"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

// FEATMUSIC_MENU_MAS_PAGINAS_NUEVAS_V1

type IconoTipo = "premium" | "ayuda" | "reporte" | "terminos" | "privacidad";

const OPCIONES_MAS: Array<{
  href: string;
  titulo: string;
  descripcion: string;
  icono: IconoTipo;
}> = [
  {
    href: "/planes",
    titulo: "Planes Premium",
    descripcion: "Conoce las funciones que llegarán a FeatMusic.",
    icono: "premium",
  },
  {
    href: "/ayuda",
    titulo: "Ayuda y soporte",
    descripcion: "Resuelve dudas sobre perfiles, ideas y propuestas.",
    icono: "ayuda",
  },
  {
    href: "/reportar-usuario",
    titulo: "Reportar un usuario",
    descripcion: "Informa comportamientos o contenido inapropiado.",
    icono: "reporte",
  },
  {
    href: "/terminos",
    titulo: "Términos y condiciones",
    descripcion: "Consulta las reglas de uso de la plataforma.",
    icono: "terminos",
  },
  {
    href: "/privacidad",
    titulo: "Política de privacidad",
    descripcion: "Conoce cómo se tratan tus datos personales.",
    icono: "privacidad",
  },
];

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

  if (tipo === "premium") {
    return (
      <svg {...props}>
        <path d="m4 8 4 3 4-6 4 6 4-3-2 10H6L4 8Z" />
        <path d="M7 21h10" />
      </svg>
    );
  }

  if (tipo === "ayuda") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.4 2.4 0 1 1 3.6 2.08c-.9.52-1.4 1-1.4 2.12" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (tipo === "reporte") {
    return (
      <svg {...props}>
        <path d="M5 21V4" />
        <path d="M5 5h11l-1.5 3L16 11H5" />
        <path d="M18 15v3M18 21h.01" />
      </svg>
    );
  }

  if (tipo === "terminos") {
    return (
      <svg {...props}>
        <path d="M6 3h9l3 3v15H6V3Z" />
        <path d="M15 3v4h4" />
        <path d="M9 11h6M9 15h6M9 19h4" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M12 3 5 6v5c0 4.7 2.8 8 7 10 4.2-2 7-5.3 7-10V6l-7-3Z" />
      <path d="M9.5 12 11 13.5l3.5-4" />
    </svg>
  );
}

function IconoMenu({ abierto = false }: { abierto?: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-4 w-5">
      <span
        className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition ${
          abierto ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition ${
          abierto ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition ${
          abierto ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

function IconoChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function rutaActiva(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MenuMasEscritorio() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const activo = OPCIONES_MAS.some((opcion) =>
    rutaActiva(pathname, opcion.href),
  );

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    function cerrarFuera(evento: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    }

    function cerrarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", cerrarFuera);
    window.addEventListener("keydown", cerrarEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarFuera);
      window.removeEventListener("keydown", cerrarEscape);
    };
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((estado) => !estado)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
          activo
            ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-400/30"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <IconoMenu abierto={abierto} />
        Más
      </button>

      {abierto && (
        <div
          role="menu"
          className="featmusic-more-dropdown absolute left-1/2 top-[calc(100%+0.65rem)] z-[90] w-[330px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#07110d]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,.5)] backdrop-blur-xl"
        >
          <div className="px-3 pb-2 pt-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
              Más en FeatMusic
            </p>
          </div>

          {OPCIONES_MAS.map((opcion) => {
            const seleccionada = rutaActiva(pathname, opcion.href);

            return (
              <Link
                key={opcion.href}
                href={opcion.href}
                role="menuitem"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  seleccionada
                    ? "bg-emerald-500/15 text-white"
                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                  <Icono tipo={opcion.icono} className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-black">
                    {opcion.titulo}
                  </span>
                  <span className="mt-0.5 block text-[9px] leading-4 text-zinc-500">
                    {opcion.descripcion}
                  </span>
                </span>
                <IconoChevron />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MenuMasMovil() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function cerrarEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    }

    window.addEventListener("keydown", cerrarEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarEscape);
    };
  }, [abierto]);

  const panel =
    montado && abierto
      ? createPortal(
          <div
            className="featmusic-more-backdrop fixed inset-0 z-[120] bg-black/65 lg:hidden"
            role="presentation"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                setAbierto(false);
              }
            }}
          >
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Más opciones de FeatMusic"
              className="featmusic-more-drawer flex h-[100dvh] w-[min(88vw,350px)] flex-col border-r border-white/10 bg-[#07110d] shadow-[24px_0_70px_rgba(0,0,0,.5)]"
            >
              <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
                <Link
                  href="/inicio"
                  className="text-xl font-black tracking-tight text-white"
                >
                  Feat<span className="text-emerald-400">Music</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
                  aria-label="Cerrar menú"
                >
                  <IconoMenu abierto />
                </button>
              </div>

              <div className="px-4 pb-2 pt-5">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400">
                  Información y soporte
                </p>
                <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                  Planes, ayuda, seguridad y documentos de la plataforma.
                </p>
              </div>

              <nav
                aria-label="Más páginas"
                className="flex-1 space-y-1 overflow-y-auto px-3 py-2"
              >
                {OPCIONES_MAS.map((opcion) => {
                  const seleccionada = rutaActiva(pathname, opcion.href);

                  return (
                    <Link
                      key={opcion.href}
                      href={opcion.href}
                      className={`flex min-h-16 touch-manipulation items-center gap-3 rounded-2xl px-3 py-3 transition active:scale-[0.99] ${
                        seleccionada
                          ? "bg-emerald-500/15 text-white ring-1 ring-inset ring-emerald-400/25"
                          : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                        <Icono tipo={opcion.icono} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-black">
                          {opcion.titulo}
                        </span>
                        <span className="mt-1 block text-[10px] leading-4 text-zinc-500">
                          {opcion.descripcion}
                        </span>
                      </span>
                      <IconoChevron />
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <p className="text-center text-[9px] font-semibold text-zinc-600">
                  FeatMusic · Conecta, crea y colabora
                </p>
              </div>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir más opciones"
        aria-expanded={abierto}
        className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl text-white transition hover:bg-white/5 active:bg-white/10 lg:hidden"
      >
        <IconoMenu />
      </button>
      {panel}
    </>
  );
}
