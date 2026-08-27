-- Motor base de planes de FeatMusic.
-- Todos los usuarios existentes permanecen en el plan GRATUITO.
ALTER TABLE `usuarios`
  ADD COLUMN `plan` VARCHAR(20) NOT NULL DEFAULT 'GRATUITO';
