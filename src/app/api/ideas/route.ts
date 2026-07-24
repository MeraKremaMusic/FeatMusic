import { NextResponse } from "next/server";
import { z } from "zod";

import { eliminarAudioIdea, subirAudioIdea } from "@/lib/cloudinary";
import { limpiarIdeasExpiradasUsuario } from "@/lib/ideas";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_DURATION = 240;
const MAX_ACTIVE_IDEAS = 3;

const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/aiff",
  "audio/x-aiff",
  "audio/opus",
]);

const MIME_TYPES_GENERICOS = new Set(["", "application/octet-stream"]);

const AUDIO_EXTENSIONS = new Set([
  "mp3",
  "wav",
  "flac",
  "m4a",
  "aac",
  "ogg",
  "aiff",
  "aif",
  "opus",
]);

const ideaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(80, "El título no puede superar 80 caracteres."),
  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(300, "La descripción no puede superar 300 caracteres."),
  bpm: z.coerce
    .number()
    .int("El BPM debe ser un número entero.")
    .min(40, "El BPM mínimo es 40.")
    .max(250, "El BPM máximo es 250."),
  tonalidad: z
    .string()
    .trim()
    .min(1, "Selecciona la tonalidad de la canción.")
    .max(30, "La tonalidad no puede superar 30 caracteres."),
});

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function obtenerExtension(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toLowerCase() ?? "";
}

function tipoAudioPermitido(archivo: File) {
  const extensionValida = AUDIO_EXTENSIONS.has(
    obtenerExtension(archivo.name),
  );
  const mime = archivo.type.toLowerCase();
  const mimeValido = AUDIO_TYPES.has(mime) || MIME_TYPES_GENERICOS.has(mime);

  return extensionValida && mimeValido;
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  let audioPublicId: string | null = null;

  try {
    const formData = await request.formData();
    const resultado = ideaSchema.safeParse({
      titulo: formData.get("titulo"),
      descripcion: formData.get("descripcion"),
      bpm: formData.get("bpm"),
      tonalidad: formData.get("tonalidad"),
    });

    if (!resultado.success) {
      return respuestaError(
        resultado.error.issues[0]?.message ??
          "Los datos enviados no son válidos.",
        400,
      );
    }

    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return respuestaError("Selecciona un archivo de audio.", 400);
    }

    if (!tipoAudioPermitido(audio)) {
      return respuestaError(
        "El audio debe ser MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u OPUS.",
        400,
      );
    }

    if (audio.size > MAX_AUDIO_SIZE) {
      return respuestaError(
        "El archivo original no puede pesar más de 50 MB.",
        400,
      );
    }

    await limpiarIdeasExpiradasUsuario(sesion.usuarioId).catch((error) => {
      console.error("No se pudieron limpiar las ideas expiradas.", error);
    });

    const ahora = new Date();
    const ideasActivas = await prisma.idea.count({
      where: {
        usuarioId: sesion.usuarioId,
        estado: "ACTIVA",
        expiraEn: { gt: ahora },
      },
    });

    if (ideasActivas >= MAX_ACTIVE_IDEAS) {
      return respuestaError(
        "Ya alcanzaste el límite de 3 ideas activas.",
        409,
      );
    }

    const audioSubido = await subirAudioIdea(audio, sesion.usuarioId);
    audioPublicId = audioSubido.publicId;

    if (
      audioSubido.resourceType !== "video" ||
      audioSubido.formato?.toLowerCase() !== "mp3"
    ) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error("No se pudo eliminar el audio con formato inválido.", error);
      });
      audioPublicId = null;

      return respuestaError(
        "No se pudo convertir el archivo a MP3. Prueba con otro audio.",
        422,
      );
    }

    if (
      audioSubido.duracionSegundos <= 0 ||
      audioSubido.duracionSegundos > MAX_AUDIO_DURATION
    ) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error("No se pudo eliminar el audio rechazado.", error);
      });
      audioPublicId = null;

      return respuestaError(
        `El audio no puede durar más de ${MAX_AUDIO_DURATION / 60} minutos.`,
        400,
      );
    }

    if (!audioSubido.bytes || audioSubido.bytes <= 0) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error("No se pudo eliminar el audio incompleto.", error);
      });
      audioPublicId = null;

      return respuestaError(
        "Cloudinary no devolvió un archivo de audio válido.",
        422,
      );
    }

    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 60);

    const idea = await prisma.idea.create({
      data: {
        usuarioId: sesion.usuarioId,
        titulo: resultado.data.titulo,
        descripcion: resultado.data.descripcion,
        bpm: resultado.data.bpm,
        tonalidad: resultado.data.tonalidad,
        audioUrl: audioSubido.url,
        audioPublicId: audioSubido.publicId,
        duracionSegundos: audioSubido.duracionSegundos,
        formato: "mp3",
        tamanoBytes: audioSubido.bytes,
        expiraEn,
      },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        bpm: true,
        tonalidad: true,
        audioUrl: true,
        duracionSegundos: true,
        formato: true,
        tamanoBytes: true,
        estado: true,
        expiraEn: true,
        creadoEn: true,
      },
    });

    audioPublicId = null;

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Idea publicada y optimizada correctamente.",
        idea,
      },
      { status: 201 },
    );
  } catch (error) {
    if (audioPublicId) {
      await eliminarAudioIdea(audioPublicId).catch((errorEliminacion) => {
        console.error(
          "No se pudo limpiar el audio después del error.",
          errorEliminacion,
        );
      });
    }

    console.error("No se pudo publicar la idea.", error);
    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo publicar la idea. Inténtalo nuevamente.",
      500,
    );
  }
}
