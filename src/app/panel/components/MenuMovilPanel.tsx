"use client";

// FEATMUSIC_MENU_MI_PERFIL_PUBLICO_V1

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useNotificaciones } from "@/app/components/useNotificaciones";
import { useNotificacionesChat } from "@/app/components/useNotificacionesChat";
import IdeasMusicalesCard, { type IdeaPanel } from "./IdeasMusicalesCard";

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
      ? "text-yellow-300"
      : "text-zinc-500 hover:text-zinc-200",
  ].join(" ");
}

const IDEAS_VACIAS: IdeaPanel[] = [];

type MenuMovilPanelProps = {
  ocultarDesde?: "md" | "lg";
};

export default function MenuMovilPanel({
  ocultarDesde = "lg",
}: MenuMovilPanelProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLElement>(null);
  const [publicarAbierto, setPublicarAbierto] = useState(false);
  const { total: mensajesNoLeidos } = useNotificacionesChat();
  const { totalNoLeidas: notificacionesNoLeidas } = useNotificaciones();
  const etiquetaMensajes =
    mensajesNoLeidos > 99 ? "99+" : String(mensajesNoLeidos);
  const etiquetaPerfil =
    notificacionesNoLeidas > 99
      ? "99+"
      : String(notificacionesNoLeidas);

  const estaEnInicio = pathname === "/inicio" || pathname.startsWith("/inicio/");
  const estaEnPanel = pathname === "/artistas/mi-perfil";
  const estaEnExplorar =
    (pathname === "/artistas" || pathname.startsWith("/artistas/")) &&
    pathname !== "/artistas/mi-perfil";
  const estaEnMensajes =
    pathname === "/mensajes" || pathname.startsWith("/mensajes/");

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const raiz = document.documentElement;
    const actualizarAltura = () => {
      const altura = Math.ceil(menu.getBoundingClientRect().height);
      raiz.style.setProperty(
        "--featmusic-menu-movil-altura",
        `${altura}px`,
      );
    };

    actualizarAltura();

    const observador =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(actualizarAltura);

    observador?.observe(menu);
    window.addEventListener("resize", actualizarAltura);

    return () => {
      observador?.disconnect();
      window.removeEventListener("resize", actualizarAltura);
      raiz.style.removeProperty("--featmusic-menu-movil-altura");
    };
  }, []);

  return (
    <>
      <nav
      ref={menuRef}
      aria-label="Menú principal móvil"
      className={`featmusic-mobile-bottom-nav featmusic-dark-chrome featmusic-solid-black-chrome fixed bottom-0 left-0 right-0 z-50 box-border w-full max-w-[100vw] overflow-visible px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(0,0,0,0.45)] ${
        ocultarDesde === "md" ? "md:hidden" : "lg:hidden"
      }`}
    >
      <div className="mx-auto grid w-full min-w-0 max-w-md grid-cols-5 items-end">
        <Link
          href="/inicio"
          aria-label="Ir al feed de inicio"
          aria-current={estaEnInicio ? "page" : undefined}
          className={claseOpcion(estaEnInicio)}
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

        <button
          type="button"
          onClick={() => setPublicarAbierto(true)}
          aria-label="Abrir el formulario para publicar una idea"
          aria-haspopup="dialog"
          aria-expanded={publicarAbierto}
          data-featmusic-publicar-sin-circulo-v1="true"
          className="group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-zinc-500 transition hover:text-yellow-300"
        >
          <Icono tipo="mas" className="h-6 w-6" />
          <span className="truncate text-[9px] font-semibold">Publicar</span>
        </button>

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
              <span className="absolute -right-3 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full border border-black bg-yellow-500 px-1 text-[7px] font-black leading-none text-white shadow-lg shadow-yellow-950/50">
                {etiquetaMensajes}
              </span>
            )}
          </span>
          <span className="truncate text-[9px] font-semibold">Mensajes</span>
        </Link>

        <Link
          href="/artistas/mi-perfil"
          aria-label={
            notificacionesNoLeidas > 0
              ? `Ir al perfil. ${notificacionesNoLeidas} notificación${
                  notificacionesNoLeidas === 1 ? "" : "es"
                } sin leer`
              : "Ir al perfil"
          }
          aria-current={estaEnPanel ? "page" : undefined}
          className={claseOpcion(estaEnPanel)}
        >
          <span className="relative flex">
            <Icono tipo="perfil" />
            {notificacionesNoLeidas > 0 && (
              <span className="absolute -right-3 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full border border-black bg-yellow-500 px-1 text-[7px] font-black leading-none text-white shadow-lg shadow-yellow-950/50">
                {etiquetaPerfil}
              </span>
            )}
          </span>
          <span className="truncate text-[9px] font-semibold">Perfil</span>
        </Link>
      </div>
      </nav>

      <IdeasMusicalesCard
        ideasIniciales={IDEAS_VACIAS}
        soloModal
        abiertoExterno={publicarAbierto}
        onCerrarExterno={() => setPublicarAbierto(false)}
      />
    </>
  );
}
