-- FEATMUSIC: SISTEMA PARA SEGUIR ARTISTAS
-- Es idempotente para convivir con la instalación manual de Hostinger.
CREATE TABLE IF NOT EXISTS `seguimientos` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `seguidor_id` INTEGER NOT NULL,
  `seguido_id` INTEGER NOT NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `seguimientos_seguidor_id_seguido_id_key`
    (`seguidor_id`, `seguido_id`),
  INDEX `seguimientos_seguidor_id_creado_en_idx`
    (`seguidor_id`, `creado_en`),
  INDEX `seguimientos_seguido_id_creado_en_idx`
    (`seguido_id`, `creado_en`),
  PRIMARY KEY (`id`),
  CONSTRAINT `seguimientos_seguidor_id_fkey`
    FOREIGN KEY (`seguidor_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `seguimientos_seguido_id_fkey`
    FOREIGN KEY (`seguido_id`) REFERENCES `usuarios`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
