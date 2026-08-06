-- FEATMUSIC_REPORTES_USUARIOS_V1
-- Ejecutar una sola vez antes de usar /reportar-usuario.

CREATE TABLE `reportes_usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reportante_id` INT NOT NULL,
  `reportado_id` INT NOT NULL,
  `motivo` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(1000) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `reportes_usuarios_reportante_fecha_idx` (`reportante_id`, `creado_en`),
  INDEX `reportes_usuarios_reportado_estado_fecha_idx` (`reportado_id`, `estado`, `creado_en`),
  CONSTRAINT `reportes_usuarios_reportante_id_fkey`
    FOREIGN KEY (`reportante_id`) REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reportes_usuarios_reportado_id_fkey`
    FOREIGN KEY (`reportado_id`) REFERENCES `usuarios` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
