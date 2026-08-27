-- FEATMUSIC_RATE_LIMIT_PASSWORDS_V1
CREATE TABLE `limites_seguridad` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `alcance` VARCHAR(50) NOT NULL,
  `clave_hash` CHAR(64) NOT NULL,
  `intentos` INTEGER NOT NULL DEFAULT 0,
  `ventana_inicia_en` DATETIME(3) NOT NULL,
  `bloqueado_hasta` DATETIME(3) NULL,
  `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `actualizado_en` DATETIME(3) NOT NULL,

  UNIQUE INDEX `limites_seguridad_alcance_clave_hash_key`(`alcance`, `clave_hash`),
  INDEX `limites_seguridad_bloqueado_hasta_idx`(`bloqueado_hasta`),
  INDEX `limites_seguridad_actualizado_en_idx`(`actualizado_en`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
