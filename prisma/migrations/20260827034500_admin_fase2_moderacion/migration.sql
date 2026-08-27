-- FEATMUSIC_ADMIN_FASE2_MODERACION_V1
-- Sistema de sanciones separado de planes Premium y Mercado Pago.

ALTER TABLE `usuarios`
  ADD COLUMN `estado_cuenta` VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  ADD COLUMN `suspendido_hasta` DATETIME(3) NULL,
  ADD COLUMN `motivo_restriccion` VARCHAR(500) NULL;

CREATE TABLE `acciones_moderacion` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `admin_id` INTEGER NOT NULL,
  `reporte_id` INTEGER NULL,
  `accion` VARCHAR(30) NOT NULL,
  `motivo` VARCHAR(500) NOT NULL,
  `suspendido_hasta` DATETIME(3) NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `acciones_moderacion_usuario_id_creado_en_idx`(`usuario_id`, `creado_en`),
  INDEX `acciones_moderacion_admin_id_creado_en_idx`(`admin_id`, `creado_en`),
  INDEX `acciones_moderacion_reporte_id_idx`(`reporte_id`),
  PRIMARY KEY (`id`),

  CONSTRAINT `acciones_moderacion_usuario_id_fkey`
    FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT `acciones_moderacion_admin_id_fkey`
    FOREIGN KEY (`admin_id`) REFERENCES `usuarios`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT `acciones_moderacion_reporte_id_fkey`
    FOREIGN KEY (`reporte_id`) REFERENCES `reportes_usuarios`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
