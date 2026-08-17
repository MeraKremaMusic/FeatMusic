import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import ContadorVistasIdea from "../../components/ContadorVistasIdea";
import NavegacionEscritorio from "../../components/NavegacionEscritorio";
import { MenuMasMovil } from "../../components/MenuMasNavegacion";
import RegistrarVistaIdea from "../../components/RegistrarVistaIdea";
import ReproductorAudio from "../../components/ReproductorAudio";
import { crearFraseColaboracion } from "../../components/ResumenColaboracionIdea";
import MenuMovilPanel from "../../panel/components/MenuMovilPanel";
import PerfilArtistaCard from "../../panel/components/PerfilArtistaCard";
import EnviarPropuesta from "./components/EnviarPropuesta";
import DescripcionIdea from "./components/DescripcionIdea";
import DescargaMp3Idea from "./components/DescargaMp3Idea";
import SeguimientoPerfil from "./components/SeguimientoPerfil";
import SeccionesPerfilPrivado from "./components/SeccionesPerfilPrivado";
import CompartirPerfil from "./components/CompartirPerfil";

// FEATMUSIC_PERFIL_PUBLICO_CLARO_V1
// FEATMUSIC_DESCRIPCION_IDEA_PERFIL_V1
// FEATMUSIC_DESCRIPCION_IDEA_POSICIONADA_V2
// FEATMUSIC_DESCRIPCION_CON_COLABORACION_MODAL_V1
// FEATMUSIC_ACCIONES_INTEGRADAS_PERFIL_V1
// FEATMUSIC_SEGUIR_COMPACTO_IDEAS_SIN_CAJA_V1
// FEATMUSIC_VISTAS_PERFIL_PROPIO_LINEA_UNICA_V1
// FEATMUSIC_DESCARGA_MP3_PERFIL_PUBLICO_V2
// FEATMUSIC_MP3_FRANJA_INFERIOR_V1
// FEATMUSIC_PERFIL_PRIVADO_COMO_PUBLICO_V1
// FEATMUSIC_PESTANAS_PRIVADAS_IDEAS_V1
// FEATMUSIC_CONTROLES_INTEGRADOS_PERFIL_PRIVADO_V1
// FEATMUSIC_PORTADA_DEGRADADO_NEGRO_VISIBLE_V2
// FEATMUSIC_PORTADA_IDENTIDAD_BLANCA_SIN_BORDE_V1
// FEATMUSIC_PORTADA_PERFIL_ARTISTA_V1
// FEATMUSIC_PORTADA_VISIBLE_CORREGIDA_V2
// FEATMUSIC_COMPARTIR_PERFIL_REDESSOCIALES_V1
// FEATMUSIC_SEGUIR_DEBAJO_BANDERA_V2
// FEATMUSIC_ICONO_SEGUIR_IGUAL_REDES_V3
// FEATMUSIC_SEGUIR_DENTRO_COLUMNA_REDES_V4
// FEATMUSIC_BIOGRAFIA_Y_TOQUES_ICONOS_V5
// FEATMUSIC_MENSAJES_PERFIL_PROPIO_VACIO_V1
// FEATMUSIC_MENU_MAS_PAGINAS_NUEVAS_V1

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ESTADOS_QUE_OCUPAN_CUPO = [
  "PENDIENTE",
  "CAMBIOS_SOLICITADOS",
  "ACEPTADA",
  "RECHAZANDO",
];

const CODIGOS_ISO_PAIS = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`.split(" ");

function normalizarNombrePais(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

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

  return (
    CODIGOS_PAIS_POR_NOMBRE.get(normalizarNombrePais(paisLimpio)) ?? ""
  );
}

type PerfilPublicoPageProps = {
  params: Promise<{
    nombreUsuario: string;
  }>;
};

function obtenerGeneros(generos: unknown): string[] {
  if (!Array.isArray(generos)) {
    return [];
  }

  return generos.filter(
    (genero): genero is string => typeof genero === "string",
  );
}

function formatearRol(rol: string) {
  const roles: Record<string, string> = {
    CANTANTE: "Cantante",
    COMPOSITOR: "Compositor",
    PRODUCTOR: "Productor",
    BEATMAKER: "Beatmaker",
  };

  return roles[rol] ?? rol;
}

function IconoSalir({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M13 4h7v16h-7" />
    </svg>
  );
}

function IconoUbicacion({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconoIdea({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

function IconoColaboracion({
  className = "h-3.5 w-3.5",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3.5 19c.7-3.1 2.6-4.7 5.5-4.7s4.8 1.6 5.5 4.7" />
      <path d="M14.5 15.5c2.7-.5 4.7.7 6 3.5" />
    </svg>
  );
}

function IconoRedSocial({
  nombre,
  className = "h-4 w-4",
}: {
  nombre: string;
  className?: string;
}) {
  if (nombre === "Spotify") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
      >
        <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm4.58 14.43a.62.62 0 0 1-.85.2c-2.33-1.43-5.27-1.75-8.73-.96a.62.62 0 1 1-.28-1.2c3.79-.87 7.05-.5 9.66 1.1a.62.62 0 0 1 .2.86Zm1.21-2.69a.78.78 0 0 1-1.07.26c-2.67-1.64-6.75-2.11-9.91-1.16a.78.78 0 1 1-.45-1.49c3.62-1.09 8.12-.56 11.17 1.31a.78.78 0 0 1 .26 1.08Zm.1-2.8C14.68 9.03 9.39 8.85 6.33 9.78a.94.94 0 1 1-.54-1.8c3.51-1.06 9.36-.85 13.06 1.35a.94.94 0 0 1-.96 1.61Z" />
      </svg>
    );
  }

  if (nombre === "YouTube") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
      >
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.13-2.14C19.5 3.54 12 3.54 12 3.54s-7.5 0-9.37.51A3.02 3.02 0 0 0 .5 6.19 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.13 2.14c1.87.51 9.37.51 9.37.51s7.5 0 9.37-.51a3.02 3.02 0 0 0 2.13-2.14A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.81ZM9.6 15.6V8.4L15.84 12 9.6 15.6Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function iniciales(nombre: string) {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("") || "FM"
  );
}

// FEATMUSIC_BIOGRAFIA_COMPACTA_V1

const FEATMUSIC_URL_PUBLICA = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://featmusic.pro"
).replace(/\/+$/, "");

function limitarDescripcionSocial(valor: string, maximo = 158) {
  const limpio = valor.replace(/\s+/g, " ").trim();

  if (limpio.length <= maximo) {
    return limpio;
  }

  return `${limpio.slice(0, maximo - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: PerfilPublicoPageProps): Promise<Metadata> {
  const { nombreUsuario: parametro } = await params;

  let nombreUsuario = parametro;
  try {
    nombreUsuario = decodeURIComponent(parametro);
  } catch {
    nombreUsuario = parametro;
  }

  const esRutaPerfilPropio = nombreUsuario === "mi-perfil";
  const sesion = esRutaPerfilPropio ? await obtenerSesion() : null;
  const idAlternativo = nombreUsuario.startsWith("artista-")
    ? Number(nombreUsuario.replace("artista-", ""))
    : Number.NaN;

  const artista = await prisma.usuario.findFirst({
    where: esRutaPerfilPropio
      ? { id: sesion?.usuarioId ?? -1 }
      : {
          perfilCompleto: true,
          OR: [
            { nombreUsuario },
            ...(Number.isInteger(idAlternativo) && idAlternativo > 0
              ? [{ id: idAlternativo }]
              : []),
          ],
        },
    select: {
      id: true,
      nombre: true,
      nombreArtistico: true,
      nombreUsuario: true,
      fotoPerfil: true,
      portadaPerfil: true,
      biografia: true,
      ciudad: true,
      pais: true,
      generos: true,
    },
  });

  if (!artista) {
    return {
      title: "Perfil de artista | FeatMusic",
      description:
        "Descubre artistas, escucha ideas musicales y encuentra nuevas colaboraciones en FeatMusic.",
    };
  }

  const nombreArtistico =
    artista.nombreArtistico?.trim() || artista.nombre?.trim() || "Artista";
  const usuarioVisible =
    artista.nombreUsuario?.trim() || `artista-${artista.id}`;
  const generos = obtenerGeneros(artista.generos).slice(0, 2);
  const ubicacion = [artista.ciudad, artista.pais]
    .filter(Boolean)
    .join(", ");
  const rutaPublica = `/artistas/${encodeURIComponent(usuarioVisible)}`;
  const urlPublica = `${FEATMUSIC_URL_PUBLICA}${rutaPublica}`;
  const imagenSocial = artista.portadaPerfil || artista.fotoPerfil || undefined;
  const descripcionBase =
    artista.biografia?.trim() ||
    `Escucha las ideas musicales de ${nombreArtistico} y propón una colaboración en FeatMusic.`;
  const contexto = [
    generos.length > 0 ? generos.join(" · ") : "",
    ubicacion,
  ]
    .filter(Boolean)
    .join(" — ");
  const descripcion = limitarDescripcionSocial(
    contexto ? `${descripcionBase} ${contexto}.` : descripcionBase,
  );
  const titulo = `${nombreArtistico} (@${usuarioVisible}) | FeatMusic`;
  const imagenes = imagenSocial
    ? [
        {
          url: imagenSocial,
          alt: `Perfil musical de ${nombreArtistico} en FeatMusic`,
        },
      ]
    : undefined;

  return {
    title: titulo,
    description: descripcion,
    alternates: {
      canonical: urlPublica,
    },
    openGraph: {
      type: "website",
      siteName: "FeatMusic",
      title: titulo,
      description: descripcion,
      url: urlPublica,
      images: imagenes,
    },
    twitter: {
      card: imagenSocial ? "summary_large_image" : "summary",
      title: titulo,
      description: descripcion,
      images: imagenSocial ? [imagenSocial] : undefined,
    },
    robots: esRutaPerfilPropio
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export default async function PerfilPublicoPage({
  params,
}: PerfilPublicoPageProps) {
  const sesion = await obtenerSesion();
  const { nombreUsuario: parametro } = await params;

  let nombreUsuario = parametro;
  try {
    nombreUsuario = decodeURIComponent(parametro);
  } catch {
    nombreUsuario = parametro;
  }

  const esRutaPerfilPropio = nombreUsuario === "mi-perfil";

  if (esRutaPerfilPropio && !sesion) {
    redirect("/iniciar-sesion");
  }

  const idAlternativo = nombreUsuario.startsWith("artista-")
    ? Number(nombreUsuario.replace("artista-", ""))
    : Number.NaN;

  const artista = await prisma.usuario.findFirst({
    where: esRutaPerfilPropio
      ? {
          id: sesion?.usuarioId ?? -1,
        }
      : {
          perfilCompleto: true,
          OR: [
            { nombreUsuario },
            ...(Number.isInteger(idAlternativo) && idAlternativo > 0
              ? [{ id: idAlternativo }]
              : []),
          ],
        },
    select: {
      id: true,
      perfilCompleto: true,
      nombre: true,
      nombreArtistico: true,
      nombreUsuario: true,
      fotoPerfil: true,
      portadaPerfil: true,
      actualizadoEn: true,
      biografia: true,
      ciudad: true,
      pais: true,
      rolPrincipal: true,
      generos: true,
      spotifyUrl: true,
      youtubeUrl: true,
      instagramUrl: true,
      distribuidoraPreferida: true,
      softwarePreferido: true,
      creadoEn: true,
      _count: {
        select: {
          seguidores: true,
          siguiendo: true,
        },
      },
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
          expiraEn: { gt: new Date() },
        },
        orderBy: { creadoEn: "desc" },
        select: {
          id: true,
          titulo: true,
          descripcion: true,
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
          portadaUrl: true,
          audioUrl: true,
          duracionSegundos: true,
          expiraEn: true,
          _count: {
            select: {
              propuestas: {
                where: {
                  estado: {
                    in: ESTADOS_QUE_OCUPAN_CUPO,
                  },
                },
              },
              vistas: true,
            },
          },
          propuestas: {
            where: {
              remitenteId: sesion?.usuarioId ?? -1,
            },
            select: {
              estado: true,
              motivoDecision: true,
              permiteReintento: true,
              numeroIntento: true,
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!artista) {
    notFound();
  }

  if (esRutaPerfilPropio && !artista.perfilCompleto) {
    redirect("/completar-perfil");
  }

  const esPerfilPropio = sesion?.usuarioId === artista.id;
  const portadaPerfilVisible = artista.portadaPerfil
    ? `${artista.portadaPerfil}${artista.portadaPerfil.includes("?") ? "&" : "?"}fm_portada=${artista.actualizadoEn.getTime()}`
    : null;

  const propuestasRecibidasGuardadas = esPerfilPropio
    ? await prisma.propuesta.findMany({
        where: {
          idea: {
            usuarioId: artista.id,
          },
          estado: {
            notIn: ["RECHAZADA", "RECHAZANDO"],
          },
        },
        orderBy: { creadoEn: "desc" },
        take: 30,
        select: {
          id: true,
          mensaje: true,
          audioUrl: true,
          duracionSegundos: true,
          estado: true,
          motivoDecision: true,
          permiteReintento: true,
          numeroIntento: true,
          decisionEn: true,
          creadoEn: true,
          conversacion: { select: { id: true } },
          idea: { select: { id: true, titulo: true } },
          remitente: {
            select: {
              id: true,
              nombre: true,
              nombreArtistico: true,
              nombreUsuario: true,
              fotoPerfil: true,
            },
          },
        },
      })
    : [];

  const propuestasEnviadasGuardadas = esPerfilPropio
    ? await prisma.propuesta.findMany({
        where: { remitenteId: artista.id },
        orderBy: { creadoEn: "desc" },
        take: 30,
        select: {
          id: true,
          mensaje: true,
          audioUrl: true,
          duracionSegundos: true,
          estado: true,
          motivoDecision: true,
          permiteReintento: true,
          numeroIntento: true,
          decisionEn: true,
          creadoEn: true,
          conversacion: { select: { id: true } },
          idea: {
            select: {
              id: true,
              titulo: true,
              portadaUrl: true,
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  nombreArtistico: true,
                  nombreUsuario: true,
                  fotoPerfil: true,
                },
              },
            },
          },
        },
      })
    : [];

  const propuestasRecibidasIniciales = propuestasRecibidasGuardadas.map(
    ({ conversacion, ...propuesta }) => ({
      ...propuesta,
      conversacionId: conversacion?.id ?? null,
      decisionEn: propuesta.decisionEn?.toISOString() ?? null,
      creadoEn: propuesta.creadoEn.toISOString(),
    }),
  );

  const propuestasEnviadasIniciales = propuestasEnviadasGuardadas.map(
    ({ conversacion, ...propuesta }) => ({
      ...propuesta,
      conversacionId: conversacion?.id ?? null,
      decisionEn: propuesta.decisionEn?.toISOString() ?? null,
      creadoEn: propuesta.creadoEn.toISOString(),
    }),
  );

  const ideasRecibidasIniciales = artista.ideas.map((idea) => ({
    id: idea.id,
    titulo: idea.titulo,
    portadaUrl: idea.portadaUrl?.trim() || null,
  }));

  const nombreArtistico =
    artista.nombreArtistico?.trim() || artista.nombre?.trim() || "Artista";
  const usuarioVisible =
    artista.nombreUsuario?.trim() || `artista-${artista.id}`;
  const generos = obtenerGeneros(artista.generos);
  const ubicacion =
    [artista.ciudad, artista.pais].filter(Boolean).join(", ") ||
    "Ubicación sin completar";
  const codigoPais = resolverCodigoPais(artista.pais ?? "");
  const redes = [
    { nombre: "Spotify", url: artista.spotifyUrl },
    { nombre: "YouTube", url: artista.youtubeUrl },
    { nombre: "Instagram", url: artista.instagramUrl },
  ].filter(
    (red): red is { nombre: string; url: string } =>
      typeof red.url === "string" && red.url.length > 0,
  );
  const preferenciasMusicales = [
    {
      etiqueta: "Distribuidora preferida",
      valor: artista.distribuidoraPreferida?.trim(),
    },
    {
      etiqueta: "Software preferido",
      valor: artista.softwarePreferido?.trim(),
    },
  ].filter(
    (
      preferencia,
    ): preferencia is {
      etiqueta: string;
      valor: string;
    } => Boolean(preferencia.valor),
  );

  const tarjetasIdeasActivas = (
    <>
      {artista.ideas.length === 0 ? (
        esPerfilPropio ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#FFD400] bg-[#FFD400] text-black">
              <IconoIdea className="h-5 w-5" />
            </span>

            <p className="mt-3 text-sm font-black text-slate-800">
              Aún no has publicado ninguna idea
            </p>

            <p className="mx-auto mt-1.5 max-w-sm text-[10px] leading-4 text-slate-500 sm:text-[11px]">
              Comparte una idea y empieza a recibir propuestas.
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Este artista no tiene ideas activas
            </p>
          </div>
        )
      ) : (
        <div className="mt-3 grid gap-2 sm:mt-4 sm:gap-2.5">
          {artista.ideas.map((idea, indice) => {
            const portadaIdeaVisible = idea.portadaUrl?.trim() || null;

            return (
              <article
                id={`idea-${idea.id}`}
                key={idea.id}
                data-vista-idea
                className="relative scroll-mt-16 overflow-visible rounded-xl border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]"
              >
                <RegistrarVistaIdea
                  ideaId={idea.id}
                  sesionActiva={Boolean(sesion)}
                  esPropietario={esPerfilPropio}
                />

                <div
                  className={`relative overflow-hidden rounded-t-xl p-2.5 sm:p-3 ${
                    portadaIdeaVisible
                      ? "featmusic-idea-cover bg-black"
                      : ""
                  }`}
                >
                  {portadaIdeaVisible && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                    >
                      <img
                        src={portadaIdeaVisible}
                        alt=""
                        className="h-full w-full object-cover object-center contrast-[1.04] saturate-[1.08]"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.98) 16%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.38) 64%, rgba(0,0,0,0.08) 82%, rgba(0,0,0,0) 100%)",
                        }}
                      />
                    </div>
                  )}

                  <div
                    className={`relative z-10 ${
                      portadaIdeaVisible ? "featmusic-idea-cover-content" : ""
                    }`}
                  >
                    <ReproductorAudio
                      id={`perfil-${idea.id}`}
                      src={idea.audioUrl}
                      titulo={idea.titulo}
                      bpm={idea.bpm}
                      tonalidad={idea.tonalidad}
                      duracionSegundos={idea.duracionSegundos}
                      numero={indice + 1}
                      detalleMetadatos={
                        <ContadorVistasIdea
                          ideaId={idea.id}
                          totalInicial={idea._count.vistas}
                          esPropietario={esPerfilPropio}
                          className="!h-auto !w-auto !shrink-0 !gap-1 !whitespace-nowrap !text-[8px] !leading-none !text-slate-500 sm:!text-[9px] [&_svg]:!h-3 [&_svg]:!w-3 [&_svg]:!shrink-0"
                        />
                      }
                      className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-8 [&_button]:w-8 [&_input[type='range']]:mt-2"
                    />

                    <DescripcionIdea
                      titulo={idea.titulo}
                      descripcion={idea.descripcion}
                      resumenColaboracion={crearFraseColaboracion({
                        rolBuscado: idea.rolBuscado,
                        generoMusical: idea.generoMusical,
                        idiomaBuscado: idea.idiomaBuscado,
                        modalidadColaboracion: idea.modalidadColaboracion,
                        paisPreferido: idea.paisPreferido,
                        departamentoPreferido: idea.departamentoPreferido,
                        ciudadPreferida: idea.ciudadPreferida,
                        tipoAcuerdo: idea.tipoAcuerdo,
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-b-xl border-t border-slate-200 bg-white">
                  <DescargaMp3Idea
                    ideaId={idea.id}
                    titulo={idea.titulo}
                    sesionActiva={Boolean(sesion)}
                  />

                  <EnviarPropuesta
                    ideaId={idea.id}
                    sesionActiva={Boolean(sesion)}
                    esPropietario={esPerfilPropio}
                    propuestasActuales={idea._count.propuestas}
                    propuestaUsuario={idea.propuestas[0] ?? null}
                    variante="integrada"
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
      
    </>
  );

  return (
    <main className="featmusic-app-light featmusic-page-contrast min-h-screen w-full max-w-full overflow-x-clip bg-[#f4f6fa] pb-20 text-[#172033] lg:pb-0">
      <header className="featmusic-solid-black-chrome sticky top-0 z-50">
        <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-0.5">
            <MenuMasMovil sesionActiva={Boolean(sesion)} />
            <Link
              href={sesion ? "/artistas/mi-perfil" : "/"}
              className="text-lg font-black tracking-tight"
            >
              Feat<span className="text-yellow-400">Music</span>
            </Link>
          </div>

          <NavegacionEscritorio />

          {sesion ? (
            <form action="/api/cerrar-sesion" method="post" className="hidden lg:block">
              <button
                type="submit"
                className="featmusic-logout-plain flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-white transition"
              >
                <IconoSalir />
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="rounded-lg border border-emerald-400/50 px-3 py-1.5 text-[10px] font-bold text-emerald-200 transition hover:bg-emerald-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <div
        className={
          esPerfilPropio
            ? "mx-auto max-w-[1180px] px-0 pb-3 pt-0 sm:px-4 sm:py-5 md:py-8"
            : "mx-auto max-w-[1180px] px-3 py-3 sm:px-4 sm:py-5 md:py-8"
        }
      >
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside
            className={`relative overflow-hidden p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)] sm:p-5 ${
              esPerfilPropio
                ? "rounded-none border-x-0 border-b border-t-0 sm:rounded-2xl sm:border"
                : "rounded-2xl border"
            } ${
              artista.portadaPerfil
                ? "featmusic-profile-cover border-transparent bg-black"
                : "border-slate-200 bg-white"
            }`}
          >
            {portadaPerfilVisible && (
              <div aria-hidden="true" className="absolute inset-0">
                <img
                  src={portadaPerfilVisible}
                  alt=""
                  className="h-full w-full object-cover object-center contrast-[1.04] saturate-[1.08]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.98) 16%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.38) 64%, rgba(0,0,0,0.08) 82%, rgba(0,0,0,0) 100%)",
                  }}
                />
              </div>
            )}

            <div className="pointer-events-auto absolute right-2.5 top-2.5 z-40 flex flex-col items-center gap-0.5 sm:right-3.5 sm:top-3.5 sm:gap-1">
              {codigoPais && (
                <div className="pointer-events-none flex h-7 w-11 shrink-0 items-center justify-center">
                  <img
                    src={`https://flagcdn.com/w40/${codigoPais.toLowerCase()}.png`}
                    srcSet={`https://flagcdn.com/w80/${codigoPais.toLowerCase()}.png 2x`}
                    width={28}
                    height={20}
                    alt={`Bandera de ${artista.pais ?? ""}`}
                    title={artista.pais ?? ""}
                    className="h-5 w-7 object-contain"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {!esPerfilPropio && (
                <SeguimientoPerfil
                  artistaId={artista.id}
                  nombreUsuario={usuarioVisible}
                  sesionActiva={Boolean(sesion)}
                  esPerfilPropio={esPerfilPropio}
                  siguiendoInicial={artista.seguidores.length > 0}
                  seguidoresIniciales={artista._count.seguidores}
                  siguiendoCantidad={artista._count.siguiendo}
                  modo="boton"
                />
              )}

              {redes.map((red) => (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${red.nombre}`}
                  title={red.nombre}
                  className="group relative z-40 inline-flex h-11 w-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-xl outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-yellow-400/70 [-webkit-tap-highlight-color:transparent]"
                >
                  <span
                    className="featmusic-profile-social-button pointer-events-none inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition"
                  >
                    <IconoRedSocial
                      nombre={red.nombre}
                      className="h-3.5 w-3.5"
                    />
                  </span>
                </a>
              ))}
            </div>

            <div className="relative z-10 flex items-start gap-3.5 lg:flex-col lg:items-center lg:text-center">
              <div className="flex w-20 shrink-0 flex-col gap-1.5 sm:w-24 lg:w-28">
                {artista.fotoPerfil ? (
                  <img
                    src={artista.fotoPerfil}
                    alt={`Foto de ${nombreArtistico}`}
                    className={`h-20 w-full rounded-2xl border object-cover shadow-sm sm:h-24 lg:h-28 ${
                      artista.portadaPerfil
                        ? "border-white/30"
                        : "border-slate-200"
                    }`}
                  />
                ) : (
                  <div
                    className={`flex h-20 w-full items-center justify-center rounded-2xl border text-2xl font-black sm:h-24 sm:text-3xl lg:h-28 ${
                      artista.portadaPerfil
                        ? "border-white/25 bg-black/45 text-white backdrop-blur-sm"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {iniciales(nombreArtistico)}
                  </div>
                )}

                <div className="grid gap-1.5">
                  <span
                    title={`Rol: ${formatearRol(artista.rolPrincipal)}`}
                    aria-label={`Rol: ${formatearRol(artista.rolPrincipal)}`}
                    className={`featmusic-profile-dark-label flex min-h-7 w-full items-center justify-center rounded-lg border px-1.5 py-1 text-center text-[8px] font-black leading-tight ${
                      artista.portadaPerfil
                        ? "border-white/20 bg-black/40 text-white backdrop-blur-sm"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {formatearRol(artista.rolPrincipal)}
                  </span>

                  {preferenciasMusicales.length > 0 && (
                    <div className="grid gap-1.5 lg:hidden">
                      {preferenciasMusicales.map((preferencia) => (
                        <span
                          key={preferencia.etiqueta}
                          title={`${preferencia.etiqueta}: ${preferencia.valor}`}
                          aria-label={`${preferencia.etiqueta}: ${preferencia.valor}`}
                          className={`featmusic-profile-dark-label flex min-h-7 w-full items-center justify-center rounded-lg border px-1.5 py-1 text-center text-[8px] font-bold leading-tight ${
                            artista.portadaPerfil
                              ? "border-white/20 bg-black/40 text-white backdrop-blur-sm"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {preferencia.valor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-0.5 lg:w-full lg:px-10 lg:pt-0">
                <div className="pr-28 sm:pr-32 lg:pr-0">
                  <h1
                    className={`break-words text-xl font-black leading-tight sm:text-2xl lg:mt-4 ${
                      artista.portadaPerfil
                        ? "featmusic-cover-identity-text text-white"
                        : "featmusic-no-cover-identity-text text-black dark:text-white"
                    }`}
                  >
                    {nombreArtistico}
                  </h1>
                  <p
                    className={`mt-1 break-all text-[11px] font-semibold sm:text-xs ${
                      artista.portadaPerfil
                        ? "featmusic-cover-identity-text text-white"
                        : "featmusic-no-cover-identity-text text-black dark:text-white"
                    }`}
                  >
                    @{usuarioVisible}
                  </p>

                  <p
                    className={`mt-2 flex items-center gap-1.5 text-[11px] lg:justify-center ${
                      artista.portadaPerfil ? "text-slate-200" : "text-slate-500"
                    }`}
                  >
                    <IconoUbicacion className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 truncate">{ubicacion}</span>
                  </p>
                </div>

                {generos.length > 0 && (
                  <div className="mt-2.5 flex max-w-full flex-nowrap gap-1.5 overflow-x-auto pb-1 whitespace-nowrap [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden">
                    {generos.slice(0, 2).map((genero) => (
                      <span
                        key={genero}
                        className={`featmusic-profile-dark-chip shrink-0 rounded-full border px-2.5 py-1 text-[9px] backdrop-blur-sm sm:text-[10px] ${
                          artista.portadaPerfil
                            ? "border-white/20 bg-black/35 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {genero}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className={
                    artista.portadaPerfil
                      ? "[&_a]:text-white [&_button]:text-white [&_p]:text-white [&_span]:text-white"
                      : ""
                  }
                >
                  <SeguimientoPerfil
                    artistaId={artista.id}
                    nombreUsuario={usuarioVisible}
                    sesionActiva={Boolean(sesion)}
                    esPerfilPropio={esPerfilPropio}
                    siguiendoInicial={artista.seguidores.length > 0}
                    seguidoresIniciales={artista._count.seguidores}
                    siguiendoCantidad={artista._count.siguiendo}
                    modo="contadores"
                  />
                </div>

                <p
                  className={`mt-2 max-w-full pr-14 text-left text-[11px] leading-[1.5] [overflow-wrap:anywhere] sm:pr-16 sm:text-xs sm:leading-5 lg:px-2 lg:pr-2 lg:text-center ${
                    artista.portadaPerfil ? "text-white/85" : "text-slate-600"
                  }`}
                >
                  {artista.biografia?.replace(/\s+/g, " ").trim() ||
                    (esPerfilPropio
                      ? "Completa tu perfil y haz que otros artistas puedan encontrarte."
                      : "Este artista todavía no ha agregado una biografía.")}
                </p>
              </div>
            </div>

            {esPerfilPropio && (
              <div className="featmusic-profile-dark-controls relative z-10 -mx-4 -mb-4 mt-4 grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 bg-white sm:-mx-5 sm:-mb-5">
                <PerfilArtistaCard
                  modo="controles"
                  nombreArtistico={nombreArtistico}
                  nombreUsuario={usuarioVisible}
                  fotoPerfil={artista.fotoPerfil}
                  portadaPerfil={portadaPerfilVisible}
                  biografia={artista.biografia}
                  spotifyUrl={artista.spotifyUrl}
                  youtubeUrl={artista.youtubeUrl}
                  instagramUrl={artista.instagramUrl}
                  distribuidoraPreferida={artista.distribuidoraPreferida}
                  softwarePreferido={artista.softwarePreferido}
                  rol={formatearRol(artista.rolPrincipal)}
                  tipoColaboracion=""
                  generos={generos}
                  ubicacion={ubicacion}
                  idiomaPrincipal=""
                  fechaRegistro=""
                  correoVerificado={false}
                  seguidores={artista._count.seguidores}
                  siguiendo={artista._count.siguiendo}
                />

                <CompartirPerfil
                  nombreArtistico={nombreArtistico}
                  nombreUsuario={usuarioVisible}
                  fotoPerfil={artista.fotoPerfil}
                  portadaPerfil={portadaPerfilVisible}
                  biografia={artista.biografia}
                  ubicacion={ubicacion}
                />
              </div>
            )}

          </aside>

          <section
            className={`min-w-0 ${esPerfilPropio ? "px-3 sm:px-0" : ""}`}
          >
            {esPerfilPropio ? (
              <SeccionesPerfilPrivado
                ideasActivas={tarjetasIdeasActivas}
                ideasRecibidasIniciales={ideasRecibidasIniciales}
                cantidadIdeasActivas={artista.ideas.length}
                propuestasRecibidasIniciales={propuestasRecibidasIniciales}
                propuestasEnviadasIniciales={propuestasEnviadasIniciales}
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 px-1 lg:px-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 sm:h-7 sm:w-7">
                      <IconoIdea className="h-3.5 w-3.5" />
                    </span>
                    <h2 className="text-sm font-black text-slate-900 sm:text-base lg:text-lg">
                      Ideas activas
                    </h2>
                  </div>
                
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 sm:px-3 sm:py-1 sm:text-xs">
                    {artista.ideas.length}
                  </span>
                </div>
                {tarjetasIdeasActivas}
              </>
            )}
          </section>
        </div>
      </div>

      {sesion && <MenuMovilPanel />}
    </main>
  );
}