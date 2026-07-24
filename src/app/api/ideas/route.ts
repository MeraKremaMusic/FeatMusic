import { NextResponse } from "next/server";
import { z } from "zod";

import {
  eliminarAudioIdea,
  subirAudioIdea,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_SIZE = 20 * 1024 * 1024;
const MAX_AUDIO_DURATION = 120;
const MAX_ACTIVE_IDEAS = 3;

const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
]);

const AUDIO_EXTENSIONS = new Set([
  "mp3",
  "wav",
  "m4a",
  "aac",
  "ogg",
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
  duracionSegundos: z.coerce
    .number()
    .positive("No se pudo comprobar la duración del audio.")
    .max(
      MAX_AUDIO_DURATION,
      `El audio no puede durar más de ${MAX_AUDIO_DURATION} segundos.`,
    ),
});

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function obtenerExtension(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toLowerCase() ?? "";
}

function tipoAudioPermitido(archivo: File) {
  return (
    AUDIO_TYPES.has(archivo.type.toLowerCase()) ||
    AUDIO_EXTENSIONS.has(obtenerExtension(archivo.name))
  );
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
      duracionSegundos: formData.get("duracionSegundos"),
    });

    if (!resultado.success) {
      return respuestaError(
        resultado.error.issues[0]?.message ?? "Los datos enviados no son válidos.",
        400,
      );
    }

    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return respuestaError("Selecciona un archivo de audio.", 400);
    }

    if (!tipoAudioPermitido(audio)) {
      return respuestaError(
        "El audio debe estar en formato MP3, WAV, M4A, AAC u OGG.",
        400,
      );
    }

    if (audio.size > MAX_AUDIO_SIZE) {
      return respuestaError("El audio no puede pesar más de 20 MB.", 400);
    }

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
      audioSubido.duracionSegundos <= 0 ||
      audioSubido.duracionSegundos > MAX_AUDIO_DURATION
    ) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error("No se pudo eliminar el audio rechazado.", error);
      });
      audioPublicId = null;

      return respuestaError(
        `El audio no puede durar más de ${MAX_AUDIO_DURATION} segundos.`,
        400,
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
        formato: audioSubido.formato,
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
        mensaje: "Idea publicada correctamente.",
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
