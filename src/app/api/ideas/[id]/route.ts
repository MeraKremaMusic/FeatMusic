import { NextResponse } from "next/server";

import { eliminarAudioIdea } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function convertirId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function DELETE(_request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const { id: idTexto } = await contexto.params;
  const ideaId = convertirId(idTexto);

  if (!ideaId) {
    return respuestaError("El identificador de la idea no es válido.", 400);
  }

  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      usuarioId: sesion.usuarioId,
    },
    select: {
      id: true,
      audioPublicId: true,
    },
  });

  if (!idea) {
    return respuestaError("No se encontró la idea musical.", 404);
  }

  try {
    await eliminarAudioIdea(idea.audioPublicId);

    await prisma.idea.delete({
      where: { id: idea.id },
    });

    return NextResponse.json({
      ok: true,
      mensaje: "La idea y su audio fueron eliminados correctamente.",
    });
  } catch (error) {
    console.error("No se pudo eliminar la idea musical.", error);
    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo eliminar la idea musical.",
      500,
    );
  }
}
