"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ReproductorAudio from "../../components/ReproductorAudio";

export type IdeaPanel = {
  id: number;
  titulo: string;
  descripcion: string;
  bpm: number;
  tonalidad: string;
  audioUrl: string;
  duracionSegundos: number;
  formato: string | null;
  tamanoBytes: number | null;
  estado: string;
  expiraEn: string;
  creadoEn: string;
};

type IdeasMusicalesCardProps = {
  ideasIniciales: IdeaPanel[];
};

type RespuestaCrearIdea = {
  ok: boolean;
  mensaje?: string;
  idea?: Omit<IdeaPanel, "creadoEn" | "expiraEn"> & {
    creadoEn: string | Date;
    expiraEn: string | Date;
  };
};

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_DURATION = 240;
const MAX_ACTIVE_IDEAS = 3;

const AUDIO_EXTENSIONS = new Set([
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

const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/aiff",
  "audio/x-aiff",
  "audio/opus",
]);

const MIME_TYPES_GENERICOS = new Set(["", "application/octet-stream"]);

const TONALIDADES = [
  "Do mayor",
  "Do menor",
  "Do# mayor",
  "Do# menor",
  "Re mayor",
  "Re menor",
  "Re# mayor",
  "Re# menor",
  "Mi mayor",
  "Mi menor",
  "Fa mayor",
  "Fa menor",
  "Fa# mayor",
  "Fa# menor",
  "Sol mayor",
  "Sol menor",
  "Sol# mayor",
  "Sol# menor",
  "La mayor",
  "La menor",
  "La# mayor",
  "La# menor",
  "Si mayor",
  "Si menor",
  "No estoy seguro",
] as const;

type IconoTipo =
  | "mas"
  | "musica"
  | "subir"
  | "cerrar"
  | "reloj"
  | "descargar"
  | "eliminar";

function Icono({
  tipo,
  className = "h-4 w-4",
}: {
  tipo: IconoTipo;
  className?: string;
}) {
  const props = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (tipo === "mas") {
    return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
  }

  if (tipo === "musica") {
    return (
      <svg {...props}>
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </svg>
    );
  }

  if (tipo === "subir") {
    return (
      <svg {...props}>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  if (tipo === "reloj") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (tipo === "descargar") {
    return (
      <svg {...props}>
        <path d="M12 4v11" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  if (tipo === "eliminar") {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="m7 7 1 13h8l1-13" />
        <path d="M10 11v5M14 11v5" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function obtenerExtension(nombre: string) {
  return nombre.split(".").pop()?.toLowerCase() ?? "";
}

function audioPermitido(archivo: File) {
  const extensionValida = AUDIO_EXTENSIONS.has(obtenerExtension(archivo.name));
  const mime = archivo.type.toLowerCase();
  const mimeValido =
    AUDIO_TYPES.has(mime) || MIME_TYPES_GENERICOS.has(mime);

  return extensionValida && mimeValido;
}

function formatearTamano(bytes: number | null) {
  if (!bytes) return null;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatearFecha(fecha: string) {
  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaConvertida);
}

function leerDuracionAudio(url: string) {
  return new Promise<number>((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      const duracion = audio.duration;
      if (!Number.isFinite(duracion) || duracion <= 0) {
        reject(new Error("No se pudo comprobar la duración del audio."));
        return;
      }
      resolve(Math.ceil(duracion));
    };

    audio.onerror = () => {
      reject(new Error("El navegador no pudo leer los metadatos del audio."));
    };

    audio.src = url;
  });
}

function enviarIdeaConProgreso(
  formData: FormData,
  onProgress: (porcentaje: number) => void,
) {
  return new Promise<RespuestaCrearIdea>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/ideas");
    request.responseType = "text";
    request.timeout = 180_000;

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      onProgress(
        Math.min(100, Math.round((event.loaded / event.total) * 100)),
      );
    };

    request.onload = () => {
      let data: RespuestaCrearIdea | null = null;

      try {
        data = JSON.parse(request.responseText) as RespuestaCrearIdea;
      } catch {
        data = null;
      }

      if (request.status < 200 || request.status >= 300 || !data?.ok) {
        reject(
          new Error(data?.mensaje ?? "No se pudo publicar la idea musical."),
        );
        return;
      }

      resolve(data);
    };

    request.onerror = () => {
      reject(new Error("Se perdió la conexión mientras se subía el audio."));
    };

    request.ontimeout = () => {
      reject(
        new Error(
          "La subida tardó demasiado. Comprueba tu conexión e inténtalo otra vez.",
        ),
      );
    };

    request.send(formData);
  });
}

export default function IdeasMusicalesCard({
  ideasIniciales,
}: IdeasMusicalesCardProps) {
  const router = useRouter();
  const [ideas, setIdeas] = useState(ideasIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [bpm, setBpm] = useState("");
  const [tonalidad, setTonalidad] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [duracionSegundos, setDuracionSegundos] = useState<number | null>(null);
  const [avisoAudio, setAvisoAudio] = useState("");
  const [leyendoAudio, setLeyendoAudio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [error, setError] = useState("");
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIdeas(ideasIniciales);
  }, [ideasIniciales]);

  useEffect(() => {
    if (!modalAbierto) return;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guardando) {
        cerrarModal();
      }
    };

    document.addEventListener("keydown", cerrarConEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = "";
    };
  }, [modalAbierto, guardando]);

  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  const limiteAlcanzado = ideas.length >= MAX_ACTIVE_IDEAS;

  function limpiarFormulario() {
    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setTitulo("");
    setDescripcion("");
    setBpm("");
    setTonalidad("");
    setArchivo(null);
    setVistaPrevia(null);
    setDuracionSegundos(null);
    setAvisoAudio("");
    setLeyendoAudio(false);
    setProgresoSubida(0);
    setError("");

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  }

  function abrirModal() {
    if (limiteAlcanzado) return;
    limpiarFormulario();
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    limpiarFormulario();
    setModalAbierto(false);
  }

  async function seleccionarAudio(event: ChangeEvent<HTMLInputElement>) {
    const audioSeleccionado = event.target.files?.[0];
    if (!audioSeleccionado) return;

    setError("");
    setAvisoAudio("");
    setArchivo(null);
    setDuracionSegundos(null);

    if (!audioPermitido(audioSeleccionado)) {
      setError(
        "Selecciona un audio MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u OPUS.",
      );
      event.target.value = "";
      return;
    }

    if (audioSeleccionado.size > MAX_AUDIO_SIZE) {
      setError("El archivo original no puede pesar más de 50 MB.");
      event.target.value = "";
      return;
    }

    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }

    const nuevaVistaPrevia = URL.createObjectURL(audioSeleccionado);
    setVistaPrevia(nuevaVistaPrevia);
    setArchivo(audioSeleccionado);
    setLeyendoAudio(true);

    try {
      const duracion = await leerDuracionAudio(nuevaVistaPrevia);

      if (duracion > MAX_AUDIO_DURATION) {
        setArchivo(null);
        setError("El audio no puede durar más de 4 minutos.");
        URL.revokeObjectURL(nuevaVistaPrevia);
        setVistaPrevia(null);
        event.target.value = "";
        return;
      }

      setDuracionSegundos(duracion);
    } catch {
      setAvisoAudio(
        "Tu navegador no pudo leer la duración. El servidor la comprobará antes de publicar.",
      );
    } finally {
      setLeyendoAudio(false);
    }
  }

  async function publicarIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando) return;

    setError("");

    const tituloLimpio = titulo.trim();
    const descripcionLimpia = descripcion.trim();
    const bpmNumero = Number(bpm);

    if (tituloLimpio.length < 3) {
      setError("El título debe tener al menos 3 caracteres.");
      return;
    }

    if (descripcionLimpia.length < 10) {
      setError("La descripción debe tener al menos 10 caracteres.");
      return;
    }

    if (!Number.isInteger(bpmNumero) || bpmNumero < 40 || bpmNumero > 250) {
      setError("El BPM debe ser un número entero entre 40 y 250.");
      return;
    }

    if (!tonalidad) {
      setError("Selecciona la tonalidad de la canción.");
      return;
    }

    if (!archivo) {
      setError("Selecciona un archivo de audio válido.");
      return;
    }

    const formData = new FormData();
    formData.set("titulo", tituloLimpio);
    formData.set("descripcion", descripcionLimpia);
    formData.set("bpm", String(bpmNumero));
    formData.set("tonalidad", tonalidad);
    formData.set("audio", archivo);

    try {
      setGuardando(true);
      setProgresoSubida(0);

      const data = await enviarIdeaConProgreso(formData, setProgresoSubida);

      if (!data.idea) {
        throw new Error("El servidor no devolvió la idea publicada.");
      }

      const ideaNueva: IdeaPanel = {
        ...data.idea,
        creadoEn: new Date(data.idea.creadoEn).toISOString(),
        expiraEn: new Date(data.idea.expiraEn).toISOString(),
      };

      setIdeas((ideasActuales) => [ideaNueva, ...ideasActuales]);
      limpiarFormulario();
      setModalAbierto(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo publicar la idea.",
      );
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarIdea(idea: IdeaPanel) {
    if (eliminandoId !== null) return;

    const confirmado = window.confirm(
      `¿Eliminar “${idea.titulo}”? El audio también se borrará de Cloudinary.`,
    );
    if (!confirmado) return;

    setError("");
    setEliminandoId(idea.id);

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as {
        ok: boolean;
        mensaje?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje ?? "No se pudo eliminar la idea.");
      }

      setIdeas((ideasActuales) =>
        ideasActuales.filter((ideaActual) => ideaActual.id !== idea.id),
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la idea.",
      );
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-white/10 bg-black/30 p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
              Mis publicaciones
            </p>
            <h2 className="mt-1 text-lg font-black text-white">
              Ideas musicales
            </h2>
          </div>

          <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-black text-violet-200">
            {ideas.length}/{MAX_ACTIVE_IDEAS} activas
          </span>
        </div>

        {ideas.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <div className="max-w-xs text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-950/30">
                <Icono tipo="musica" className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-bold text-zinc-100">
                Publica tu primera idea
              </p>
              <p className="mt-2 text-[11px] leading-5 text-zinc-500">
                Sube una maqueta. Se convertirá automáticamente a un único MP3
                liviano para escuchar y descargar.
              </p>
              <button
                type="button"
                onClick={abrirModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-5 py-2.5 text-xs font-bold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/25 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
              >
                <Icono tipo="mas" />
                Publicar una idea
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {ideas.map((idea, indice) => (
                <section
                  key={idea.id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-3.5 shadow-lg shadow-black/15"
                >
                  <p className="mb-3 line-clamp-3 text-[11px] leading-5 text-zinc-400">
                    {idea.descripcion}
                  </p>

                  <ReproductorAudio
                    id={`panel-${idea.id}`}
                    src={idea.audioUrl}
                    titulo={idea.titulo}
                    bpm={idea.bpm}
                    tonalidad={idea.tonalidad}
                    duracionSegundos={idea.duracionSegundos}
                    numero={indice + 1}
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[9px] text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Icono tipo="reloj" className="h-3 w-3" />
                        Publicada {formatearFecha(idea.creadoEn)}
                      </span>
                      <span>Hasta {formatearFecha(idea.expiraEn)}</span>
                      {idea.formato && (
                        <span className="font-semibold uppercase">
                          {idea.formato}
                        </span>
                      )}
                      {formatearTamano(idea.tamanoBytes) && (
                        <span>{formatearTamano(idea.tamanoBytes)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={idea.audioUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.035] px-2.5 text-[9px] font-bold text-zinc-300 transition hover:bg-white/[0.07]"
                      >
                        <Icono tipo="descargar" className="h-3 w-3" />
                        MP3
                      </a>

                      <button
                        type="button"
                        onClick={() => eliminarIdea(idea)}
                        disabled={eliminandoId !== null}
                        aria-label={`Eliminar ${idea.titulo}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-400/20 bg-red-500/[0.07] text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {eliminandoId === idea.id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border border-red-300/30 border-t-red-200" />
                        ) : (
                          <Icono tipo="eliminar" className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {error && !modalAbierto && (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-3 py-2 text-[10px] text-red-200">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={abrirModal}
              disabled={limiteAlcanzado}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.025] disabled:text-zinc-600"
            >
              <Icono tipo="mas" />
              {limiteAlcanzado
                ? "Límite de ideas alcanzado"
                : "Publicar otra idea"}
            </button>
          </>
        )}
      </div>

      {modalAbierto && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <form
            onSubmit={publicarIdea}
            className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#100d15] p-4 shadow-2xl shadow-black/60 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                  Nueva publicación
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  Publicar una idea
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-zinc-500">
                  Sube una maqueta de hasta 4 minutos. FeatMusic la optimizará
                  como un MP3 liviano y compatible.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
              >
                <Icono tipo="cerrar" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Archivo de audio
                </span>
                <input
                  ref={inputArchivoRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg,.aiff,.aif,.opus"
                  onChange={seleccionarAudio}
                  disabled={guardando}
                  className="mt-2 block w-full rounded-xl border border-dashed border-violet-400/25 bg-violet-500/[0.05] p-3 text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-violet-200"
                />
                <span className="mt-1.5 block text-[9px] text-zinc-600">
                  50 MB · 4 minutos · MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u
                  OPUS
                </span>
              </label>

              {vistaPrevia && (
                <div className="md:col-span-2">
                  <ReproductorAudio
                    id="vista-previa-publicacion"
                    src={vistaPrevia}
                    titulo={titulo.trim() || archivo?.name || "Vista previa del audio"}
                    bpm={bpm ? Number(bpm) : null}
                    tonalidad={tonalidad || null}
                    duracionSegundos={duracionSegundos}
                  />
                  {leyendoAudio && (
                    <p className="mt-2 text-[10px] text-violet-300">
                      Leyendo duración del audio...
                    </p>
                  )}
                  {avisoAudio && (
                    <p className="mt-2 text-[10px] text-amber-300">
                      {avisoAudio}
                    </p>
                  )}
                </div>
              )}

              <label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Título
                </span>
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  maxLength={80}
                  disabled={guardando}
                  placeholder="Ej. Coro para reggaetón"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/40"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  BPM
                </span>
                <input
                  type="number"
                  min={40}
                  max={250}
                  value={bpm}
                  onChange={(event) => setBpm(event.target.value)}
                  disabled={guardando}
                  placeholder="Ej. 92"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/40"
                />
              </label>

              <label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Tonalidad
                </span>
                <select
                  value={tonalidad}
                  onChange={(event) => setTonalidad(event.target.value)}
                  disabled={guardando}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-400/40"
                >
                  <option value="">Selecciona una tonalidad</option>
                  {TONALIDADES.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Descripción
                </span>
                <textarea
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  maxLength={500}
                  rows={4}
                  disabled={guardando}
                  placeholder="Explica qué colaboración buscas y qué te gustaría recibir."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-violet-400/40"
                />
                <span className="mt-1 block text-right text-[9px] text-zinc-600">
                  {descripcion.length}/500
                </span>
              </label>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-3 py-2.5 text-[10px] text-red-200">
                {error}
              </p>
            )}

            {guardando && (
              <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-3">
                <div className="flex items-center justify-between text-[10px] font-semibold text-violet-200">
                  <span>Subiendo y procesando audio...</span>
                  <span>{progresoSubida}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-[width]"
                    style={{ width: `${progresoSubida}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-400 transition hover:bg-white/5 disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || leyendoAudio}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/20 px-5 py-2.5 text-xs font-bold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icono tipo="subir" />
                {guardando ? "Publicando..." : "Publicar idea"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}