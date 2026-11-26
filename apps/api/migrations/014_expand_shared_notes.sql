-- Permite guardar las observaciones originales junto a la opinión del remitente compartida.
ALTER TABLE restaurants ALTER COLUMN notes TYPE varchar(8200);
