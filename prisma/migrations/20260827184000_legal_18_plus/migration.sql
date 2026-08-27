-- FEATMUSIC_LEGAL_18_PLUS_V1
ALTER TABLE `usuarios`
  ADD COLUMN `version_legal_aceptada` VARCHAR(20) NULL,
  ADD COLUMN `confirmo_mayoria_edad_en` DATETIME(3) NULL;

ALTER TABLE `registros_pendientes`
  ADD COLUMN `version_legal_aceptada` VARCHAR(20) NULL,
  ADD COLUMN `confirmo_mayoria_edad_en` DATETIME(3) NULL;
