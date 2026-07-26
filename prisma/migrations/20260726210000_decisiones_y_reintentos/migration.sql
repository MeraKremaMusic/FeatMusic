-- FEATMUSIC: DECISIONES, CAMBIOS Y REINTENTOS
-- Ejecutar una sola vez en phpMyAdmin/Hostinger.
-- No elimina usuarios, ideas, propuestas, conversaciones ni mensajes.

SET @base_actual := DATABASE();

-- Amplía el estado para CAMBIOS_SOLICITADOS.
ALTER TABLE `propuestas`
  MODIFY `estado` VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE';

-- motivo_decision
SET @existe_columna := (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = @base_actual
    AND `TABLE_NAME` = 'propuestas'
    AND `COLUMN_NAME` = 'motivo_decision'
);
SET @sql_columna := IF(
  @existe_columna = 0,
  'ALTER TABLE `propuestas` ADD COLUMN `motivo_decision` VARCHAR(500) NULL AFTER `estado`',
  'SELECT ''motivo_decision ya existe'' AS resultado'
);
PREPARE instruccion FROM @sql_columna;
EXECUTE instruccion;
DEALLOCATE PREPARE instruccion;

-- permite_reintento
SET @existe_columna := (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = @base_actual
    AND `TABLE_NAME` = 'propuestas'
    AND `COLUMN_NAME` = 'permite_reintento'
);
SET @sql_columna := IF(
  @existe_columna = 0,
  'ALTER TABLE `propuestas` ADD COLUMN `permite_reintento` BOOLEAN NOT NULL DEFAULT false AFTER `motivo_decision`',
  'SELECT ''permite_reintento ya existe'' AS resultado'
);
PREPARE instruccion FROM @sql_columna;
EXECUTE instruccion;
DEALLOCATE PREPARE instruccion;

-- numero_intento
SET @existe_columna := (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = @base_actual
    AND `TABLE_NAME` = 'propuestas'
    AND `COLUMN_NAME` = 'numero_intento'
);
SET @sql_columna := IF(
  @existe_columna = 0,
  'ALTER TABLE `propuestas` ADD COLUMN `numero_intento` INTEGER NOT NULL DEFAULT 1 AFTER `permite_reintento`',
  'SELECT ''numero_intento ya existe'' AS resultado'
);
PREPARE instruccion FROM @sql_columna;
EXECUTE instruccion;
DEALLOCATE PREPARE instruccion;

-- decision_en
SET @existe_columna := (
  SELECT COUNT(*)
  FROM `information_schema`.`COLUMNS`
  WHERE `TABLE_SCHEMA` = @base_actual
    AND `TABLE_NAME` = 'propuestas'
    AND `COLUMN_NAME` = 'decision_en'
);
SET @sql_columna := IF(
  @existe_columna = 0,
  'ALTER TABLE `propuestas` ADD COLUMN `decision_en` DATETIME(3) NULL AFTER `numero_intento`',
  'SELECT ''decision_en ya existe'' AS resultado'
);
PREPARE instruccion FROM @sql_columna;
EXECUTE instruccion;
DEALLOCATE PREPARE instruccion;

-- Normaliza datos existentes.
UPDATE `propuestas`
SET
  `permite_reintento` = false,
  `numero_intento` = CASE
    WHEN `numero_intento` IS NULL OR `numero_intento` < 1 THEN 1
    ELSE `numero_intento`
  END;

SELECT
  COUNT(*) AS propuestas_totales,
  SUM(`estado` = 'PENDIENTE') AS pendientes,
  SUM(`estado` = 'ACEPTADA') AS aceptadas,
  SUM(`estado` = 'RECHAZADA') AS rechazadas
FROM `propuestas`;
