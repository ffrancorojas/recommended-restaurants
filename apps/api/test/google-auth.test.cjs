require('reflect-metadata');
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FirebaseTokenService } = require('../dist/auth/firebase-token.service');
const { AuthService } = require('../dist/auth/auth.service');

const projectId = 'auth-tests';
const app = initializeApp({ projectId }, `auth-${projectId}`);
const originalProject = process.env.FIREBASE_PROJECT_ID;
process.env.FIREBASE_PROJECT_ID = projectId;
after(async () => {
  if (originalProject === undefined) delete process.env.FIREBASE_PROJECT_ID;
  else process.env.FIREBASE_PROJECT_ID = originalProject;
  await deleteApp(app);
});

test('delega la validación criptográfica al SDK antes de aceptar la identidad', async (t) => {
  const verify = t.mock.method(getAuth(app), 'verifyIdToken', async (token) => {
    assert.equal(token, 'firebase-token');
    return { uid: 'uid-1', email: 'ANA@example.com', email_verified: true, name: ' Ana ', firebase: { sign_in_provider: 'google.com' } };
  });
  assert.deepEqual(await new FirebaseTokenService().verify('firebase-token'), { uid: 'uid-1', email: 'ana@example.com', name: 'Ana' });
  assert.equal(verify.mock.callCount(), 1);
});

test('rechaza tokens que el SDK considera caducados, falsificados o de otro proyecto', async (t) => {
  t.mock.method(getAuth(app), 'verifyIdToken', async () => { throw Object.assign(new Error('Invalid'), { code: 'auth/argument-error' }); });
  await assert.rejects(new FirebaseTokenService().verify('bad-token'), { status: 401 });
});

test('exige proveedor Google y correo verificado', async (t) => {
  const valid = { uid: 'uid-1', email: 'ana@example.com', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
  for (const invalid of [
    { ...valid, firebase: { sign_in_provider: 'password' } },
    { ...valid, email_verified: false }, { ...valid, email: undefined },
  ]) {
    const mock = t.mock.method(getAuth(app), 'verifyIdToken', async () => invalid);
    await assert.rejects(new FirebaseTokenService().verify('token'), { status: 401 });
    mock.mock.restore();
  }
});

test('no admite tokens sin firma del emulador en la API', async () => {
  const previous = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  try { await assert.rejects(new FirebaseTokenService().verify('token'), { status: 503 }); }
  finally {
    if (previous === undefined) delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
    else process.env.FIREBASE_AUTH_EMULATOR_HOST = previous;
  }
});

test('sin proyecto Firebase configurado el login no crea ninguna cuenta', async () => {
  delete process.env.FIREBASE_PROJECT_ID;
  try { await assert.rejects(new FirebaseTokenService().verify('token'), { status: 503 }); }
  finally { process.env.FIREBASE_PROJECT_ID = projectId; }
});

test('un token rechazado no llega a la base de datos', async () => {
  let connected = false;
  const service = new AuthService({ connect: async () => { connected = true; } }, { verify: async () => { throw new Error('Rejected'); } });
  await assert.rejects(service.loginWithGoogle('invalid'));
  assert.equal(connected, false);
});

test('fallo al crear sesión revierte el alta y libera la conexión', async () => {
  const queries = [];
  let released = false;
  const client = {
    query: async (sql) => {
      queries.push(sql);
      if (sql.startsWith('INSERT INTO sessions')) throw new Error('Database error');
      return { rows: [{ id: 'id', created_at: new Date() }] };
    },
    release: () => { released = true; },
  };
  const service = new AuthService({ connect: async () => client }, { verify: async () => ({ uid: 'uid', email: 'ana@example.com', name: 'Ana' }) });
  await assert.rejects(service.loginWithGoogle('token'));
  assert.ok(queries.includes('ROLLBACK'));
  assert.ok(!queries.includes('COMMIT'));
  assert.equal(released, true);
});
