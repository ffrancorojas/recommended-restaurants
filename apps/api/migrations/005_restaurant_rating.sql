ALTER TABLE restaurants ADD COLUMN rating text NOT NULL DEFAULT ''
  CHECK (rating IN ('', 'liked', 'disliked'));
