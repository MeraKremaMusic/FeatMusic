import { prisma } from "@/lib/prisma";

const TAMANO_LOTE_NOTIFICACIONES = 500;

function limitarTexto(valor: string, maximo: number) {
  const limpio = valor.trim();

  if (limpio.length <= maximo) {
    return limpio;
  }

  return `${limpio.slice(0, Math.max(0, maximo - 1)).trimEnd()}…`;
}

function nombreVisible(usuario: {
  nombre: string | null;
  nombreArtistico: string | null;
  nombreUsuario: string | null;
}) {
  return (
    usuario.nombreArtistico?.trim() ||
    usuario.nombre?.trim() ||
    (usuario.nombreUsuario ? `@${usuario.nombreUsuario}` : null) ||
    "Un artista de FeatMusic"
  );
}

export async function notificarSeguidoresNuevaIdea({
  artistaId,
  ideaId,
  tituloIdea,
}: {
  artistaId: number;
  ideaId: number;
  tituloIdea: string;
}) {
  try {
    const [artista, seguimientos] = await Promise.all([
      prisma.usuario.findUnique({
        where: { id: artistaId },
        select: {
          id: true,
          nombre: true,
          nombreArtistico: true,
          nombreUsuario: true,
        },
      }),
      prisma.seguimiento.findMany({
        where: { seguidoId: artistaId },
        select: { seguidorId: true },
      }),
    ]);

    if (!artista || seguimientos.length === 0) {
      return;
    }

    const identificador =
      artista.nombreUsuario?.trim() || `artista-${artista.id}`;
    const enlace = `/artistas/${encodeURIComponent(identificador)}#idea-${ideaId}`;
    const titulo = "Nueva oportunidad musical";
    const mensaje = limitarTexto(
      `${nombreVisible(artista)} publicó “${tituloIdea}”.`,
      500,
    );

    for (
      let indice = 0;
      indice < seguimientos.length;
      indice += TAMANO_LOTE_NOTIFICACIONES
    ) {
      const lote = seguimientos.slice(
        indice,
        indice + TAMANO_LOTE_NOTIFICACIONES,
      );

      await prisma.notificacion.createMany({
        data: lote.map((seguimiento) => ({
          usuarioId: seguimiento.seguidorId,
          actorId: artistaId,
          tipo: "NUEVA_IDEA_SEGUIDO",
          titulo,
          mensaje,
          enlace,
          entidadTipo: "IDEA",
          entidadId: ideaId,
        })),
      });
    }
  } catch (error) {
    // La idea debe publicarse aunque una notificación falle.
    console.error(
      "No se pudo avisar a los seguidores sobre la nueva idea.",
      error,
    );
  }
}
