-- Chat único por pareja de artistas.
-- Esta migración reinicia únicamente las tablas de chat y conserva
-- usuarios, perfiles, ideas y propuestas.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `mensajes`;
DROP TABLE IF EXISTS `conversaciones`;

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE `propuestas`
  ADD COLUMN `conversacion_id` INTEGER NULL;

CREATE TABLE `conversaciones` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_a_id` INTEGER NOT NULL,
  `usuario_b_id` INTEGER NOT NULL,
  `ultimo_mensaje_en` DATETIME(3) NULL,
  `ultima_actividad_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL,
  UNIQUE INDEX `conversaciones_usuario_a_id_usuario_b_id_key`(`usuario_a_id`, `usuario_b_id`),
  INDEX `conversaciones_usuario_a_id_ultima_actividad_en_idx`(`usuario_a_id`, `ultima_actividad_en`),
  INDEX `conversaciones_usuario_b_id_ultima_actividad_en_idx`(`usuario_b_id`, `ultima_actividad_en`),
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

CREATE INDEX `propuestas_conversacion_id_estado_creado_en_idx`
  ON `propuestas`(`conversacion_id`, `estado`, `creado_en`);

ALTER TABLE `conversaciones`
  ADD CONSTRAINT `conversaciones_usuario_a_id_fkey`
  FOREIGN KEY (`usuario_a_id`) REFERENCES `usuarios`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `conversaciones`
  ADD CONSTRAINT `conversaciones_usuario_b_id_fkey`
  FOREIGN KEY (`usuario_b_id`) REFERENCES `usuarios`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `propuestas`
  ADD CONSTRAINT `propuestas_conversacion_id_fkey`
  FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_conversacion_id_fkey`
  FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_remitente_id_fkey`
  FOREIGN KEY (`remitente_id`) REFERENCES `usuarios`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Recupera las propuestas aceptadas de prueba y las agrupa por pareja.
INSERT INTO `conversaciones`
  (
    `usuario_a_id`,
    `usuario_b_id`,
    `ultimo_mensaje_en`,
    `ultima_actividad_en`,
    `creado_en`,
    `actualizado_en`
  )
SELECT
  LEAST(`i`.`usuario_id`, `p`.`remitente_id`) AS `usuario_a_id`,
  GREATEST(`i`.`usuario_id`, `p`.`remitente_id`) AS `usuario_b_id`,
  NULL,
  MAX(`p`.`actualizado_en`),
  MIN(`p`.`actualizado_en`),
  MAX(`p`.`actualizado_en`)
FROM `propuestas` AS `p`
INNER JOIN `ideas` AS `i`
  ON `i`.`id` = `p`.`idea_id`
WHERE `p`.`estado` = 'ACEPTADA'
GROUP BY
  LEAST(`i`.`usuario_id`, `p`.`remitente_id`),
  GREATEST(`i`.`usuario_id`, `p`.`remitente_id`);

UPDATE `propuestas` AS `p`
INNER JOIN `ideas` AS `i`
  ON `i`.`id` = `p`.`idea_id`
INNER JOIN `conversaciones` AS `c`
  ON `c`.`usuario_a_id` = LEAST(`i`.`usuario_id`, `p`.`remitente_id`)
 AND `c`.`usuario_b_id` = GREATEST(`i`.`usuario_id`, `p`.`remitente_id`)
SET `p`.`conversacion_id` = `c`.`id`
WHERE `p`.`estado` = 'ACEPTADA';
