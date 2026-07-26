-- Crea la tabla de propuestas musicales y la relaciona con ideas y usuarios.
CREATE TABLE `propuestas` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idea_id` INTEGER NOT NULL,
  `remitente_id` INTEGER NOT NULL,
  `mensaje` VARCHAR(500) NULL,
  `audio_url` VARCHAR(1000) NOT NULL,
  `audio_public_id` VARCHAR(255) NOT NULL,
  `duracion_segundos` INTEGER NOT NULL,
  `formato` VARCHAR(20) NULL,
  `tamano_bytes` INTEGER NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL,

  UNIQUE INDEX `propuestas_idea_id_remitente_id_key`(`idea_id`, `remitente_id`),
  INDEX `propuestas_idea_id_estado_creado_en_idx`(`idea_id`, `estado`, `creado_en`),
  INDEX `propuestas_remitente_id_estado_creado_en_idx`(`remitente_id`, `estado`, `creado_en`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `propuestas`
  ADD CONSTRAINT `propuestas_idea_id_fkey`
  FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `propuestas`
  ADD CONSTRAINT `propuestas_remitente_id_fkey`
  FOREIGN KEY (`remitente_id`) REFERENCES `usuarios`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
