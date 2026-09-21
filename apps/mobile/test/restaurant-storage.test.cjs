const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/restaurantStorage.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const currentKey = '@restaurantes-recomendados/v2';
const oldKey = '@restaurantes-recomendados/v1';

function setup(key, data) {
  const stored = new Map([[key, JSON.stringify(data)]]);
  const exports = {};
  vm.runInNewContext(source, { exports, require: (name) => {
    if (name === '@restaurantes/contracts') return require(name);
    if (name === '@react-native-async-storage/async-storage') return {
      getItem: async (key) => stored.get(key) ?? null,
      setItem: async (key, value) => { stored.set(key, value); },
    };
    throw new Error('Unexpected import: ' + name);
  } });
  return { storage: exports, stored };
}

test('la demo elimina precios antiguos del almacenamiento activo sin cambiar rangos ni IDs', async () => {
  const context = setup(currentKey, { nextId: 10, items: [
    { id: '3', name: 'Antiguo', price: '25 €', legacyPrice: '20 €', type: [] },
    { id: '9', name: 'Actual', price: '20to40', legacyPrice: '30 €', type: [] },
  ] });
  const items = await context.storage.loadRestaurants();
  assert.equal(items[0].price, '');
  assert.equal(items[1].price, '20to40');
  assert.ok(items.every(item => !Object.hasOwn(item, 'legacyPrice')));
  const saved = JSON.parse(context.stored.get(currentKey));
  assert.deepEqual(saved.items.map(item => item.id), ['3', '9']);
  assert.ok(saved.items.every(item => !Object.hasOwn(item, 'legacyPrice')));
  assert.equal(await context.storage.allocateRestaurantId(), '10');
});

test('la demo v1 sigue convirtiendo UUID a IDs numéricos y descarta textos de precio', async () => {
  const context = setup(oldKey, [{ id: 'old-uuid', createdAt: '2026-01-01', price: 'Consultar', type: [] }]);
  const items = await context.storage.loadRestaurants();
  assert.equal(items[0].id, '1');
  assert.equal(items[0].price, '');
  assert.equal(Object.hasOwn(items[0], 'legacyPrice'), false);
  assert.equal(await context.storage.allocateRestaurantId(), '2');
});
