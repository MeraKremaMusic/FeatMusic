-- Mantener beneficios hasta terminar el periodo ya pagado.
ALTER TABLE `suscripciones_mercadopago`
  ADD COLUMN `activada_en` DATETIME(3) NULL,
  ADD COLUMN `cancelada_en` DATETIME(3) NULL,
  ADD COLUMN `beneficios_hasta` DATETIME(3) NULL;

-- Compatibilidad con suscripciones ya existentes.
UPDATE `suscripciones_mercadopago`
SET `activada_en` = `creado_en`
WHERE `activada_en` IS NULL
  AND `estado` = 'authorized';

UPDATE `suscripciones_mercadopago`
SET `beneficios_hasta` = `proximo_cobro_en`
WHERE `beneficios_hasta` IS NULL
  AND `proximo_cobro_en` IS NOT NULL
  AND `estado` IN ('authorized', 'canceled', 'cancelled');
