"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ReproductorAudio from "@/app/components/ReproductorAudio";

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

export default function ChatClient({
  conversacionId,
  propuestaId,
  usuarioActualId,
  ideaTitulo,
  audioUrl,
  duracionSegundos,
  otroArtista,
  mensajesIniciales,
}: {
  conversacionId: number;
  propuestaId: number;
  usuarioActualId: number;
  ideaTitulo: string;
  audioUrl: string | null;
  duracionSegundos: number;
  otroArtista: OtroArtista;
  mensajesIniciales: MensajeChat[];
}) {
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const finalRef = useRef<HTMLDivElement | null>(null);

  const ultimoMensajeId = useMemo(
    () => mensajes[mensajes.length - 1]?.id ?? 0,
    [mensajes],
  );

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes.length]);

  useEffect(() => {
    let activo = true;
    let consultando = false;

    async function consultarMensajes() {
      if (consultando || document.visibilityState !== "visible") {
        return;
      }

      consultando = true;

      try {
        const response = await fetch(
          `/api/conversaciones/${conversacionId}?despuesDe=${ultimoMensajeId}`,
          {
            cache: "no-store",
            credentials: "include",
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
        }
      } catch (errorConsulta) {
        if (activo) {
          setError(
            errorConsulta instanceof Error
              ? errorConsulta.message
              : "No se pudieron actualizar los mensajes.",
          );
        }
      } finally {
        consultando = false;
      }
    }

    const intervalo = window.setInterval(() => {
      void consultarMensajes();
    }, 5000);

    const alVolver = () => {
      void consultarMensajes();
    };

    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      activo = false;
      window.clearInterval(intervalo);
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [conversacionId, ultimoMensajeId]);

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
    <div className="mx-auto grid min-h-[calc(100dvh-56px)] max-w-6xl gap-4 px-3 py-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-4">
      <aside className="h-fit rounded-2xl border border-white/10 bg-black/35 p-4 shadow-xl shadow-black/20 backdrop-blur-sm lg:sticky lg:top-[72px]">
        <div className="flex items-center gap-3">
          {otroArtista.fotoPerfil ? (
            <img
              src={otroArtista.fotoPerfil}
              alt={`Foto de ${otroArtista.nombreVisible}`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/10 text-xs font-black text-violet-200">
              {iniciales(otroArtista.nombreVisible)}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">
              {otroArtista.nombreVisible}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-emerald-300">
              Propuesta aceptada
            </p>
          </div>
        </div>

        {otroArtista.nombreUsuario && (
          <Link
            href={`/artistas/${encodeURIComponent(otroArtista.nombreUsuario)}`}
            className="mt-3 block text-[10px] font-bold text-violet-300 transition hover:text-violet-200"
          >
            Ver perfil del artista →
          </Link>
        )}

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-600">
            Idea musical
          </p>
          <p className="mt-1 text-xs font-black text-zinc-100">{ideaTitulo}</p>
        </div>

        {audioUrl ? (
          <>
            <ReproductorAudio
              id={`chat-propuesta-${propuestaId}`}
              src={audioUrl}
              titulo="Audio de la propuesta aceptada"
              duracionSegundos={duracionSegundos}
              numero={1}
              className="mt-3"
            />
            <a
              href={`/api/propuestas/${propuestaId}/descargar`}
              className="mt-3 flex items-center justify-center rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-[10px] font-black text-sky-200 transition hover:bg-sky-500/20"
            >
              Descargar MP3
            </a>
          </>
        ) : (
          <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-zinc-500">
            El audio aceptado no está disponible.
          </p>
        )}

        <p className="mt-4 text-[9px] leading-4 text-zinc-600">
          Este chat es privado y solo puede ser abierto por los dos artistas de
          la colaboración.
        </p>
      </aside>

      <section className="flex min-h-[70dvh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-xl shadow-black/20 backdrop-blur-sm lg:h-[calc(100dvh-88px)] lg:min-h-0">
        <div className="shrink-0 border-b border-white/10 px-4 py-3">
          <p className="text-sm font-black text-white">
            Conversación con {otroArtista.nombreVisible}
          </p>
          <p className="mt-1 text-[9px] font-medium text-zinc-600">
            Los mensajes se actualizan automáticamente.
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
                  Hablen sobre la idea, acuerden cómo trabajarán y compartan los
                  siguientes pasos de la colaboración.
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
                        ? "rounded-br-md bg-violet-500 text-white"
                        : "rounded-bl-md border border-white/10 bg-white/[0.06] text-zinc-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-xs leading-5">
                      {mensaje.contenido}
                    </p>
                    <p
                      className={`mt-1 text-right text-[8px] ${
                        propio ? "text-violet-100/70" : "text-zinc-600"
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
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40"
            />

            <button
              type="submit"
              disabled={enviando || contenido.trim().length === 0}
              className="flex h-11 shrink-0 items-center justify-center rounded-xl bg-violet-500 px-4 text-[10px] font-black text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
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
