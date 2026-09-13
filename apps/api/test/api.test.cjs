require('reflect-metadata');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { Pool } = require('pg');
const { Test } = require('@nestjs/testing');
const { AppModule } = require('../dist/app.module');
const { DATABASE } = require('../dist/database/database.module');
const { setupApp } = require('../dist/setup');
const { ConfirmationMailService } = require('../dist/auth/confirmation-mail.service');
const emails = new Map();

const schema = `test_${randomUUID().replaceAll('-', '')}`;
const password = 'una-clave-de-prueba-larga';
let admin;
let db;
let app;
let baseUrl;
let owner;
let other;
let restaurant;

async function startApp() {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DATABASE).useValue(db)
    .overrideProvider(ConfirmationMailService).useValue({ send: async (email, token) => { emails.set(email, token); } }).compile();
  const instance = module.createNestApplication({ logger: false });
  setupApp(instance, ['http://localhost:8081']);
  await instance.listen(0, '127.0.0.1');
  return instance;
}

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}/api/v1${path}`, {
    method,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : null, headers: response.headers };
}

before(async () => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL en apps/api/.env para ejecutar las pruebas con PostgreSQL.');
  admin = new Pool({ connectionString: process.env.TEST_DATABASE_URL, connectionTimeoutMillis: 5000 });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  db = new Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}`, connectionTimeoutMillis: 5000 });
  const { migrate } = await import('../scripts/migrate.mjs');
  const client = await db.connect();
  try { await migrate(client); await migrate(client); } finally { client.release(); }
  app = await startApp();
  baseUrl = await app.getUrl();
  const first = await request('/auth/register', { method: 'POST', body: { name: 'Propietario', nick: 'owner', email: ' OWNER@example.com ', password } });
  assert.equal(first.status, 201);
  assert.equal(first.body.accessToken, undefined);
  assert.equal((await request('/auth/login', { method: 'POST', body: { email: 'owner@example.com', password } })).status, 403);
  const confirmation = emails.get('owner@example.com');
  const stored = await db.query('SELECT token_hash FROM email_confirmations');
  assert.equal(stored.rows[0].token_hash, createHash('sha256').update(confirmation).digest('hex'));
  assert.equal((await request('/auth/verify-email', { method: 'POST', body: { token: confirmation } })).status, 200);
  assert.equal((await request('/auth/verify-email', { method: 'POST', body: { token: confirmation } })).status, 400);
  owner = (await request('/auth/login', { method: 'POST', body: { email: 'owner@example.com', password } })).body;
  const second = await request('/auth/register', { method: 'POST', body: { name: 'Otra persona', nick: 'other', email: 'other@example.com', password } });
  assert.equal(second.status, 201);
  assert.equal((await request('/auth/verify-email', { method: 'POST', body: { token: emails.get('other@example.com') } })).status, 200);
  other = (await request('/auth/login', { method: 'POST', body: { email: 'other@example.com', password } })).body;
});

after(async () => {
  if (app) await app.close();
  if (db) await db.end();
  if (admin) {
    // Solo se elimina el esquema generado por esta ejecución.
    assert.match(schema, /^test_[a-f0-9]{32}$/);
    await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.end();
  }
});

test('migraciones repetibles, salud y documentación OpenAPI', async () => {
  const result = await request('/health');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { status: 'ok' });
  const migrations = await db.query('SELECT * FROM schema_migrations');
  assert.equal(migrations.rowCount, 4);
  const docs = await fetch(`${baseUrl}/api/docs-json`).then((response) => response.json());
  assert.ok(docs.paths['/api/v1/restaurants/{id}'].patch);
});

test('registro normaliza correo y almacena hashes, nunca contraseñas ni tokens en claro', async () => {
  assert.equal(owner.user.email, 'owner@example.com');
  assert.deepEqual(Object.keys(owner.user).sort(), ['createdAt', 'email', 'id', 'name', 'nick']);
  const users = await db.query('SELECT password_hash FROM users WHERE id = $1', [owner.user.id]);
  assert.match(users.rows[0].password_hash, /^scrypt:/);
  assert.notEqual(users.rows[0].password_hash, password);
  const sessions = await db.query('SELECT token_hash FROM sessions WHERE user_id = $1', [owner.user.id]);
  assert.notEqual(sessions.rows[0].token_hash, owner.accessToken);
  assert.equal(sessions.rows[0].token_hash, createHash('sha256').update(owner.accessToken).digest('hex'));
  const duplicate = await request('/auth/register', { method: 'POST', body: { name: 'Duplicado', nick: 'duplicate', email: 'OWNER@example.com', password } });
  assert.equal(duplicate.status, 409);
  const invalid = await request('/auth/register', { method: 'POST', body: { email: 'invalid', password: 'short' } });
  assert.equal(invalid.status, 400);
});

test('login real, errores genéricos y rutas protegidas', async () => {
  const success = await request('/auth/login', { method: 'POST', body: { email: 'owner@example.com', password } });
  assert.equal(success.status, 200);
  const me = await request('/auth/me', { token: success.body.accessToken });
  assert.deepEqual(me.body, owner.user);
  for (const email of ['owner@example.com', 'missing@example.com']) {
    const failed = await request('/auth/login', { method: 'POST', body: { email, password: 'contraseña-equivocada' } });
    assert.equal(failed.status, 401);
    assert.equal(failed.body.message, 'Correo o contraseña incorrectos.');
  }
  for (const path of ['/restaurants', '/auth/me']) {
    assert.equal((await request(path)).status, 401);
    assert.equal((await request(path, { token: 'invalid' })).status, 401);
  }
});

test('crear restaurante, validar entrada y rechazar propietario suministrado por el cliente', async () => {
  const body = { name: ' Casa Prueba ', locality: 'Madrid', type: 'Tapas', price: '25 €', recommendedBy: 'Ana', notes: 'Terraza' };
  const created = await request('/restaurants', { method: 'POST', token: owner.accessToken, body });
  assert.equal(created.status, 201);
  restaurant = created.body;
  assert.equal(restaurant.id, '1');
  assert.equal(restaurant.name, 'Casa Prueba');
  assert.equal(restaurant.dishes, '');
  assert.equal(restaurant.recommendedBy, 'Ana');
  assert.equal('user_id' in restaurant, false);
  for (const invalid of [{ name: ' ' }, { name: 'X', type: 'invalid' }, { name: 'X', notes: null }, { ...body, userId: other.user.id }]) {
    assert.equal((await request('/restaurants', { method: 'POST', token: owner.accessToken, body: invalid })).status, 400);
  }
});

test('otro usuario no puede listar, leer, modificar ni eliminar restaurantes ajenos', async () => {
  const list = await request('/restaurants', { token: other.accessToken });
  assert.deepEqual(list.body.items, []);
  for (const method of ['GET', 'PATCH', 'DELETE']) {
    const response = await request(`/restaurants/${restaurant.id}`, {
      method, token: other.accessToken, ...(method === 'PATCH' ? { body: { name: 'Intruso' } } : {}),
    });
    assert.equal(response.status, 404);
  }
  assert.equal((await request(`/restaurants/${restaurant.id}`, { token: owner.accessToken })).body.name, 'Casa Prueba');
});

test('filtros por recomendador, tipos múltiples y paginación con límites', async () => {
  const token = owner.accessToken;
  assert.equal((await request('/restaurants?query=ana&types=Tapas&types=Sushi', { token })).body.items.length, 1);
  assert.equal((await request('/restaurants?types=Sushi', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants?locality=madrid&price=25', { token })).body.items.length, 1);
  assert.equal((await request('/restaurants?query=%25', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants?query=%27%20OR%201%3D1--', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants?limit=1&offset=1', { token })).body.items.length, 0);
  for (const query of ['limit=101', 'limit=0', 'offset=-1', 'types=invalid']) {
    assert.equal((await request(`/restaurants?${query}`, { token })).status, 400);
  }
});

test('PATCH conserva campos omitidos y rechaza null e identificadores inválidos', async () => {
  const result = await request(`/restaurants/${restaurant.id}`, { method: 'PATCH', token: owner.accessToken, body: { name: 'Nombre nuevo' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.name, 'Nombre nuevo');
  assert.equal(result.body.locality, 'Madrid');
  assert.equal(result.body.type, 'Tapas');
  assert.equal(result.body.notes, 'Terraza');
  assert.equal(result.body.recommendedBy, 'Ana');
  const invalid = await request(`/restaurants/${restaurant.id}`, { method: 'PATCH', token: owner.accessToken, body: { notes: null } });
  assert.equal(invalid.status, 400);
  assert.equal((await request('/restaurants/not-a-uuid', { token: owner.accessToken })).status, 400);
});

test('visitas y opinión se guardan, se filtran y se validan', async () => {
  const token = owner.accessToken;
  const path = `/restaurants/${restaurant.id}`;
  assert.equal((await request(path, { token })).body.visited, false);
  assert.equal((await request('/restaurants?visitedOnly=true', { token })).body.items.length, 0);
  const updated = await request(path, { method: 'PATCH', token, body: { visited: true, opinion: 'Volvería por las croquetas' } });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.visited, true);
  assert.equal(updated.body.opinion, 'Volvería por las croquetas');
  assert.equal((await request('/restaurants?visitedOnly=true&types=Tapas&locality=madrid', { token })).body.items.length, 1);
  assert.equal((await request('/restaurants?visitedOnly=true', { token: other.accessToken })).body.items.length, 0);
  for (const body of [{ visited: 'false' }, { visited: null }, { opinion: null }, { opinion: 'x'.repeat(4001) }]) {
    assert.equal((await request(path, { method: 'PATCH', token, body })).status, 400);
  }
  assert.equal((await request('/restaurants?visitedOnly=invalid', { token })).status, 400);
  await request(path, { method: 'PATCH', token, body: { visited: false } });
  assert.equal((await request(path, { token })).body.opinion, 'Volvería por las croquetas');
  assert.equal((await request('/restaurants?visitedOnly=true', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants?visitedOnly=false', { token })).body.items.length, 1);
});

test('restaurantes y sesiones persisten tras reiniciar la API', async () => {
  await app.close();
  app = await startApp();
  baseUrl = await app.getUrl();
  assert.equal((await request('/auth/me', { token: owner.accessToken })).status, 200);
  assert.equal((await request(`/restaurants/${restaurant.id}`, { token: owner.accessToken })).body.name, 'Nombre nuevo');
});

test('eliminar restaurante devuelve 204 y después 404', async () => {
  const path = `/restaurants/${restaurant.id}`;
  assert.equal((await request(path, { method: 'DELETE', token: owner.accessToken })).status, 204);
  assert.equal((await request(path, { token: owner.accessToken })).status, 404);
});

test('logout invalida el token y se rechazan sesiones caducadas', async () => {
  assert.equal((await request('/auth/logout', { method: 'POST', token: other.accessToken })).status, 204);
  assert.equal((await request('/auth/me', { token: other.accessToken })).status, 401);
  await db.query('UPDATE sessions SET expires_at = now() - interval \'1 second\' WHERE user_id = $1', [owner.user.id]);
  assert.equal((await request('/auth/me', { token: owner.accessToken })).status, 401);
});

test('login limita intentos repetidos', async () => {
  let result;
  for (let index = 0; index < 11; index += 1) {
    result = await request('/auth/login', { method: 'POST', body: { email: 'missing@example.com', password } });
  }
  assert.equal(result.status, 429);
});
