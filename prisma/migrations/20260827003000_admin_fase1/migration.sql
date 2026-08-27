-- FEATMUSIC_ADMIN_FASE1_V1
-- Agrega un rol de sistema independiente del plan Premium.
ALTER TABLE `usuarios`
  ADD COLUMN `rol_sistema` VARCHAR(20) NOT NULL DEFAULT 'USUARIO';

-- El modelo ya existe en Prisma. CREATE IF NOT EXISTS permite que esta
-- migración también sea segura en bases donde la tabla se creó previamente.
CREATE TABLE IF NOT EXISTS `reportes_usuarios` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reportante_id` INTEGER NOT NULL,
  `reportado_id` INTEGER NOT NULL,
  `motivo` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(1000) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `reportes_usuarios_reportante_id_creado_en_idx`(`reportante_id`, `creado_en`),
  INDEX `reportes_usuarios_reportado_id_estado_creado_en_idx`(`reportado_id`, `estado`, `creado_en`),
  PRIMARY KEY (`id`),
  CONSTRAINT `reportes_usuarios_reportante_id_fkey`
    FOREIGN KEY (`reportante_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reportes_usuarios_reportado_id_fkey`
    FOREIGN KEY (`reportado_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
