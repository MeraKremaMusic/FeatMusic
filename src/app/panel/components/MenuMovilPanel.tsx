"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useNotificacionesChat } from "@/app/components/useNotificacionesChat";

type IconoTipo =
  | "inicio"
  | "explorar"
  | "mensajes"
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

    case "mensajes":
      return (
        <svg {...props}>
          <path d="M4 5h16v11H8l-4 4V5Z" />
          <path d="M8 9h8" />
          <path d="M8 12h5" />
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

function claseOpcion(activa: boolean) {
  return [
    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 transition",
    activa
      ? "text-violet-300"
      : "text-zinc-500 hover:text-zinc-200",
  ].join(" ");
}

type MenuMovilPanelProps = {
  ocultarDesde?: "md" | "lg";
};

export default function MenuMovilPanel({
  ocultarDesde = "lg",
}: MenuMovilPanelProps) {
  const pathname = usePathname();
  const { total: mensajesNoLeidos } = useNotificacionesChat();
  const etiquetaMensajes =
    mensajesNoLeidos > 99 ? "99+" : String(mensajesNoLeidos);

  const estaEnPanel = pathname === "/panel" || pathname.startsWith("/panel/");
  const estaEnExplorar =
    pathname === "/artistas" || pathname.startsWith("/artistas/");
  const estaEnMensajes =
    pathname === "/mensajes" || pathname.startsWith("/mensajes/");

  return (
    <nav
      aria-label="Menú principal móvil"
      className={`fixed bottom-0 left-0 right-0 z-50 box-border w-full max-w-[100vw] overflow-visible border-t border-white/10 bg-[#0b0810]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
        ocultarDesde === "md" ? "md:hidden" : "lg:hidden"
      }`}
    >
      <div className="mx-auto grid w-full min-w-0 max-w-md grid-cols-5 items-end">
        <Link
          href="/panel"
          aria-label="Ir al panel"
          aria-current={estaEnPanel ? "page" : undefined}
          className={claseOpcion(estaEnPanel)}
        >
          <Icono tipo="inicio" />
          <span className="truncate text-[9px] font-semibold">Inicio</span>
        </Link>

        <Link
          href="/artistas"
          aria-label="Explorar artistas"
          aria-current={estaEnExplorar ? "page" : undefined}
          className={claseOpcion(estaEnExplorar)}
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
          href="/mensajes"
          aria-label={
            mensajesNoLeidos > 0
              ? `Ir a mensajes. ${mensajesNoLeidos} mensaje${
                  mensajesNoLeidos === 1 ? "" : "s"
                } sin leer`
              : "Ir a mensajes"
          }
          aria-current={estaEnMensajes ? "page" : undefined}
          className={claseOpcion(estaEnMensajes)}
        >
          <span className="relative flex">
            <Icono tipo="mensajes" />
            {mensajesNoLeidos > 0 && (
              <span className="absolute -right-3 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full border border-[#0b0810] bg-red-500 px-1 text-[7px] font-black leading-none text-white shadow-lg shadow-red-950/50">
                {etiquetaMensajes}
              </span>
            )}
          </span>
          <span className="truncate text-[9px] font-semibold">Mensajes</span>
        </Link>

        <Link
          href="/panel#panel-card-1"
          aria-label="Ir al perfil"
          className={claseOpcion(false)}
        >
          <Icono tipo="perfil" />
          <span className="truncate text-[9px] font-semibold">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
