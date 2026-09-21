const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the session lifecycle without native device modules or real credentials.
const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/googleAuth.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const session = () => ({ accessToken: 'a'.repeat(64), expiresAt: new Date(Date.now() + 3600000).toISOString(), user: { id: 'owner' } });
class ApiError extends Error { constructor(status) { super('API error'); this.status = status; } }

function setup(options = {}) {
  let stored = options.stored ?? null;
  const calls = [];
  const value = session();
  const modules = {
    'expo-constants': { __esModule: true, default: { executionEnvironment: options.expoGo ? 'store' : 'standalone', expoConfig: { extra: { googleWebClientId: 'web-client' } } }, ExecutionEnvironment: { StoreClient: 'store' } },
    'react-native': { Platform: { OS: 'android' } },
    'expo-secure-store': {
      getItemAsync: async () => stored,
      setItemAsync: async (_, data) => { if (options.storageFailure) throw new Error('Storage failed'); stored = data; },
      deleteItemAsync: async () => { stored = null; },
    },
    './authApi': {
      ApiError,
      exchangeGoogleToken: async (token) => { calls.push(['exchange', token]); return value; },
      authenticatedRequest: async (token, endpoint) => {
        calls.push(['api', token, endpoint]);
        if (options.apiFailure) throw options.apiFailure;
        return { id: 'verified-owner' };
      },
    },
    '@react-native-google-signin/google-signin': {
      GoogleSignin: {
        configure: () => {}, hasPlayServices: async () => true,
        signIn: async () => options.cancel ? { type: 'cancelled' } : { type: 'success', data: { idToken: 'google-token' } },
        signOut: async () => { calls.push(['google-signout']); },
      },
      isErrorWithCode: () => false, statusCodes: {},
    },
    '@react-native-firebase/auth': {
      GoogleAuthProvider: { credential: (token) => { calls.push(['credential', token]); return 'credential'; } },
      getAuth: () => 'auth',
      signInWithCredential: async () => ({ user: 'firebase-user' }),
      getIdToken: async () => 'firebase-token',
      signOut: async () => { calls.push(['firebase-signout']); },
    },
  };
  const exports = {};
  vm.runInNewContext(source, {
    exports, process: { env: {} },
    require: (name) => {
      if (options.expoGo && name.startsWith('@react-native')) throw new Error('Native module loaded in Expo Go');
      if (!modules[name]) throw new Error('Unexpected import: ' + name);
      return modules[name];
    },
  });
  return { auth: exports, calls, value, getStored: () => stored };
}

test('intercambia el token Firebase, guarda la sesión y cierra las sesiones nativas temporales', async () => {
  const context = setup();
  assert.deepEqual(await context.auth.loginWithGoogle(), context.value);
  assert.deepEqual(context.calls.find(([name]) => name === 'exchange'), ['exchange', 'firebase-token']);
  assert.deepEqual(JSON.parse(context.getStored()), context.value);
  assert.ok(context.calls.some(([name]) => name === 'firebase-signout'));
  assert.ok(context.calls.some(([name]) => name === 'google-signout'));
});

test('cancelar Google no inicia ni guarda una sesión de API', async () => {
  const context = setup({ cancel: true });
  assert.equal(await context.auth.loginWithGoogle(), undefined);
  assert.equal(context.getStored(), null);
  assert.equal(context.calls.some(([name]) => name === 'exchange'), false);
});

test('si falla SecureStore se revoca la sesión recién creada', async () => {
  const context = setup({ storageFailure: true });
  await assert.rejects(context.auth.loginWithGoogle());
  assert.ok(context.calls.some(([name, , endpoint]) => name === 'api' && endpoint === '/auth/logout'));
});

test('restaurar consulta el usuario real a la API, no confía en el usuario guardado', async () => {
  const context = setup({ stored: JSON.stringify(session()) });
  const restored = await context.auth.restoreSession();
  assert.equal(restored.user.id, 'verified-owner');
  assert.equal(context.calls[0][2], '/auth/me');
});

test('elimina sesiones corruptas, caducadas o revocadas', async () => {
  for (const stored of ['null', '{}', 'bad-json', JSON.stringify({ ...session(), expiresAt: 'invalid' }), JSON.stringify({ ...session(), expiresAt: '2000-01-01' })]) {
    const context = setup({ stored });
    assert.equal(await context.auth.restoreSession(), undefined);
    assert.equal(context.getStored(), null);
  }
  const revoked = setup({ stored: JSON.stringify(session()), apiFailure: new ApiError(401) });
  assert.equal(await revoked.auth.restoreSession(), undefined);
  assert.equal(revoked.getStored(), null);
});

test('un fallo de red al restaurar o salir conserva la sesión para reintentar', async () => {
  const context = setup({ stored: JSON.stringify(session()), apiFailure: new Error('Offline') });
  await assert.rejects(context.auth.restoreSession());
  assert.ok(context.getStored());
  await assert.rejects(context.auth.logout(session()));
  assert.ok(context.getStored());
});

test('cerrar sesión revoca en el servidor y elimina SecureStore', async () => {
  const context = setup({ stored: JSON.stringify(session()) });
  await context.auth.logout(session());
  assert.equal(context.calls[0][2], '/auth/logout');
  assert.equal(context.getStored(), null);
});

test('Expo Go conserva la demo y no carga módulos nativos de Google o Firebase', async () => {
  const context = setup({ expoGo: true });
  assert.equal(context.auth.googleLoginAvailable, false);
  assert.equal(await context.auth.restoreSession(), undefined);
  assert.equal(context.calls.length, 0);
});
