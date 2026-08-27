-- FEATMUSIC: GUARDAR OPORTUNIDADES MUSICALES
-- Ejecutar UNA SOLA VEZ en la base de datos MySQL utilizada por FeatMusic.
-- Es segura para las ideas y usuarios existentes.
CREATE TABLE IF NOT EXISTS `ideas_guardadas` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `idea_id` INTEGER NOT NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `ideas_guardadas_usuario_id_idea_id_key`(`usuario_id`, `idea_id`),
  INDEX `ideas_guardadas_usuario_id_creado_en_idx`(`usuario_id`, `creado_en`),
  INDEX `ideas_guardadas_idea_id_idx`(`idea_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ideas_guardadas_usuario_id_fkey`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ideas_guardadas_idea_id_fkey`
    FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
