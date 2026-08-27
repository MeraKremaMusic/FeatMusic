-- FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
-- Guarda el primer fallo de renovación y el límite del período de gracia.
ALTER TABLE `suscripciones_mercadopago`
  ADD COLUMN `pago_fallido_en` DATETIME(3) NULL,
  ADD COLUMN `gracia_hasta` DATETIME(3) NULL,
  ADD INDEX `suscripciones_mercadopago_estado_gracia_hasta_idx`
    (`estado`, `gracia_hasta`);
