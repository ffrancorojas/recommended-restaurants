require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { RegisterDto, ConfirmEmailDto } = require('../dist/auth/register.dto');
const { AuthService } = require('../dist/auth/auth.service');
const { hashPassword } = require('../dist/auth/password');
const { Test } = require('@nestjs/testing');
const { AuthController } = require('../dist/auth/auth.controller');
const { setupApp } = require('../dist/setup');

test('registro valida los cuatro campos y normaliza email y nick', async () => {
  const valid = { name: ' Ana ', nick: ' ANA_1 ', email: ' ANA@example.com ', password: 'password-de-prueba' };
  const dto = plainToInstance(RegisterDto, valid);
  assert.deepEqual(await validate(dto), []);
  assert.equal(dto.name, 'Ana');
  assert.equal(dto.nick, 'ana_1');
  assert.equal(dto.email, 'ana@example.com');
  for (const field of ['name', 'nick', 'email', 'password']) {
    assert.ok((await validate(plainToInstance(RegisterDto, { ...valid, [field]: '' }))).length);
  }
  assert.ok((await validate(plainToInstance(ConfirmEmailDto, { token: '<script>' }))).length);
});

test('cuenta pendiente no puede iniciar sesión aunque la contraseña sea correcta', async () => {
  const user = { email_verified_at: null, password_hash: await hashPassword('password-de-prueba') };
  const service = new AuthService({ query: async () => ({ rows: [user] }) }, {});
  await assert.rejects(service.login({ email: 'ana@example.com', password: 'password-de-prueba' }), { status: 403 });
});

test('token inválido, caducado o consumido no activa una cuenta', async () => {
  const service = new AuthService({ query: async () => ({ rowCount: 0 }) }, {});
  await assert.rejects(service.confirm('a'.repeat(64)), { status: 400 });
});

test('fallo del correo revierte el registro y libera la conexión', async () => {
  const queries = [];
  let released = false;
  const client = {
    query: async (sql) => { queries.push(sql); return { rows: [{ id: 'id', email: 'ana@example.com' }] }; },
    release: () => { released = true; },
  };
  const service = new AuthService({ connect: async () => client }, { send: async () => { throw new Error('SMTP caído'); } });
  await assert.rejects(service.register({ name: 'Ana', nick: 'ana', email: 'ana@example.com', password: 'password-de-prueba' }));
  assert.ok(queries.includes('ROLLBACK'));
  assert.ok(!queries.includes('COMMIT'));
  assert.equal(released, true);
});

test('el enlace requiere confirmación explícita y acepta el formulario del navegador', async () => {
  const confirmations = [];
  const module = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [{ provide: AuthService, useValue: { confirm: async (token) => { confirmations.push(token); return { message: 'Cuenta activada' }; } } }],
  }).compile();
  const app = module.createNestApplication({ logger: false });
  setupApp(app);
  try {
    await app.listen(0, '127.0.0.1');
    const url = `${await app.getUrl()}/api/v1/auth/confirm-email`;
    const token = 'a'.repeat(64);
    const page = await fetch(`${url}?token=${token}`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Activar cuenta/);
    assert.equal(confirmations.length, 0);
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token }) });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Cuenta activada/);
    assert.deepEqual(confirmations, [token]);
    assert.equal((await fetch(`${url}?token=invalid`)).status, 400);
  } finally { await app.close(); }
});
