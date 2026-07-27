-- FEATMUSIC: CENTRO COMPLETO DE NOTIFICACIONES
-- Crea notificaciones para propuestas, decisiones, reintentos y mensajes.
-- No elimina usuarios, ideas, propuestas, conversaciones ni mensajes.

CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `actor_id` INTEGER NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `titulo` VARCHAR(160) NOT NULL,
  `mensaje` VARCHAR(500) NOT NULL,
  `enlace` VARCHAR(500) NULL,
  `entidad_tipo` VARCHAR(50) NULL,
  `entidad_id` INTEGER NULL,
  `conversacion_id` INTEGER NULL,
  `leida_en` DATETIME(3) NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `notificaciones_usuario_id_leida_en_creado_en_idx`
    (`usuario_id`, `leida_en`, `creado_en`),
  INDEX `notificaciones_conversacion_id_leida_en_idx`
    (`conversacion_id`, `leida_en`),
  INDEX `notificaciones_entidad_tipo_entidad_id_idx`
    (`entidad_tipo`, `entidad_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `notificaciones_usuario_id_fkey`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notificaciones_actor_id_fkey`
    FOREIGN KEY (`actor_id`) REFERENCES `usuarios`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SELECT
  COUNT(*) AS notificaciones_totales,
  SUM(`leida_en` IS NULL) AS notificaciones_sin_leer
FROM `notificaciones`;
