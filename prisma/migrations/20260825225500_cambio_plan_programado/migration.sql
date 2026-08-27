-- Programa cambios Creator <-> Pro para la siguiente renovación.
ALTER TABLE `suscripciones_mercadopago`
  ADD COLUMN `plan_programado` VARCHAR(20) NULL,
  ADD COLUMN `monto_programado` INTEGER NULL,
  ADD COLUMN `cambio_plan_en` DATETIME(3) NULL;
