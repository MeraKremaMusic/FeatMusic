"use client";

import Link from "next/link";
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

function formatearFechaCorta(fecha: string) {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
  const finalRef = useRef<HTMLDivElement | null>(null);

  const ultimoMensajeIdRef = useRef(
    mensajesIniciales[mensajesIniciales.length - 1]?.id ?? 0,
  );

  useEffect(() => {
    ultimoMensajeIdRef.current = mensajes[mensajes.length - 1]?.id ?? 0;
    finalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

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
    <div className="mx-auto grid min-h-[calc(100dvh-56px)] max-w-6xl gap-4 px-3 py-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-4">
      <aside className="h-fit overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-xl shadow-black/20 backdrop-blur-sm lg:sticky lg:top-[72px]">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {otroArtista.fotoPerfil ? (
              <img
                src={otroArtista.fotoPerfil}
                alt={`Foto de ${otroArtista.nombreVisible}`}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-500/10 text-xs font-black text-emerald-200">
                {iniciales(otroArtista.nombreVisible)}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-white">
                {otroArtista.nombreVisible}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-emerald-300">
                {colaboraciones.length} colaboración
                {colaboraciones.length === 1 ? "" : "es"} activa
                {colaboraciones.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {otroArtista.nombreUsuario && (
            <Link
              href={`/artistas/${encodeURIComponent(otroArtista.nombreUsuario)}`}
              className="mt-3 block text-[10px] font-bold text-emerald-300 transition hover:text-emerald-200"
            >
              Ver perfil del artista →
            </Link>
          )}
        </div>

        <div className="border-t border-white/10 px-3 pb-3 pt-2">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="text-emerald-300">
              <IconoColaboracion />
            </span>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500">
              Colaboraciones
            </p>
          </div>

          <div className="max-h-[52dvh] space-y-2 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
            {colaboraciones.map((colaboracion, indice) => (
              <details
                key={colaboracion.propuestaId}
                open={indice === 0}
                className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]"
              >
                <summary className="cursor-pointer list-none px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-black text-zinc-100">
                        {colaboracion.ideaTitulo}
                      </p>
                      <p className="mt-0.5 truncate text-[8px] font-semibold text-zinc-600">
                        {colaboracion.bpm} BPM · {colaboracion.tonalidad} ·{" "}
                        {formatearFechaCorta(colaboracion.aceptadaEn)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] text-zinc-600 transition group-open:rotate-180">
                      ▾
                    </span>
                  </div>
                </summary>

                <div className="border-t border-white/[0.07] p-2.5">
                  {colaboracion.audioUrl ? (
                    <>
                      <ReproductorAudio
                        id={`chat-propuesta-${colaboracion.propuestaId}`}
                        src={colaboracion.audioUrl}
                        titulo="Audio aceptado"
                        bpm={colaboracion.bpm}
                        tonalidad={colaboracion.tonalidad}
                        duracionSegundos={colaboracion.duracionSegundos}
                        numero={indice + 1}
                        className="!border-white/[0.07] !bg-black/20 !p-2"
                      />
                      <a
                        href={`/api/propuestas/${colaboracion.propuestaId}/descargar`}
                        className="mt-2 flex items-center justify-center rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-[9px] font-black text-sky-200 transition hover:bg-sky-500/20"
                      >
                        Descargar MP3
                      </a>
                    </>
                  ) : (
                    <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[9px] text-zinc-500">
                      El audio aceptado no está disponible.
                    </p>
                  )}

                  {colaboracion.mensaje && (
                    <p className="mt-2 whitespace-pre-wrap rounded-lg border border-white/[0.07] bg-black/20 px-2.5 py-2 text-[9px] leading-4 text-zinc-500">
                      {colaboracion.mensaje}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>

        <p className="border-t border-white/10 px-4 py-3 text-[9px] leading-4 text-zinc-600">
          Este chat es único para ustedes dos. Las nuevas propuestas aceptadas
          entre ambos aparecerán en la lista de colaboraciones.
        </p>
      </aside>

      <section className="flex min-h-[70dvh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-xl shadow-black/20 backdrop-blur-sm lg:h-[calc(100dvh-88px)] lg:min-h-0">
        <div className="shrink-0 border-b border-white/10 px-4 py-3">
          <p className="text-sm font-black text-white">
            Conversación con {otroArtista.nombreVisible}
          </p>
          <p className="mt-1 text-[9px] font-medium text-zinc-600">
            Un solo chat para todas las colaboraciones entre ustedes.
          </p>
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
                    className={`max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[72%] ${
                      propio
                        ? "rounded-br-md bg-emerald-500 text-white"
                        : "rounded-bl-md border border-white/10 bg-white/[0.06] text-zinc-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-xs leading-5">
                      {mensaje.contenido}
                    </p>
                    <p
                      className={`mt-1 text-right text-[8px] ${
                        propio ? "text-emerald-100/70" : "text-zinc-600"
                      }`}
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
              placeholder="Escribe un mensaje…"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/40"
            />

            <button
              type="submit"
              disabled={enviando || contenido.trim().length === 0}
              className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-4 text-[10px] font-black text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>

          <div className="mt-1 flex items-center justify-between px-1">
            <p className="text-[8px] text-zinc-700">
              Enter para enviar · Shift + Enter para otra línea
            </p>
            <p className="text-[8px] text-zinc-700">{contenido.length}/2000</p>
          </div>
        </form>
      </section>
    </div>
  );
}
