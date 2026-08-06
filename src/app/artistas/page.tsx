import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

// FEATMUSIC_PORTADAS_TARJETAS_EXPLORAR_V1
import ArtistasClient, {
  type ArtistaExplorar,
  type EstadisticasExplorar,
  type OpcionesFiltros,
} from "./ArtistasClient";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CODIGOS_ISO_PAIS = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(
  " ",
);

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

/**
 * Crea el mapa país -> código ISO usando únicamente Intl de Node.js.
 * Así Explorar no depende de los archivos JSON internos del paquete
 * @countrystatecity/countries en producción.
 */
function crearMapaCodigosPais() {
  const mapa = new Map<string, string>();
  const idiomas = ["es", "en", "pt"] as const;

  for (const idioma of idiomas) {
    const nombresPaises = new Intl.DisplayNames([idioma], { type: "region" });

    for (const codigo of CODIGOS_ISO_PAIS) {
      const nombre = nombresPaises.of(codigo);

      if (nombre && nombre !== codigo) {
        mapa.set(normalizarNombrePais(nombre), codigo);
      }
    }
  }

  const alias: Record<string, string> = {
    "ee uu": "US",
    "e e u u": "US",
    usa: "US",
    "estados unidos de america": "US",
    "gran bretana": "GB",
    inglaterra: "GB",
    "republica checa": "CZ",
    "corea del sur": "KR",
    "corea del norte": "KP",
    rusia: "RU",
    bolivia: "BO",
    venezuela: "VE",
    moldavia: "MD",
    palestina: "PS",
    "costa de marfil": "CI",
    "cabo verde": "CV",
    "republica democratica del congo": "CD",
    "republica del congo": "CG",
    taiwan: "TW",
  };

  for (const [nombre, codigo] of Object.entries(alias)) {
    mapa.set(normalizarNombrePais(nombre), codigo);
  }

  return mapa;
}

const CODIGOS_PAIS_POR_NOMBRE = crearMapaCodigosPais();

function resolverCodigoPais(nombrePais: string) {
  const paisLimpio = nombrePais.trim();

  if (/^[a-z]{2}$/i.test(paisLimpio)) {
    return paisLimpio.toUpperCase();
  }

  return CODIGOS_PAIS_POR_NOMBRE.get(normalizarNombrePais(paisLimpio)) ?? "";
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
    const [usuarios, totalPropuestas] = await Promise.all([
      prisma.usuario.findMany({
        where: { perfilCompleto: true },
        orderBy: { creadoEn: "desc" },
        select: {
          id: true,
          nombreArtistico: true,
          nombreUsuario: true,
          fotoPerfil: true,
          portadaPerfil: true,
          biografia: true,
          ciudad: true,
          pais: true,
          rolPrincipal: true,
          generos: true,
          creadoEn: true,
          seguidores: {
            where: {
              seguidorId: sesion?.usuarioId ?? -1,
            },
            select: { id: true },
            take: 1,
          },
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
              descripcion: true,
              audioUrl: true,
              duracionSegundos: true,
              bpm: true,
              tonalidad: true,
              rolBuscado: true,
              generoMusical: true,
              idiomaBuscado: true,
              modalidadColaboracion: true,
              paisPreferido: true,
              departamentoPreferido: true,
              ciudadPreferida: true,
              tipoAcuerdo: true,
              _count: {
                select: {
                  vistas: true,
                },
              },
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
      prisma.propuesta.count(),
    ]);

    const usuariosPublicables = usuarios.filter(perfilEsPublicable);

    artistas = usuariosPublicables
      .map((usuario) => ({
        id: usuario.id,
        nombreArtistico: usuario.nombreArtistico!.trim(),
        nombreUsuario: usuario.nombreUsuario!.trim(),
        fotoPerfil: usuario.fotoPerfil,
        portadaPerfil: usuario.portadaPerfil,
        biografia: usuario.biografia,
        siguiendoInicial: usuario.seguidores.length > 0,
        ciudad: usuario.ciudad!.trim(),
        pais: usuario.pais!.trim(),
        codigoPais: resolverCodigoPais(usuario.pais!),
        rol: usuario.rolPrincipal,
        generos: obtenerGeneros(usuario.generos),
        ideasActivas: usuario._count.ideas,
        ideasRecientes: usuario.ideas.map((idea) => {
          const { _count, ...datosIdea } = idea;

          return {
            ...datosIdea,
            vistasUnicas: _count.vistas,
          };
        }),
        creadoEn: usuario.creadoEn.toISOString(),
      }))
      .sort((a, b) => {
        if (b.ideasActivas !== a.ideasActivas) {
          return b.ideasActivas - a.ideasActivas;
        }

        return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
      });

    estadisticas = {
      artistas: artistas.length,
      ideas: artistas.reduce(
        (total, artista) => total + artista.ideasActivas,
        0,
      ),
      propuestas: totalPropuestas,
    };

    opciones = {
      paises: valoresUnicos(artistas.map((artista) => artista.pais)),
      ciudades: valoresUnicos(artistas.map((artista) => artista.ciudad)),
      roles: valoresUnicos(artistas.map((artista) => artista.rol)),
      generos: valoresUnicos(artistas.flatMap((artista) => artista.generos)),
    };

  } catch (error) {
    errorCarga = true;
    console.error("No se pudo cargar el explorador de FeatMusic.", error);
  }

  return (
    <ArtistasClient
      sesionActiva={Boolean(sesion)}
      usuarioActualId={sesion?.usuarioId ?? null}
      artistasIniciales={artistas}
      estadisticas={estadisticas}
      opciones={opciones}
      errorCarga={errorCarga}
    />
  );
}
