-- Guarda la relación entre cada usuario de FeatMusic y su suscripción de Mercado Pago.
CREATE TABLE `suscripciones_mercadopago` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `mercadopago_id` VARCHAR(100) NULL,
  `referencia` VARCHAR(160) NOT NULL,
  `plan` VARCHAR(20) NOT NULL,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `monto` INTEGER NOT NULL,
  `moneda` VARCHAR(10) NOT NULL DEFAULT 'COP',
  `payer_email` VARCHAR(255) NULL,
  `checkout_url` VARCHAR(1000) NULL,
  `ultimo_pago_id` VARCHAR(100) NULL,
  `ultimo_pago_estado` VARCHAR(30) NULL,
  `proximo_cobro_en` DATETIME(3) NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL,

  UNIQUE INDEX `suscripciones_mercadopago_mercadopago_id_key`(`mercadopago_id`),
  UNIQUE INDEX `suscripciones_mercadopago_referencia_key`(`referencia`),
  INDEX `suscripciones_mercadopago_usuario_id_estado_actualizado_en_idx`(`usuario_id`, `estado`, `actualizado_en`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `suscripciones_mercadopago`
  ADD CONSTRAINT `suscripciones_mercadopago_usuario_id_fkey`
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
