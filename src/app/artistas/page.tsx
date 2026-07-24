"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type IconoTipo =
  | "inicio"
  | "explorar"
  | "planes"
  | "propuestas"
  | "perfil"
  | "mas"
  | "salir";

function Icono({
  tipo,
  className = "h-5 w-5",
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

    case "explorar":
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

    case "propuestas":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16.5" cy="9.5" r="2.5" />
          <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
          <path d="M13.5 17a4.5 4.5 0 0 1 8 3" />
        </svg>
      );

    case "perfil":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );

    case "mas":
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M13 4h7v16h-7" />
        </svg>
      );
  }
}

function Banner() {
  return (
    <header className="relative z-20 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4">
        <Link href="/panel" className="text-lg font-black tracking-tight">
          Feat<span className="text-violet-400">Music</span>
        </Link>

        <nav
          aria-label="Navegación principal"
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
            aria-current="page"
            className="flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold text-violet-300"
          >
            <Icono tipo="explorar" className="h-3.5 w-3.5" />
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
  );
}

function MenuMovil() {
  return (
    <nav
      aria-label="Menú principal móvil"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0810]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end">
        <Link
          href="/panel"
          className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-500 transition hover:text-zinc-200"
        >
          <Icono tipo="inicio" />
          <span className="truncate text-[9px] font-semibold">Inicio</span>
        </Link>

        <Link
          href="/artistas"
          aria-current="page"
          className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-violet-300"
        >
          <Icono tipo="explorar" />
          <span className="truncate text-[9px] font-semibold">Explorar</span>
        </Link>

        <Link
          href="/panel#panel-card-2"
          aria-label="Ir a publicar una idea"
          className="group -mt-5 flex min-w-0 flex-col items-center justify-center gap-1 text-zinc-300"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/40 bg-violet-500 text-white shadow-lg shadow-violet-950/60 transition group-hover:scale-105 group-hover:bg-violet-400">
            <Icono tipo="mas" className="h-6 w-6" />
          </span>
          <span className="truncate text-[9px] font-semibold">Publicar</span>
        </Link>

        <Link
          href="/panel#panel-card-3"
          className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-500 transition hover:text-zinc-200"
        >
          <Icono tipo="propuestas" />
          <span className="truncate text-[9px] font-semibold">Propuestas</span>
        </Link>

        <Link
          href="/panel#panel-card-1"
          className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-500 transition hover:text-zinc-200"
        >
          <Icono tipo="perfil" />
          <span className="truncate text-[9px] font-semibold">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}

function CargandoArtistas() {
  return (
    <div
      className="relative z-10 flex flex-1 items-center justify-center px-6 pb-20 lg:pb-0"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-violet-400/20 bg-violet-500/5 animate-ping" />
          <span className="absolute inset-2 rounded-full border-2 border-zinc-800 border-t-violet-400 animate-spin" />
          <span className="absolute inset-5 rounded-full border border-violet-300/30 bg-violet-500/10 animate-pulse" />
          <Icono tipo="explorar" className="relative h-6 w-6 text-violet-300" />
        </div>

        <p className="mt-5 text-sm font-bold text-zinc-100">
          Cargando artistas
          <span className="inline-block w-4 text-left animate-pulse">...</span>
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          Preparando nuevas conexiones musicales
        </p>
      </div>
    </div>
  );
}

export default function ArtistasPage() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setCargando(false);
    }, 700);

    return () => window.clearTimeout(temporizador);
  }, []);

  return (
    <main className="relative flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-[#09070d] text-white">
      <Banner />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute inset-x-0 top-12 h-72 bg-gradient-to-b from-violet-950/30 to-transparent" />

      {cargando ? (
        <CargandoArtistas />
      ) : (
        <section className="relative z-10 flex flex-1 items-center justify-center px-6 pb-20 lg:pb-0">
          <div className="w-full max-w-xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-950/30">
              <Icono tipo="explorar" className="h-7 w-7" />
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400">
              FeatMusic
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Explorar artistas
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-400">
              Muy pronto podrás descubrir artistas y colaboradores por rol,
              género y ubicación.
            </p>

            <Link
              href="/panel"
              className="mt-7 inline-flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-500/20"
            >
              <Icono tipo="inicio" className="h-4 w-4" />
              Volver al panel
            </Link>
          </div>
        </section>
      )}

      <MenuMovil />
    </main>
  );
}