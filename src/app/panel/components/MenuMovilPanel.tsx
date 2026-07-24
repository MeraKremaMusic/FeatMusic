"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type IconoTipo =
  | "inicio"
  | "explorar"
  | "propuestas"
  | "perfil"
  | "mas";

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
          <path d="M14.5 16.5a4.5 4.5 0 0 1 8 3" />
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

    default:
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
  }
}

function claseOpcion(activa: boolean, bloqueada: boolean) {
  return [
    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition",
    activa
      ? "text-violet-300"
      : "text-zinc-500 hover:text-zinc-200",
    bloqueada ? "pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function MenuMovilPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const [cargandoExplorar, setCargandoExplorar] = useState(false);

  const estaEnPanel = pathname === "/panel" || pathname.startsWith("/panel/");
  const estaEnExplorar =
    pathname === "/artistas" || pathname.startsWith("/artistas/");

  useEffect(() => {
    router.prefetch("/panel");
    router.prefetch("/artistas");
  }, [router]);

  function abrirExplorar() {
    if (cargandoExplorar || estaEnExplorar) {
      return;
    }

    setCargandoExplorar(true);

    // Permite que React pinte la animación antes de iniciar la navegación.
    window.setTimeout(() => {
      router.push("/artistas");
    }, 80);
  }

  return (
    <>
      {cargandoExplorar && (
        <div
          className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-[#09070d] text-white lg:hidden"
          role="status"
          aria-live="polite"
          aria-label="Cargando artistas"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-950/30 to-transparent" />

          <div className="relative z-10 flex h-12 shrink-0 items-center border-b border-white/10 bg-black/90 px-4 backdrop-blur-xl">
            <span className="text-lg font-black tracking-tight">
              Feat<span className="text-violet-400">Music</span>
            </span>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-20">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full border border-violet-400/20 bg-violet-500/5" />
                <span className="absolute inset-2 animate-spin rounded-full border-2 border-zinc-800 border-t-violet-400" />
                <span className="absolute inset-5 animate-pulse rounded-full border border-violet-300/30 bg-violet-500/10" />

                <Icono
                  tipo="explorar"
                  className="relative h-6 w-6 text-violet-300"
                />
              </div>

              <p className="mt-5 text-sm font-bold text-zinc-100">
                Cargando artistas
                <span className="inline-block w-4 animate-pulse text-left">
                  ...
                </span>
              </p>

              <p className="mt-1 text-[11px] text-zinc-500">
                Preparando nuevas conexiones musicales
              </p>
            </div>
          </div>

          <div className="relative z-10 h-[72px] shrink-0 border-t border-white/10 bg-[#0b0810]/95 backdrop-blur-xl" />
        </div>
      )}

      <nav
        aria-label="Menú principal móvil"
        aria-busy={cargandoExplorar}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b0810]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end">
          <Link
            href="/panel"
            aria-label="Ir al panel"
            className={claseOpcion(estaEnPanel, cargandoExplorar)}
          >
            <Icono tipo="inicio" />
            <span className="truncate text-[9px] font-semibold">Inicio</span>
          </Link>

          <button
            type="button"
            onClick={abrirExplorar}
            disabled={cargandoExplorar}
            aria-label="Explorar artistas"
            aria-current={estaEnExplorar ? "page" : undefined}
            className={claseOpcion(estaEnExplorar, cargandoExplorar)}
          >
            <Icono tipo="explorar" />
            <span className="truncate text-[9px] font-semibold">Explorar</span>
          </button>

          <Link
            href="/panel#panel-card-2"
            aria-label="Ir a publicar una idea"
            className={`group -mt-5 flex min-w-0 flex-col items-center justify-center gap-1 text-zinc-300 ${
              cargandoExplorar ? "pointer-events-none" : ""
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/40 bg-violet-500 text-white shadow-lg shadow-violet-950/60 transition group-hover:scale-105 group-hover:bg-violet-400">
              <Icono tipo="mas" className="h-6 w-6" />
            </span>
            <span className="truncate text-[9px] font-semibold">Publicar</span>
          </Link>

          <Link
            href="/panel#panel-card-3"
            aria-label="Ir a propuestas"
            className={claseOpcion(false, cargandoExplorar)}
          >
            <Icono tipo="propuestas" />
            <span className="truncate text-[9px] font-semibold">
              Propuestas
            </span>
          </Link>

          <Link
            href="/panel#panel-card-1"
            aria-label="Ir al perfil"
            className={claseOpcion(false, cargandoExplorar)}
          >
            <Icono tipo="perfil" />
            <span className="truncate text-[9px] font-semibold">Perfil</span>
          </Link>
        </div>
      </nav>
    </>
  );
}