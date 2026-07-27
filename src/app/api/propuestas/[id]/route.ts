import { NextResponse } from "next/server";
import { z } from "zod";

import { eliminarAudioIdea } from "@/lib/cloudinary";
import { crearNotificacionSegura } from "@/lib/notificaciones";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INTENTOS_POR_IDEA = 2;
const motivoSchema = z
  .string()
  .trim()
  .min(3, "Escribe un motivo de al menos 3 caracteres.")
  .max(500, "El motivo no puede superar 500 caracteres.");

const decisionSchema = z.discriminatedUnion("accion", [
  z.object({
    accion: z.literal("ACEPTAR"),
  }),
  z.object({
    accion: z.literal("SOLICITAR_CAMBIOS"),
    motivo: motivoSchema,
  }),
  z.object({
    accion: z.literal("RECHAZAR"),
    motivo: motivoSchema,
    permiteReintento: z.boolean(),
  }),
]);

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

  if (estado === "CAMBIOS_SOLICITADOS") {
    return "Ya solicitaste una nueva versión. Espera a que el artista la envíe.";
  }

  if (estado === "RECHAZADA") {
    return "Esta propuesta ya fue rechazada.";
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

  const resultado = decisionSchema.safeParse(body);

  if (!resultado.success) {
    return respuestaError(
      resultado.error.issues[0]?.message ?? "La decisión no es válida.",
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
      remitenteId: true,
      numeroIntento: true,
      idea: {
        select: {
          usuarioId: true,
          titulo: true,
        },
      },
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

  if (
    resultado.data.accion === "SOLICITAR_CAMBIOS" &&
    propuesta.numeroIntento >= MAX_INTENTOS_POR_IDEA
  ) {
    return respuestaError(
      "Esta persona ya utilizó sus 2 intentos. Debes aceptar o rechazar la propuesta.",
      409,
    );
  }

  if (
    resultado.data.accion === "RECHAZAR" &&
    resultado.data.permiteReintento &&
    propuesta.numeroIntento >= MAX_INTENTOS_POR_IDEA
  ) {
    return respuestaError(
      "Esta persona ya utilizó sus 2 intentos y no puede recibir otra oportunidad.",
      409,
    );
  }

  try {
    if (resultado.data.accion === "ACEPTAR") {
      const resultadoAceptacion = await prisma.$transaction(async (tx) => {
        const ahora = new Date();
        const actualizacion = await tx.propuesta.updateMany({
          where: {
            id: propuesta.id,
            estado: "PENDIENTE",
          },
          data: {
            estado: "ACEPTADA",
            motivoDecision: null,
            permiteReintento: false,
            decisionEn: ahora,
          },
        });

        if (actualizacion.count === 0) {
          return null;
        }

        const usuarioAId = Math.min(
          propuesta.idea.usuarioId,
          propuesta.remitenteId,
        );
        const usuarioBId = Math.max(
          propuesta.idea.usuarioId,
          propuesta.remitenteId,
        );

        const conversacion = await tx.conversacion.upsert({
          where: {
            usuarioAId_usuarioBId: {
              usuarioAId,
              usuarioBId,
            },
          },
          update: {
            ultimaActividadEn: ahora,
          },
          create: {
            usuarioAId,
            usuarioBId,
            ultimaActividadEn: ahora,
          },
          select: {
            id: true,
          },
        });

        const actualizada = await tx.propuesta.update({
          where: {
            id: propuesta.id,
          },
          data: {
            conversacionId: conversacion.id,
          },
          select: {
            id: true,
            estado: true,
            audioUrl: true,
            motivoDecision: true,
            permiteReintento: true,
            numeroIntento: true,
            decisionEn: true,
            actualizadoEn: true,
          },
        });

        return {
          actualizada,
          conversacionId: conversacion.id,
        };
      });

      if (!resultadoAceptacion) {
        return respuestaError(
          "La propuesta ya fue respondida desde otra sesión. Actualiza la página.",
          409,
        );
      }

      await crearNotificacionSegura({
        usuarioId: propuesta.remitenteId,
        actorId: sesion.usuarioId,
        tipo: "PROPUESTA_ACEPTADA",
        titulo: "Tu propuesta fue aceptada",
        mensaje: `Aceptaron tu propuesta para “${propuesta.idea.titulo}”. Ya puedes continuar en el chat.`,
        enlace: `/mensajes/${resultadoAceptacion.conversacionId}`,
        entidadTipo: "PROPUESTA",
        entidadId: propuesta.id,
        conversacionId: resultadoAceptacion.conversacionId,
      });

      return NextResponse.json({
        ok: true,
        mensaje:
          "Propuesta aceptada. El cupo quedó ocupado y ya puedes continuar la colaboración en el chat privado.",
        propuesta: {
          ...resultadoAceptacion.actualizada,
          conversacionId: resultadoAceptacion.conversacionId,
          decisionEn:
            resultadoAceptacion.actualizada.decisionEn?.toISOString() ?? null,
          actualizadoEn:
            resultadoAceptacion.actualizada.actualizadoEn.toISOString(),
        },
      });
    }

    if (resultado.data.accion === "SOLICITAR_CAMBIOS") {
      const ahora = new Date();
      const actualizacion = await prisma.propuesta.updateMany({
        where: {
          id: propuesta.id,
          estado: "PENDIENTE",
          numeroIntento: propuesta.numeroIntento,
        },
        data: {
          estado: "CAMBIOS_SOLICITADOS",
          motivoDecision: resultado.data.motivo,
          permiteReintento: false,
          decisionEn: ahora,
        },
      });

      if (actualizacion.count === 0) {
        return respuestaError(
          "La propuesta ya fue respondida desde otra sesión. Actualiza la página.",
          409,
        );
      }

      const actualizada = await prisma.propuesta.findUniqueOrThrow({
        where: {
          id: propuesta.id,
        },
        select: {
          id: true,
          estado: true,
          audioUrl: true,
          motivoDecision: true,
          permiteReintento: true,
          numeroIntento: true,
          decisionEn: true,
          actualizadoEn: true,
        },
      });

      await crearNotificacionSegura({
        usuarioId: propuesta.remitenteId,
        actorId: sesion.usuarioId,
        tipo: "CAMBIOS_SOLICITADOS",
        titulo: "Solicitaron cambios",
        mensaje: `Para “${propuesta.idea.titulo}”: ${resultado.data.motivo}`,
        enlace: "/panel#panel-card-3",
        entidadTipo: "PROPUESTA",
        entidadId: propuesta.id,
      });

      return NextResponse.json({
        ok: true,
        mensaje:
          "Cambios solicitados. El cupo sigue reservado mientras la persona envía una nueva versión.",
        propuesta: {
          ...actualizada,
          conversacionId: null,
          decisionEn: actualizada.decisionEn?.toISOString() ?? null,
          actualizadoEn: actualizada.actualizadoEn.toISOString(),
        },
      });
    }

    const ahora = new Date();
    const reclamada = await prisma.propuesta.updateMany({
      where: {
        id: propuesta.id,
        estado: "PENDIENTE",
      },
      data: {
        estado: "RECHAZANDO",
        motivoDecision: resultado.data.motivo,
        permiteReintento: resultado.data.permiteReintento,
        decisionEn: ahora,
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
            motivoDecision: null,
            permiteReintento: false,
            decisionEn: null,
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
          motivoDecision: true,
          permiteReintento: true,
          numeroIntento: true,
          decisionEn: true,
          actualizadoEn: true,
        },
      });

      await crearNotificacionSegura({
        usuarioId: propuesta.remitenteId,
        actorId: sesion.usuarioId,
        tipo: actualizada.permiteReintento
          ? "REINTENTO_PERMITIDO"
          : "PROPUESTA_RECHAZADA",
        titulo: actualizada.permiteReintento
          ? "Puedes intentarlo nuevamente"
          : "Propuesta rechazada",
        mensaje: actualizada.permiteReintento
          ? `Rechazaron tu propuesta para “${propuesta.idea.titulo}”, pero puedes enviar otro intento si hay un cupo disponible. Motivo: ${resultado.data.motivo}`
          : `Rechazaron definitivamente tu propuesta para “${propuesta.idea.titulo}”. Motivo: ${resultado.data.motivo}`,
        enlace: "/panel#panel-card-3",
        entidadTipo: "PROPUESTA",
        entidadId: propuesta.id,
      });

      return NextResponse.json({
        ok: true,
        mensaje: actualizada.permiteReintento
          ? "Propuesta rechazada. El cupo fue liberado y la persona podrá intentarlo una vez más si encuentra espacio disponible."
          : "Propuesta rechazada definitivamente. El cupo fue liberado para otro artista.",
        propuesta: {
          ...actualizada,
          conversacionId: null,
          decisionEn: actualizada.decisionEn?.toISOString() ?? null,
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
