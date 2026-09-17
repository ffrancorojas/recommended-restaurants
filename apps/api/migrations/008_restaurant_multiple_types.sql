ALTER TABLE restaurants DROP CONSTRAINT restaurants_type_check;
ALTER TABLE restaurants ALTER COLUMN type DROP DEFAULT;
ALTER TABLE restaurants ALTER COLUMN type TYPE text[]
  USING CASE WHEN type = '' THEN ARRAY[]::text[] ELSE ARRAY[type]::text[] END;
ALTER TABLE restaurants ALTER COLUMN type SET DEFAULT ARRAY[]::text[];
ALTER TABLE restaurants ADD CONSTRAINT restaurants_type_check CHECK (
  type <@ ARRAY[
    'Hamburguesería', 'Sushi', 'Carne', 'Pescado', 'Italiano',
    'Mexicano', 'Tapas', 'Vegetariano', 'Mediterráneo', 'Japonés', 'Chino', 'Turco', 'Otro'
  ]::text[]
  AND array_position(type, NULL) IS NULL
);
