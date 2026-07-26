-- Permite conservar el historial de propuestas aunque el audio haya sido eliminado.
ALTER TABLE `propuestas`
  MODIFY `audio_url` VARCHAR(1000) NULL,
  MODIFY `audio_public_id` VARCHAR(255) NULL;
