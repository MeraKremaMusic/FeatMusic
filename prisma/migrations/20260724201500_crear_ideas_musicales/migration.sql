-- Crea la tabla de ideas musicales y la relaciona con usuarios.
CREATE TABLE `ideas` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `titulo` VARCHAR(80) NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `bpm` INTEGER NOT NULL,
  `tonalidad` VARCHAR(30) NOT NULL,
  `audio_url` VARCHAR(1000) NOT NULL,
  `audio_public_id` VARCHAR(255) NOT NULL,
  `duracion_segundos` INTEGER NOT NULL,
  `formato` VARCHAR(20) NULL,
  `tamano_bytes` INTEGER NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  `expira_en` DATETIME(3) NOT NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL,

  INDEX `ideas_usuario_id_estado_expira_en_idx`(`usuario_id`, `estado`, `expira_en`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ideas`
  ADD CONSTRAINT `ideas_usuario_id_fkey`
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
