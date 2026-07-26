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
      estado: "ACTIVA",
    },
    select: {
      id: true,
      audioPublicId: true,
      propuestas: {
        select: {
          id: true,
          estado: true,
          audioPublicId: true,
        },
      },
    },
  });

  if (!idea) {
    return respuestaError("No se encontró la idea musical activa.", 404);
  }

  try {
    const propuestasNoAceptadas = idea.propuestas.filter(
      (propuesta) => propuesta.estado !== "ACEPTADA",
    );
    const tienePropuestaAceptada = idea.propuestas.some(
      (propuesta) => propuesta.estado === "ACEPTADA",
    );

    for (const propuesta of propuestasNoAceptadas) {
      if (propuesta.audioPublicId) {
        await eliminarAudioIdea(propuesta.audioPublicId);
      }
    }

    // Si ya existe una colaboración aceptada, conservamos el audio de la idea.
    // Si nunca se aceptó ninguna propuesta, liberamos también ese almacenamiento.
    if (!tienePropuestaAceptada) {
      await eliminarAudioIdea(idea.audioPublicId);
    }

    await prisma.$transaction(async (tx) => {
      await tx.propuesta.updateMany({
        where: {
          ideaId: idea.id,
          estado: { in: ["PENDIENTE", "RECHAZANDO"] },
        },
        data: {
          estado: "EXPIRADA",
          audioUrl: null,
          audioPublicId: null,
        },
      });

      await tx.propuesta.updateMany({
        where: {
          ideaId: idea.id,
          estado: { in: ["RECHAZADA", "EXPIRADA"] },
        },
        data: {
          audioUrl: null,
          audioPublicId: null,
        },
      });

      await tx.idea.update({
        where: { id: idea.id },
        data: {
          estado: "ELIMINADA",
        },
      });
    });

    return NextResponse.json({
      ok: true,
      mensaje: tienePropuestaAceptada
        ? "La idea se retiró del perfil. La propuesta aceptada y sus audios se conservaron."
        : "La idea se retiró del perfil y sus audios no aceptados fueron eliminados.",
    });
  } catch (error) {
    console.error("No se pudo retirar la idea musical.", error);
    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo retirar la idea musical.",
      500,
    );
  }
}
