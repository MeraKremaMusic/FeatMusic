"use client";

import { createPortal } from "react-dom";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import ReproductorAudio from "@/app/components/ReproductorAudio";
import { actualizarNotificacionesChat } from "@/app/components/useNotificacionesChat";

type MensajeChat = {
  id: number;
  remitenteId: number;
  contenido: string;
  creadoEn: string;
  leidoEn: string | null;
};

type OtroArtista = {
  id: number;
  nombre: string | null;
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  fotoPerfil: string | null;
  nombreVisible: string;
};

type ColaboracionChat = {
  propuestaId: number;
  ideaTitulo: string;
  bpm: number;
  tonalidad: string;
  mensaje: string | null;
  audioUrl: string | null;
  duracionSegundos: number;
  aceptadaEn: string;
};

type RespuestaMensajes = {
  ok: boolean;
  mensaje?: string;
  mensajes?: MensajeChat[];
};

type RespuestaEnvio = {
  ok: boolean;
  mensaje?: string;
  nuevoMensaje?: MensajeChat;
};

function formatearHora(fecha: string) {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
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

function agregarSinDuplicados(
  actuales: MensajeChat[],
  nuevos: MensajeChat[],
) {
  if (nuevos.length === 0) {
    return actuales;
  }

  const ids = new Set(actuales.map((mensaje) => mensaje.id));
  const combinados = [
    ...actuales,
    ...nuevos.filter((mensaje) => !ids.has(mensaje.id)),
  ];

  return combinados.sort((a, b) => a.id - b.id);
}

function IconoColaboracion() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

export default function ChatClient({
  conversacionId,
  usuarioActualId,
  otroArtista,
  colaboraciones,
  mensajesIniciales,
}: {
  conversacionId: number;
  usuarioActualId: number;
  otroArtista: OtroArtista;
  colaboraciones: ColaboracionChat[];
  mensajesIniciales: MensajeChat[];
}) {
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [detallesAbiertos, setDetallesAbiertos] = useState(false);
  const chatViewportRef = useRef<HTMLDivElement | null>(null);
  const finalRef = useRef<HTMLDivElement | null>(null);

  const ultimoMensajeIdRef = useRef(
    mensajesIniciales[mensajesIniciales.length - 1]?.id ?? 0,
  );

  useEffect(() => {
    ultimoMensajeIdRef.current = mensajes[mensajes.length - 1]?.id ?? 0;
    finalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // FEATMUSIC_CHAT_VISUAL_VIEWPORT_V1
  useEffect(() => {
    const contenedor = chatViewportRef.current;
    if (!contenedor) return;

    const viewport = window.visualViewport;
    let frame = 0;

    const actualizarAltoVisible = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const altoVisible = viewport?.height ?? window.innerHeight;
        contenedor.style.setProperty(
          "--featmusic-chat-viewport-height",
          `${Math.round(altoVisible)}px`,
        );
      });
    };

    actualizarAltoVisible();
    window.addEventListener("resize", actualizarAltoVisible);
    viewport?.addEventListener("resize", actualizarAltoVisible);
    viewport?.addEventListener("scroll", actualizarAltoVisible);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", actualizarAltoVisible);
      viewport?.removeEventListener("resize", actualizarAltoVisible);
      viewport?.removeEventListener("scroll", actualizarAltoVisible);
    };
  }, []);

  useEffect(() => {
    void actualizarNotificacionesChat();
  }, []);

  useEffect(() => {
    let activo = true;
    let consultando = false;
    let temporizador: number | null = null;
    let controlador: AbortController | null = null;

    function cancelarTemporizador() {
      if (temporizador !== null) {
        window.clearTimeout(temporizador);
        temporizador = null;
      }
    }

    function programarSiguienteConsulta() {
      cancelarTemporizador();

      if (!activo) {
        return;
      }

      temporizador = window.setTimeout(() => {
        void consultarMensajes();
      }, 2500);
    }

    async function consultarMensajes() {
      if (!activo || consultando) {
        return;
      }

      cancelarTemporizador();
      consultando = true;
      controlador = new AbortController();

      try {
        const marcaTiempo = Date.now();
        const response = await fetch(
          `/api/conversaciones/${conversacionId}?despuesDe=${ultimoMensajeIdRef.current}&_=${marcaTiempo}`,
          {
            cache: "no-store",
            credentials: "include",
            signal: controlador.signal,
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache, no-store, max-age=0",
              Pragma: "no-cache",
            },
          },
        );

        const data = (await response.json()) as RespuestaMensajes;

        if (!response.ok || !data.ok) {
          throw new Error(data.mensaje || "No se pudieron actualizar los mensajes.");
        }

        if (activo && data.mensajes) {
          setMensajes((actuales) =>
            agregarSinDuplicados(actuales, data.mensajes ?? []),
          );
          setError("");
          void actualizarNotificacionesChat();
        }
      } catch (errorConsulta) {
        if (
          activo &&
          !(errorConsulta instanceof DOMException && errorConsulta.name === "AbortError")
        ) {
          setError(
            errorConsulta instanceof Error
              ? errorConsulta.message
              : "No se pudieron actualizar los mensajes.",
          );
        }
      } finally {
        consultando = false;
        controlador = null;
        programarSiguienteConsulta();
      }
    }

    const alVolver = () => {
      if (document.visibilityState === "visible") {
        void consultarMensajes();
      }
    };

    void consultarMensajes();
    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      activo = false;
      cancelarTemporizador();
      controlador?.abort();
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [conversacionId]);

  async function enviarMensaje(event?: FormEvent) {
    event?.preventDefault();

    const texto = contenido.trim();

    if (!texto || enviando) {
      return;
    }

    setError("");
    setEnviando(true);

    try {
      const response = await fetch(
        `/api/conversaciones/${conversacionId}/mensajes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ contenido: texto }),
        },
      );

      const data = (await response.json()) as RespuestaEnvio;

      if (!response.ok || !data.ok || !data.nuevoMensaje) {
        throw new Error(data.mensaje || "No se pudo enviar el mensaje.");
      }

      setMensajes((actuales) =>
        agregarSinDuplicados(actuales, [data.nuevoMensaje as MensajeChat]),
      );
      setContenido("");
    } catch (errorEnvio) {
      setError(
        errorEnvio instanceof Error
          ? errorEnvio.message
          : "No se pudo enviar el mensaje.",
      );
    } finally {
      setEnviando(false);
    }
  }

  function manejarTecla(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void enviarMensaje();
    }
  }

  return (
    <div
      ref={chatViewportRef}
      className="featmusic-chat-mobile-viewport mx-auto max-w-5xl px-0 py-0 sm:px-3 sm:py-4 lg:px-4"
    >
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border border-x-0 border-white/10 bg-black/35 shadow-xl shadow-black/20 backdrop-blur-sm sm:rounded-2xl sm:border-x lg:h-[calc(100dvh-88px)] lg:min-h-0">
        <div className="shrink-0 border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* FEATMUSIC_CHAT_CABECERA_ARTISTA_V1 */}
            <div className="flex min-w-0 items-center gap-2.5">
              {otroArtista.fotoPerfil ? (
                <img
                  src={otroArtista.fotoPerfil}
                  alt={`Foto de ${otroArtista.nombreVisible}`}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FFD400]/30 bg-[#FFD400]/10 text-[10px] font-black text-[#FFD400]">
                  {iniciales(otroArtista.nombreVisible)}
                </span>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {otroArtista.nombreVisible}
                </p>
                {otroArtista.nombreUsuario && (
                  <p className="mt-0.5 truncate text-[10px] font-bold text-[#FFD400]">
                    @{otroArtista.nombreUsuario}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDetallesAbiertos(true)}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#FFD400] bg-[#FFD400] px-3 text-[9px] font-black text-black transition hover:border-[#F2C900] hover:bg-[#F2C900] focus:outline-none focus:ring-2 focus:ring-[#FFD400]/40"
            >
              <IconoColaboracion />
              <span>Detalles</span>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 [scrollbar-width:thin]">
          {mensajes.length === 0 ? (
            <div className="flex h-full min-h-64 items-center justify-center">
              <div className="max-w-sm text-center">
                <p className="text-sm font-bold text-zinc-300">
                  Ya pueden comenzar a conversar
                </p>
                <p className="mt-2 text-[10px] leading-4 text-zinc-600">
                  Hablen sobre las ideas aceptadas, acuerden cómo trabajarán y
                  compartan los siguientes pasos.
                </p>
              </div>
            </div>
          ) : (
            mensajes.map((mensaje) => {
              const propio = mensaje.remitenteId === usuarioActualId;

              return (
                <div
                  key={mensaje.id}
                  className={`flex ${propio ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-black sm:max-w-[72%] ${
                      propio
                        ? "rounded-br-md bg-[#FFD400]"
                        : "rounded-bl-md border border-zinc-300 bg-zinc-300"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-xs leading-5">
                      {mensaje.contenido}
                    </p>
                    <p
                      className="mt-1 text-right text-[8px] text-black/60"
                    >
                      {formatearHora(mensaje.creadoEn)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={finalRef} />
        </div>

        <form
          onSubmit={(event) => void enviarMensaje(event)}
          className="shrink-0 border-t border-white/10 bg-black/25 p-3"
        >
          {error && (
            <p className="mb-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] text-red-200">
              {error}
            </p>
          )}

          <div className="flex items-end gap-2">
            <textarea
              value={contenido}
              onChange={(event) => setContenido(event.target.value)}
              onKeyDown={manejarTecla}
              maxLength={2000}
              rows={1}
              enterKeyHint="send"
              placeholder="Escribe un mensaje…"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/40"
            />

            <button
              type="submit"
              disabled={enviando || contenido.trim().length === 0}
              className="flex h-11 shrink-0 items-center justify-center rounded-xl !bg-[#FFD400] px-4 text-[10px] font-black !text-black transition hover:!bg-[#F2C900] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>

          <div className="mt-1 flex justify-end px-1">
            <p className="text-[8px] text-zinc-700">{contenido.length}/2000</p>
          </div>
        </form>
      </section>

      {detallesAbiertos && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4">
              <button
                type="button"
                aria-label="Cerrar detalles"
                className="absolute inset-0"
                onClick={() => setDetallesAbiertos(false)}
              />

              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="chat-detalles-titulo"
                className="relative z-[1] flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] text-white shadow-2xl shadow-black/40"
              >
                {/* FEATMUSIC_CHAT_DETALLES_MODAL_V1 */}
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {otroArtista.fotoPerfil ? (
                      <img
                        src={otroArtista.fotoPerfil}
                        alt={`Foto de ${otroArtista.nombreVisible}`}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#FFD400]/30 bg-[#FFD400]/10 text-xs font-black text-[#FFD400]">
                        {iniciales(otroArtista.nombreVisible)}
                      </span>
                    )}

                    <div className="min-w-0">
                      <p
                        id="chat-detalles-titulo"
                        className="truncate text-sm font-black text-white"
                      >
                        {otroArtista.nombreVisible}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold text-[#FFD400]">
                        {colaboraciones.length} colaboración
                        {colaboraciones.length === 1 ? "" : "es"} activa
                        {colaboraciones.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={() => setDetallesAbiertos(false)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-lg font-bold text-white transition hover:border-[#FFD400]/50 hover:bg-[#FFD400] hover:text-black"
                  >
                    ×
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin]">
                  {/* FEATMUSIC_CHAT_DETALLES_RESUMIDO_V2 */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFD400]">
                      <IconoColaboracion />
                    </span>
                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white">
                      Colaboraciones
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    {colaboraciones.map((colaboracion, indice) =>
                      colaboracion.audioUrl ? (
                        <ReproductorAudio
                          key={colaboracion.propuestaId}
                          id={`chat-propuesta-${colaboracion.propuestaId}`}
                          src={colaboracion.audioUrl}
                          titulo={`Versión para "${colaboracion.ideaTitulo}" de ${otroArtista.nombreVisible}`}
                          bpm={colaboracion.bpm}
                          tonalidad={colaboracion.tonalidad}
                          duracionSegundos={colaboracion.duracionSegundos}
                          numero={indice + 1}
                          className="!border-white/[0.07] !bg-black/20 !p-2"
                        />
                      ) : null,
                    )}
                  </div>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
