"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";

type DescargaMp3IdeaProps = {
  ideaId: number;
  titulo: string;
  sesionActiva: boolean;
};

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

export default function DescargaMp3Idea({
  ideaId,
  titulo,
  sesionActiva,
}: DescargaMp3IdeaProps) {
  const [abierta, setAbierta] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const panelId = useId();
  const botonCerrarRef = useRef<HTMLButtonElement>(null);

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
      if (evento.key === "Escape" && !descargando) {
        setAbierta(false);
        setErrorDescarga(null);
      }
    }

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierta, descargando]);

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

      setAbierta(false);
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

  const modal =
    montado && abierta
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
                  setAbierta(false);
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
                id={panelId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${panelId}-titulo`}
                className="pointer-events-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-yellow-300 bg-yellow-400 text-black">
                      <IconoDescarga className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-yellow-600">
                        Descargar audio
                      </p>
                      <h3
                        id={`${panelId}-titulo`}
                        className="truncate text-sm font-black text-slate-900"
                      >
                        {titulo}
                      </h3>
                    </div>
                  </div>

                  <button
                    ref={botonCerrarRef}
                    type="button"
                    aria-label="Cerrar"
                    disabled={descargando}
                    onClick={() => {
                      setAbierta(false);
                      setErrorDescarga(null);
                    }}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
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
                      setAbierta(false);
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
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-yellow-400 bg-yellow-400 px-3 py-2.5 text-[10px] font-black text-black transition hover:border-yellow-300 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
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
    <>
      <button
        type="button"
        aria-label={`Descargar ${titulo} en MP3`}
        aria-expanded={abierta}
        aria-controls={panelId}
        title="Descargar MP3"
        onClick={() => {
          setErrorDescarga(null);
          setAbierta(true);
        }}
        className="flex min-h-11 w-full items-center justify-center gap-1.5 bg-white px-1.5 py-2 text-[9px] font-black text-slate-700 transition hover:bg-yellow-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-300/60 sm:text-[10px]"
      >
        <IconoDescarga className="h-3.5 w-3.5 shrink-0" />
        <span>MP3</span>
      </button>

      {modal}
    </>
  );
}
