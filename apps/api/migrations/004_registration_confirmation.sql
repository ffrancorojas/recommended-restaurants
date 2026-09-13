ALTER TABLE users ADD COLUMN name varchar(160) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN nick varchar(40);
ALTER TABLE users ADD COLUMN email_verified_at timestamptz;
CREATE UNIQUE INDEX users_nick_unique ON users (lower(nick));
CREATE TABLE email_confirmations (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL
);
-- También las cuentas anteriores deben confirmar su correo.
DELETE FROM sessions;
