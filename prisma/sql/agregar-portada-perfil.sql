-- FEATMUSIC_PORTADA_PERFIL_ARTISTA_V1
-- Ejecuta esta consulta una sola vez en la base de datos de FeatMusic.

ALTER TABLE `usuarios`
  ADD COLUMN `portada_perfil` VARCHAR(500) NULL AFTER `foto_perfil`;
