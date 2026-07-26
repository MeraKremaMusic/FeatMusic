import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import NavegacionEscritorio from "../../components/NavegacionEscritorio";
import ReproductorAudio from "../../components/ReproductorAudio";
import MenuMovilPanel from "../../panel/components/MenuMovilPanel";
import EnviarPropuesta from "./components/EnviarPropuesta";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const idAlternativo = nombreUsuario.startsWith("artista-")
    ? Number(nombreUsuario.replace("artista-", ""))
    : Number.NaN;

  const artista = await prisma.usuario.findFirst({
    where: {
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
      biografia: true,
      ciudad: true,
      pais: true,
      rolPrincipal: true,
      generos: true,
      spotifyUrl: true,
      youtubeUrl: true,
      instagramUrl: true,
      creadoEn: true,
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
          audioUrl: true,
          duracionSegundos: true,
          expiraEn: true,
          propuestas: {
            select: {
              remitenteId: true,
              estado: true,
            },
          },
        },
      },
    },
  });

  if (!artista) {
    notFound();
  }

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

  return (
    <main className="min-h-screen bg-[#09070d] pb-20 text-white lg:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4">
          <Link
            href={sesion ? "/panel" : "/"}
            className="text-lg font-black tracking-tight"
          >
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <NavegacionEscritorio />

          {sesion ? (
            <form action="/api/cerrar-sesion" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-red-400/50 px-3 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10"
              >
                <IconoSalir />
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="rounded-lg border border-violet-400/50 px-3 py-1.5 text-[10px] font-bold text-violet-200 transition hover:bg-violet-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-3 py-3 sm:px-4 sm:py-5 md:py-8">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="relative rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm sm:p-5">
            <div className="absolute right-3 top-3 flex flex-col items-center gap-2 sm:right-4 sm:top-4">
              {codigoPais && (
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
              )}

              {redes.map((red) => (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Abrir ${red.nombre}`}
                  title={red.nombre}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
                >
                  <IconoRedSocial nombre={red.nombre} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>

            <div className="flex items-start gap-3.5 lg:flex-col lg:items-center lg:text-center">
              {artista.fotoPerfil ? (
                <img
                  src={artista.fotoPerfil}
                  alt={`Foto de ${nombreArtistico}`}
                  className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 object-cover sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/10 text-2xl font-black text-violet-200 sm:h-24 sm:w-24 sm:text-3xl lg:h-28 lg:w-28">
                  {iniciales(nombreArtistico)}
                </div>
              )}

              <div className="min-w-0 flex-1 pr-12 pt-0.5 lg:w-full lg:px-10 lg:pt-0">
                <h1 className="break-words text-xl font-black leading-tight sm:text-2xl lg:mt-4">
                  {nombreArtistico}
                </h1>
                <p className="mt-1 break-all text-[11px] font-semibold text-violet-300 sm:text-xs">
                  @{usuarioVisible}
                </p>

                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400 lg:justify-center">
                  <IconoUbicacion className="h-3 w-3 shrink-0" />
                  <span className="min-w-0 truncate">{ubicacion}</span>
                </p>

                <div className="mt-2.5 flex flex-wrap gap-1.5 lg:justify-center">
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[9px] font-semibold text-violet-200 sm:text-[10px]">
                    {formatearRol(artista.rolPrincipal)}
                  </span>
                  {generos.map((genero) => (
                    <span
                      key={genero}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] text-zinc-300 sm:text-[10px]"
                    >
                      {genero}
                    </span>
                  ))}
                </div>

                <p className="mt-2.5 whitespace-pre-wrap text-[11px] leading-[1.45] text-zinc-400 sm:text-xs sm:leading-5 lg:text-center">
                  {artista.biografia?.trim() ||
                    "Este artista todavía no ha agregado una biografía."}
                </p>
              </div>
            </div>

          </aside>

          <section className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm lg:p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-black text-white sm:text-lg">
                Ideas activas
              </h2>
              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200">
                {artista.ideas.length}
              </span>
            </div>

            {artista.ideas.length === 0 ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-12 text-center">
                <p className="text-sm font-semibold text-zinc-300">
                  Este artista no tiene ideas activas
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {artista.ideas.map((idea, indice) => (
                  <article
                    key={idea.id}
                    className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <p className="mb-3 whitespace-pre-wrap text-xs leading-5 text-zinc-400">
                      {idea.descripcion}
                    </p>

                    <ReproductorAudio
                      id={`perfil-${idea.id}`}
                      src={idea.audioUrl}
                      titulo={idea.titulo}
                      bpm={idea.bpm}
                      tonalidad={idea.tonalidad}
                      duracionSegundos={idea.duracionSegundos}
                      numero={indice + 1}
                    />

                    <EnviarPropuesta
                      ideaId={idea.id}
                      sesionActiva={Boolean(sesion)}
                      esPropietario={sesion?.usuarioId === artista.id}
                      propuestasActuales={idea.propuestas.length}
                      estadoPropuestaUsuario={
                        sesion
                          ? idea.propuestas.find(
                              (propuesta) =>
                                propuesta.remitenteId === sesion.usuarioId,
                            )?.estado ?? null
                          : null
                      }
                    />
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {sesion && <MenuMovilPanel />}
    </main>
  );
}