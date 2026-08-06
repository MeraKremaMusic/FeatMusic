"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  OPCIONES_GENERO_MUSICAL,
  OPCIONES_IDIOMA_BUSCADO,
  OPCIONES_MODALIDAD_COLABORACION,
  OPCIONES_ROL_BUSCADO,
  OPCIONES_TIPO_ACUERDO,
} from "@/lib/colaboracion-ideas";
import ContadorVistasIdea from "../../components/ContadorVistasIdea";
import ReproductorAudio from "../../components/ReproductorAudio";
import ResumenColaboracionIdea from "../../components/ResumenColaboracionIdea";
import SelectorUbicacionIdea, {
  type UbicacionIdeaSeleccionada,
} from "./SelectorUbicacionIdea";

export type IdeaPanel = {
  id: number;
  titulo: string;
  descripcion: string;
  bpm: number;
  tonalidad: string;
  rolBuscado: string | null;
  generoMusical: string | null;
  idiomaBuscado: string | null;
  modalidadColaboracion: string | null;
  paisPreferido: string | null;
  departamentoPreferido: string | null;
  ciudadPreferida: string | null;
  tipoAcuerdo: string | null;
  portadaUrl: string | null;
  audioUrl: string;
  duracionSegundos: number;
  formato: string | null;
  tamanoBytes: number | null;
  estado: string;
  expiraEn: string;
  creadoEn: string;
  vistasUnicas: number;
};

type IdeasMusicalesCardProps = {
  ideasIniciales: IdeaPanel[];
  soloModal?: boolean;
  abiertoExterno?: boolean;
  onCerrarExterno?: () => void;
};

type RespuestaCrearIdea = {
  ok: boolean;
  mensaje?: string;
  idea?: Omit<
    IdeaPanel,
    "creadoEn" | "expiraEn" | "vistasUnicas"
  > & {
    creadoEn: string | Date;
    expiraEn: string | Date;
    vistasUnicas?: number;
  };
};

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_DURATION = 240;
const MAX_ACTIVE_IDEAS = 3;
const MAX_PORTADA_SIZE = 5 * 1024 * 1024;

const PORTADA_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const PORTADA_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const UBICACION_VACIA: UbicacionIdeaSeleccionada = {
  paisCodigo: "",
  paisNombre: "",
  departamentoCodigo: "",
  departamentoNombre: "",
  ciudad: "",
};

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
  | "imagen"
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

  if (tipo === "imagen") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m5 17 4.5-4 3.5 3 2.5-2 3.5 3" />
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

function portadaPermitida(archivo: File) {
  const extensionValida = PORTADA_EXTENSIONS.has(
    obtenerExtension(archivo.name),
  );
  const mime = archivo.type.toLowerCase();
  const mimeValido =
    PORTADA_TYPES.has(mime) || MIME_TYPES_GENERICOS.has(mime);

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
  soloModal = false,
  abiertoExterno,
  onCerrarExterno,
}: IdeasMusicalesCardProps) {
  const router = useRouter();
  const [ideas, setIdeas] = useState(ideasIniciales);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [bpm, setBpm] = useState("");
  const [tonalidad, setTonalidad] = useState("");
  const [rolBuscado, setRolBuscado] = useState("");
  const [generoMusical, setGeneroMusical] = useState("");
  const [idiomaBuscado, setIdiomaBuscado] = useState("");
  const [modalidadColaboracion, setModalidadColaboracion] = useState("");
  const [tipoAcuerdo, setTipoAcuerdo] = useState("");
  const [ubicacionPreferida, setUbicacionPreferida] =
    useState<UbicacionIdeaSeleccionada>(UBICACION_VACIA);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [vistaPreviaPortada, setVistaPreviaPortada] = useState<string | null>(
    null,
  );
  const [duracionSegundos, setDuracionSegundos] = useState<number | null>(null);
  const [avisoAudio, setAvisoAudio] = useState("");
  const [leyendoAudio, setLeyendoAudio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [error, setError] = useState("");
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const inputPortadaRef = useRef<HTMLInputElement>(null);
  const modalControlado = typeof abiertoExterno === "boolean";
  const modalVisible = modalControlado ? abiertoExterno : modalAbierto;

  useEffect(() => {
    setIdeas(ideasIniciales);
  }, [ideasIniciales]);

  useEffect(() => {
    if (!modalVisible) return;

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
  }, [modalVisible, guardando]);

  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  useEffect(() => {
    return () => {
      if (vistaPreviaPortada) {
        URL.revokeObjectURL(vistaPreviaPortada);
      }
    };
  }, [vistaPreviaPortada]);

  const limiteAlcanzado = ideas.length >= MAX_ACTIVE_IDEAS;

  function limpiarFormulario() {
    if (vistaPrevia) {
      URL.revokeObjectURL(vistaPrevia);
    }

    if (vistaPreviaPortada) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    setTitulo("");
    setDescripcion("");
    setBpm("");
    setTonalidad("");
    setRolBuscado("");
    setGeneroMusical("");
    setIdiomaBuscado("");
    setModalidadColaboracion("");
    setTipoAcuerdo("");
    setUbicacionPreferida(UBICACION_VACIA);
    setArchivo(null);
    setVistaPrevia(null);
    setArchivoPortada(null);
    setVistaPreviaPortada(null);
    setDuracionSegundos(null);
    setAvisoAudio("");
    setLeyendoAudio(false);
    setProgresoSubida(0);
    setError("");

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }

    if (inputPortadaRef.current) {
      inputPortadaRef.current.value = "";
    }
  }

  function abrirModal() {
    if (limiteAlcanzado || modalControlado) return;
    limpiarFormulario();
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    limpiarFormulario();

    if (modalControlado) {
      onCerrarExterno?.();
      return;
    }

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

  function seleccionarPortada(event: ChangeEvent<HTMLInputElement>) {
    const portadaSeleccionada = event.target.files?.[0];
    if (!portadaSeleccionada) return;

    setError("");

    if (!portadaPermitida(portadaSeleccionada)) {
      setError("La portada debe ser una imagen JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (portadaSeleccionada.size > MAX_PORTADA_SIZE) {
      setError("La portada no puede pesar más de 5 MB.");
      event.target.value = "";
      return;
    }

    if (vistaPreviaPortada) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    setArchivoPortada(portadaSeleccionada);
    setVistaPreviaPortada(URL.createObjectURL(portadaSeleccionada));
  }

  function quitarPortada() {
    if (vistaPreviaPortada) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    setArchivoPortada(null);
    setVistaPreviaPortada(null);

    if (inputPortadaRef.current) {
      inputPortadaRef.current.value = "";
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

    if (!rolBuscado) {
      setError("Selecciona qué rol buscas para esta idea.");
      return;
    }

    if (!generoMusical) {
      setError("Selecciona el género musical de la colaboración.");
      return;
    }

    if (!idiomaBuscado) {
      setError("Selecciona el idioma de la colaboración.");
      return;
    }

    if (!modalidadColaboracion) {
      setError("Selecciona si la colaboración será remota o presencial.");
      return;
    }

    if (!tipoAcuerdo) {
      setError("Selecciona el tipo de acuerdo de la colaboración.");
      return;
    }

    const valoresUbicacion = [
      ubicacionPreferida.paisCodigo,
      ubicacionPreferida.departamentoCodigo,
      ubicacionPreferida.ciudad,
    ];
    const tieneAlgunDatoUbicacion = valoresUbicacion.some(Boolean);
    const tieneUbicacionCompleta = valoresUbicacion.every(Boolean);

    if (
      modalidadColaboracion === "PRESENCIAL" &&
      !tieneUbicacionCompleta
    ) {
      setError(
        "Para una colaboración presencial, selecciona país, departamento y ciudad.",
      );
      return;
    }

    if (tieneAlgunDatoUbicacion && !tieneUbicacionCompleta) {
      setError("Completa toda la ubicación preferida o déjala vacía.");
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
    formData.set("rolBuscado", rolBuscado);
    formData.set("generoMusical", generoMusical);
    formData.set("idiomaBuscado", idiomaBuscado);
    formData.set("modalidadColaboracion", modalidadColaboracion);
    formData.set("tipoAcuerdo", tipoAcuerdo);
    formData.set("paisCodigoPreferido", ubicacionPreferida.paisCodigo);
    formData.set(
      "departamentoCodigoPreferido",
      ubicacionPreferida.departamentoCodigo,
    );
    formData.set("ciudadPreferida", ubicacionPreferida.ciudad.trim());
    formData.set("audio", archivo);

    if (archivoPortada) {
      formData.set("portada", archivoPortada);
    }

    try {
      setGuardando(true);
      setProgresoSubida(0);

      const data = await enviarIdeaConProgreso(formData, setProgresoSubida);

      if (!data.idea) {
        throw new Error("El servidor no devolvió la idea publicada.");
      }

      const ideaNueva: IdeaPanel = {
        ...data.idea,
        vistasUnicas: data.idea.vistasUnicas ?? 0,
        creadoEn: new Date(data.idea.creadoEn).toISOString(),
        expiraEn: new Date(data.idea.expiraEn).toISOString(),
      };

      setIdeas((ideasActuales) => [ideaNueva, ...ideasActuales]);
      limpiarFormulario();

      if (modalControlado) {
        onCerrarExterno?.();
      } else {
        setModalAbierto(false);
      }

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
      {!soloModal && (
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(0,0,0,0.22)_48%,rgba(16,185,129,0.035))] shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-emerald-500/[0.08] blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.07] px-3.5 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
              <Icono tipo="musica" className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">
                Mis publicaciones
              </p>
              <h2 className="mt-0.5 truncate text-base font-black text-white sm:text-lg">
                Ideas musicales
              </h2>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/[0.09] px-2.5 py-1 text-[9px] font-black tabular-nums text-emerald-200 sm:text-[10px]">
            {ideas.length} de {MAX_ACTIVE_IDEAS}
          </span>
        </div>

        {ideas.length === 0 ? (
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-5 py-8">
            <div className="max-w-xs text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                <Icono tipo="musica" className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-black text-zinc-100">
                Publica tu primera idea
              </p>
              <p className="mt-1.5 text-[10px] leading-5 text-zinc-500 sm:text-[11px]">
                Sube una maqueta. FeatMusic la optimizará automáticamente como
                un MP3 liviano para escuchar y descargar.
              </p>
              <button
                type="button"
                onClick={abrirModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-[11px] font-bold text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
              >
                <Icono tipo="mas" className="h-3.5 w-3.5" />
                Publicar una idea
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
              <div className="divide-y divide-white/[0.07]">
                {ideas.map((idea, indice) => {
                  const tamanoFormateado = formatearTamano(idea.tamanoBytes);
                  const portadaVisible = idea.portadaUrl?.trim() || null;

                  return (
                    <section
                      key={idea.id}
                      className={`relative overflow-hidden px-3.5 py-3 transition sm:px-4 sm:py-3.5 ${
                        portadaVisible
                          ? "featmusic-idea-cover bg-black"
                          : "hover:bg-white/[0.018]"
                      }`}
                    >
                      {portadaVisible && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
                        >
                          <img
                            src={portadaVisible}
                            alt=""
                            className="h-full w-full object-cover object-center contrast-[1.04] saturate-[1.08]"
                            loading="lazy"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.98) 16%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.38) 64%, rgba(0,0,0,0.08) 82%, rgba(0,0,0,0) 100%)",
                            }}
                          />
                        </div>
                      )}

                      <div
                        className={`relative z-10 ${
                          portadaVisible ? "featmusic-idea-cover-content" : ""
                        }`}
                      >
                      <ReproductorAudio
                        id={`panel-${idea.id}`}
                        src={idea.audioUrl}
                        titulo={idea.titulo}
                        bpm={idea.bpm}
                        tonalidad={idea.tonalidad}
                        duracionSegundos={idea.duracionSegundos}
                        numero={indice + 1}
                        className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-8 [&_button]:w-8"
                      />

                      {idea.descripcion.trim() && (
                        <p className="mt-2 whitespace-pre-wrap text-[10px] leading-4 text-zinc-500 sm:text-[11px] sm:leading-[1.15rem]">
                          {idea.descripcion}
                        </p>
                      )}

                      <ResumenColaboracionIdea
                        rolBuscado={idea.rolBuscado}
                        generoMusical={idea.generoMusical}
                        idiomaBuscado={idea.idiomaBuscado}
                        modalidadColaboracion={idea.modalidadColaboracion}
                        paisPreferido={idea.paisPreferido}
                        departamentoPreferido={idea.departamentoPreferido}
                        ciudadPreferida={idea.ciudadPreferida}
                        tipoAcuerdo={idea.tipoAcuerdo}
                        compacta
                      />

                      <div className="mt-2.5 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[8px] font-medium text-zinc-600 sm:text-[9px]">
                            <span className="inline-flex items-center gap-1">
                              <Icono tipo="reloj" className="h-2.5 w-2.5" />
                              {formatearFecha(idea.creadoEn)}
                            </span>
                            <span className="text-zinc-700">•</span>
                            <span>Vence {formatearFecha(idea.expiraEn)}</span>
                          </div>

                          <ContadorVistasIdea
                            ideaId={idea.id}
                            totalInicial={idea.vistasUnicas}
                            esPropietario
                            variante="panel"
                            className="mt-1.5"
                          />

                          {(idea.formato || tamanoFormateado) && (
                            <div className="mt-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-zinc-600 sm:text-[9px]">
                              {idea.formato && <span>{idea.formato}</span>}
                              {idea.formato && tamanoFormateado && (
                                <span className="text-zinc-700">•</span>
                              )}
                              {tamanoFormateado && (
                                <span className="normal-case tracking-normal">
                                  {tamanoFormateado}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <a
                            href={idea.audioUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Descargar ${idea.titulo}`}
                            title="Descargar MP3"
                            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 text-[8px] font-black text-zinc-400 transition hover:border-emerald-400/20 hover:bg-emerald-500/[0.08] hover:text-emerald-200 sm:text-[9px]"
                          >
                            <Icono tipo="descargar" className="h-3 w-3" />
                            MP3
                          </a>

                          <button
                            type="button"
                            onClick={() => eliminarIdea(idea)}
                            disabled={eliminandoId !== null}
                            aria-label={`Eliminar ${idea.titulo}`}
                            title="Eliminar idea"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-red-400/15 bg-red-500/[0.055] text-red-300/80 transition hover:border-red-400/25 hover:bg-red-500/12 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {eliminandoId === idea.id ? (
                              <span className="h-3 w-3 animate-spin rounded-full border border-red-300/30 border-t-red-200" />
                            ) : (
                              <Icono tipo="eliminar" className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            {error && !modalVisible && (
              <p className="relative mx-3.5 mb-2 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-3 py-2 text-[10px] text-red-200 sm:mx-4">
                {error}
              </p>
            )}

            <div className="relative border-t border-white/[0.07] bg-white/[0.012] p-3">
              <button
                type="button"
                onClick={abrirModal}
                disabled={limiteAlcanzado}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-2.5 text-[10px] font-black text-emerald-200 transition hover:border-emerald-300/35 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:border-white/[0.07] disabled:bg-white/[0.02] disabled:text-zinc-600 sm:text-[11px]"
              >
                <Icono tipo="mas" className="h-3.5 w-3.5" />
                {limiteAlcanzado
                  ? "Límite de ideas alcanzado"
                  : "Publicar otra idea"}
              </button>
            </div>
          </>
        )}
      </div>
      )}

      {modalVisible && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <form
            onSubmit={publicarIdea}
            className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#08140f] p-4 shadow-2xl shadow-black/60 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
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
                  className="mt-2 block w-full rounded-xl border border-dashed border-emerald-400/25 bg-emerald-500/[0.05] p-3 text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500/15 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-emerald-200"
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
                    <p className="mt-2 text-[10px] text-emerald-300">
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

              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Portada de la idea
                    </span>
                    <p className="mt-1 text-[9px] leading-4 text-zinc-600">
                      Opcional · JPG, PNG o WebP · máximo 5 MB
                    </p>
                  </div>

                  {vistaPreviaPortada && (
                    <button
                      type="button"
                      onClick={quitarPortada}
                      disabled={guardando}
                      className="rounded-lg border border-red-400/20 bg-red-500/[0.06] px-2.5 py-1.5 text-[9px] font-bold text-red-200 transition hover:bg-red-500/10 disabled:opacity-40"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <input
                  ref={inputPortadaRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={seleccionarPortada}
                  disabled={guardando}
                  className="mt-2 block w-full rounded-xl border border-dashed border-white/15 bg-black/20 p-3 text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-white"
                />

                {vistaPreviaPortada && (
                  <div className="relative mt-3 h-40 overflow-hidden rounded-2xl border border-white/10 bg-black sm:h-48">
                    <img
                      src={vistaPreviaPortada}
                      alt="Vista previa de la portada"
                      className="h-full w-full object-cover object-center contrast-[1.04] saturate-[1.08]"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.98) 16%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.38) 64%, rgba(0,0,0,0.08) 82%, rgba(0,0,0,0) 100%)",
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 flex max-w-[72%] flex-col justify-center p-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">
                        Vista previa
                      </span>
                      <p className="mt-1 line-clamp-2 text-lg font-black text-white">
                        {titulo.trim() || "Título de la idea"}
                      </p>
                      <p className="mt-1 text-[10px] text-white/70">
                        La información aparecerá encima de la portada.
                      </p>
                    </div>
                  </div>
                )}
              </div>

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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-emerald-400/40"
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-emerald-400/40"
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
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-400/40"
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
                  maxLength={300}
                  rows={4}
                  disabled={guardando}
                  placeholder="Explica qué colaboración buscas y qué te gustaría recibir."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-emerald-400/40"
                />
                <span className="mt-1 block text-right text-[9px] text-zinc-600">
                  {descripcion.length}/300
                </span>
              </label>


              <div className="md:col-span-2 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.035] p-3.5 sm:p-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300">
                    Colaboración que buscas
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                    Esta información ayudará a que los artistas adecuados entiendan
                    rápidamente tu propuesta.
                  </p>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Rol buscado
                    </span>
                    <select
                      value={rolBuscado}
                      onChange={(event) => setRolBuscado(event.target.value)}
                      disabled={guardando}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-400/40"
                    >
                      <option value="">Selecciona un rol</option>
                      {OPCIONES_ROL_BUSCADO.map(([valor, etiqueta]) => (
                        <option key={valor} value={valor}>
                          {etiqueta}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Género musical
                    </span>
                    <select
                      value={generoMusical}
                      onChange={(event) => setGeneroMusical(event.target.value)}
                      disabled={guardando}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-400/40"
                    >
                      <option value="">Selecciona un género</option>
                      {OPCIONES_GENERO_MUSICAL.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Idioma
                    </span>
                    <select
                      value={idiomaBuscado}
                      onChange={(event) => setIdiomaBuscado(event.target.value)}
                      disabled={guardando}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-400/40"
                    >
                      <option value="">Selecciona un idioma</option>
                      {OPCIONES_IDIOMA_BUSCADO.map(([valor, etiqueta]) => (
                        <option key={valor} value={valor}>
                          {etiqueta}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Modalidad
                    </span>
                    <select
                      value={modalidadColaboracion}
                      onChange={(event) =>
                        setModalidadColaboracion(event.target.value)
                      }
                      disabled={guardando}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-400/40"
                    >
                      <option value="">Selecciona una modalidad</option>
                      {OPCIONES_MODALIDAD_COLABORACION.map(
                        ([valor, etiqueta]) => (
                          <option key={valor} value={valor}>
                            {etiqueta}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Tipo de acuerdo
                    </span>
                    <select
                      value={tipoAcuerdo}
                      onChange={(event) => setTipoAcuerdo(event.target.value)}
                      disabled={guardando}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none focus:border-emerald-400/40"
                    >
                      <option value="">Selecciona un acuerdo</option>
                      {OPCIONES_TIPO_ACUERDO.map(([valor, etiqueta]) => (
                        <option key={valor} value={valor}>
                          {etiqueta}
                        </option>
                      ))}
                    </select>
                  </label>

                  <SelectorUbicacionIdea
                    valor={ubicacionPreferida}
                    onChange={setUbicacionPreferida}
                    requerida={modalidadColaboracion === "PRESENCIAL"}
                    disabled={guardando}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-3 py-2.5 text-[10px] text-red-200">
                {error}
              </p>
            )}

            {guardando && (
              <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3">
                <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-200">
                  <span>Subiendo y procesando la publicación...</span>
                  <span>{progresoSubida}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-[width]"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-5 py-2.5 text-xs font-bold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
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