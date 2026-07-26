"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_DURATION = 240;
const MAX_PROPUESTAS = 3;

const EXTENSIONES_PERMITIDAS = new Set([
  "mp3",
  "wav",
  "flac",
  "m4a",
  "aac",
  "ogg",
  "aiff",
  "aif",
  "opus",
]);

type EnviarPropuestaProps = {
  ideaId: number;
  sesionActiva: boolean;
  esPropietario: boolean;
  propuestasActuales: number;
  estadoPropuestaUsuario: string | null;
};

type RespuestaApi = {
  ok: boolean;
  mensaje?: string;
  propuesta?: {
    id: number;
    estado: string;
  };
};

function obtenerExtension(nombre: string) {
  return nombre.split(".").pop()?.toLowerCase() ?? "";
}

function formatearTamano(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function leerDuracionAudio(url: string) {
  return new Promise<number>((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = url;

    audio.onloadedmetadata = () => {
      const duracion = audio.duration;
      audio.removeAttribute("src");
      audio.load();

      if (!Number.isFinite(duracion) || duracion <= 0) {
        reject(new Error("Duración inválida"));
        return;
      }

      resolve(Math.ceil(duracion));
    };

    audio.onerror = () => {
      audio.removeAttribute("src");
      audio.load();
      reject(new Error("No se pudo leer el audio"));
    };
  });
}

function enviarConProgreso(
  ideaId: number,
  formData: FormData,
  actualizarProgreso: (progreso: number) => void,
) {
  return new Promise<RespuestaApi>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/ideas/${ideaId}/propuestas`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (evento) => {
      if (!evento.lengthComputable) return;
      actualizarProgreso(Math.round((evento.loaded / evento.total) * 100));
    };

    xhr.onload = () => {
      const data = (xhr.response ?? {}) as RespuestaApi;

      if (xhr.status < 200 || xhr.status >= 300 || !data.ok) {
        reject(
          new Error(
            data.mensaje || "No se pudo enviar la propuesta musical.",
          ),
        );
        return;
      }

      resolve(data);
    };

    xhr.onerror = () => {
      reject(new Error("Se perdió la conexión mientras se enviaba el audio."));
    };

    xhr.send(formData);
  });
}

function etiquetaEstado(estado: string) {
  const etiquetas: Record<string, string> = {
    PENDIENTE: "Propuesta pendiente",
    ACEPTADA: "Propuesta aceptada",
    RECHAZADA: "Propuesta rechazada",
    EXPIRADA: "Propuesta expirada",
  };

  return etiquetas[estado] ?? "Propuesta enviada";
}

function claseEstado(estado: string) {
  if (estado === "ACEPTADA") {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  if (estado === "RECHAZADA" || estado === "EXPIRADA") {
    return "border-red-400/25 bg-red-500/10 text-red-200";
  }

  return "border-amber-400/25 bg-amber-500/10 text-amber-200";
}

export default function EnviarPropuesta({
  ideaId,
  sesionActiva,
  esPropietario,
  propuestasActuales,
  estadoPropuestaUsuario,
}: EnviarPropuestaProps) {
  const router = useRouter();
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [avisoAudio, setAvisoAudio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [totalPropuestas, setTotalPropuestas] = useState(propuestasActuales);
  const [estadoPropio, setEstadoPropio] = useState(
    estadoPropuestaUsuario,
  );

  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  function limpiarArchivo() {
    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setArchivo(null);
    setVistaPrevia(null);
    setAvisoAudio("");

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  }

  function cerrarModal() {
    if (enviando) return;
    limpiarArchivo();
    setMensaje("");
    setError("");
    setProgreso(0);
    setModalAbierto(false);
  }

  async function seleccionarAudio(evento: ChangeEvent<HTMLInputElement>) {
    setError("");
    setAvisoAudio("");

    const seleccionado = evento.target.files?.[0] ?? null;

    if (!seleccionado) {
      limpiarArchivo();
      return;
    }

    if (!EXTENSIONES_PERMITIDAS.has(obtenerExtension(seleccionado.name))) {
      setError(
        "Selecciona un audio MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u OPUS.",
      );
      evento.target.value = "";
      return;
    }

    if (seleccionado.size > MAX_AUDIO_SIZE) {
      setError("El archivo original no puede pesar más de 50 MB.");
      evento.target.value = "";
      return;
    }

    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }

    const nuevaVistaPrevia = URL.createObjectURL(seleccionado);
    setArchivo(seleccionado);
    setVistaPrevia(nuevaVistaPrevia);

    try {
      const duracion = await leerDuracionAudio(nuevaVistaPrevia);

      if (duracion > MAX_AUDIO_DURATION) {
        setError("El audio no puede durar más de 4 minutos.");
        URL.revokeObjectURL(nuevaVistaPrevia);
        setArchivo(null);
        setVistaPrevia(null);
        evento.target.value = "";
      }
    } catch {
      setAvisoAudio(
        "El navegador no pudo leer la duración. El servidor la comprobará antes de enviarla.",
      );
    }
  }

  async function enviarPropuesta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (enviando) return;

    setError("");

    if (!archivo) {
      setError("Selecciona el audio de tu propuesta.");
      return;
    }

    if (mensaje.trim().length > 500) {
      setError("El mensaje no puede superar 500 caracteres.");
      return;
    }

    const formData = new FormData();
    formData.set("audio", archivo);
    formData.set("mensaje", mensaje.trim());

    try {
      setEnviando(true);
      setProgreso(0);

      const data = await enviarConProgreso(
        ideaId,
        formData,
        setProgreso,
      );

      const nuevoEstado = data.propuesta?.estado ?? "PENDIENTE";
      setEstadoPropio(nuevoEstado);
      setTotalPropuestas((actual) => Math.min(MAX_PROPUESTAS, actual + 1));
      limpiarArchivo();
      setMensaje("");
      setModalAbierto(false);
      router.refresh();
    } catch (errorEnvio) {
      setError(
        errorEnvio instanceof Error
          ? errorEnvio.message
          : "No se pudo enviar la propuesta.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (esPropietario) {
    return (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
        <p className="text-[10px] font-semibold text-zinc-500">
          Esta publicación es tuya.
        </p>
        <span className="text-[10px] font-bold text-zinc-400">
          {totalPropuestas}/{MAX_PROPUESTAS} propuestas
        </span>
      </div>
    );
  }

  if (estadoPropio) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${claseEstado(
            estadoPropio,
          )}`}
        >
          {etiquetaEstado(estadoPropio)}
        </span>
        <span className="text-[10px] font-bold text-zinc-500">
          {totalPropuestas}/{MAX_PROPUESTAS} propuestas
        </span>
      </div>
    );
  }

  if (!sesionActiva) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-400/15 bg-violet-500/[0.06] px-3 py-2.5">
        <p className="text-[10px] font-medium text-zinc-400">
          Inicia sesión para colaborar con esta idea.
        </p>
        <Link
          href="/iniciar-sesion"
          className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-[10px] font-bold text-violet-200 transition hover:bg-violet-500/20"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const cuposCompletos = totalPropuestas >= MAX_PROPUESTAS;

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
        <p className="text-[10px] font-medium text-zinc-500">
          {cuposCompletos
            ? "Esta idea ya completó sus propuestas."
            : `${MAX_PROPUESTAS - totalPropuestas} cupo${
                MAX_PROPUESTAS - totalPropuestas === 1 ? "" : "s"
              } disponible${
                MAX_PROPUESTAS - totalPropuestas === 1 ? "" : "s"
              }.`}
        </p>
        <button
          type="button"
          disabled={cuposCompletos}
          onClick={() => {
            setError("");
            setModalAbierto(true);
          }}
          className="rounded-lg border border-violet-400/35 bg-violet-500/15 px-3 py-1.5 text-[10px] font-bold text-violet-100 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-zinc-600"
        >
          {cuposCompletos ? "Cupos completos" : "Enviar propuesta"}
        </button>
      </div>

      {modalAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enviar propuesta musical"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              cerrarModal();
            }
          }}
        >
          <form
            onSubmit={enviarPropuesta}
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#120e18] p-5 shadow-2xl shadow-black/60"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-violet-300">
                  Colaborar con esta idea
                </p>
                <h3 className="mt-1 text-xl font-black text-white">
                  Enviar propuesta
                </h3>
              </div>
              <button
                type="button"
                onClick={cerrarModal}
                disabled={enviando}
                aria-label="Cerrar formulario"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <div className="mt-5">
              <label className="text-xs font-bold text-zinc-200">
                Audio de la propuesta
              </label>
              <input
                ref={inputArchivoRef}
                type="file"
                accept=".mp3,.wav,.flac,.m4a,.aac,.ogg,.aiff,.aif,.opus,audio/*"
                onChange={seleccionarAudio}
                disabled={enviando}
                className="mt-2 block w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-violet-200"
              />
              <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                Máximo 50 MB y 4 minutos. Se guardará automáticamente como
                MP3 de 64 kbps.
              </p>
            </div>

            {archivo && (
              <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-zinc-200">
                      {archivo.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">
                      {formatearTamano(archivo.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={limpiarArchivo}
                    disabled={enviando}
                    className="rounded-lg border border-red-400/20 px-2.5 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10"
                  >
                    Quitar
                  </button>
                </div>
                {vistaPrevia && (
                  <audio
                    controls
                    preload="metadata"
                    src={vistaPrevia}
                    className="mt-3 h-9 w-full"
                  />
                )}
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`mensaje-propuesta-${ideaId}`}
                  className="text-xs font-bold text-zinc-200"
                >
                  Mensaje opcional
                </label>
                <span className="text-[10px] text-zinc-600">
                  {mensaje.length}/500
                </span>
              </div>
              <textarea
                id={`mensaje-propuesta-${ideaId}`}
                value={mensaje}
                onChange={(evento) => setMensaje(evento.target.value)}
                maxLength={500}
                rows={4}
                disabled={enviando}
                placeholder="Cuéntale al artista qué agregaste o cómo imaginas la colaboración."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40"
              />
            </div>

            {avisoAudio && (
              <p className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-[10px] text-amber-200">
                {avisoAudio}
              </p>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] text-red-200">
                {error}
              </p>
            )}

            {enviando && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400">
                  <span>Subiendo y convirtiendo el audio…</span>
                  <span>{progreso}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-[width]"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={cerrarModal}
                disabled={enviando}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-white/5 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando || !archivo}
                className="rounded-xl border border-violet-300/30 bg-violet-500 px-4 py-2.5 text-xs font-black text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {enviando ? "Enviando…" : "Enviar propuesta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
