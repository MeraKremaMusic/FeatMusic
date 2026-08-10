"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

// FEATMUSIC_COMPARTIR_PERFIL_REDESSOCIALES_V1

type CompartirPerfilProps = {
  nombreArtistico: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  portadaPerfil: string | null;
  biografia: string | null;
  ubicacion: string;
};

function IconoCompartir({ className = "h-4 w-4" }: { className?: string }) {
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
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.3 10.9 7.4-4.6M8.3 13.1l7.4 4.6" />
    </svg>
  );
}

function IconoCerrar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function IconoCopiar({ className = "h-5 w-5" }: { className?: string }) {
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
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function IconoWhatsApp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.04 2a9.84 9.84 0 0 0-8.5 14.77L2 22l5.39-1.5A9.98 9.98 0 1 0 12.04 2Zm0 17.96a8 8 0 0 1-4.08-1.11l-.29-.17-3.2.89.85-3.12-.19-.31a7.92 7.92 0 1 1 6.91 3.82Zm4.37-5.93c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19a7.22 7.22 0 0 1-1.34-1.67c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function IconoFacebook({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.7 22v-8.4h2.82l.42-3.27H13.7V8.24c0-.95.26-1.6 1.62-1.6h1.73V3.72a23.4 23.4 0 0 0-2.52-.13c-2.5 0-4.2 1.52-4.2 4.32v2.41H7.5v3.27h2.83V22h3.37Z" />
    </svg>
  );
}

function IconoInstagram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoX({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.26-8.3L2.98 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.44 4.05H6.59L17.8 19.84Z" />
    </svg>
  );
}

function IconoTelegram({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.63 3.22 18.5 20.05c-.24 1.19-.86 1.48-1.74.92l-4.77-3.52-2.3 2.22c-.25.25-.47.47-.96.47l.34-4.86 8.85-8c.38-.34-.08-.53-.6-.19L6.38 13.98 1.67 12.5c-1.02-.32-1.04-1.02.21-1.51L20.3 3.9c.85-.32 1.6.2 1.33 1.32Z" />
    </svg>
  );
}

function IconoEnlace({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M10.5 13.5a4 4 0 0 0 5.66 0l2.34-2.34a4 4 0 0 0-5.66-5.66L11.5 6.84" />
      <path d="M13.5 10.5a4 4 0 0 0-5.66 0L5.5 12.84a4 4 0 0 0 5.66 5.66l1.34-1.34" />
    </svg>
  );
}

function obtenerIniciales(nombre: string) {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("") || "FM"
  );
}

export default function CompartirPerfil({
  nombreArtistico,
  nombreUsuario,
  fotoPerfil,
  portadaPerfil,
  biografia,
  ubicacion,
}: CompartirPerfilProps) {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [compartiendo, setCompartiendo] = useState(false);
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rutaPublica = useMemo(
    () => `/artistas/${encodeURIComponent(nombreUsuario)}`,
    [nombreUsuario],
  );

  const descripcion = useMemo(() => {
    const limpia = biografia?.replace(/\s+/g, " ").trim();
    return limpia || `Escucha las ideas de ${nombreArtistico} y colabora en FeatMusic.`;
  }, [biografia, nombreArtistico]);

  useEffect(() => {
    setMontado(true);
    return () => {
      if (temporizadorRef.current) {
        clearTimeout(temporizadorRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setAbierto(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto]);

  function mostrarMensaje(texto: string) {
    setMensaje(texto);

    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
    }

    temporizadorRef.current = setTimeout(() => {
      setMensaje("");
    }, 2600);
  }

  function obtenerDatosCompartir() {
    const url = `${window.location.origin}${rutaPublica}`;
    const texto = `Descubre a ${nombreArtistico} (@${nombreUsuario}) en FeatMusic 🎵 Escucha sus ideas musicales y propón una colaboración.`;

    return {
      title: `${nombreArtistico} en FeatMusic`,
      text: texto,
      url,
    };
  }

  async function copiarTexto(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      const area = document.createElement("textarea");
      area.value = texto;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      const copiado = document.execCommand("copy");
      area.remove();
      return copiado;
    }
  }

  async function compartirNativo() {
    if (compartiendo) {
      return;
    }

    setCompartiendo(true);
    const datos = obtenerDatosCompartir();

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(datos);
        mostrarMensaje("Perfil compartido");
      } else {
        await copiarTexto(`${datos.text}\n${datos.url}`);
        mostrarMensaje("Enlace copiado para compartir");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const copiado = await copiarTexto(`${datos.text}\n${datos.url}`);
      mostrarMensaje(copiado ? "Enlace copiado" : "No se pudo compartir");
    } finally {
      setCompartiendo(false);
    }
  }

  async function compartirInstagram() {
    const datos = obtenerDatosCompartir();

    if (typeof navigator.share === "function") {
      await compartirNativo();
      return;
    }

    await copiarTexto(`${datos.text}\n${datos.url}`);
    mostrarMensaje("Enlace copiado. Pégalo en Instagram.");
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  function abrirRed(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=620");
  }

  async function copiarEnlace() {
    const { url } = obtenerDatosCompartir();
    const copiado = await copiarTexto(url);
    mostrarMensaje(copiado ? "Enlace copiado" : "No se pudo copiar");
  }

  const modal =
    montado && abierto
      ? createPortal(
          <div
            className="featmusic-share-backdrop fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-5"
            role="presentation"
            onMouseDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                setAbierto(false);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-compartir-perfil"
              className="featmusic-share-sheet relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-white px-4 pb-5 pt-3 shadow-2xl sm:max-w-[520px] sm:rounded-[28px] sm:p-5"
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                    Haz crecer tu comunidad
                  </p>
                  <h2
                    id="titulo-compartir-perfil"
                    className="mt-0.5 text-lg font-black text-slate-950"
                  >
                    Comparte tu perfil
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                  aria-label="Cerrar"
                >
                  <IconoCerrar />
                </button>
              </div>

              <div className="featmusic-share-preview relative overflow-hidden rounded-2xl bg-slate-950 p-4 text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)]">
                {portadaPerfil && (
                  <div className="pointer-events-none absolute inset-0">
                    <img
                      src={portadaPerfil}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,.94)_28%,rgba(0,0,0,.5)_68%,rgba(0,0,0,.12)_100%)]" />
                  </div>
                )}

                {!portadaPerfil && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(52,211,153,.45),transparent_42%),linear-gradient(135deg,#020617,#0f172a)]" />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  {fotoPerfil ? (
                    <img
                      src={fotoPerfil}
                      alt={`Foto de ${nombreArtistico}`}
                      className="h-16 w-16 shrink-0 rounded-2xl border border-white/30 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-black/35 text-xl font-black text-white backdrop-blur-sm">
                      {obtenerIniciales(nombreArtistico)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-emerald-200 backdrop-blur-sm">
                      Perfil de artista
                    </span>
                    <h3 className="mt-1 truncate text-lg font-black text-white">
                      {nombreArtistico}
                    </h3>
                    <p className="truncate text-[11px] font-semibold text-white/80">
                      @{nombreUsuario}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-white/65">
                      {ubicacion}
                    </p>
                  </div>
                </div>

                <p className="relative z-10 mt-3 line-clamp-2 text-[11px] leading-5 text-white/82">
                  {descripcion}
                </p>

                <div className="relative z-10 mt-3 flex items-center justify-between gap-3 border-t border-white/15 pt-3">
                  <span className="text-[10px] font-bold text-white/75">
                    Escucha ideas y colabora
                  </span>
                  <span className="text-sm font-black tracking-tight text-white">
                    Feat<span className="text-emerald-400">Music</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={compartirNativo}
                disabled={compartiendo}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(16,185,129,.28)] transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-70"
              >
                <IconoCompartir className="h-5 w-5" />
                {compartiendo ? "Abriendo opciones…" : "Compartir en mis aplicaciones"}
              </button>

              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Compartir directamente
              </p>

              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                <button
                  type="button"
                  onClick={() => {
                    const datos = obtenerDatosCompartir();
                    abrirRed(
                      `https://wa.me/?text=${encodeURIComponent(`${datos.text}\n${datos.url}`)}`,
                    );
                  }}
                  className="featmusic-share-network"
                >
                  <span className="bg-[#25D366] text-white">
                    <IconoWhatsApp />
                  </span>
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const { url } = obtenerDatosCompartir();
                    abrirRed(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    );
                  }}
                  className="featmusic-share-network"
                >
                  <span className="bg-[#1877F2] text-white">
                    <IconoFacebook />
                  </span>
                  Facebook
                </button>

                <button
                  type="button"
                  onClick={compartirInstagram}
                  className="featmusic-share-network"
                >
                  <span className="bg-[linear-gradient(135deg,#833AB4,#FD1D1D,#FCAF45)] text-white">
                    <IconoInstagram />
                  </span>
                  Instagram
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const datos = obtenerDatosCompartir();
                    abrirRed(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(datos.text)}&url=${encodeURIComponent(datos.url)}`,
                    );
                  }}
                  className="featmusic-share-network"
                >
                  <span className="bg-black text-white">
                    <IconoX />
                  </span>
                  X
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const datos = obtenerDatosCompartir();
                    abrirRed(
                      `https://t.me/share/url?url=${encodeURIComponent(datos.url)}&text=${encodeURIComponent(datos.text)}`,
                    );
                  }}
                  className="featmusic-share-network"
                >
                  <span className="bg-[#229ED9] text-white">
                    <IconoTelegram />
                  </span>
                  Telegram
                </button>

                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="featmusic-share-network"
                >
                  <span className="bg-slate-100 text-slate-700">
                    <IconoCopiar />
                  </span>
                  Copiar
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <IconoEnlace className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-500">
                  featmusic.pro{rutaPublica}
                </span>
                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="shrink-0 text-[10px] font-black text-emerald-700 hover:text-emerald-800"
                >
                  Copiar
                </button>
              </div>

              {mensaje && (
                <div
                  role="status"
                  className="featmusic-share-toast fixed bottom-24 left-1/2 z-[140] -translate-x-1/2 rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xl sm:absolute sm:bottom-5"
                >
                  {mensaje}
                </div>
              )}
            </section>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        className="featmusic-profile-dark-control flex min-h-10 min-w-0 items-center justify-center gap-1.5 px-1.5 py-2 text-center text-[9px] font-black leading-tight text-slate-600 transition hover:bg-yellow-50 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500/30 sm:min-h-11 sm:py-2.5 sm:text-[10px]"
      >
        <IconoCompartir className="h-3.5 w-3.5 shrink-0" />
        <span>Compartir perfil</span>
      </button>

      {modal}
    </>
  );
}
