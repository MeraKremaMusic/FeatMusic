import { prisma } from "@/lib/prisma";

type DatosNotificacion = {
  usuarioId: number;
  actorId?: number | null;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace?: string | null;
  entidadTipo?: string | null;
  entidadId?: number | null;
  conversacionId?: number | null;
};

function limitarTexto(valor: string, maximo: number) {
  const limpio = valor.trim();

  if (limpio.length <= maximo) {
    return limpio;
  }

  return `${limpio.slice(0, Math.max(0, maximo - 1)).trimEnd()}…`;
}

function normalizarEnlace(enlace: string | null | undefined) {
  const limpio = enlace?.trim();

  if (!limpio || !limpio.startsWith("/") || limpio.startsWith("//")) {
    return null;
  }

  return limitarTexto(limpio, 500);
}

export async function crearNotificacionSegura(
  datos: DatosNotificacion,
): Promise<void> {
  if (
    !Number.isInteger(datos.usuarioId) ||
    datos.usuarioId <= 0 ||
    datos.usuarioId === datos.actorId
  ) {
    return;
  }

  try {
    await prisma.notificacion.create({
      data: {
        usuarioId: datos.usuarioId,
        actorId:
          datos.actorId && Number.isInteger(datos.actorId)
            ? datos.actorId
            : null,
        tipo: limitarTexto(datos.tipo || "ACTIVIDAD", 50),
        titulo: limitarTexto(datos.titulo || "Nueva actividad", 160),
        mensaje: limitarTexto(datos.mensaje || "Tienes una nueva actividad.", 500),
        enlace: normalizarEnlace(datos.enlace),
        entidadTipo: datos.entidadTipo
          ? limitarTexto(datos.entidadTipo, 50)
          : null,
        entidadId:
          datos.entidadId && Number.isInteger(datos.entidadId)
            ? datos.entidadId
            : null,
        conversacionId:
          datos.conversacionId && Number.isInteger(datos.conversacionId)
            ? datos.conversacionId
            : null,
      },
    });
  } catch (error) {
    console.error("No se pudo crear una notificación.", error);
  }
}

export async function notificarMensajeNuevoSeguro(datos: {
  usuarioId: number;
  actorId: number;
  conversacionId: number;
  mensajeId: number;
  contenido: string;
}): Promise<void> {
  if (
    datos.usuarioId === datos.actorId ||
    !Number.isInteger(datos.conversacionId) ||
    datos.conversacionId <= 0
  ) {
    return;
  }

  const vistaPrevia = limitarTexto(
    datos.contenido.replace(/\s+/g, " "),
    180,
  );

  try {
    const existente = await prisma.notificacion.findFirst({
      where: {
        usuarioId: datos.usuarioId,
        tipo: "MENSAJE_NUEVO",
        conversacionId: datos.conversacionId,
        leidaEn: null,
      },
      orderBy: {
        creadoEn: "desc",
      },
      select: {
        id: true,
      },
    });

    if (existente) {
      await prisma.notificacion.update({
        where: {
          id: existente.id,
        },
        data: {
          actorId: datos.actorId,
          titulo: "Nuevo mensaje",
          mensaje: vistaPrevia || "Te enviaron un nuevo mensaje.",
          enlace: `/mensajes/${datos.conversacionId}`,
          entidadTipo: "MENSAJE",
          entidadId: datos.mensajeId,
          creadoEn: new Date(),
        },
      });
      return;
    }

    await crearNotificacionSegura({
      usuarioId: datos.usuarioId,
      actorId: datos.actorId,
      tipo: "MENSAJE_NUEVO",
      titulo: "Nuevo mensaje",
      mensaje: vistaPrevia || "Te enviaron un nuevo mensaje.",
      enlace: `/mensajes/${datos.conversacionId}`,
      entidadTipo: "MENSAJE",
      entidadId: datos.mensajeId,
      conversacionId: datos.conversacionId,
    });
  } catch (error) {
    console.error("No se pudo registrar la notificación del mensaje.", error);
  }
}
