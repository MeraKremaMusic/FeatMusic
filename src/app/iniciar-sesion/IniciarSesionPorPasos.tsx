"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

const PASOS = [
  {
    titulo: "Tu correo",
    descripcion: "Usa el correo con el que creaste tu cuenta.",
    icono: "correo",
  },
  {
    titulo: "Tu contraseña",
    descripcion: "Último paso para volver a tu perfil.",
    icono: "candado",
  },
] as const;

export default function IniciarSesionPorPasos() {
  const [paso, setPaso] = useState(0);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const correoRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      if (paso === 0) correoRef.current?.focus({ preventScroll: true });
      if (paso === 1) passwordRef.current?.focus({ preventScroll: true });
    });
  }, [paso]);

  const avanzar = () => {
    const input = correoRef.current;
    if (!input) return;

    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }

    setPaso(1);
  };

  const manejarSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (paso === 0) {
      event.preventDefault();
      avanzar();
      return;
    }

    const input = passwordRef.current;
    if (input && !input.checkValidity()) {
      event.preventDefault();
      input.reportValidity();
    }
  };

  const actual = PASOS[paso];
  const progreso = ((paso + 1) / PASOS.length) * 100;

  return (
    <form
      action="/api/iniciar-sesion"
      method="post"
      className="flex min-h-0 flex-col"
      onSubmit={manejarSubmit}
    >
      <input type="hidden" name="correo" value={correo} />

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
          <p className="mt-0.5 text-xs leading-snug text-zinc-400 sm:mt-1 sm:text-sm">
            {actual.descripcion}
          </p>
        </div>
      </div>

      <div className="min-h-[88px] sm:min-h-[96px]">
        {paso === 0 ? (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-200 sm:mb-2 sm:text-sm">
              Correo electrónico
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-zinc-500">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="14" x="3" y="5" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <input
                ref={correoRef}
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="artista@correo.com"
                className="h-11 w-full rounded-xl border border-zinc-800 bg-black/70 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#FFD400] sm:h-12"
              />
            </div>
          </label>
        ) : (
          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-200 sm:mb-2 sm:text-sm">
                Contraseña
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-zinc-500">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="10" rx="2" />
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                  </svg>
                </span>
                <input
                  ref={passwordRef}
                  required
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contraseña"
                  className="h-11 w-full rounded-xl border border-zinc-800 bg-black/70 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#FFD400] sm:h-12"
                />
              </div>
            </label>

            <p className="mt-2 text-right text-xs sm:text-sm">
              <Link
                href="/recuperar-contrasena"
                className="font-medium text-[#FFD400] transition hover:brightness-110"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2.5 border-t border-zinc-800 pt-3 sm:mt-5 sm:gap-3 sm:pt-4">
        {paso === 1 ? (
          <button
            type="button"
            onClick={() => setPaso(0)}
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

        {paso === 0 ? (
          <button
            key="siguiente"
            type="button"
            onClick={(event) => {
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
            key="entrar"
            type="submit"
            className="ml-auto inline-flex h-10 items-center justify-center rounded-full bg-[#FFD400] px-5 text-sm font-semibold text-black transition hover:brightness-95 sm:h-11 sm:px-6"
          >
            Iniciar sesión
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
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
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
    className: "h-5 w-5 sm:h-6 sm:w-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (tipo === "correo") {
    return (
      <svg {...comun}>
        <rect width="18" height="14" x="3" y="5" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }

  return (
    <svg {...comun}>
      <rect width="18" height="11" x="3" y="10" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  );
}
