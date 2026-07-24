import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

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

function obtenerIniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
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

const alturasOnda = [
  7, 14, 9, 19, 12, 24, 16, 30, 22, 15, 27, 18, 33, 20, 12, 25, 17, 29,
  14, 21, 10, 18, 8, 15,
];

function Onda({
  activa = false,
}: {
  activa?: boolean;
}) {
  return (
    <div className="flex h-6 min-w-0 flex-1 items-center gap-[2px] overflow-hidden">
      {alturasOnda.map((altura, indice) => (
        <span
          key={`${altura}-${indice}`}
          className={`w-[2px] shrink-0 rounded-full ${
            activa ? "bg-violet-400" : "bg-zinc-600"
          }`}
          style={{ height: `${Math.max(4, Math.round(altura * 0.65))}px` }}
        />
      ))}
    </div>
  );
}

const ideasDemo = [
  {
    id: 1,
    titulo: "Luces de Medianoche",
    genero: "Pop alternativo",
    bpm: "96 BPM",
    tonalidad: "Em",
    descripcion: "Idea sobre noches en la ciudad, deseos y nuevos comienzos.",
    duracion: "0:28",
    imagen:
      "bg-[radial-gradient(circle_at_70%_30%,#fb7185_0%,transparent_22%),linear-gradient(160deg,#312e81_0%,#7c3aed_46%,#111827_100%)]",
  },
  {
    id: 2,
    titulo: "Mar sin Ruido",
    genero: "R&B",
    bpm: "82 BPM",
    tonalidad: "Am",
    descripcion: "Una balada íntima sobre soltar, aceptar y seguir adelante.",
    duracion: "0:26",
    imagen:
      "bg-[radial-gradient(circle_at_50%_40%,#22d3ee_0%,transparent_24%),linear-gradient(160deg,#0f172a_0%,#1d4ed8_52%,#111827_100%)]",
  },
  {
    id: 3,
    titulo: "Órbitas",
    genero: "Electrónica",
    bpm: "120 BPM",
    tonalidad: "Dm",
    descripcion: "Texturas electrónicas y voces etéreas para la pista de baile.",
    duracion: "0:24",
    imagen:
      "bg-[radial-gradient(circle_at_58%_28%,#c4b5fd_0%,transparent_18%),linear-gradient(160deg,#111827_0%,#312e81_48%,#020617_100%)]",
  },
];

const propuestasDemo = [
  {
    nombre: "Neo Wave",
    rol: "Productor",
    iniciales: "NW",
    mensaje: "Me vibra mucho la atmósfera. Puedo trabajar el beat y la estructura.",
    duracion: "0:18",
    color: "from-amber-500 to-orange-700",
  },
  {
    nombre: "Silvia Neón",
    rol: "Cantante",
    iniciales: "SN",
    mensaje: "Tengo una idea de melodía para el estribillo que puede encajar perfecto.",
    duracion: "0:22",
    color: "from-cyan-500 to-blue-700",
  },
  {
    nombre: "Dh-man",
    rol: "Beatmaker",
    iniciales: "DH",
    mensaje: "Puedo aportar una versión más oscura y bailable. ¿Te late?",
    duracion: "0:27",
    color: "from-violet-500 to-fuchsia-700",
  },
];

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

  const iniciales = obtenerIniciales(nombreArtistico);
  const usuarioPublico = crearUsuario(nombreArtistico);
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
    <main className="min-h-screen bg-[#09070d] text-white lg:h-screen lg:overflow-hidden">
      <header className="border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4 lg:px-4">
          <Link href="/panel" className="text-lg font-black tracking-tight">
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <nav className="hidden h-full items-center gap-5 md:flex">
            <Link
              href="/panel"
              className="relative flex h-full items-center gap-2 px-2 text-xs font-semibold text-white"
            >
              <Icono tipo="inicio" className="h-3 w-3" />
              Inicio
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-400" />
            </Link>

            <Link
              href="/artistas"
              className="flex h-full items-center gap-2 px-2 text-xs text-zinc-400 transition hover:text-white"
            >
              <Icono tipo="comunidad" className="h-3 w-3" />
              Comunidad
            </Link>

            <Link
              href="/planes"
              className="flex h-full items-center gap-2 px-2 text-xs text-zinc-400 transition hover:text-white"
            >
              <Icono tipo="planes" className="h-3 w-3" />
              Planes
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Icono tipo="campana" className="h-3 w-3" />
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-black">
                3
              </span>
            </button>

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
        </div>
      </header>

      <div className="relative lg:h-[calc(100vh-48px)] lg:overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-950/30 to-transparent" />

        <div
          id="panel-carrusel"
          className="
            relative mx-auto flex w-full max-w-[1460px] snap-x snap-mandatory
            items-center gap-4 overflow-x-auto overscroll-x-contain
            px-4 pb-3 pt-4 scroll-smooth touch-pan-x
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            lg:grid lg:h-full lg:grid-cols-[0.84fr_1.08fr_1.08fr]
            lg:items-stretch lg:gap-3 lg:overflow-visible lg:snap-none
            lg:px-4 lg:py-3
          "
        >
          <section
            id="panel-card-1"
            className="min-h-[calc(100dvh-116px)] w-[calc(100vw-32px)] max-w-[440px] shrink-0 snap-center scroll-mt-20 overflow-y-auto rounded-[20px] border border-white/15 bg-[#0d0913]/95 p-5 shadow-2xl shadow-black/35 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:min-h-0 lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink lg:rounded-[18px] lg:p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 lg:text-[9px]">
                <Icono
                  tipo="perfil"
                  className="h-3.5 w-3.5 text-violet-400"
                />
                <span className="text-violet-400">1</span>
                Perfil del artista
              </div>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                  usuario.perfilCompleto
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                    : "border-amber-400/25 bg-amber-400/10 text-amber-300"
                }`}
              >
                {usuario.perfilCompleto
                  ? "Perfil completo"
                  : "Perfil pendiente"}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border border-violet-300/40 bg-gradient-to-br from-violet-700 to-fuchsia-500 text-[28px] font-black shadow-xl shadow-violet-950/40 lg:h-16 lg:w-16 lg:text-2xl">
                {iniciales}

                {usuario.correoVerificado && (
                  <span
                    title="Correo verificado"
                    className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-[#0d0913] bg-violet-500 text-[11px] font-black"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[22px] font-black leading-tight tracking-tight lg:text-lg">
                  {nombreArtistico}
                </h1>

                <p className="mt-1 truncate text-[13px] text-zinc-400 lg:text-[10px]">
                  @{usuarioPublico}
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200 lg:text-[10px]">
                    {rol}
                  </span>

                  <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-200 lg:text-[10px]">
                    {tipoColaboracion}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Géneros musicales
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {(generos.length > 0
                  ? generos
                  : ["Sin completar"]
                ).map((genero) => (
                  <span
                    key={genero}
                    className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-200"
                  >
                    {genero}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <Icono tipo="ubicacion" className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Ciudad y país
                  </p>
                  <p className="truncate text-[12px] font-semibold text-zinc-200">
                    {ubicacion}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <Icono tipo="mundo" className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Idioma principal
                  </p>
                  <p className="truncate text-[12px] font-semibold text-zinc-200">
                    {idiomaPrincipal}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <Icono tipo="musica" className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Tipo de colaboración
                  </p>
                  <p className="truncate text-[12px] font-semibold text-zinc-200">
                    {tipoColaboracion}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Miembro de FeatMusic desde
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-zinc-200">
                    {fechaRegistro}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                    usuario.correoVerificado
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {usuario.correoVerificado
                    ? "Cuenta verificada"
                    : "Verificación pendiente"}
                </span>
              </div>
            </div>
          </section>

          <section id="panel-card-2" className="min-h-[calc(100dvh-116px)] w-[calc(100vw-32px)] max-w-[440px] shrink-0 snap-center scroll-mt-20 overflow-hidden rounded-[20px] border border-white/15 bg-[#0d0913]/95 p-4 shadow-2xl shadow-black/35 lg:min-h-0 lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink lg:rounded-[18px] lg:p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-400">
                <Icono tipo="idea" className="h-3 w-3 text-violet-400" />
                <span className="text-violet-400">2</span>
                Ideas musicales
              </div>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold text-violet-200 transition hover:bg-violet-500/20"
              >
                <Icono tipo="mas" className="h-3 w-3" />
                Nueva idea
              </button>
            </div>

            <p className="mt-2 text-[10px] text-zinc-400">
              Selecciona una idea para ver sus propuestas.
            </p>

            <div className="mt-1.5 space-y-1">
              {ideasDemo.map((idea, indice) => {
                const seleccionada = indice === 0;

                return (
                  <button
                    key={idea.id}
                    type="button"
                    className={`w-full rounded-lg border p-2 text-left transition ${
                      seleccionada
                        ? "border-violet-400/80 bg-violet-500/[0.06] shadow-lg shadow-violet-950/30"
                        : "border-white/10 bg-white/[0.025] hover:border-white/20"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`h-16 w-16 shrink-0 rounded-lg ${idea.imagen}`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xs font-bold">
                              {idea.titulo}
                            </h3>
                            <p className="mt-0.5 text-[9px] text-zinc-400">
                              {idea.genero} · {idea.bpm} · {idea.tonalidad}
                            </p>
                          </div>

                          {seleccionada && (
                            <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[8px] font-black uppercase">
                              Seleccionada
                            </span>
                          )}
                        </div>

                        <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-zinc-400">
                          {idea.descripcion}
                        </p>

                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 text-white">
                            <Icono tipo="play" className="h-3 w-3" />
                          </span>
                          <Onda activa={seleccionada} />
                          <span className="text-[10px] text-zinc-500">
                            {idea.duracion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold text-violet-300 transition hover:bg-violet-500/10"
            >
              Ver todas las ideas
              <Icono tipo="flecha" className="h-3 w-3" />
            </button>
          </section>

          <section id="panel-card-3" className="min-h-[calc(100dvh-116px)] w-[calc(100vw-32px)] max-w-[440px] shrink-0 snap-center scroll-mt-20 overflow-hidden rounded-[20px] border border-white/15 bg-[#0d0913]/95 p-4 shadow-2xl shadow-black/35 lg:min-h-0 lg:w-auto lg:max-w-none lg:min-w-0 lg:shrink lg:rounded-[18px] lg:p-3">
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-400">
              <Icono tipo="propuestas" className="h-3 w-3 text-violet-400" />
              <span className="text-violet-400">3</span>
              Propuestas para:
              <span className="normal-case tracking-normal text-violet-300">
                Luces de Medianoche
              </span>
            </div>

            <p className="mt-2 text-[10px] text-zinc-400">
              Propuestas de la idea seleccionada.
            </p>

            <div className="mt-1.5 space-y-1">
              {propuestasDemo.map((propuesta, indice) => (
                <article
                  key={propuesta.nombre}
                  className="rounded-lg border border-white/10 bg-white/[0.025] p-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${propuesta.color} text-[10px] font-black`}
                      >
                        {propuesta.iniciales}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate text-[11px] font-bold">
                            {propuesta.nombre}
                          </h3>
                          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-violet-500 text-[7px] font-black">
                            ✓
                          </span>
                        </div>

                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-md border border-violet-400/20 bg-violet-500/5 px-1.5 py-0.5 text-[8px] text-zinc-300">
                          <Icono tipo="musica" className="h-2.5 w-2.5" />
                          {propuesta.rol}
                        </span>
                      </div>

                      <span className="shrink-0 text-[8px] font-semibold text-amber-400">
                        • Pendiente
                      </span>
                    </div>

                    <p className="ml-[42px] mt-0.5 line-clamp-1 text-[8px] leading-3.5 text-zinc-400">
                      {propuesta.mensaje}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Reproducir propuesta de ${propuesta.nombre}`}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition hover:bg-white/10"
                      >
                        <Icono tipo="play" className="h-2.5 w-2.5" />
                      </button>

                      <Onda activa={indice === 1} />

                      <span className="shrink-0 text-[8px] text-zinc-500">
                        {propuesta.duracion}
                      </span>

                      <div className="ml-1 flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          className="flex h-5 items-center justify-center gap-1 border border-emerald-400/45 bg-emerald-500/[0.04] px-1.5 text-[7px] font-semibold uppercase tracking-[0.06em] text-emerald-300 transition hover:border-emerald-300 hover:bg-emerald-500/10"
                        >
                          <Icono tipo="aceptar" className="h-2.5 w-2.5" />
                          Aceptar
                        </button>

                        <button
                          type="button"
                          className="flex h-5 items-center justify-center gap-1 border border-red-400/45 bg-red-500/[0.04] px-1.5 text-[7px] font-semibold uppercase tracking-[0.06em] text-red-300 transition hover:border-red-300 hover:bg-red-500/10"
                        >
                          <Icono tipo="rechazar" className="h-2.5 w-2.5" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-bold text-violet-300 transition hover:bg-violet-500/10"
            >
              <Icono tipo="propuestas" className="h-3 w-3" />
              Ver todas las propuestas
              <Icono tipo="flecha" className="h-3 w-3" />
            </button>
          </section>
        </div>

        <div
          className="relative z-10 flex items-center justify-center gap-2 pb-4 lg:hidden"
          aria-label="Navegación entre secciones del panel"
        >
          <a
            href="#panel-card-1"
            aria-label="Ir al perfil del artista"
            className="h-2 w-5 rounded-full bg-violet-400 shadow-sm shadow-violet-500/50 transition hover:bg-violet-300"
          />
          <a
            href="#panel-card-2"
            aria-label="Ir a ideas musicales"
            className="h-2 w-2 rounded-full bg-white/25 transition hover:bg-white/50"
          />
          <a
            href="#panel-card-3"
            aria-label="Ir a propuestas"
            className="h-2 w-2 rounded-full bg-white/25 transition hover:bg-white/50"
          />
        </div>
      </div>
    </main>
  );
}