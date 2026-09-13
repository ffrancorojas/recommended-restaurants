ALTER TABLE restaurants
  ADD COLUMN visited boolean NOT NULL DEFAULT false,
  ADD COLUMN opinion text NOT NULL DEFAULT '' CHECK (char_length(opinion) <= 4000);
