ALTER TABLE restaurants ADD COLUMN legacy_price varchar(80) NOT NULL DEFAULT '';

-- Keep free-text estimates intact; users can choose their corresponding range.
UPDATE restaurants SET legacy_price = price, price = ''
WHERE price NOT IN ('', 'under20', '20to40', '40to60', '60to80', '80to100', 'over100');

ALTER TABLE restaurants ADD CONSTRAINT restaurants_price_check
  CHECK (price IN ('', 'under20', '20to40', '40to60', '60to80', '80to100', 'over100'));
