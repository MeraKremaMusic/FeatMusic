// FEATMUSIC_AUDIO_DIRECT_CLOUDINARY_V1
import { NextResponse } from "next/server";

import {
  crearFirmaSubidaDirectaAudioIdea,
  eliminarAudioIdea,
  esPublicIdAudioIdeaUsuario,
} from "@/lib/cloudinary";
import { limpiarIdeasExpiradasUsuario } from "@/lib/ideas";
import { obtenerLimitesPlan } from "@/lib/planes";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import { sincronizarPlanUsuario } from "@/lib/suscripciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;

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

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json(
    { ok: false, mensaje },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function obtenerExtension(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toLowerCase() ?? "";
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  try {
    const body = (await request.json()) as {
      nombreArchivo?: unknown;
      tamanoBytes?: unknown;
    };

    const nombreArchivo =
      typeof body.nombreArchivo === "string" ? body.nombreArchivo.trim() : "";
    const tamanoBytes = Number(body.tamanoBytes);

    if (!nombreArchivo || !Number.isFinite(tamanoBytes) || tamanoBytes <= 0) {
      return respuestaError("Selecciona un archivo de audio válido.", 400);
    }

    if (tamanoBytes > MAX_AUDIO_SIZE) {
      return respuestaError(
        "El archivo original no puede pesar más de 50 MB.",
        400,
      );
    }

    const extensionValida = AUDIO_EXTENSIONS.has(
      obtenerExtension(nombreArchivo),
    );

    // No bloqueamos por MIME del navegador: Safari, Android y algunos
    // exploradores reportan tipos diferentes para WAV/M4A/AAC. Cloudinary
    // convierte el archivo y /api/ideas verifica después que el resultado
    // real sea un MP3 válido antes de crear la publicación.
    if (!extensionValida) {
      return respuestaError(
        "El audio debe ser MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u OPUS.",
        400,
      );
    }

    await limpiarIdeasExpiradasUsuario(sesion.usuarioId).catch((error) => {
      console.error("No se pudieron limpiar las ideas expiradas.", error);
    });

    await sincronizarPlanUsuario(sesion.usuarioId);

    const [usuario, ideasActivas] = await prisma.$transaction([
      prisma.usuario.findUnique({
        where: { id: sesion.usuarioId },
        select: { plan: true },
      }),
      prisma.idea.count({
        where: {
          usuarioId: sesion.usuarioId,
          estado: "ACTIVA",
          expiraEn: { gt: new Date() },
        },
      }),
    ]);

    const limiteIdeas = obtenerLimitesPlan(usuario?.plan).ideasActivas;

    if (ideasActivas >= limiteIdeas) {
      return respuestaError(
        `Ya alcanzaste el límite de ${limiteIdeas} ideas activas de tu plan.`,
        409,
      );
    }

    const firma = crearFirmaSubidaDirectaAudioIdea(sesion.usuarioId);

    return NextResponse.json(
      { ok: true, ...firma },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("No se pudo preparar la subida directa del audio.", error);
    return respuestaError(
      "No se pudo preparar la subida del audio. Inténtalo nuevamente.",
      500,
    );
  }
}

export async function DELETE(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  try {
    const body = (await request.json()) as { publicId?: unknown };
    const publicId =
      typeof body.publicId === "string" ? body.publicId.trim() : "";

    if (!publicId || !esPublicIdAudioIdeaUsuario(publicId, sesion.usuarioId)) {
      return respuestaError("El audio indicado no es válido.", 400);
    }

    const ideaExistente = await prisma.idea.findFirst({
      where: { audioPublicId: publicId },
      select: { id: true },
    });

    if (ideaExistente) {
      return NextResponse.json(
        { ok: true, protegido: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    await eliminarAudioIdea(publicId);

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("No se pudo limpiar el audio temporal.", error);
    return respuestaError(
      "No se pudo limpiar el audio temporal.",
      500,
    );
  }
}
