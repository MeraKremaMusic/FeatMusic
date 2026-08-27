CREATE TABLE IF NOT EXISTS `vistas_ideas` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `idea_id` INTEGER NOT NULL,
  `usuario_id` INTEGER NOT NULL,
  `vista_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `vistas_ideas_idea_id_usuario_id_key`(`idea_id`, `usuario_id`),
  INDEX `vistas_ideas_idea_id_vista_en_idx`(`idea_id`, `vista_en`),
  INDEX `vistas_ideas_usuario_id_vista_en_idx`(`usuario_id`, `vista_en`),
  PRIMARY KEY (`id`),
  CONSTRAINT `vistas_ideas_idea_id_fkey`
    FOREIGN KEY (`idea_id`) REFERENCES `ideas`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vistas_ideas_usuario_id_fkey`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
