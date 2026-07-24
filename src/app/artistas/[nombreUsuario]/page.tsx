import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import NavegacionEscritorio from "../../components/NavegacionEscritorio";
import MenuMovilPanel from "../../panel/components/MenuMovilPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
          expiraEn: true,
        },
      },
    },
  });

  if (!artista) {
    notFound();
  }

  const nombreArtistico =
    artista.nombreArtistico?.trim() ||
    artista.nombre?.trim() ||
    "Artista";

  const usuarioVisible =
    artista.nombreUsuario?.trim() || `artista-${artista.id}`;

  const generos = obtenerGeneros(artista.generos);
  const ubicacion =
    [artista.ciudad, artista.pais].filter(Boolean).join(", ") ||
    "Ubicación sin completar";

  const redes = [
    { nombre: "Spotify", url: artista.spotifyUrl },
    { nombre: "YouTube", url: artista.youtubeUrl },
    { nombre: "Instagram", url: artista.instagramUrl },
  ].filter(
    (red): red is { nombre: string; url: string } =>
      typeof red.url === "string" && red.url.length > 0,
  );

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#09070d] text-white lg:h-screen">
      <header className="relative z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
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

      <div className="relative h-[calc(100dvh-48px)] overflow-hidden lg:h-[calc(100vh-48px)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-950/30 to-transparent" />

        <div className="relative z-10 h-full overflow-y-auto px-4 pb-28 pt-4 lg:px-6 lg:pb-8 lg:pt-6">
          <div className="mx-auto grid w-full max-w-[1180px] gap-4 lg:grid-cols-[340px_1fr]">
            <aside className="rounded-2xl border border-white/10 bg-black/35 p-5 backdrop-blur-sm">
              {artista.fotoPerfil ? (
                <img
                  src={artista.fotoPerfil}
                  alt={`Foto de ${nombreArtistico}`}
                  className="mx-auto h-28 w-28 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/10 text-3xl font-black text-violet-200">
                  {iniciales(nombreArtistico)}
                </div>
              )}

              <div className="mt-4 text-center">
                <h1 className="text-xl font-black">{nombreArtistico}</h1>
                <p className="mt-1 text-sm font-semibold text-violet-300">
                  @{usuarioVisible}
                </p>
                <p className="mt-2 text-xs text-zinc-400">{ubicacion}</p>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold text-violet-200">
                  {formatearRol(artista.rolPrincipal)}
                </span>

                {generos.map((genero) => (
                  <span
                    key={genero}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-zinc-300"
                  >
                    {genero}
                  </span>
                ))}
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                {artista.biografia?.trim() || "Este artista todavía no ha agregado una biografía."}
              </p>

              {redes.length > 0 && (
                <div className="mt-5 grid gap-2">
                  {redes.map((red) => (
                    <a
                      key={red.nombre}
                      href={red.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-center text-xs font-semibold text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
                    >
                      {red.nombre}
                    </a>
                  ))}
                </div>
              )}

              <Link
                href="/artistas"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-200"
              >
                Volver a explorar
              </Link>
            </aside>

            <section className="min-w-0 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm lg:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-violet-300">
                    Ideas activas
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    Publicaciones de {nombreArtistico}
                  </h2>
                </div>

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
                  {artista.ideas.map((idea) => (
                    <article
                      key={idea.id}
                      className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white">
                            {idea.titulo}
                          </h3>
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-400">
                            {idea.descripcion}
                          </p>
                        </div>

                        <div className="flex gap-2 text-[10px] text-zinc-400">
                          <span className="rounded-full border border-white/10 px-2.5 py-1">
                            {idea.bpm} BPM
                          </span>
                          <span className="rounded-full border border-white/10 px-2.5 py-1">
                            {idea.tonalidad}
                          </span>
                        </div>
                      </div>

                      <audio
                        controls
                        preload="none"
                        src={idea.audioUrl}
                        className="mt-4 w-full"
                      >
                        Tu navegador no puede reproducir este audio.
                      </audio>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {sesion && <MenuMovilPanel />}
    </main>
  );
}