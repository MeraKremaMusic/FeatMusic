"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";

type DescripcionIdeaProps = {
  ideaId: number;
  titulo: string;
  descripcion: string | null;
  resumenColaboracion: string | null;
  sesionActiva: boolean;
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

function IconoDescarga({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M5 20h14" />
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

function obtenerNombreArchivo(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null;
  }

  const utf8 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (utf8) {
    try {
      return decodeURIComponent(utf8);
    } catch {
      return utf8;
    }
  }

  return contentDisposition.match(/filename="?([^";]+)"?/i)?.[1] ?? null;
}

export default function DescripcionIdea({
  ideaId,
  titulo,
  descripcion,
  resumenColaboracion,
  sesionActiva,
}: DescripcionIdeaProps) {
  const [abierta, setAbierta] = useState(false);
  const [descargaAbierta, setDescargaAbierta] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const panelId = useId();
  const panelDescargaId = useId();
  const botonCerrarRef = useRef<HTMLButtonElement>(null);
  const botonCerrarDescargaRef = useRef<HTMLButtonElement>(null);
  const textoDescripcion = descripcion?.trim() || null;
  const textoColaboracion = resumenColaboracion?.trim() || null;
  const tieneContenido = Boolean(textoDescripcion || textoColaboracion);
  const hayModalAbierto = abierta || descargaAbierta;

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!hayModalAbierto) {
      return;
    }

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (abierta) {
      botonCerrarRef.current?.focus();
    } else {
      botonCerrarDescargaRef.current?.focus();
    }

    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAbierta(false);
        setDescargaAbierta(false);
        setErrorDescarga(null);
      }
    }

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierta, descargaAbierta, hayModalAbierto]);

  async function descargarMp3() {
    if (!sesionActiva) {
      window.location.href = "/iniciar-sesion";
      return;
    }

    setDescargando(true);
    setErrorDescarga(null);

    try {
      const respuesta = await fetch(`/api/ideas/${ideaId}/descargar`, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!respuesta.ok) {
        let mensaje = "No se pudo descargar el MP3.";

        try {
          const datos = (await respuesta.json()) as { mensaje?: string };
          if (datos.mensaje) {
            mensaje = datos.mensaje;
          }
        } catch {
          // La respuesta puede no ser JSON.
        }

        throw new Error(mensaje);
      }

      const archivo = await respuesta.blob();
      const nombreArchivo =
        obtenerNombreArchivo(respuesta.headers.get("content-disposition")) ??
        `FeatMusic-${titulo}.mp3`;
      const urlTemporal = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");

      enlace.href = urlTemporal;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(urlTemporal);

      setDescargaAbierta(false);
    } catch (error) {
      setErrorDescarga(
        error instanceof Error
          ? error.message
          : "No se pudo descargar el MP3.",
      );
    } finally {
      setDescargando(false);
    }
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
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                      <IconoDescripcion className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
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
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
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
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
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

  const modalDescarga =
    montado && descargaAbierta
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Cerrar descarga MP3"
              className="fixed inset-x-0 top-12 z-40 bg-slate-950/20 backdrop-blur-[5px]"
              style={{
                bottom: "var(--featmusic-menu-movil-altura, 0px)",
              }}
              onClick={() => {
                if (!descargando) {
                  setDescargaAbierta(false);
                  setErrorDescarga(null);
                }
              }}
            />

            <div
              className="pointer-events-none fixed inset-x-0 top-12 z-[45] flex items-center justify-center px-4 py-5"
              style={{
                bottom: "var(--featmusic-menu-movil-altura, 0px)",
              }}
            >
              <section
                id={panelDescargaId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${panelDescargaId}-titulo`}
                className="pointer-events-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                      <IconoDescarga className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        Descargar audio
                      </p>
                      <h3
                        id={`${panelDescargaId}-titulo`}
                        className="truncate text-sm font-black text-slate-900"
                      >
                        {titulo}
                      </h3>
                    </div>
                  </div>

                  <button
                    ref={botonCerrarDescargaRef}
                    type="button"
                    aria-label="Cerrar"
                    disabled={descargando}
                    onClick={() => {
                      setDescargaAbierta(false);
                      setErrorDescarga(null);
                    }}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconoCerrar />
                  </button>
                </div>

                <p className="mt-4 text-[11px] leading-[1.15rem] text-slate-600 sm:text-xs sm:leading-5">
                  Descarga el MP3, graba tu aporte y vuelve a FeatMusic para
                  enviarlo como propuesta.
                </p>

                {!sesionActiva && (
                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] leading-4 text-amber-800">
                    Debes iniciar sesión para descargar esta idea musical.
                  </p>
                )}

                {errorDescarga && (
                  <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] leading-4 text-red-700">
                    {errorDescarga}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={descargando}
                    onClick={() => {
                      setDescargaAbierta(false);
                      setErrorDescarga(null);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={descargando}
                    onClick={descargarMp3}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-2.5 text-[10px] font-black text-white transition hover:border-emerald-700 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconoDescarga className="h-3.5 w-3.5" />
                    {descargando
                      ? "Descargando..."
                      : sesionActiva
                        ? "Descargar MP3"
                        : "Iniciar sesión"}
                  </button>
                </div>
              </section>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="absolute right-0 top-[20px] z-30 flex flex-col items-end gap-1.5">
      {tieneContenido && (
        <button
          type="button"
          aria-label={`Ver descripción de ${titulo}`}
          aria-expanded={abierta}
          aria-controls={panelId}
          title="Ver descripción"
          onClick={() => setAbierta(true)}
          className={`inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[7px] font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-300/60 sm:text-[8px] ${
            abierta
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
          }`}
        >
          <IconoDescripcion className="h-2.5 w-2.5" />
          <span>Descripción</span>
        </button>
      )}

      <button
        type="button"
        aria-label={`Descargar ${titulo} en MP3`}
        aria-expanded={descargaAbierta}
        aria-controls={panelDescargaId}
        title="Descargar MP3"
        onClick={() => {
          setErrorDescarga(null);
          setDescargaAbierta(true);
        }}
        className={`inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[7px] font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-300/60 sm:text-[8px] ${
          descargaAbierta
            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-white/95 text-slate-500 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
        }`}
      >
        <IconoDescarga className="h-2.5 w-2.5" />
        <span>MP3</span>
      </button>

      {modalDescripcion}
      {modalDescarga}
    </div>
  );
}
