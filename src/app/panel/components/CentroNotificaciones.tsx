"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  actualizarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  type NotificacionCentro,
  useNotificaciones,
} from "@/app/components/useNotificaciones";

function IconoCampana({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
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
      <path d="M18 9a6 6 0 0 0-12 0c0 6-3 7-3 8h18c0-1-3-2-3-8Z" />
      <path d="M10 21h4" />
    </svg>
  );
}

function IconoTipo({
  tipo,
  className = "h-4 w-4",
}: {
  tipo: string;
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

  if (tipo === "MENSAJE_NUEVO") {
    return (
      <svg {...props}>
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    );
  }

  if (tipo === "PROPUESTA_ACEPTADA") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16.5 8.5" />
      </svg>
    );
  }

  if (tipo === "PROPUESTA_RECHAZADA") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6M15 9l-6 6" />
      </svg>
    );
  }

  if (tipo === "CAMBIOS_SOLICITADOS") {
    return (
      <svg {...props}>
        <path d="M4 5h16v12H8l-4 3V5Z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    );
  }

  if (tipo === "REINTENTO_PERMITIDO") {
    return (
      <svg {...props}>
        <path d="M20 7v5h-5" />
        <path d="M19 12a7 7 0 1 0-2 5" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.2 14.5A7 7 0 1 1 15.8 14.5c-1.1.8-1.8 1.8-1.8 3.5h-4c0-1.7-.7-2.7-1.8-3.5Z" />
    </svg>
  );
}

function claseTipo(tipo: string) {
  if (tipo === "PROPUESTA_ACEPTADA") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (tipo === "PROPUESTA_RECHAZADA") {
    return "border-red-400/20 bg-red-500/10 text-red-300";
  }

  if (tipo === "CAMBIOS_SOLICITADOS") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  }

  if (tipo === "REINTENTO_PERMITIDO") {
    return "border-sky-400/20 bg-sky-500/10 text-sky-300";
  }

  if (tipo === "MENSAJE_NUEVO") {
    return "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-300";
  }

  return "border-violet-400/20 bg-violet-500/10 text-violet-300";
}

function formatearTiempo(fecha: string) {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  const diferenciaSegundos = Math.round(
    (valor.getTime() - Date.now()) / 1000,
  );
  const absoluto = Math.abs(diferenciaSegundos);
  const formato = new Intl.RelativeTimeFormat("es", {
    numeric: "auto",
  });

  if (absoluto < 60) {
    return "Ahora";
  }

  if (absoluto < 3600) {
    return formato.format(Math.round(diferenciaSegundos / 60), "minute");
  }

  if (absoluto < 86400) {
    return formato.format(Math.round(diferenciaSegundos / 3600), "hour");
  }

  if (absoluto < 604800) {
    return formato.format(Math.round(diferenciaSegundos / 86400), "day");
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
  }).format(valor);
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

export default function CentroNotificaciones() {
  const botonRef = useRef<HTMLButtonElement | null>(null);
  const [montado, setMontado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const {
    cargando,
    error,
    notificaciones,
    totalNoLeidas,
  } = useNotificaciones();
  const [posicionEscritorio, setPosicionEscritorio] = useState({
    top: 64,
    left: 16,
  });

  const actualizarPosicion = useCallback(() => {
    const boton = botonRef.current;

    if (!boton || typeof window === "undefined") {
      return;
    }

    const rect = boton.getBoundingClientRect();
    const anchoPanel = 390;
    const margen = 16;
    const left = Math.min(
      window.innerWidth - anchoPanel - margen,
      Math.max(margen, rect.right - anchoPanel),
    );

    setPosicionEscritorio({
      top: Math.min(window.innerHeight - 120, rect.bottom + 8),
      left,
    });
  }, []);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    actualizarPosicion();
    void actualizarNotificaciones();

    window.addEventListener("resize", actualizarPosicion);
    window.addEventListener("scroll", actualizarPosicion, true);

    return () => {
      window.removeEventListener("resize", actualizarPosicion);
      window.removeEventListener("scroll", actualizarPosicion, true);
    };
  }, [abierto, actualizarPosicion]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    };

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto]);

  const notificacionesVisibles = useMemo(
    () =>
      soloNoLeidas
        ? notificaciones.filter((notificacion) => !notificacion.leidaEn)
        : notificaciones,
    [notificaciones, soloNoLeidas],
  );

  async function marcarLeida(id: number) {
    await marcarNotificacionLeida(id);
  }

  async function marcarTodas() {
    await marcarTodasNotificacionesLeidas();
  }

  async function abrirNotificacion(notificacion: NotificacionCentro) {
    await marcarLeida(notificacion.id);
    setAbierto(false);

    if (
      notificacion.enlace &&
      notificacion.enlace.startsWith("/") &&
      !notificacion.enlace.startsWith("//")
    ) {
      window.location.assign(notificacion.enlace);
    }
  }

  const panel = (
    <>
      <button
        type="button"
        aria-label="Cerrar centro de notificaciones"
        className="fixed inset-0 z-[90] cursor-default bg-black/45 backdrop-blur-[1px] sm:bg-black/20"
        onClick={() => setAbierto(false)}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="centro-notificaciones-titulo"
        className="fixed inset-x-0 bottom-0 z-[100] flex max-h-[82dvh] flex-col overflow-hidden rounded-t-[26px] border border-white/10 bg-[#0d0913]/98 shadow-[0_-24px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:hidden"
      >
        <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-white/15" />
        <ContenidoCentro
          cargando={cargando}
          error={error}
          notificaciones={notificacionesVisibles}
          totalNoLeidas={totalNoLeidas}
          soloNoLeidas={soloNoLeidas}
          onSoloNoLeidas={setSoloNoLeidas}
          onCerrar={() => setAbierto(false)}
          onRecargar={() => void actualizarNotificaciones()}
          onMarcarTodas={() => void marcarTodas()}
          onAbrir={(notificacion) => void abrirNotificacion(notificacion)}
        />
      </section>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="centro-notificaciones-titulo-escritorio"
        className="fixed z-[100] hidden max-h-[min(650px,calc(100vh-32px))] w-[390px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0913]/98 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:flex"
        style={{
          top: posicionEscritorio.top,
          left: posicionEscritorio.left,
          maxHeight: `calc(100vh - ${posicionEscritorio.top + 16}px)`,
        }}
      >
        <ContenidoCentro
          escritorio
          cargando={cargando}
          error={error}
          notificaciones={notificacionesVisibles}
          totalNoLeidas={totalNoLeidas}
          soloNoLeidas={soloNoLeidas}
          onSoloNoLeidas={setSoloNoLeidas}
          onCerrar={() => setAbierto(false)}
          onRecargar={() => void actualizarNotificaciones()}
          onMarcarTodas={() => void marcarTodas()}
          onAbrir={(notificacion) => void abrirNotificacion(notificacion)}
        />
      </section>
    </>
  );

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={() => {
          setAbierto((actual) => !actual);
        }}
        title="Notificaciones"
        aria-label={
          totalNoLeidas > 0
            ? `${totalNoLeidas} notificaciones sin leer`
            : "Notificaciones"
        }
        aria-expanded={abierto}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400 transition hover:bg-violet-500/15 hover:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      >
        <IconoCampana />

        {totalNoLeidas > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#0d0913] bg-violet-500 px-1 text-[8px] font-black leading-none text-white shadow-lg shadow-violet-950/40">
            {totalNoLeidas > 99 ? "99+" : totalNoLeidas}
          </span>
        )}
      </button>

      {montado && abierto ? createPortal(panel, document.body) : null}
    </>
  );
}

function ContenidoCentro({
  escritorio = false,
  cargando,
  error,
  notificaciones,
  totalNoLeidas,
  soloNoLeidas,
  onSoloNoLeidas,
  onCerrar,
  onRecargar,
  onMarcarTodas,
  onAbrir,
}: {
  escritorio?: boolean;
  cargando: boolean;
  error: string;
  notificaciones: NotificacionCentro[];
  totalNoLeidas: number;
  soloNoLeidas: boolean;
  onSoloNoLeidas: (valor: boolean) => void;
  onCerrar: () => void;
  onRecargar: () => void;
  onMarcarTodas: () => void;
  onAbrir: (notificacion: NotificacionCentro) => void;
}) {
  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-4 pb-3 pt-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <IconoCampana />
            </span>
            <div>
              <h2
                id={
                  escritorio
                    ? "centro-notificaciones-titulo-escritorio"
                    : "centro-notificaciones-titulo"
                }
                className="text-sm font-black text-white"
              >
                Notificaciones
              </h2>
              <p className="mt-0.5 text-[10px] text-zinc-500">
                {totalNoLeidas === 0
                  ? "Estás al día"
                  : `${totalNoLeidas} sin leer`}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
        >
          ×
        </button>
      </header>

      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5 sm:px-5">
        <label className="inline-flex cursor-pointer items-center gap-2 text-[10px] font-semibold text-zinc-400">
          <input
            type="checkbox"
            checked={soloNoLeidas}
            onChange={(evento) => onSoloNoLeidas(evento.target.checked)}
            className="h-3.5 w-3.5 rounded border-white/20 bg-black accent-violet-500"
          />
          Solo no leídas
        </label>

        <button
          type="button"
          onClick={onMarcarTodas}
          disabled={totalNoLeidas === 0}
          className="text-[10px] font-bold text-violet-300 transition hover:text-violet-200 disabled:cursor-not-allowed disabled:text-zinc-700"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
        {cargando && notificaciones.length === 0 ? (
          <div className="space-y-3 p-4 sm:p-5">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl bg-white/[0.035]"
              />
            ))}
          </div>
        ) : error && notificaciones.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-xs font-semibold text-red-200">{error}</p>
            <button
              type="button"
              onClick={onRecargar}
              className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-zinc-300"
            >
              Intentar nuevamente
            </button>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] text-violet-300/70">
              <IconoCampana className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-bold text-zinc-300">
              {soloNoLeidas
                ? "No tienes notificaciones sin leer"
                : "Todavía no tienes notificaciones"}
            </p>
            <p className="mt-1 text-[10px] leading-5 text-zinc-600">
              Aquí aparecerán propuestas, decisiones, cambios y mensajes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {notificaciones.map((notificacion) => {
              const noLeida = !notificacion.leidaEn;

              return (
                <button
                  key={notificacion.id}
                  type="button"
                  onClick={() => onAbrir(notificacion)}
                  className={`relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition sm:px-5 ${
                    noLeida
                      ? "bg-violet-500/[0.045] hover:bg-violet-500/[0.075]"
                      : "hover:bg-white/[0.025]"
                  }`}
                >
                  {noLeida && (
                    <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-violet-400" />
                  )}

                  {notificacion.actor?.fotoPerfil ? (
                    <img
                      src={notificacion.actor.fotoPerfil}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                  ) : notificacion.actor ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.07] text-[10px] font-black text-violet-200">
                      {iniciales(notificacion.actor.nombreVisible)}
                    </span>
                  ) : (
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${claseTipo(
                        notificacion.tipo,
                      )}`}
                    >
                      <IconoTipo
                        tipo={notificacion.tipo}
                        className="h-4 w-4"
                      />
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={`block text-[11px] leading-4 ${
                          noLeida
                            ? "font-black text-zinc-100"
                            : "font-bold text-zinc-300"
                        }`}
                      >
                        {notificacion.titulo}
                      </span>
                      <span className="shrink-0 text-[8px] font-semibold text-zinc-600">
                        {formatearTiempo(notificacion.creadoEn)}
                      </span>
                    </span>

                    {notificacion.actor && (
                      <span className="mt-0.5 block truncate text-[9px] font-semibold text-violet-300/80">
                        {notificacion.actor.nombreVisible}
                      </span>
                    )}

                    <span className="mt-1 block text-[10px] leading-4 text-zinc-500">
                      {notificacion.mensaje}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && notificaciones.length > 0 && (
        <div className="border-t border-red-400/10 bg-red-500/[0.04] px-4 py-2 text-[9px] text-red-200">
          {error}
        </div>
      )}
    </>
  );
}
