ALTER TABLE restaurants DROP CONSTRAINT restaurants_type_check;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_type_check CHECK (type IN (
  '', 'Hamburguesería', 'Sushi', 'Carne', 'Pescado', 'Italiano',
  'Mexicano', 'Tapas', 'Vegetariano', 'Mediterráneo', 'Japonés', 'Chino', 'Turco', 'Otro'
));
