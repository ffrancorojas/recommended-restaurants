-- Keep the numeric primary key and identity sequence unchanged.
ALTER TABLE restaurants
  DROP CONSTRAINT restaurants_legacy_id_key,
  DROP COLUMN legacy_id;
