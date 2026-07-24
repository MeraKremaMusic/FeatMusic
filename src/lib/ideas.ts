import { eliminarAudioIdea } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const MAX_IDEAS_POR_USUARIO = 20;
const MAX_IDEAS_POR_TAREA = 100;

type IdeaParaLimpiar = {
  id: number;
  usuarioId: number;
  audioPublicId: string;
};

async function limpiarListado(ideas: IdeaParaLimpiar[], ahora: Date) {
  let eliminadas = 0;
  let fallidas = 0;

  for (const idea of ideas) {
    try {
      await eliminarAudioIdea(idea.audioPublicId);

      const actualizada = await prisma.idea.updateMany({
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

      eliminadas += actualizada.count;
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
    select: {
      id: true,
      usuarioId: true,
      audioPublicId: true,
    },
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
    select: {
      id: true,
      usuarioId: true,
      audioPublicId: true,
    },
  });

  return limpiarListado(ideasExpiradas, ahora);
}
