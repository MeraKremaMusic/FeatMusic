"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

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

function Icono({
  tipo,
  className = "h-4 w-4",
}: {
  tipo:
    | "mas"
    | "musica"
    | "subir"
    | "cerrar"
    | "reloj"
    | "descargar"
    | "eliminar";
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
    return (
      <svg {...props}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
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
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function obtenerExtension(nombre: string) {
  return nombre.split(".").pop()?.toLowerCase() ?? "";
}

function audioPermitido(archivo: File) {
  const extensionValida = AUDIO_EXTENSIONS.has(obtenerExtension(archivo.name));
  const mime = archivo.type.toLowerCase();
  const mimeValido = AUDIO_TYPES.has(mime) || MIME_TYPES_GENERICOS.has(mime);

  return extensionValida && mimeValido;
}

function formatearDuracion(segundos: number) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.floor(segundos % 60);
  return `${minutos}:${String(segundosRestantes).padStart(2, "0")}`;
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
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
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
      <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[20px] p-1 lg:rounded-[18px]">
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-400">
              Mis publicaciones
            </p>
            <h2 className="mt-1 text-base font-black text-white">
              Ideas musicales
            </h2>
          </div>

          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-semibold text-zinc-400">
            {ideas.length}/{MAX_ACTIVE_IDEAS} activas
          </span>
        </div>

        {ideas.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-violet-400/20 bg-violet-500/[0.035] p-5">
            <div className="flex max-w-xs flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300 shadow-lg shadow-violet-950/30">
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
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {ideas.map((idea) => (
                <section
                  key={idea.id}
                  className="rounded-2xl border border-white/10 bg-black/25 p-3.5 shadow-lg shadow-black/15"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-white">
                        {idea.titulo}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-violet-500/10 px-2 py-1 text-[9px] font-bold text-violet-300">
                          {idea.bpm} BPM
                        </span>
                        <span className="rounded-md bg-white/[0.045] px-2 py-1 text-[9px] font-semibold text-zinc-300">
                          {idea.tonalidad}
                        </span>
                        <span className="rounded-md bg-white/[0.045] px-2 py-1 text-[9px] font-semibold text-zinc-400">
                          {formatearDuracion(idea.duracionSegundos)}
                        </span>
                        {idea.formato && (
                          <span className="rounded-md bg-white/[0.045] px-2 py-1 text-[9px] font-semibold uppercase text-zinc-500">
                            {idea.formato}
                          </span>
                        )}
                        {formatearTamano(idea.tamanoBytes) && (
                          <span className="rounded-md bg-white/[0.045] px-2 py-1 text-[9px] font-semibold text-zinc-500">
                            {formatearTamano(idea.tamanoBytes)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/[0.08] text-violet-300">
                      <Icono tipo="musica" />
                    </div>
                  </div>

                  <p className="mt-3 break-words text-[11px] leading-5 text-zinc-400">
                    {idea.descripcion}
                  </p>

                  <audio
                    controls
                    preload="metadata"
                    src={idea.audioUrl}
                    className="mt-3 h-9 w-full"
                  >
                    Tu navegador no puede reproducir este audio.
                  </audio>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[9px] text-zinc-600">
                      <span>Publicada {formatearFecha(idea.creadoEn)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Icono tipo="reloj" className="h-3 w-3" />
                        Hasta {formatearFecha(idea.expiraEn)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/api/ideas/${idea.id}/descargar`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-bold text-violet-200 transition hover:bg-violet-500/20"
                      >
                        <Icono tipo="descargar" className="h-3.5 w-3.5" />
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
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-200/30 border-t-red-200" />
                        ) : (
                          <Icono tipo="eliminar" className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {error && !modalAbierto && (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={abrirModal}
              disabled={limiteAlcanzado}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
            >
              <Icono tipo="mas" />
              {limiteAlcanzado
                ? "Límite de ideas alcanzado"
                : "Publicar otra idea"}
            </button>
          </>
        )}
      </article>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publicar-idea-titulo"
            className="max-h-[94dvh] w-full overflow-y-auto rounded-t-[24px] border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-400">
                  Nueva publicación
                </p>
                <h2
                  id="publicar-idea-titulo"
                  className="mt-1 text-xl font-black text-white"
                >
                  Publicar una idea
                </h2>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Sube una maqueta de hasta 4 minutos. FeatMusic la optimizará
                  como un MP3 liviano y compatible.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <Icono tipo="cerrar" />
              </button>
            </div>

            <form onSubmit={publicarIdea} className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-zinc-200">
                    Archivo de audio
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    50 MB · 4 minutos
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => inputArchivoRef.current?.click()}
                  disabled={guardando || leyendoAudio}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl border border-dashed border-violet-400/25 bg-violet-500/[0.04] p-4 text-left transition hover:border-violet-300/45 hover:bg-violet-500/[0.08] disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                    {leyendoAudio ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />
                    ) : (
                      <Icono tipo="subir" className="h-5 w-5" />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-zinc-200">
                      {archivo?.name ??
                        (leyendoAudio
                          ? "Leyendo información del audio..."
                          : "Seleccionar audio")}
                    </span>
                    <span className="mt-1 block text-[10px] text-zinc-500">
                      MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u OPUS
                    </span>
                  </span>
                </button>

                <input
                  ref={inputArchivoRef}
                  type="file"
                  accept=".mp3,.wav,.flac,.m4a,.aac,.ogg,.aiff,.aif,.opus,audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/aac,audio/ogg,audio/aiff,audio/opus"
                  onChange={seleccionarAudio}
                  disabled={guardando}
                  className="hidden"
                />

                <p className="mt-2 text-[10px] leading-4 text-zinc-600">
                  Solo se conservará el MP3 optimizado. El archivo original no
                  quedará guardado.
                </p>

                {avisoAudio && (
                  <p className="mt-2 rounded-lg border border-amber-400/15 bg-amber-500/[0.07] px-3 py-2 text-[10px] leading-4 text-amber-200/80">
                    {avisoAudio}
                  </p>
                )}

                {archivo && vistaPrevia && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/35 p-3">
                    <audio
                      controls
                      preload="metadata"
                      src={vistaPrevia}
                      className="h-9 w-full"
                    >
                      Tu navegador no puede reproducir este audio.
                    </audio>
                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-[9px] text-zinc-500">
                      <span>{formatearTamano(archivo.size)}</span>
                      <span>
                        {duracionSegundos
                          ? formatearDuracion(duracionSegundos)
                          : "Duración por verificar"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">
                    Título
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {titulo.length}/80
                  </span>
                </div>
                <input
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  minLength={3}
                  maxLength={80}
                  required
                  disabled={guardando}
                  placeholder="Ejemplo: Noche en Cali"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">
                    Descripción
                  </span>
                  <span className="text-[10px] text-zinc-600">
                    {descripcion.length}/300
                  </span>
                </div>
                <textarea
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  minLength={10}
                  maxLength={300}
                  rows={4}
                  required
                  disabled={guardando}
                  placeholder="Describe la idea y qué tipo de colaboración estás buscando."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-zinc-200">
                    BPM
                  </span>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(event) => setBpm(event.target.value)}
                    min={40}
                    max={250}
                    step={1}
                    required
                    disabled={guardando}
                    placeholder="96"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-zinc-200">
                    Tonalidad
                  </span>
                  <select
                    value={tonalidad}
                    onChange={(event) => setTonalidad(event.target.value)}
                    required
                    disabled={guardando}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  >
                    <option value="">Seleccionar</option>
                    {TONALIDADES.map((opcion) => (
                      <option key={opcion} value={opcion}>
                        {opcion}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {guardando && (
                <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.06] p-3">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-semibold text-violet-200">
                    <span>
                      {progresoSubida < 100
                        ? "Subiendo archivo..."
                        : "Procesando y convirtiendo a MP3..."}
                    </span>
                    <span>{progresoSubida}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                    <div
                      className="h-full rounded-full bg-violet-400 transition-[width] duration-200"
                      style={{ width: `${progresoSubida}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    guardando ||
                    leyendoAudio ||
                    !archivo ||
                    titulo.trim().length < 3 ||
                    descripcion.trim().length < 10 ||
                    !tonalidad ||
                    !bpm
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Optimizando audio...
                    </>
                  ) : (
                    <>
                      <Icono tipo="subir" />
                      Publicar idea
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
