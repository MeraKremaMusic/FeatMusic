-- FEATMUSIC_MI_CUENTA_V1
-- Versionado de sesiones + marca de eliminación/anominización de cuenta.

ALTER TABLE `usuarios`
  ADD COLUMN `sesion_version` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `eliminado_en` DATETIME(3) NULL;
