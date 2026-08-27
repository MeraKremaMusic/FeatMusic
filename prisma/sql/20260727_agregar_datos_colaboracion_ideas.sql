-- Ejecutar UNA SOLA VEZ en la base de datos MySQL utilizada por FeatMusic.
-- Las columnas permiten NULL para conservar sin cambios las ideas antiguas.
ALTER TABLE `ideas`
  ADD COLUMN `rol_buscado` VARCHAR(30) NULL,
  ADD COLUMN `genero_musical` VARCHAR(60) NULL,
  ADD COLUMN `idioma_buscado` VARCHAR(40) NULL,
  ADD COLUMN `modalidad_colaboracion` VARCHAR(20) NULL,
  ADD COLUMN `pais_preferido` VARCHAR(120) NULL,
  ADD COLUMN `departamento_preferido` VARCHAR(120) NULL,
  ADD COLUMN `ciudad_preferida` VARCHAR(120) NULL,
  ADD COLUMN `tipo_acuerdo` VARCHAR(30) NULL;
