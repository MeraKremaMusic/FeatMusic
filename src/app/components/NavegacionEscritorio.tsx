"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useNotificacionesChat } from "@/app/components/useNotificacionesChat";

type IconoTipo = "planes" | "explorar" | "propuestas" | "perfil";

function Icono({
  tipo,
  className = "h-3.5 w-3.5",
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

  if (tipo === "planes") {
    return (
      <svg {...props}>
        <path d="m3 8 4 3 5-7 5 7 4-3-2 11H5L3 8Z" />
        <path d="M5 19h14" />
      </svg>
    );
  }

  if (tipo === "explorar") {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M14.5 16.5a4.5 4.5 0 0 1 6 3.5" />
      </svg>
    );
  }

  if (tipo === "propuestas") {
    return (
      <svg {...props}>
        <circle cx="8" cy="8" r="3" />
        <circle cx="16.5" cy="9.5" r="2.5" />
        <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
        <path d="M13.5 17a4.5 4.5 0 0 1 8 3" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

const claseBase =
  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition";

const claseInactiva =
  "text-zinc-400 hover:bg-white/5 hover:text-white";

const claseActiva =
  "bg-violet-500/15 text-violet-200 ring-1 ring-inset ring-violet-400/30";

type NavegacionEscritorioProps = {
  mostrarDesde?: "md" | "lg";
};

export default function NavegacionEscritorio({
  mostrarDesde = "lg",
}: NavegacionEscritorioProps) {
  const pathname = usePathname();
  const { total: mensajesNoLeidos } = useNotificacionesChat();
  const etiquetaMensajes = mensajesNoLeidos > 99 ? "99+" : String(mensajesNoLeidos);

  const explorando =
    pathname === "/artistas" || pathname.startsWith("/artistas/");

  const viendoPerfil = pathname === "/panel";
  const viendoMensajes = pathname.startsWith("/mensajes/");

  return (
    <nav
      aria-label="Navegación principal"
      className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 ${
        mostrarDesde === "md" ? "md:flex" : "lg:flex"
      }`}
    >
      <button
        type="button"
        title="Próximamente"
        className={`${claseBase} cursor-default text-zinc-500`}
      >
        <Icono tipo="planes" />
        Planes
      </button>

      <Link
        href="/artistas"
        aria-current={explorando ? "page" : undefined}
        className={`${claseBase} ${
          explorando ? claseActiva : claseInactiva
        }`}
      >
        <Icono tipo="explorar" />
        Explorar
      </Link>

      <Link
        href="/panel#panel-card-3"
        aria-current={viendoMensajes ? "page" : undefined}
        className={`${claseBase} ${
          viendoMensajes ? claseActiva : claseInactiva
        }`}
      >
        <span className="relative flex">
          <Icono tipo="propuestas" />
          {mensajesNoLeidos > 0 && (
            <span className="absolute -right-3 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full border border-[#09070d] bg-red-500 px-1 text-[7px] font-black leading-none text-white shadow-lg shadow-red-950/50">
              {etiquetaMensajes}
            </span>
          )}
        </span>
        Propuestas
      </Link>

      <Link
        href="/panel#panel-card-1"
        aria-current={viendoPerfil ? "page" : undefined}
        className={`${claseBase} ${
          viendoPerfil ? claseActiva : claseInactiva
        }`}
      >
        <Icono tipo="perfil" />
        Mi perfil
      </Link>
    </nav>
  );
}