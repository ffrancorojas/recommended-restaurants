require('reflect-metadata');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { Pool } = require('pg');
const { Test } = require('@nestjs/testing');
const { AppModule } = require('../dist/app.module');
const { DATABASE } = require('../dist/database/database.module');
const { setupApp } = require('../dist/setup');
const { FirebaseTokenService } = require('../dist/auth/firebase-token.service');
const { UnauthorizedException } = require('@nestjs/common');
const tokenFor = (uid) => `firebase.${uid}.signature`;
const identities = { owner: { uid: 'google-owner', email: 'owner@example.com', name: 'Propietario' }, other: { uid: 'google-other', email: 'other@example.com', name: 'Otra persona' } };

const schema = `test_${randomUUID().replaceAll('-', '')}`;

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
    .overrideProvider(FirebaseTokenService).useValue({ verify: async (token) => {
      const identity = identities[token.split('.')[1]];
      if (!identity) throw new UnauthorizedException('Token no válido.');
      return identity;
    } }).compile();
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
  const first = await request('/auth/google', { method: 'POST', body: { idToken: tokenFor('owner') } });
  assert.equal(first.status, 200);
  owner = first.body;
  const second = await request('/auth/google', { method: 'POST', body: { idToken: tokenFor('other') } });
  assert.equal(second.status, 200);
  other = second.body;
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
  assert.equal(migrations.rowCount, 13);
  assert.equal((await db.query("SELECT to_regclass('email_confirmations') AS name")).rows[0].name, null);
  const docs = await fetch(`${baseUrl}/api/docs-json`).then((response) => response.json());
  assert.ok(docs.paths['/api/v1/restaurants/{id}'].patch);
});

test('Google crea usuarios sin contraseña y guarda solo el hash de la sesión', async () => {
  assert.equal(owner.user.email, 'owner@example.com');
  assert.deepEqual(Object.keys(owner.user).sort(), ['createdAt', 'email', 'id', 'name', 'nick']);
  const users = await db.query('SELECT password_hash, firebase_uid, email_verified_at FROM users WHERE id = $1', [owner.user.id]);
  assert.equal(users.rows[0].password_hash, null);
  assert.equal(users.rows[0].firebase_uid, 'google-owner');
  assert.ok(users.rows[0].email_verified_at);
  const sessions = await db.query('SELECT token_hash FROM sessions WHERE user_id = $1', [owner.user.id]);
  assert.equal(sessions.rows[0].token_hash, createHash('sha256').update(owner.accessToken).digest('hex'));
  const again = await request('/auth/google', { method: 'POST', body: { idToken: tokenFor('owner') } });
  assert.equal(again.status, 200);
  assert.equal(again.body.user.id, owner.user.id);
  assert.notEqual(again.body.accessToken, owner.accessToken);
});

test('solo permite Google verificado y rechaza datos de identidad enviados por el cliente', async () => {
  assert.equal((await request('/auth/me', { token: owner.accessToken })).body.id, owner.user.id);
  assert.equal((await request('/auth/google', { method: 'POST', body: { idToken: tokenFor('invalid') } })).status, 401);
  assert.equal((await request('/auth/google', { method: 'POST', body: { idToken: 'invalid' } })).status, 400);
  assert.equal((await request('/auth/google', { method: 'POST', body: { idToken: tokenFor('owner'), email: 'intruso@example.com' } })).status, 400);
  for (const path of ['/auth/register', '/auth/login', '/auth/verify-email', '/auth/resend-confirmation']) {
    assert.equal((await request(path, { method: 'POST', body: {} })).status, 404);
  }
  for (const path of ['/restaurants', '/auth/me']) {
    assert.equal((await request(path)).status, 401);
    assert.equal((await request(path, { token: 'invalid' })).status, 401);
  }
});

test('una cuenta distinta no se vincula automáticamente por compartir correo', async () => {
  identities.collision = { ...identities.owner, uid: 'different-uid' };
  assert.equal((await request('/auth/google', { method: 'POST', body: { idToken: tokenFor('collision') } })).status, 409);
  const result = await db.query('SELECT firebase_uid FROM users WHERE id = $1', [owner.user.id]);
  assert.equal(result.rows[0].firebase_uid, 'google-owner');
});

test('crear restaurante, validar entrada y rechazar propietario suministrado por el cliente', async () => {
  const body = { name: ' Casa Prueba ', locality: 'Madrid', type: ['Tapas', 'Mediterráneo'], price: '20to40', recommendedBy: 'Ana', notes: 'Terraza' };
  const created = await request('/restaurants', { method: 'POST', token: owner.accessToken, body });
  assert.equal(created.status, 201);
  restaurant = created.body;
  assert.equal(restaurant.id, '1');
  assert.equal(restaurant.name, 'Casa Prueba');
  assert.equal(restaurant.dishes, '');
  assert.equal(restaurant.recommendedBy, 'Ana');
  assert.equal(restaurant.price, '20to40');
  assert.deepEqual(restaurant.type, ['Tapas', 'Mediterráneo']);
  assert.equal('user_id' in restaurant, false);
  assert.equal('legacyPrice' in restaurant, false);
  assert.equal('legacy_id' in restaurant, false);
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
  assert.equal((await request('/restaurants?types=Mediterr%C3%A1neo', { token })).body.items.length, 1);
  assert.equal((await request('/restaurants?locality=madrid&price=20to40', { token })).body.items.length, 1);
  assert.equal((await request('/restaurants?price=40to60', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants?price=25', { token })).status, 400);
  assert.equal((await request('/restaurants?query=%25', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants?query=%27%20OR%201%3D1--', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants?limit=1&offset=1', { token })).body.items.length, 0);
  for (const query of ['limit=101', 'limit=0', 'offset=-1', 'types=invalid']) {
    assert.equal((await request(`/restaurants?${query}`, { token })).status, 400);
  }
});

test('rangos de precio se guardan, se filtran por igualdad y se pueden quitar', async () => {
  const token = owner.accessToken;
  const path = `/restaurants/${restaurant.id}`;
  for (const price of ['under20', '20to40', '40to60', '60to80', '80to100', 'over100']) {
    const updated = await request(path, { method: 'PATCH', token, body: { price } });
    assert.equal(updated.status, 200);
    assert.equal((await request(path, { token })).body.price, price);
    assert.equal((await request(`/restaurants?price=${price}`, { token })).body.items.length, 1);
    const different = price === 'under20' ? 'over100' : 'under20';
    assert.equal((await request(`/restaurants?price=${different}`, { token })).body.items.length, 0);
  }
  assert.equal((await request(path, { method: 'PATCH', token, body: { price: '25 €' } })).status, 400);
  assert.equal((await request(path, { method: 'PATCH', token, body: { price: '' } })).body.price, '');
  assert.equal((await request('/restaurants', { token })).body.items.length, 1);
  await request(path, { method: 'PATCH', token, body: { price: '20to40' } });
});

test('migraciones de precios descartan texto antiguo y conservan rangos elegidos', async () => {
  const { readFile } = require('node:fs/promises');
  const { join } = require('node:path');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query("CREATE TEMP TABLE restaurants (id integer, price varchar(80) NOT NULL DEFAULT '') ON COMMIT DROP");
    await client.query("INSERT INTO restaurants VALUES (1, '25 €'), (2, ''), (3, '20to40')");
    await client.query(await readFile(join(__dirname, '../migrations/009_restaurant_price_ranges.sql'), 'utf8'));
    assert.deepEqual((await client.query('SELECT price, legacy_price FROM restaurants ORDER BY id')).rows, [
      { price: '', legacy_price: '25 €' }, { price: '', legacy_price: '' }, { price: '20to40', legacy_price: '' },
    ]);
    await client.query(await readFile(join(__dirname, '../migrations/012_drop_restaurant_legacy_price.sql'), 'utf8'));
    assert.deepEqual((await client.query('SELECT * FROM restaurants ORDER BY id')).rows, [
      { id: 1, price: '' }, { id: 2, price: '' }, { id: 3, price: '20to40' },
    ]);
    await assert.rejects(client.query("INSERT INTO restaurants VALUES (4, '25 €')"), { code: '23514' });
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('PATCH conserva campos omitidos y rechaza null e identificadores inválidos', async () => {
  const result = await request(`/restaurants/${restaurant.id}`, { method: 'PATCH', token: owner.accessToken, body: { name: 'Nombre nuevo' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.name, 'Nombre nuevo');
  assert.equal(result.body.locality, 'Madrid');
  assert.equal(result.body.price, '20to40');
  assert.deepEqual(result.body.type, ['Tapas', 'Mediterráneo']);
  assert.equal(result.body.notes, 'Terraza');
  assert.equal(result.body.recommendedBy, 'Ana');
  const invalid = await request(`/restaurants/${restaurant.id}`, { method: 'PATCH', token: owner.accessToken, body: { notes: null } });
  assert.equal(invalid.status, 400);
  assert.equal((await request('/restaurants/not-a-uuid', { token: owner.accessToken })).status, 400);
  for (const method of ['GET', 'PATCH', 'DELETE']) {
    assert.equal((await request('/restaurants/00000000-0000-4000-8000-000000000001', {
      method, token: owner.accessToken, ...(method === 'PATCH' ? { body: { name: 'Cambio' } } : {}),
    })).status, 400);
  }
});

test('tipos múltiples se actualizan, se vacían y se conservan cuando se omiten', async () => {
  const token = owner.accessToken;
  const path = `/restaurants/${restaurant.id}`;
  const updated = await request(path, { method: 'PATCH', token, body: { type: ['Sushi', 'Japonés'] } });
  assert.equal(updated.status, 200);
  assert.deepEqual((await request(path, { token })).body.type, ['Sushi', 'Japonés']);
  assert.equal((await request('/restaurants?types=Sushi', { token })).body.items.length, 1);
  assert.equal((await request('/restaurants?types=Tapas', { token })).body.items.length, 0);
  for (const type of [null, ['invalid'], ['Tapas', 'Tapas'], [null], ['']]) {
    assert.equal((await request(path, { method: 'PATCH', token, body: { type } })).status, 400);
  }
  assert.deepEqual((await request(path, { method: 'PATCH', token, body: { type: [] } })).body.type, []);
  assert.equal((await request('/restaurants?types=Sushi', { token })).body.items.length, 0);
  assert.equal((await request('/restaurants', { token })).body.items.length, 1);
  // Older clients sending one type are still accepted.
  assert.deepEqual((await request(path, { method: 'PATCH', token, body: { type: 'Tapas' } })).body.type, ['Tapas']);
  assert.deepEqual((await request(path, { method: 'PATCH', token, body: { opinion: '' } })).body.type, ['Tapas']);
});

test('migración de tipos conserva selecciones antiguas y campos vacíos', async () => {
  const { readFile } = require('node:fs/promises');
  const { join } = require('node:path');
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE TEMP TABLE restaurants (
      id integer, type varchar(40) NOT NULL DEFAULT '',
      CONSTRAINT restaurants_type_check CHECK (type IN ('', 'Tapas'))
    ) ON COMMIT DROP`);
    await client.query("INSERT INTO restaurants (id, type) VALUES (1, 'Tapas'), (2, '')");
    await client.query(await readFile(join(__dirname, '../migrations/008_restaurant_multiple_types.sql'), 'utf8'));
    assert.deepEqual((await client.query('SELECT type FROM restaurants ORDER BY id')).rows, [{ type: ['Tapas'] }, { type: [] }]);
    await client.query('INSERT INTO restaurants (id) VALUES (3)');
    assert.deepEqual((await client.query('SELECT type FROM restaurants WHERE id = 3')).rows[0].type, []);
    await client.query('UPDATE restaurants SET type = $1 WHERE id = 1', [['Tapas', 'Japonés']]);
    assert.deepEqual((await client.query('SELECT type FROM restaurants WHERE id = 1')).rows[0].type, ['Tapas', 'Japonés']);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
});

test('visitas y opinión se guardan, se filtran y se validan', async () => {
  const token = owner.accessToken;
  const path = `/restaurants/${restaurant.id}`;
  assert.equal((await request(path, { token })).body.visited, false);
  assert.equal((await request('/restaurants?visitedOnly=true', { token })).body.items.length, 0);
  const updated = await request(path, { method: 'PATCH', token, body: { visited: true, opinion: 'Volvería por las croquetas', rating: 'liked' } });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.visited, true);
  assert.equal(updated.body.rating, 'liked');
  assert.equal((await request(path, { token })).body.rating, 'liked');
  assert.equal(updated.body.name, 'Nombre nuevo');
  const disliked = await request(path, { method: 'PATCH', token, body: { rating: 'disliked' } });
  assert.equal(disliked.body.rating, 'disliked');
  assert.equal(disliked.body.opinion, 'Volvería por las croquetas');
  for (const rating of ['loved', 'neutral', 'disappointed']) {
    const rated = await request(path, { method: 'PATCH', token, body: { rating } });
    assert.equal(rated.status, 200);
    assert.equal((await request(path, { token })).body.rating, rating);
    assert.equal(rated.body.visited, true);
    assert.equal(rated.body.opinion, 'Volvería por las croquetas');
  }
  assert.equal(updated.body.opinion, 'Volvería por las croquetas');
  assert.equal((await request('/restaurants?visitedOnly=true&types=Tapas&locality=madrid', { token })).body.items.length, 1);
  assert.equal((await request('/restaurants?visitedOnly=true', { token: other.accessToken })).body.items.length, 0);
  for (const body of [{ rating: null }, { rating: 'invalid' }, { visited: 'false' }, { visited: null }, { opinion: null }, { opinion: 'x'.repeat(4001) }]) {
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
    result = await request('/auth/google', { method: 'POST', body: { idToken: tokenFor('invalid') } });
  }
  assert.equal(result.status, 429);
});
