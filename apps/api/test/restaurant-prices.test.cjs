require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { PRICE_RANGE_VALUES, normalizeRestaurantPrice } = require('@restaurantes/contracts');
const { CreateRestaurantDto, UpdateRestaurantDto, ListRestaurantsDto } = require('../dist/restaurants/restaurant.dto');

test('crear, editar y filtrar admiten solo rangos de precio definidos', async () => {
  for (const Dto of [CreateRestaurantDto, UpdateRestaurantDto, ListRestaurantsDto]) {
    for (const price of PRICE_RANGE_VALUES) {
      const dto = plainToInstance(Dto, { name: 'Prueba', price });
      assert.deepEqual(await validate(dto), []);
      assert.equal(dto.price, price);
    }
    for (const price of ['25 €', '20–30 €', 'invalid', null, 20, ['under20']]) {
      assert.ok((await validate(plainToInstance(Dto, { name: 'Prueba', price }))).length);
    }
  }
  assert.equal(plainToInstance(CreateRestaurantDto, { name: 'Prueba' }).price, '');
  assert.equal(plainToInstance(UpdateRestaurantDto, { name: 'Cambio' }).price, undefined);
});

test('descarta precios antiguos y conserva rangos al cargar datos guardados', () => {
  for (const price of ['25 €', '20–30 € por persona', 'Consultar carta']) {
    const converted = normalizeRestaurantPrice({ price, name: 'Prueba' });
    assert.deepEqual(converted, { name: 'Prueba', price: '' });
    assert.deepEqual(normalizeRestaurantPrice(converted), converted);
  }
  const selected = { price: '20to40', legacyPrice: '25 €' };
  assert.deepEqual(normalizeRestaurantPrice(selected), { price: '20to40' });
  assert.equal(selected.legacyPrice, '25 €');
  assert.deepEqual(normalizeRestaurantPrice({ price: '' }), { price: '' });
});
