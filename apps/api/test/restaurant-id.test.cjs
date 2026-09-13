require('reflect-metadata');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { RestaurantIdPipe } = require('../dist/restaurants/restaurant-id.pipe');

test('IDs BIGINT conservan precisión y rechazan UUID y valores inválidos', () => {
  const pipe = new RestaurantIdPipe();
  for (const id of ['1', '2', '9007199254740993', '9223372036854775807']) {
    assert.equal(pipe.transform(id), id);
  }
  for (const id of ['0', '-1', '1.5', '1e3', '01', ' 1', '9223372036854775808', 'd8e34a12-5a67-4e89-b123-94c687a2fd10']) {
    assert.throws(() => pipe.transform(id), { status: 400 });
  }
});
