import { eliminarAudioIdea } from "@/lib/cloudinary";
import { crearNotificacionSegura } from "@/lib/notificaciones";
import { prisma } from "@/lib/prisma";

const MAX_IDEAS_POR_USUARIO = 20;
const MAX_IDEAS_POR_TAREA = 100;

type IdeaParaLimpiar = {
  id: number;
  usuarioId: number;
  titulo: string;
  audioPublicId: string;
  propuestas: Array<{
    id: number;
    remitenteId: number;
    estado: string;
    audioPublicId: string | null;
  }>;
};

async function limpiarListado(ideas: IdeaParaLimpiar[], ahora: Date) {
  let eliminadas = 0;
  let fallidas = 0;

  for (const idea of ideas) {
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

      // Si existe una colaboración aceptada, conservamos también el audio
      // original de la idea para que pueda usarse en el futuro chat.
      if (!tienePropuestaAceptada) {
        await eliminarAudioIdea(idea.audioPublicId);
      }

      const resultado = await prisma.$transaction(async (tx) => {
        await tx.propuesta.updateMany({
          where: {
            ideaId: idea.id,
            estado: { in: ["PENDIENTE", "CAMBIOS_SOLICITADOS", "RECHAZANDO"] },
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

        return tx.idea.updateMany({
          where: {
            id: idea.id,
            usuarioId: idea.usuarioId,
            estado: "ACTIVA",
            expiraEn: { lte: ahora },
          },
          data: {
            estado: "EXPIRADA",
          },
        });
      });

      eliminadas += resultado.count;

      if (resultado.count > 0) {
        await crearNotificacionSegura({
          usuarioId: idea.usuarioId,
          tipo: "IDEA_EXPIRADA",
          titulo: "Tu idea expiró",
          mensaje: `“${idea.titulo}” terminó su periodo activo.`,
          enlace: "/panel#panel-card-2",
          entidadTipo: "IDEA",
          entidadId: idea.id,
        });

        const remitentesAfectados = Array.from(
          new Set(
            propuestasNoAceptadas
              .filter((propuesta) =>
                ["PENDIENTE", "CAMBIOS_SOLICITADOS", "RECHAZANDO"].includes(
                  propuesta.estado,
                ),
              )
              .map((propuesta) => propuesta.remitenteId),
          ),
        );

        await Promise.all(
          remitentesAfectados.map((remitenteId) =>
            crearNotificacionSegura({
              usuarioId: remitenteId,
              actorId: idea.usuarioId,
              tipo: "PROPUESTA_EXPIRADA",
              titulo: "La convocatoria terminó",
              mensaje: `La idea “${idea.titulo}” expiró antes de que tu propuesta fuera aceptada.`,
              enlace: "/panel#panel-card-3",
              entidadTipo: "IDEA",
              entidadId: idea.id,
            }),
          ),
        );
      }
    } catch (error) {
      fallidas += 1;
      console.error(`No se pudo limpiar la idea expirada ${idea.id}.`, error);
    }
  }

  return {
    revisadas: ideas.length,
    eliminadas,
    fallidas,
  };
}

const seleccionLimpieza = {
  id: true,
  usuarioId: true,
  titulo: true,
  audioPublicId: true,
  propuestas: {
    select: {
      id: true,
      remitenteId: true,
      estado: true,
      audioPublicId: true,
    },
  },
} as const;

export async function limpiarIdeasExpiradasUsuario(usuarioId: number) {
  const ahora = new Date();
  const ideasExpiradas = await prisma.idea.findMany({
    where: {
      usuarioId,
      estado: "ACTIVA",
      expiraEn: { lte: ahora },
    },
    orderBy: { expiraEn: "asc" },
    take: MAX_IDEAS_POR_USUARIO,
    select: seleccionLimpieza,
  });

  return limpiarListado(ideasExpiradas, ahora);
}

export async function limpiarIdeasExpiradasGlobales() {
  const ahora = new Date();
  const ideasExpiradas = await prisma.idea.findMany({
    where: {
      estado: "ACTIVA",
      expiraEn: { lte: ahora },
    },
    orderBy: { expiraEn: "asc" },
    take: MAX_IDEAS_POR_TAREA,
    select: seleccionLimpieza,
  });

  return limpiarListado(ideasExpiradas, ahora);
}
