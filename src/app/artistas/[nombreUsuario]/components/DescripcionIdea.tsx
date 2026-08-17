"use client";

// FEATMUSIC_ICONOS_NEGROS_PORTADA_IDEA_V2

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";

type DescripcionIdeaProps = {
  titulo: string;
  descripcion: string | null;
  resumenColaboracion: string | null;
};

function IconoDescripcion({ className = "h-3 w-3" }: { className?: string }) {
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
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

function IconoCerrar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export default function DescripcionIdea({
  titulo,
  descripcion,
  resumenColaboracion,
}: DescripcionIdeaProps) {
  const [abierta, setAbierta] = useState(false);
  const [montado, setMontado] = useState(false);
  const panelId = useId();
  const botonCerrarRef = useRef<HTMLButtonElement>(null);
  const textoDescripcion = descripcion?.trim() || null;
  const textoColaboracion = resumenColaboracion?.trim() || null;
  const tieneContenido = Boolean(textoDescripcion || textoColaboracion);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!abierta) {
      return;
    }

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCerrarRef.current?.focus();

    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbierta(false);
      }
    }

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierta]);

  if (!tieneContenido) {
    return null;
  }

  const modalDescripcion =
    montado && abierta
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Cerrar descripción"
              className="fixed inset-x-0 top-12 z-40 bg-slate-950/20 backdrop-blur-[5px]"
              style={{
                bottom: "var(--featmusic-menu-movil-altura, 0px)",
              }}
              onClick={() => setAbierta(false)}
            />

            <div
              className="pointer-events-none fixed inset-x-0 top-12 z-[45] flex items-center justify-center px-4 py-5"
              style={{
                bottom: "var(--featmusic-menu-movil-altura, 0px)",
              }}
            >
              <section
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${panelId}-titulo`}
                className="pointer-events-auto max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_24px_70px_rgba(15,23,42,0.24)] [scrollbar-width:thin] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-yellow-300 bg-yellow-400 text-black">
                      <IconoDescripcion className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-yellow-600">
                        Detalles de la idea
                      </p>
                      <h3
                        id={`${panelId}-titulo`}
                        className="truncate text-sm font-black text-slate-900 sm:text-base"
                      >
                        {titulo}
                      </h3>
                    </div>
                  </div>

                  <button
                    ref={botonCerrarRef}
                    type="button"
                    aria-label="Cerrar"
                    onClick={() => setAbierta(false)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-300/60"
                  >
                    <IconoCerrar />
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {textoDescripcion && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                        Descripción de la idea
                      </p>
                      <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-[1.15rem] text-slate-700 sm:text-xs sm:leading-5">
                        {textoDescripcion}
                      </p>
                    </div>
                  )}

                  {textoColaboracion && (
                    <div className="rounded-xl border border-yellow-300 bg-yellow-50/80 px-3.5 py-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-yellow-600">
                        Colaboración buscada
                      </p>
                      <p className="mt-1.5 text-[11px] leading-[1.15rem] text-slate-700 sm:text-xs sm:leading-5">
                        {textoColaboracion}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="absolute right-0 top-[20px] z-30">
      <button
        type="button"
        aria-label={`Ver descripción de ${titulo}`}
        aria-expanded={abierta}
        aria-controls={panelId}
        title="Ver descripción"
        onClick={() => setAbierta(true)}
        className={`featmusic-description-toggle inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[7px] font-bold transition focus:outline-none focus:ring-2 focus:ring-yellow-300/60 sm:text-[8px] ${
          abierta
            ? "border-yellow-400 bg-yellow-400 text-black"
            : "border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:border-yellow-400 hover:bg-yellow-50 hover:text-black"
        }`}
      >
        <IconoDescripcion className="h-2.5 w-2.5" />
        <span>Descripción</span>
      </button>

      {modalDescripcion}
    </div>
  );
}
