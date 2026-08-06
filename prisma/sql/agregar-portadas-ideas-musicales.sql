-- Ejecutar una sola vez en la base de datos de FeatMusic.
ALTER TABLE `ideas`
  ADD COLUMN `portada_url` VARCHAR(1000) NULL AFTER `tipo_acuerdo`,
  ADD COLUMN `portada_public_id` VARCHAR(255) NULL AFTER `portada_url`;
