-- Remove obsolete free-text prices; keep the current range and its CHECK constraint.
ALTER TABLE restaurants DROP COLUMN legacy_price;
