-- Crea chats privados para las propuestas aceptadas.
CREATE TABLE `conversaciones` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `propuesta_id` INTEGER NOT NULL,
  `ultimo_mensaje_en` DATETIME(3) NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL,
  UNIQUE INDEX `conversaciones_propuesta_id_key`(`propuesta_id`),
  INDEX `conversaciones_ultimo_mensaje_en_idx`(`ultimo_mensaje_en`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `mensajes` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `conversacion_id` INTEGER NOT NULL,
  `remitente_id` INTEGER NOT NULL,
  `contenido` VARCHAR(2000) NOT NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `leido_en` DATETIME(3) NULL,
  INDEX `mensajes_conversacion_id_creado_en_idx`(`conversacion_id`, `creado_en`),
  INDEX `mensajes_remitente_id_creado_en_idx`(`remitente_id`, `creado_en`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `conversaciones`
  ADD CONSTRAINT `conversaciones_propuesta_id_fkey`
  FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_conversacion_id_fkey`
  FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_remitente_id_fkey`
  FOREIGN KEY (`remitente_id`) REFERENCES `usuarios`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Crea conversaciones para propuestas que ya estaban aceptadas antes de esta mejora.
INSERT INTO `conversaciones`
  (`propuesta_id`, `ultimo_mensaje_en`, `creado_en`, `actualizado_en`)
SELECT
  `p`.`id`,
  NULL,
  CURRENT_TIMESTAMP(3),
  CURRENT_TIMESTAMP(3)
FROM `propuestas` AS `p`
LEFT JOIN `conversaciones` AS `c`
  ON `c`.`propuesta_id` = `p`.`id`
WHERE `p`.`estado` = 'ACEPTADA'
  AND `c`.`id` IS NULL;
