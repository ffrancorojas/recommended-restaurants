CREATE TABLE users (
  id uuid PRIMARY KEY,
  email varchar(254) NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token_hash char(64) PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE restaurants (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(160) NOT NULL CHECK (length(trim(name)) > 0),
  locality varchar(160) NOT NULL DEFAULT '',
  dishes varchar(2000) NOT NULL DEFAULT '',
  price varchar(80) NOT NULL DEFAULT '',
  type varchar(40) NOT NULL DEFAULT '' CHECK (type IN (
    '', 'Hamburguesería', 'Sushi', 'Carne', 'Pescado', 'Italiano',
    'Mexicano', 'Tapas', 'Vegetariano', 'Otro'
  )),
  notes varchar(4000) NOT NULL DEFAULT '',
  recommended_by varchar(160) NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX restaurants_user_created_idx ON restaurants(user_id, created_at DESC, id DESC);
