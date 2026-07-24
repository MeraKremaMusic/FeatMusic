"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import NavegacionEscritorio from "../components/NavegacionEscritorio";

type ArtistasClientProps = {
  sesionActiva: boolean;
};

function IconoSalir({ className = "h-3 w-3" }: { className?: string }) {
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
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M13 4h7v16h-7" />
    </svg>
  );
}

function IconoArtistas({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M14.5 16.5a4.5 4.5 0 0 1 6 3.5" />
    </svg>
  );
}

function CargandoArtistas() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09070d] px-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.055)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <section className="relative flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-violet-400/20 bg-violet-500/5" />
          <span className="absolute inset-1 animate-ping rounded-full border border-violet-400/30" />
          <span className="absolute inset-3 animate-pulse rounded-full bg-violet-500/15" />

          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/30 bg-violet-500/15 text-violet-200 shadow-[0_0_35px_rgba(139,92,246,0.25)]">
            <IconoArtistas />
          </div>
        </div>

        <p className="mt-6 text-base font-bold tracking-tight text-zinc-100">
          Cargando artistas...
        </p>

        <p className="mt-2 text-xs text-zinc-500">
          Preparando nuevas conexiones musicales
        </p>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300" />
        </div>
      </section>
    </main>
  );
}

export default function ArtistasClient({
  sesionActiva,
}: ArtistasClientProps) {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setCargando(false);
    }, 700);

    return () => window.clearTimeout(temporizador);
  }, []);

  if (cargando) {
    return <CargandoArtistas />;
  }

  return (
    <main className="min-h-screen bg-[#09070d] text-white">
      <header className="border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4">
          <Link
            href={sesionActiva ? "/panel" : "/"}
            className="text-lg font-black tracking-tight"
          >
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <NavegacionEscritorio />

          {sesionActiva ? (
            <form action="/api/cerrar-sesion" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-red-400/50 px-3 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10"
              >
                <IconoSalir />
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="rounded-lg border border-violet-400/50 px-3 py-1.5 text-[10px] font-bold text-violet-200 transition hover:bg-violet-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-48px)] items-center justify-center px-6">
        <div className="max-w-xl text-center">
          <p className="text-sm font-semibold text-violet-400">FeatMusic</p>

          <h1 className="mt-3 text-4xl font-bold">Explorar artistas</h1>

          <p className="mt-4 text-zinc-400">
            Muy pronto podrás descubrir artistas y colaboradores por rol,
            género y ubicación.
          </p>

          <Link
            href={sesionActiva ? "/panel#panel-card-1" : "/"}
            className="mt-8 inline-flex items-center rounded-full border border-zinc-700 px-6 py-3 font-semibold transition hover:bg-zinc-900"
          >
            {sesionActiva ? "Volver a mi perfil" : "Volver al inicio"}
          </Link>
        </div>
      </section>
    </main>
  );
}