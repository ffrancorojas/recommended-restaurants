const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const { readdir, readFile } = require('node:fs/promises');
const path = require('node:path');
const { Client } = require('pg');

test('retirar campos obsoletos conserva usuarios, sesiones, restaurantes e IDs numéricos', async () => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL para las pruebas con PostgreSQL.');
  const client = new Client({ connectionString: process.env.TEST_DATABASE_URL, connectionTimeoutMillis: 5000 });
  const schema = `test_${randomUUID().replaceAll('-', '')}`;
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query(`SET search_path TO "${schema}"`);
    await client.query('CREATE TABLE schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const directory = path.join(__dirname, '../migrations');
    for (const name of (await readdir(directory)).filter((name) => name.endsWith('.sql') && name < '011_').sort()) {
      const sql = (await readFile(path.join(directory, name), 'utf8')).replace(/\r\n/g, '\n');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [name, createHash('sha256').update(sql).digest('hex')]);
    }
    const legacyId = randomUUID();
    const googleId = randomUUID();
    await client.query(`INSERT INTO users (id, email, password_hash, firebase_uid, email_verified_at) VALUES
      ($1, 'legacy@example.com', 'legacy-password-hash', NULL, NULL),
      ($2, 'google@example.com', NULL, 'google-existing', '2026-01-01T00:00:00Z')`, [legacyId, googleId]);
    await client.query("INSERT INTO email_confirmations (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 day')", [legacyId, 'a'.repeat(64)]);
    await client.query("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '1 day')", [googleId, 'b'.repeat(64)]);
    await client.query("SELECT setval(pg_get_serial_sequence('restaurants', 'id'), 9007199254740993, false)");
    await client.query(`INSERT INTO restaurants (user_id, name, price, legacy_price, legacy_id) VALUES
      ($1, 'Con rango', '20to40', '25 €', $2), ($1, 'Sin rango', '', 'Consultar', NULL)`, [googleId, randomUUID()]);
    const restaurants = (await client.query('SELECT * FROM restaurants ORDER BY id')).rows.map(({ legacy_price, legacy_id, ...row }) => row);
    const sequence = (await client.query("SELECT pg_get_serial_sequence('restaurants', 'id') AS name")).rows[0].name;
    const sequenceState = (await client.query(`SELECT last_value, is_called FROM ${sequence}`)).rows;
    const users = await client.query('SELECT * FROM users ORDER BY id');
    const sessions = await client.query('SELECT * FROM sessions');
    const history = await client.query('SELECT * FROM schema_migrations ORDER BY name');
    const { migrate } = await import('../scripts/migrate.mjs');
    await migrate(client);
    await migrate(client);
    assert.equal((await client.query("SELECT to_regclass('email_confirmations') AS name")).rows[0].name, null);
    assert.deepEqual((await client.query('SELECT * FROM users ORDER BY id')).rows, users.rows);
    assert.deepEqual((await client.query('SELECT * FROM sessions')).rows, sessions.rows);
    assert.deepEqual((await client.query('SELECT * FROM restaurants ORDER BY id')).rows, restaurants);
    assert.equal((await client.query("SELECT pg_get_serial_sequence('restaurants', 'id') AS name")).rows[0].name, sequence);
    assert.deepEqual((await client.query(`SELECT last_value, is_called FROM ${sequence}`)).rows, sequenceState);
    assert.deepEqual((await client.query("SELECT attname FROM pg_attribute WHERE attrelid = 'restaurants'::regclass AND NOT attisdropped AND attname IN ('legacy_price', 'legacy_id')")).rows, []);
    const constraints = (await client.query("SELECT conname FROM pg_constraint WHERE conrelid = 'restaurants'::regclass")).rows.map(row => row.conname);
    assert.ok(!constraints.includes('restaurants_legacy_id_key'));
    for (const name of ['restaurants_pkey', 'restaurants_price_check', 'restaurants_user_id_fkey']) assert.ok(constraints.includes(name));
    assert.equal((await client.query("SELECT to_regclass('restaurants_legacy_id_key') AS name")).rows[0].name, null);
    const next = await client.query("INSERT INTO restaurants (user_id, name, price) VALUES ($1, 'Siguiente', 'under20') RETURNING id", [googleId]);
    assert.equal(next.rows[0].id, '9007199254740995');
    const migrated = (await client.query('SELECT * FROM schema_migrations ORDER BY name')).rows;
    assert.deepEqual(migrated.slice(0, history.rows.length), history.rows);
    assert.equal(migrated.length, history.rows.length + 3);
    assert.ok(migrated.some(row => row.name === '011_drop_email_confirmations.sql'));
  } finally {
    try {
      await client.query('ROLLBACK');
      assert.match(schema, /^test_[a-f0-9]{32}$/);
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } finally { await client.end(); }
  }
});
