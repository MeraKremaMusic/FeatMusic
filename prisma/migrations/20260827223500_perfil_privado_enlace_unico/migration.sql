-- FEATMUSIC_PERFIL_PRIVADO_ENLACE_UNICO_V1
-- Todos los perfiles existentes continúan públicos.
-- La versión solo cambia cuando el usuario regenera manualmente su enlace.
ALTER TABLE `usuarios`
  ADD COLUMN `perfil_privado` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `version_enlace_privado` INT NOT NULL DEFAULT 1;
