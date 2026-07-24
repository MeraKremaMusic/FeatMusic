import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import PerfilArtistaCard from "./components/PerfilArtistaCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatearRol(rol: string) {
  const roles: Record<string, string> = {
    CANTANTE: "Cantante",
    COMPOSITOR: "Compositor",
    BEATMAKER: "Beatmaker",
  };

  return roles[rol] ?? rol;
}

function obtenerGeneros(generos: unknown): string[] {
  if (!Array.isArray(generos)) {
    return [];
  }

  return generos.filter(
    (genero): genero is string => typeof genero === "string",
  );
}


function crearUsuario(nombre: string) {
  return (
    nombre
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "artista"
  );
}

function formatearFecha(fecha: Date | string | null | undefined) {
  if (!fecha) {
    return "Sin registrar";
  }

  const fechaConvertida =
    fecha instanceof Date ? fecha : new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Sin registrar";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaConvertida);
}

type IconoTipo =
  | "inicio"
  | "comunidad"
  | "planes"
  | "campana"
  | "perfil"
  | "idea"
  | "propuestas"
  | "ubicacion"
  | "mundo"
  | "musica"
  | "mas"
  | "play"
  | "aceptar"
  | "rechazar"
  | "salir"
  | "flecha";

function Icono({
  tipo,
  className = "h-3 w-3",
}: {
  tipo: IconoTipo;
  className?: string;
}) {
  const props = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (tipo) {
    case "inicio":
      return (
        <svg {...props}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );

    case "comunidad":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="10" r="2.5" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M14.5 16.5a4.5 4.5 0 0 1 6 3.5" />
        </svg>
      );

    case "planes":
      return (
        <svg {...props}>
          <path d="m3 8 4 3 5-7 5 7 4-3-2 11H5L3 8Z" />
          <path d="M5 19h14" />
        </svg>
      );

    case "campana":
      return (
        <svg {...props}>
          <path d="M18 9a6 6 0 0 0-12 0c0 6-3 7-3 8h18c0-1-3-2-3-8Z" />
          <path d="M10 21h4" />
        </svg>
      );

    case "perfil":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );

    case "idea":
      return (
        <svg {...props}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M8.5 15.5A7 7 0 1 1 15.5 15.5c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" />
        </svg>
      );

    case "propuestas":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16.5" cy="9.5" r="2.5" />
          <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M13.5 17a4.5 4.5 0 0 1 8 3" />
        </svg>
      );

    case "ubicacion":
      return (
        <svg {...props}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "mundo":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a15 15 0 0 1 0 18" />
          <path d="M12 3a15 15 0 0 0 0 18" />
        </svg>
      );

    case "musica":
      return (
        <svg {...props}>
          <path d="M9 18V5l10-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="16" cy="16" r="3" />
        </svg>
      );

    case "mas":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "play":
      return (
        <svg {...props} fill="currentColor" stroke="none">
          <path d="m9 7 8 5-8 5V7Z" />
        </svg>
      );

    case "aceptar":
      return (
        <svg {...props}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "rechazar":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );

    case "salir":
      return (
        <svg {...props}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M13 4h7v16h-7" />
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
  }
}


export default async function PanelPage() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
  });

  if (!usuario) {
    redirect("/iniciar-sesion");
  }

  if (!usuario.perfilCompleto) {
    redirect("/completar-perfil");
  }

  const nombreArtistico =
    usuario.nombreArtistico?.trim() ||
    usuario.nombre?.trim() ||
    "Artista";

  const usuarioPublico =
    usuario.nombreUsuario?.trim() || crearUsuario(nombreArtistico);
  const generos = obtenerGeneros(usuario.generos);
  const rol = formatearRol(usuario.rolPrincipal);

  const ubicacion =
    [usuario.ciudad, usuario.pais].filter(Boolean).join(", ") ||
    "Ubicación sin completar";


  const idiomaPrincipal =
    usuario.idiomaPrincipal?.trim() || "Sin completar";

  const tipoColaboracion =
    usuario.tipoColaboracion?.trim() || "Sin completar";

  const fechaRegistro = formatearFecha(usuario.creadoEn);

  return (
    <main className="h-[100dvh] overflow-hidden bg-[#09070d] text-white lg:h-screen">
      <header className="border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4 lg:px-4">
          <Link href="/panel" className="text-lg font-black tracking-tight">
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <nav
            aria-label="Navegación principal del panel"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex"
          >
            <button
              type="button"
              title="Próximamente"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <Icono tipo="planes" className="h-3.5 w-3.5" />
              Planes
            </button>

            <Link
              href="/artistas"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <Icono tipo="comunidad" className="h-3.5 w-3.5" />
              Explorar
            </Link>
          </nav>

          <form action="/api/cerrar-sesion" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-red-400/50 px-3 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10"
            >
              <Icono tipo="salir" className="h-3 w-3" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="relative h-[calc(100dvh-48px)] overflow-hidden lg:h-[calc(100vh-48px)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-950/30 to-transparent" />

        <div
          id="panel-carrusel"
          className="
            relative mx-auto flex h-[calc(100%-72px)] w-full max-w-[1460px] snap-x snap-mandatory
            items-center gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain
            px-4 pb-3 pt-4 scroll-smooth touch-pan-x
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            lg:grid lg:h-full lg:grid-cols-[0.84fr_1.08fr_1.08fr]
            lg:items-stretch lg:gap-3 lg:overflow-visible lg:snap-none
            lg:px-4 lg:py-3
          "
        >
          <section
            id="panel-card-1"
            className="flex h-full min-h-0 w-[calc(100vw-32px)] max-w-[440px] shrink-0 snap-center scroll-mt-20 overflow-hidden [&>*]:!h-full [&>*]:!max-h-full [&>*]:!border-0 [&>*]:!bg-transparent [&>*]:!shadow-none lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink"
          >
            <PerfilArtistaCard
              nombreArtistico={nombreArtistico}
              nombreUsuario={usuarioPublico}
              fotoPerfil={usuario.fotoPerfil}
              biografia={usuario.biografia}

              spotifyUrl={usuario.spotifyUrl}

              youtubeUrl={usuario.youtubeUrl}

              instagramUrl={usuario.instagramUrl}

              distribuidoraPreferida={usuario.distribuidoraPreferida}
              softwarePreferido={usuario.softwarePreferido}
              rol={rol}
              tipoColaboracion={tipoColaboracion}
              generos={generos}
              ubicacion={ubicacion}
              idiomaPrincipal={idiomaPrincipal}
              fechaRegistro={fechaRegistro}
              correoVerificado={usuario.correoVerificado}
/>
          </section>

          <section
            id="panel-card-2"
            className="flex h-full min-h-0 w-[calc(100vw-32px)] max-w-[440px] shrink-0 snap-center scroll-mt-20 items-center justify-center overflow-hidden p-4 lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink lg:p-3"
          >
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-6 py-3 text-sm font-bold text-violet-100 shadow-lg shadow-violet-950/30 transition hover:border-violet-300/50 hover:bg-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-400/60"
            >
              <Icono tipo="mas" className="h-4 w-4" />
              Publicar una idea
            </button>
          </section>

          <section
            id="panel-card-3"
            className="flex h-full min-h-0 w-[calc(100vw-32px)] max-w-[440px] shrink-0 snap-center scroll-mt-20 flex-col overflow-hidden p-4 lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink lg:p-3"
          >
            <div className="flex flex-1 items-center justify-center">
              <div className="flex max-w-xs flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300">
                  <Icono tipo="propuestas" className="h-5 w-5" />
                </div>

                <p className="mt-4 text-sm font-semibold text-zinc-200">
                  No has recibido ninguna propuesta
                </p>
              </div>
            </div>
          </section>
        </div>

      </div>

      <nav
        aria-label="Menú principal móvil"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0810]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end">
          <button
            type="button"
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-violet-300"
          >
            <Icono tipo="inicio" className="h-5 w-5" />
            <span className="truncate text-[9px] font-semibold">Inicio</span>
          </button>

          <Link
            href="/artistas"
            aria-label="Explorar artistas"
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-500 transition hover:text-zinc-200"
          >
            <Icono tipo="comunidad" className="h-5 w-5" />
            <span className="truncate text-[9px] font-semibold">Explorar</span>
          </Link>

          <a
            href="#panel-card-2"
            aria-label="Ir a publicar una idea"
            className="group -mt-5 flex min-w-0 flex-col items-center justify-center gap-1 text-zinc-300"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/40 bg-violet-500 text-white shadow-lg shadow-violet-950/60 transition group-hover:scale-105 group-hover:bg-violet-400">
              <Icono tipo="mas" className="h-6 w-6" />
            </span>
            <span className="truncate text-[9px] font-semibold">Publicar</span>
          </a>

          <a
            href="#panel-card-3"
            aria-label="Ir a propuestas"
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-500 transition hover:text-zinc-200"
          >
            <Icono tipo="propuestas" className="h-5 w-5" />
            <span className="truncate text-[9px] font-semibold">Propuestas</span>
          </a>

          <a
            href="#panel-card-1"
            aria-label="Ir al perfil"
            className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-500 transition hover:text-zinc-200"
          >
            <Icono tipo="perfil" className="h-5 w-5" />
            <span className="truncate text-[9px] font-semibold">Perfil</span>
          </a>
        </div>
      </nav>
    </main>
  );
}