import { NextResponse } from "next/server";
import { z } from "zod";

import { eliminarAudioIdea } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const estadoSchema = z.object({
  estado: z.enum(["ACEPTADA", "RECHAZADA"]),
});

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

function mensajeDecisionTomada(estado: string) {
  if (estado === "ACEPTADA") {
    return "Esta propuesta ya fue aceptada y la decisión es definitiva.";
  }

  if (estado === "RECHAZADA") {
    return "Esta propuesta ya fue rechazada y la decisión es definitiva.";
  }

  if (estado === "EXPIRADA") {
    return "Esta propuesta expiró y ya no puede responderse.";
  }

  return "Esta propuesta ya está siendo procesada. Actualiza la página e inténtalo nuevamente.";
}

export async function PATCH(request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const { id: idTexto } = await contexto.params;
  const propuestaId = convertirId(idTexto);

  if (!propuestaId) {
    return respuestaError(
      "El identificador de la propuesta no es válido.",
      400,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return respuestaError("El contenido enviado no es válido.", 400);
  }

  const resultado = estadoSchema.safeParse(body);

  if (!resultado.success) {
    return respuestaError(
      resultado.error.issues[0]?.message ?? "El estado no es válido.",
      400,
    );
  }

  const propuesta = await prisma.propuesta.findFirst({
    where: {
      id: propuestaId,
      idea: {
        usuarioId: sesion.usuarioId,
        estado: "ACTIVA",
        expiraEn: { gt: new Date() },
      },
    },
    select: {
      id: true,
      estado: true,
      audioPublicId: true,
    },
  });

  if (!propuesta) {
    return respuestaError(
      "No se encontró la propuesta, la idea ya terminó o no tienes permiso para modificarla.",
      404,
    );
  }

  if (propuesta.estado !== "PENDIENTE") {
    return respuestaError(mensajeDecisionTomada(propuesta.estado), 409);
  }

  try {
    if (resultado.data.estado === "ACEPTADA") {
      const resultadoActualizacion = await prisma.propuesta.updateMany({
        where: {
          id: propuesta.id,
          estado: "PENDIENTE",
        },
        data: {
          estado: "ACEPTADA",
        },
      });

      if (resultadoActualizacion.count === 0) {
        return respuestaError(
          "La propuesta ya fue respondida desde otra sesión. Actualiza la página.",
          409,
        );
      }

      const actualizada = await prisma.propuesta.findUniqueOrThrow({
        where: { id: propuesta.id },
        select: {
          id: true,
          estado: true,
          audioUrl: true,
          actualizadoEn: true,
        },
      });

      return NextResponse.json({
        ok: true,
        mensaje: "Propuesta aceptada. El audio se conservará para la colaboración.",
        propuesta: {
          ...actualizada,
          actualizadoEn: actualizada.actualizadoEn.toISOString(),
        },
      });
    }

    const reclamada = await prisma.propuesta.updateMany({
      where: {
        id: propuesta.id,
        estado: "PENDIENTE",
      },
      data: {
        estado: "RECHAZANDO",
      },
    });

    if (reclamada.count === 0) {
      return respuestaError(
        "La propuesta ya fue respondida desde otra sesión. Actualiza la página.",
        409,
      );
    }

    try {
      if (propuesta.audioPublicId) {
        await eliminarAudioIdea(propuesta.audioPublicId);
      }
    } catch (errorEliminacion) {
      await prisma.propuesta
        .updateMany({
          where: {
            id: propuesta.id,
            estado: "RECHAZANDO",
          },
          data: {
            estado: "PENDIENTE",
          },
        })
        .catch((errorRestauracion) => {
          console.error(
            "No se pudo restaurar la propuesta después de fallar la eliminación.",
            errorRestauracion,
          );
        });

      throw errorEliminacion;
    }

    try {
      await prisma.propuesta.updateMany({
        where: {
          id: propuesta.id,
          estado: "RECHAZANDO",
        },
        data: {
          estado: "RECHAZADA",
          audioUrl: null,
          audioPublicId: null,
        },
      });

      const actualizada = await prisma.propuesta.findUniqueOrThrow({
        where: {
          id: propuesta.id,
        },
        select: {
          id: true,
          estado: true,
          audioUrl: true,
          actualizadoEn: true,
        },
      });

      return NextResponse.json({
        ok: true,
        mensaje:
          actualizada.estado === "RECHAZADA"
            ? "Propuesta rechazada. El archivo MP3 fue eliminado."
            : "La idea terminó mientras se procesaba la propuesta. El archivo MP3 fue eliminado.",
        propuesta: {
          ...actualizada,
          actualizadoEn: actualizada.actualizadoEn.toISOString(),
        },
      });
    } catch (errorFinalizacion) {
      await prisma.propuesta
        .updateMany({
          where: {
            id: propuesta.id,
            estado: "RECHAZANDO",
          },
          data: {
            estado: "RECHAZADA",
            audioUrl: null,
            audioPublicId: null,
          },
        })
        .catch((errorRecuperacion) => {
          console.error(
            "No se pudo finalizar la propuesta rechazada después de eliminar el audio.",
            errorRecuperacion,
          );
        });

      throw errorFinalizacion;
    }
  } catch (error) {
    console.error("No se pudo actualizar la propuesta.", error);

    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar la propuesta.",
      500,
    );
  }
}
