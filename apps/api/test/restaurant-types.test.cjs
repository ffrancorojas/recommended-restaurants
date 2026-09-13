require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const { RestaurantTypesController } = require('../dist/restaurant-types.controller');
const { RESTAURANT_TYPES } = require('@restaurantes/contracts');
const { setupApp } = require('../dist/setup');

test('catálogo público de tipos accesible por HTTP sin sesión ni base de datos', async () => {
  const module = await Test.createTestingModule({ controllers: [RestaurantTypesController] }).compile();
  const app = module.createNestApplication({ logger: false });
  setupApp(app, ['http://localhost:8081']);
  try {
    await app.listen(0, '127.0.0.1');
    const response = await fetch(`${await app.getUrl()}/api/v1/restaurant-types`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [...RESTAURANT_TYPES]);
  } finally {
    await app.close();
  }
});
