"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

const PASOS = [
  {
    titulo: "Tu identidad",
    descripcion: "Empecemos con lo básico.",
    icono: "usuario",
  },
  {
    titulo: "Tu @usuario",
    descripcion: "Será tu identificador único en FeatMusic.",
    icono: "arroba",
  },
  {
    titulo: "Tu ubicación",
    descripcion: "Ayúdanos a conectarte con artistas cercanos.",
    icono: "ubicacion",
  },
  {
    titulo: "Tu música",
    descripcion: "Cuéntanos qué haces y qué sonidos te representan.",
    icono: "musica",
  },
  {
    titulo: "Tus preferencias",
    descripcion: "Últimos detalles para personalizar tu experiencia.",
    icono: "ajustes",
  },
] as const;

export default function RegistroPerfilPorPasos({
  children,
  pasoInicial = 0,
}: {
  children: ReactNode;
  pasoInicial?: number;
}) {
  const pasoSeguro = Math.min(Math.max(pasoInicial, 0), PASOS.length - 1);
  const [paso, setPaso] = useState(pasoSeguro);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const formulario = formRef.current;
    if (!formulario) return;

    const secciones = Array.from(
      formulario.querySelectorAll<HTMLElement>("[data-registro-paso]"),
    );

    secciones.forEach((seccion, indice) => {
      seccion.hidden = indice !== paso;
    });

    const activa = secciones[paso];
    window.requestAnimationFrame(() => {
      activa
        ?.querySelector<HTMLElement>(
          "input:not([type='hidden']), select, textarea, button",
        )
        ?.focus({ preventScroll: true });
    });
  }, [paso]);

  const validarPasoActual = useCallback(() => {
    const formulario = formRef.current;
    if (!formulario) return false;

    const seccion = formulario.querySelectorAll<HTMLElement>(
      "[data-registro-paso]",
    )[paso];
    if (!seccion) return false;

    const usuario = seccion.querySelector<HTMLInputElement>(
      'input[name="nombreUsuario"]',
    );
    if (usuario) {
      const estado = usuario.dataset.estadoNombreUsuario;
      if (estado === "comprobando") {
        usuario.setCustomValidity(
          "Espera un momento mientras comprobamos si el nombre está disponible.",
        );
      }
    }

    const generos = Array.from(
      seccion.querySelectorAll<HTMLInputElement>('input[name="generos"]'),
    );
    if (generos.length > 0) {
      const seleccionados = generos.filter((input) => input.checked);
      const mensaje =
        seleccionados.length === 0
          ? "Elige al menos un género."
          : seleccionados.length > 5
            ? "Puedes elegir máximo 5 géneros."
            : "";
      generos[0].setCustomValidity(mensaje);
    }

    const controles = Array.from(
      seccion.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea"),
    );

    for (const control of controles) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
    }

    return true;
  }, [paso]);

  const avanzar = () => {
    if (!validarPasoActual()) return;
    setPaso((actual) => Math.min(actual + 1, PASOS.length - 1));
  };

  const retroceder = () => {
    setPaso((actual) => Math.max(actual - 1, 0));
  };

  const manejarSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (paso < PASOS.length - 1) {
      event.preventDefault();
      avanzar();
      return;
    }

    if (!validarPasoActual()) {
      event.preventDefault();
    }
  };

  const actual = PASOS[paso];
  const progreso = ((paso + 1) / PASOS.length) * 100;

  return (
    <form
      ref={formRef}
      action="/api/completar-perfil"
      method="post"
      className="mt-4 flex min-h-0 flex-1 flex-col sm:mt-5"
      onSubmit={manejarSubmit}
    >
      <div className="mb-4 sm:mb-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-xs sm:tracking-[0.2em]">
            Paso {paso + 1} de {PASOS.length}
          </span>
          <span className="text-[10px] font-medium text-zinc-500 sm:text-xs">
            {Math.round(progreso)}%
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800 sm:h-1.5">
          <div
            className="h-full rounded-full bg-[#FFD400] transition-[width] duration-300 ease-out"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:items-start sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD400] text-black sm:h-11 sm:w-11 sm:rounded-2xl">
          <IconoPaso tipo={actual.icono} />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight text-white sm:text-xl">
            {actual.titulo}
          </h2>
          <p className="mt-0.5 text-xs leading-snug text-zinc-400 sm:mt-1 sm:text-sm">{actual.descripcion}</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center"><div className="w-full">{children}</div></div>

      <div className="mt-4 flex shrink-0 items-center gap-2.5 border-t border-zinc-800 pt-3 sm:mt-5 sm:gap-3 sm:pt-4">
        {paso > 0 ? (
          <button
            type="button"
            onClick={retroceder}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-700 px-4 text-sm font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-900 sm:h-11 sm:px-5"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Atrás
          </button>
        ) : null}

        {paso < PASOS.length - 1 ? (
          <button
            key="siguiente"
            type="button"
            onClick={(event) => {
              // Evita que el mismo clic pueda convertirse en submit cuando React
              // cambia inmediatamente del paso 4 al botón final del paso 5.
              event.preventDefault();
              avanzar();
            }}
            className="ml-auto inline-flex h-10 items-center justify-center rounded-full bg-[#FFD400] px-5 text-sm font-semibold text-black transition hover:brightness-95 sm:h-11 sm:px-6"
          >
            Siguiente
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ) : (
          <button
            key="guardar"
            type="submit"
            className="ml-auto inline-flex min-h-10 items-center justify-center rounded-full bg-[#FFD400] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95 sm:min-h-11 sm:px-6"
          >
            Guardar y entrar a FeatMusic
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}

function IconoPaso({
  tipo,
}: {
  tipo: (typeof PASOS)[number]["icono"];
}) {
  const comun = {
    className: "h-6 w-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (tipo === "usuario") {
    return (
      <svg {...comun}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (tipo === "arroba") {
    return (
      <svg {...comun}>
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
      </svg>
    );
  }

  if (tipo === "ubicacion") {
    return (
      <svg {...comun}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (tipo === "musica") {
    return (
      <svg {...comun}>
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    );
  }

  return (
    <svg {...comun}>
      <path d="M4 6h10" />
      <path d="M18 6h2" />
      <path d="M4 12h2" />
      <path d="M10 12h10" />
      <path d="M4 18h7" />
      <path d="M15 18h5" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="13" cy="18" r="2" />
    </svg>
  );
}
