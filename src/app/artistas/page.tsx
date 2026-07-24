import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import ArtistasClient, {
  type ArtistaExplorar,
  type EstadisticasExplorar,
  type OpcionesFiltros,
} from "./ArtistasClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function obtenerGeneros(generos: unknown): string[] {
  if (!Array.isArray(generos)) {
    return [];
  }

  return generos
    .filter((genero): genero is string => typeof genero === "string")
    .map((genero) => genero.trim())
    .filter(Boolean);
}

function crearUsuario(nombre: string, id: number) {
  const usuario =
    nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  return usuario || `artista-${id}`;
}

function valoresUnicos(valores: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      valores
        .map((valor) => valor?.trim())
        .filter((valor): valor is string => Boolean(valor)),
    ),
  ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

export default async function ArtistasPage() {
  const sesion = await obtenerSesion();
  const ahora = new Date();

  let artistas: ArtistaExplorar[] = [];
  let estadisticas: EstadisticasExplorar = {
    artistas: 0,
    ideas: 0,
    propuestas: 0,
  };
  let opciones: OpcionesFiltros = {
    paises: [],
    ciudades: [],
    generos: [],
    roles: [],
  };
  let errorCarga = false;

  try {
    const [totalArtistas, totalIdeas, usuarios] = await Promise.all([
      prisma.usuario.count({
        where: { perfilCompleto: true },
      }),
      prisma.idea.count({
        where: {
          estado: "ACTIVA",
          expiraEn: { gt: ahora },
        },
      }),
      prisma.usuario.findMany({
        where: { perfilCompleto: true },
        orderBy: { creadoEn: "desc" },
        select: {
          id: true,
          nombre: true,
          nombreArtistico: true,
          nombreUsuario: true,
          fotoPerfil: true,
          ciudad: true,
          pais: true,
          rolPrincipal: true,
          generos: true,
          creadoEn: true,
          ideas: {
            where: {
              estado: "ACTIVA",
              expiraEn: { gt: ahora },
            },
            orderBy: { creadoEn: "desc" },
            take: 2,
            select: {
              id: true,
              titulo: true,
            },
          },
          _count: {
            select: {
              ideas: {
                where: {
                  estado: "ACTIVA",
                  expiraEn: { gt: ahora },
                },
              },
            },
          },
        },
      }),
    ]);

    artistas = usuarios
      .map((usuario) => {
        const nombreArtistico =
          usuario.nombreArtistico?.trim() ||
          usuario.nombre?.trim() ||
          "Artista";

        return {
          id: usuario.id,
          nombreArtistico,
          nombreUsuario:
            usuario.nombreUsuario?.trim() ||
            crearUsuario(nombreArtistico, usuario.id),
          fotoPerfil: usuario.fotoPerfil,
          ciudad: usuario.ciudad?.trim() || "",
          pais: usuario.pais?.trim() || "",
          rol: usuario.rolPrincipal,
          generos: obtenerGeneros(usuario.generos),
          ideasActivas: usuario._count.ideas,
          ideasRecientes: usuario.ideas,
          creadoEn: usuario.creadoEn.toISOString(),
        };
      })
      .sort((a, b) => {
        if (b.ideasActivas !== a.ideasActivas) {
          return b.ideasActivas - a.ideasActivas;
        }

        return (
          new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
        );
      });

    estadisticas = {
      artistas: totalArtistas,
      ideas: totalIdeas,
      // Todavía no existe un modelo Propuesta en Prisma.
      propuestas: 0,
    };

    opciones = {
      paises: valoresUnicos(artistas.map((artista) => artista.pais)),
      ciudades: valoresUnicos(artistas.map((artista) => artista.ciudad)),
      roles: valoresUnicos(artistas.map((artista) => artista.rol)),
      generos: valoresUnicos(
        artistas.flatMap((artista) => artista.generos),
      ),
    };
  } catch (error) {
    errorCarga = true;
    console.error("No se pudo cargar el explorador de artistas.", error);
  }

  return (
    <ArtistasClient
      sesionActiva={Boolean(sesion)}
      artistasIniciales={artistas}
      estadisticas={estadisticas}
      opciones={opciones}
      errorCarga={errorCarga}
    />
  );
}