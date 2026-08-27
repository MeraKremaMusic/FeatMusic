-- Protección final contra publicaciones duplicadas del mismo audio.
ALTER TABLE `ideas` ADD UNIQUE INDEX `ideas_audio_public_id_key`(`audio_public_id`);
