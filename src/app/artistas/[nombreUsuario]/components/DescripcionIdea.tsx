"use client";

import { useEffect, useId, useRef, useState } from "react";

type DescripcionIdeaProps = {
  titulo: string;
  descripcion: string | null;
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

export default function DescripcionIdea({
  titulo,
  descripcion,
}: DescripcionIdeaProps) {
  const [abierta, setAbierta] = useState(false);
  const panelId = useId();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const texto = descripcion?.trim();

  useEffect(() => {
    if (!abierta) {
      return;
    }

    function cerrarFuera(evento: PointerEvent) {
      const objetivo = evento.target;

      if (
        objetivo instanceof Node &&
        contenedorRef.current?.contains(objetivo)
      ) {
        return;
      }

      setAbierta(false);
    }

    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbierta(false);
      }
    }

    document.addEventListener("pointerdown", cerrarFuera);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("pointerdown", cerrarFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierta]);

  if (!texto) {
    return null;
  }

  return (
    <div
      ref={contenedorRef}
      className="absolute right-0 top-[20px] z-30"
      onMouseEnter={() => setAbierta(true)}
      onMouseLeave={() => setAbierta(false)}
    >
      <button
        type="button"
        aria-label={`Ver descripción de ${titulo}`}
        aria-expanded={abierta}
        aria-controls={panelId}
        title="Ver descripción"
        onClick={() => setAbierta((valorActual) => !valorActual)}
        className={`inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[7px] font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-300/60 sm:text-[8px] ${
          abierta
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
        }`}
      >
        <IconoDescripcion className="h-2.5 w-2.5" />
        <span>Descripción</span>
      </button>

      {abierta && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`Descripción de ${titulo}`}
          className="absolute bottom-7 right-0 z-50 w-[min(245px,calc(100vw-4rem))] rounded-xl border border-slate-200 bg-white/95 p-3 text-left shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl"
        >
          <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-slate-200 bg-white" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
                <IconoDescripcion className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                  Descripción
                </p>
                <p className="truncate text-[10px] font-bold text-slate-800 sm:text-[11px]">
                  {titulo}
                </p>
              </div>
            </div>

            <p className="mt-2.5 max-h-28 overflow-y-auto whitespace-pre-wrap pr-1 text-[10px] leading-4 text-slate-600 [scrollbar-width:thin] sm:text-[11px] sm:leading-[1.15rem]">
              {texto}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
