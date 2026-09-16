require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { CreateRestaurantDto, UpdateRestaurantDto, ListRestaurantsDto } = require('../dist/restaurants/restaurant.dto');

test('restaurantes nuevos empiezan sin visita ni opinión; PATCH conserva campos omitidos', async () => {
  const created = plainToInstance(CreateRestaurantDto, { name: 'Prueba' });
  assert.equal(created.visited, false);
  assert.equal(created.opinion, '');
  assert.equal(created.rating, '');
  assert.deepEqual(await validate(created), []);
  const patch = plainToInstance(UpdateRestaurantDto, { opinion: ' Buena comida ' });
  assert.equal(patch.visited, undefined);
  assert.equal(patch.rating, undefined);
  assert.equal(patch.opinion, 'Buena comida');
  assert.deepEqual(await validate(patch), []);
});

test('booleanos de consulta true y false se interpretan sin convertir false a true', async () => {
  for (const [input, expected] of [['true', true], ['false', false]]) {
    const filters = plainToInstance(ListRestaurantsDto, { visitedOnly: input });
    assert.equal(filters.visitedOnly, expected);
    assert.deepEqual(await validate(filters), []);
  }
  const invalid = plainToInstance(ListRestaurantsDto, { visitedOnly: 'invalid' });
  assert.ok((await validate(invalid)).length);
});

test('visita exige booleano real y opinión admite hasta 4000 caracteres', async () => {
  for (const body of [{ visited: null }, { visited: 'false' }, { opinion: null }, { opinion: 'x'.repeat(4001) }]) {
    assert.ok((await validate(plainToInstance(UpdateRestaurantDto, body))).length);
  }
  assert.deepEqual(await validate(plainToInstance(UpdateRestaurantDto, { visited: true, opinion: 'x'.repeat(4000) })), []);
});


test('valoración admite las cinco respuestas o vacío para registros antiguos', async () => {
  for (const rating of ['', 'loved', 'liked', 'neutral', 'disliked', 'disappointed']) {
    assert.deepEqual(await validate(plainToInstance(UpdateRestaurantDto, { rating })), []);
  }
  for (const rating of [null, true, '😊', 'invalid']) {
    assert.ok((await validate(plainToInstance(UpdateRestaurantDto, { rating }))).length);
  }
});
