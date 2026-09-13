-- Conserva el UUID anterior para poder identificar registros previos a la migración.
ALTER TABLE restaurants RENAME COLUMN id TO legacy_id;
ALTER TABLE restaurants ADD COLUMN id bigint;
WITH numbered AS (
  SELECT legacy_id, row_number() OVER (ORDER BY created_at, legacy_id) AS new_id
  FROM restaurants
)
UPDATE restaurants SET id = numbered.new_id
FROM numbered WHERE restaurants.legacy_id = numbered.legacy_id;

DROP INDEX restaurants_user_created_idx;
ALTER TABLE restaurants DROP CONSTRAINT restaurants_pkey;
ALTER TABLE restaurants ALTER COLUMN legacy_id DROP NOT NULL;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_legacy_id_key UNIQUE (legacy_id);
ALTER TABLE restaurants ALTER COLUMN id SET NOT NULL;
ALTER TABLE restaurants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY;
ALTER TABLE restaurants ADD PRIMARY KEY (id);
SELECT setval(pg_get_serial_sequence('restaurants', 'id'),
  COALESCE((SELECT max(id) FROM restaurants), 1),
  EXISTS (SELECT 1 FROM restaurants));
CREATE INDEX restaurants_user_created_idx ON restaurants(user_id, created_at DESC, id DESC);
