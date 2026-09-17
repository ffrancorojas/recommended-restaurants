require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Test } = require('@nestjs/testing');
const { RestaurantTypesController } = require('../dist/restaurant-types.controller');
const { RESTAURANT_TYPES, normalizeRestaurantTypes } = require('@restaurantes/contracts');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { CreateRestaurantDto, UpdateRestaurantDto } = require('../dist/restaurants/restaurant.dto');
const { setupApp } = require('../dist/setup');

test('selecciones múltiples válidas y compatibilidad con un solo tipo', async () => {
  for (const [input, expected] of [
    [['Tapas', 'Mediterráneo'], ['Tapas', 'Mediterráneo']],
    [[], []], ['Tapas', ['Tapas']], ['', []],
  ]) {
    const dto = plainToInstance(CreateRestaurantDto, { name: 'Prueba', type: input });
    assert.deepEqual(await validate(dto), []);
    assert.deepEqual(dto.type, expected);
  }
  assert.deepEqual(plainToInstance(CreateRestaurantDto, { name: 'Prueba' }).type, []);
  const patch = plainToInstance(UpdateRestaurantDto, { name: 'Nuevo nombre' });
  assert.equal(patch.type, undefined);
  assert.deepEqual(await validate(patch), []);
});

test('tipos rechaza valores desconocidos, duplicados y selecciones inválidas', async () => {
  for (const type of [null, true, 12, {}, [''], ['invalid'], [null], [['Tapas']], ['Tapas', 'Tapas']]) {
    assert.ok((await validate(plainToInstance(UpdateRestaurantDto, { type }))).length, JSON.stringify(type));
  }
});

test('datos locales antiguos se convierten sin perder tipos válidos', () => {
  assert.deepEqual(normalizeRestaurantTypes('Tapas'), ['Tapas']);
  assert.deepEqual(normalizeRestaurantTypes(['Tapas', 'Sushi']), ['Tapas', 'Sushi']);
  assert.deepEqual(normalizeRestaurantTypes(['Tapas', 'Tapas']), ['Tapas']);
  for (const value of ['', undefined, null, []]) assert.deepEqual(normalizeRestaurantTypes(value), []);
});

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
