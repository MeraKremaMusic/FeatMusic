import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import { obtenerPaises } from "@/lib/ubicaciones";
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

function tieneTexto(valor: string | null | undefined): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

/**
 * Un perfil puede mostrarse en Explorar solamente cuando tiene todos los
 * datos públicos esenciales. Las redes sociales, la biografía y la foto
 * continúan siendo opcionales.
 */
function perfilEsPublicable(usuario: {
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  ciudad: string | null;
  pais: string | null;
  rolPrincipal: string;
  generos: unknown;
}) {
  return (
    tieneTexto(usuario.nombreArtistico) &&
    tieneTexto(usuario.nombreUsuario) &&
    tieneTexto(usuario.ciudad) &&
    tieneTexto(usuario.pais) &&
    tieneTexto(usuario.rolPrincipal) &&
    obtenerGeneros(usuario.generos).length > 0
  );
}


function normalizarNombrePais(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

function crearMapaCodigosPais(
  paises: Array<{ codigo: string; nombre: string }>,
) {
  const mapa = new Map<string, string>();

  for (const pais of paises) {
    mapa.set(normalizarNombrePais(pais.nombre), pais.codigo.toUpperCase());
  }

  return mapa;
}

function resolverCodigoPais(
  nombrePais: string,
  codigosPorNombre: Map<string, string>,
) {
  const paisLimpio = nombrePais.trim();

  if (/^[a-z]{2}$/i.test(paisLimpio)) {
    return paisLimpio.toUpperCase();
  }

  return codigosPorNombre.get(normalizarNombrePais(paisLimpio)) ?? "";
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
    const usuarios = await prisma.usuario.findMany({
      // Este primer filtro evita cargar cuentas que ni siquiera han terminado
      // el formulario inicial. Después se hace una validación más estricta.
      where: { perfilCompleto: true },
      orderBy: { creadoEn: "desc" },
      select: {
        id: true,
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
            audioUrl: true,
            duracionSegundos: true,
            bpm: true,
            tonalidad: true,
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
    });

    let codigosPais = new Map<string, string>();

    try {
      codigosPais = crearMapaCodigosPais(await obtenerPaises());
    } catch (errorCatalogo) {
      // El explorador debe seguir funcionando aunque el catálogo no cargue.
      console.error(
        "No se pudieron resolver las banderas de los países.",
        errorCatalogo,
      );
    }

    const usuariosPublicables = usuarios.filter(perfilEsPublicable);

    artistas = usuariosPublicables
      .map((usuario) => ({
        id: usuario.id,
        nombreArtistico: usuario.nombreArtistico!.trim(),
        nombreUsuario: usuario.nombreUsuario!.trim(),
        fotoPerfil: usuario.fotoPerfil,
        ciudad: usuario.ciudad!.trim(),
        pais: usuario.pais!.trim(),
        codigoPais: resolverCodigoPais(usuario.pais!, codigosPais),
        rol: usuario.rolPrincipal,
        generos: obtenerGeneros(usuario.generos),
        ideasActivas: usuario._count.ideas,
        ideasRecientes: usuario.ideas,
        creadoEn: usuario.creadoEn.toISOString(),
      }))
      .sort((a, b) => {
        if (b.ideasActivas !== a.ideasActivas) {
          return b.ideasActivas - a.ideasActivas;
        }

        return (
          new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
        );
      });

    estadisticas = {
      artistas: artistas.length,
      // Solo cuenta las ideas pertenecientes a artistas que realmente se
      // muestran en Explorar.
      ideas: artistas.reduce(
        (total, artista) => total + artista.ideasActivas,
        0,
      ),
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