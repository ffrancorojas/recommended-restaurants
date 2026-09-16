ALTER TABLE restaurants DROP CONSTRAINT restaurants_rating_check;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_rating_check
  CHECK (rating IN ('', 'loved', 'liked', 'neutral', 'disliked', 'disappointed'));
