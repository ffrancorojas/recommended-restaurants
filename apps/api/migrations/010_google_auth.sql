-- Preserve existing users and restaurant ownership. Never link accounts by email alone.
ALTER TABLE users ADD COLUMN firebase_uid varchar(128) UNIQUE;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_identity_check
  CHECK (password_hash IS NOT NULL OR firebase_uid IS NOT NULL);
