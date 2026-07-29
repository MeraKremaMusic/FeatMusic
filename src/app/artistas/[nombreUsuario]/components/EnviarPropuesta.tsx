"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
// FEATMUSIC_PERFIL_PUBLICO_CLARO_V1
// FEATMUSIC_ACCIONES_INTEGRADAS_PERFIL_V1

import {
  useCallback,
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

type PropuestaUsuario = {
  estado: string;
  motivoDecision: string | null;
  permiteReintento: boolean;
  numeroIntento: number;
};

type EnviarPropuestaProps = {
  ideaId: number;
  sesionActiva: boolean;
  esPropietario: boolean;
  propuestasActuales: number;
  propuestaUsuario: PropuestaUsuario | null;
  variante?: "normal" | "integrada";
};

type RespuestaApi = {
  ok: boolean;
  mensaje?: string;
  modo?: "NUEVA" | "CORRECCION" | "REINTENTO";
  propuesta?: {
    id: number;
    estado: string;
    motivoDecision: string | null;
    permiteReintento: boolean;
    numeroIntento: number;
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
    CAMBIOS_SOLICITADOS: "Cambios solicitados",
    ACEPTADA: "Propuesta aceptada",
    RECHAZADA: "Propuesta rechazada",
    EXPIRADA: "Propuesta expirada",
  };

  return etiquetas[estado] ?? "Propuesta enviada";
}

function claseEstado(estado: string) {
  if (estado === "ACEPTADA") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (estado === "CAMBIOS_SOLICITADOS") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (estado === "RECHAZADA" || estado === "EXPIRADA") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function EnviarPropuesta({
  ideaId,
  sesionActiva,
  esPropietario,
  propuestasActuales,
  propuestaUsuario,
  variante = "normal",
}: EnviarPropuestaProps) {
  const router = useRouter();
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const contenidoModalRef = useRef<HTMLDivElement>(null);
  const mensajeRef = useRef<HTMLTextAreaElement>(null);
  const temporizadoresAjusteRef = useRef<number[]>([]);
  const enviandoRef = useRef(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [avisoAudio, setAvisoAudio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [vistaModal, setVistaModal] = useState<{
    alto: number;
    desplazamientoSuperior: number;
    esMovil: boolean;
  } | null>(null);
  const [totalPropuestas, setTotalPropuestas] = useState(propuestasActuales);
  const [propuestaPropia, setPropuestaPropia] = useState(propuestaUsuario);

  useEffect(() => {
    setTotalPropuestas(propuestasActuales);
  }, [propuestasActuales]);

  useEffect(() => {
    setPropuestaPropia(propuestaUsuario);
  }, [propuestaUsuario]);

  const cancelarAjustesMensaje = useCallback(() => {
    temporizadoresAjusteRef.current.forEach((temporizador) => {
      window.clearTimeout(temporizador);
    });
    temporizadoresAjusteRef.current = [];
  }, []);

  const asegurarMensajeVisible = useCallback(
    (comportamiento: ScrollBehavior = "smooth") => {
      const contenedor = contenidoModalRef.current;
      const textarea = mensajeRef.current;

      if (!contenedor || !textarea) return;

      window.requestAnimationFrame(() => {
        const limiteContenedor = contenedor.getBoundingClientRect();
        const limiteTextarea = textarea.getBoundingClientRect();
        const margen = 16;

        const estaVisible =
          limiteTextarea.top >= limiteContenedor.top + margen &&
          limiteTextarea.bottom <= limiteContenedor.bottom - margen;

        if (estaVisible) return;

        const centroContenedor =
          limiteContenedor.top + limiteContenedor.height / 2;
        const centroTextarea = limiteTextarea.top + limiteTextarea.height / 2;
        const destino =
          contenedor.scrollTop + (centroTextarea - centroContenedor);

        contenedor.scrollTo({
          top: Math.max(0, destino),
          behavior: comportamiento,
        });
      });
    },
    [],
  );

  const programarAjusteMensaje = useCallback(() => {
    cancelarAjustesMensaje();

    const retrasos = [0, 180, 420];
    temporizadoresAjusteRef.current = retrasos.map((retraso, indice) =>
      window.setTimeout(() => {
        asegurarMensajeVisible(indice === 0 ? "auto" : "smooth");
      }, retraso),
    );
  }, [asegurarMensajeVisible, cancelarAjustesMensaje]);

  useEffect(() => {
    return () => {
      if (vistaPrevia) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  useEffect(() => {
    enviandoRef.current = enviando;
  }, [enviando]);

  useEffect(() => {
    if (!modalAbierto) {
      setVistaModal(null);
      return;
    }

    const cuerpo = document.body;
    const documento = document.documentElement;
    const desplazamientoAnterior = window.scrollY;
    const estilosAnteriores = {
      overflow: cuerpo.style.overflow,
      position: cuerpo.style.position,
      top: cuerpo.style.top,
      width: cuerpo.style.width,
      overscrollBehavior: documento.style.overscrollBehavior,
    };

    const actualizarVistaModal = () => {
      const vistaVisual = window.visualViewport;
      setVistaModal({
        alto: Math.round(vistaVisual?.height ?? window.innerHeight),
        desplazamientoSuperior: Math.round(vistaVisual?.offsetTop ?? 0),
        esMovil: window.matchMedia("(max-width: 1023px)").matches,
      });

      if (document.activeElement === mensajeRef.current) {
        programarAjusteMensaje();
      }
    };

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !enviandoRef.current) {
        cerrarModal();
      }
    };

    cuerpo.style.overflow = "hidden";
    cuerpo.style.position = "fixed";
    cuerpo.style.top = `-${desplazamientoAnterior}px`;
    cuerpo.style.width = "100%";
    documento.style.overscrollBehavior = "none";

    actualizarVistaModal();
    window.addEventListener("resize", actualizarVistaModal);
    window.addEventListener("keydown", cerrarConEscape);
    window.visualViewport?.addEventListener("resize", actualizarVistaModal);
    window.visualViewport?.addEventListener("scroll", actualizarVistaModal);

    return () => {
      window.removeEventListener("resize", actualizarVistaModal);
      window.removeEventListener("keydown", cerrarConEscape);
      window.visualViewport?.removeEventListener("resize", actualizarVistaModal);
      window.visualViewport?.removeEventListener("scroll", actualizarVistaModal);
      cancelarAjustesMensaje();

      cuerpo.style.overflow = estilosAnteriores.overflow;
      cuerpo.style.position = estilosAnteriores.position;
      cuerpo.style.top = estilosAnteriores.top;
      cuerpo.style.width = estilosAnteriores.width;
      documento.style.overscrollBehavior = estilosAnteriores.overscrollBehavior;
      window.scrollTo(0, desplazamientoAnterior);
    };
  }, [modalAbierto, cancelarAjustesMensaje, programarAjusteMensaje]);

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

      const ocupabaCupoAntes =
        propuestaPropia?.estado === "CAMBIOS_SOLICITADOS";
      const propuestaActualizada: PropuestaUsuario = {
        estado: data.propuesta?.estado ?? "PENDIENTE",
        motivoDecision: data.propuesta?.motivoDecision ?? null,
        permiteReintento: data.propuesta?.permiteReintento ?? false,
        numeroIntento:
          data.propuesta?.numeroIntento ??
          Math.min(2, (propuestaPropia?.numeroIntento ?? 0) + 1),
      };

      setPropuestaPropia(propuestaActualizada);

      if (!ocupabaCupoAntes) {
        setTotalPropuestas((actual) =>
          Math.min(MAX_PROPUESTAS, actual + 1),
        );
      }

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

  const estadoPropio = propuestaPropia?.estado ?? null;
  const cuposCompletos = totalPropuestas >= MAX_PROPUESTAS;
  const puedeEnviarCorreccion =
    estadoPropio === "CAMBIOS_SOLICITADOS" &&
    (propuestaPropia?.numeroIntento ?? 0) < 2;
  const puedeReintentar =
    estadoPropio === "RECHAZADA" &&
    Boolean(propuestaPropia?.permiteReintento) &&
    (propuestaPropia?.numeroIntento ?? 0) < 2;
  const formularioBloqueado = puedeReintentar && cuposCompletos;
  const tituloFormulario = puedeEnviarCorreccion
    ? "Enviar corrección"
    : puedeReintentar
      ? "Intentar nuevamente"
      : "Enviar propuesta";
  const subtituloFormulario = puedeEnviarCorreccion
    ? "El cupo continúa reservado para ti"
    : puedeReintentar
      ? "El nuevo intento ocupará un cupo disponible"
      : "Colaborar con esta idea";
  const cuposDisponibles = Math.max(0, MAX_PROPUESTAS - totalPropuestas);
  const textoCupos = cuposCompletos
    ? "Cupos completos"
    : `${cuposDisponibles} cupo${cuposDisponibles === 1 ? "" : "s"} disponible${
        cuposDisponibles === 1 ? "" : "s"
      }`;
  const claseSegmento =
    "flex min-h-11 w-full items-center justify-center px-1.5 py-2 text-center text-[9px] font-black leading-tight sm:text-[10px]";
  const claseCupos = `${claseSegmento} bg-white text-slate-600`;
  const claseAccion =
    `${claseSegmento} bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`;

  if (esPropietario) {
    if (variante === "integrada") {
      return (
        <>
          <span className={claseCupos}>{textoCupos}</span>
          <span className={`${claseSegmento} bg-white text-slate-500`}>
            Tu publicación
          </span>
        </>
      );
    }

    return (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p className="text-[10px] font-semibold text-slate-500">
          Esta publicación es tuya.
        </p>
        <span className="text-[10px] font-bold text-slate-600">
          {totalPropuestas}/{MAX_PROPUESTAS} cupos ocupados
        </span>
      </div>
    );
  }

  if (
    estadoPropio &&
    !puedeEnviarCorreccion &&
    !puedeReintentar
  ) {
    if (variante === "integrada") {
      return (
        <>
          <span className={claseCupos}>{textoCupos}</span>
          <button
            type="button"
            disabled
            title={propuestaPropia?.motivoDecision ?? etiquetaEstado(estadoPropio)}
            className={`${claseSegmento} ${claseEstado(estadoPropio)} cursor-default border-0`}
          >
            {etiquetaEstado(estadoPropio)}
          </button>
        </>
      );
    }

    return (
      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${claseEstado(
              estadoPropio,
            )}`}
          >
            {etiquetaEstado(estadoPropio)}
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            {totalPropuestas}/{MAX_PROPUESTAS} cupos ocupados
          </span>
        </div>

        {propuestaPropia?.motivoDecision && (
          <p className="mt-2 border-t border-slate-200 pt-2 text-[10px] leading-4 text-slate-600">
            <span className="font-bold text-slate-700">Motivo:</span>{" "}
            {propuestaPropia.motivoDecision}
          </p>
        )}
      </div>
    );
  }

  if (!sesionActiva) {
    if (variante === "integrada") {
      return (
        <>
          <span className={claseCupos}>{textoCupos}</span>
          <Link href="/iniciar-sesion" className={claseAccion}>
            Enviar propuesta
          </Link>
        </>
      );
    }

    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
        <p className="text-[10px] font-medium text-slate-600">
          Inicia sesión para colaborar con esta idea.
        </p>
        <Link
          href="/iniciar-sesion"
          className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      {variante === "integrada" ? (
        <>
          <span className={claseCupos}>{textoCupos}</span>
          <button
            type="button"
            disabled={
              (puedeEnviarCorreccion || puedeReintentar)
                ? formularioBloqueado
                : cuposCompletos
            }
            title={propuestaPropia?.motivoDecision ?? tituloFormulario}
            onClick={() => {
              setError("");
              setModalAbierto(true);
            }}
            className={claseAccion}
          >
            {(puedeEnviarCorreccion || puedeReintentar)
              ? formularioBloqueado
                ? "Cupos completos"
                : tituloFormulario
              : "Enviar propuesta"}
          </button>
        </>
      ) : puedeEnviarCorreccion || puedeReintentar ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${claseEstado(
                estadoPropio ?? "RECHAZADA",
              )}`}
            >
              {puedeEnviarCorreccion
                ? "Cambios solicitados"
                : "Nuevo intento permitido"}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {totalPropuestas}/{MAX_PROPUESTAS} cupos ocupados
            </span>
          </div>

          {propuestaPropia?.motivoDecision && (
            <p className="mt-2 text-[10px] leading-4 text-slate-600">
              <span className="font-bold text-slate-700">Motivo:</span>{" "}
              {propuestaPropia.motivoDecision}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2">
            <p className="text-[9px] leading-4 text-slate-500">
              {puedeEnviarCorreccion
                ? "Tu cupo sigue reservado. Envía una nueva versión para volver a revisión."
                : formularioBloqueado
                  ? "El cupo se liberó, pero ahora mismo la idea está completa."
                  : "El cupo no está reservado. Puedes participar otra vez mientras haya espacio."}
            </p>
            <button
              type="button"
              disabled={formularioBloqueado}
              onClick={() => {
                setError("");
                setModalAbierto(true);
              }}
              className="rounded-lg border border-emerald-300 bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {formularioBloqueado ? "Sin cupos" : tituloFormulario}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-medium text-slate-500">
            {cuposCompletos
              ? "Esta idea ya tiene sus 3 cupos ocupados."
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
            className="rounded-lg border border-emerald-300 bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {cuposCompletos ? "Cupos completos" : "Enviar propuesta"}
          </button>
        </div>
      )}

      {modalAbierto &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`titulo-propuesta-${ideaId}`}
            className="fixed inset-x-0 z-40 flex items-stretch justify-center bg-slate-950/35 backdrop-blur-sm lg:z-[9999] lg:items-center lg:bg-slate-950/45 lg:p-4"
            style={
              vistaModal?.esMovil
                ? {
                    top: `${vistaModal.desplazamientoSuperior + 48}px`,
                    height: `calc(${vistaModal.alto}px - 48px - 5rem - env(safe-area-inset-bottom))`,
                  }
                : {
                    top: vistaModal?.desplazamientoSuperior ?? 0,
                    height: vistaModal ? `${vistaModal.alto}px` : "100dvh",
                  }
            }
            onPointerDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cerrarModal();
              }
            }}
          >
            <form
              onSubmit={enviarPropuesta}
              className="flex h-full w-full flex-col overflow-hidden rounded-b-3xl border-b border-slate-200 bg-white shadow-2xl shadow-slate-950/20 lg:h-auto lg:max-h-[90dvh] lg:max-w-lg lg:rounded-2xl lg:border"
            >
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur lg:px-5 lg:py-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700 lg:text-xs lg:normal-case lg:tracking-normal">
                    {subtituloFormulario}
                  </p>
                  <h3
                    id={`titulo-propuesta-${ideaId}`}
                    className="mt-1 text-lg font-black text-slate-900 lg:text-xl"
                  >
                    {tituloFormulario}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={enviando}
                  aria-label="Cerrar formulario"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                >
                  ×
                </button>
              </div>

              <div
                ref={contenidoModalRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-6 lg:px-5"
                style={{
                  scrollPaddingTop: "1rem",
                  scrollPaddingBottom: "1.5rem",
                }}
              >
                <div>
                  <label className="text-xs font-bold text-slate-800">
                    {puedeEnviarCorreccion
                      ? "Nueva versión del audio"
                      : "Audio de la propuesta"}
                  </label>
                  <input
                    ref={inputArchivoRef}
                    type="file"
                    accept=".mp3,.wav,.flac,.m4a,.aac,.ogg,.aiff,.aif,.opus,audio/*"
                    onChange={seleccionarAudio}
                    disabled={enviando}
                    className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-[10px] file:font-bold file:text-emerald-700"
                  />
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">
                    Máximo 50 MB y 4 minutos. Se guardará automáticamente como
                    MP3 de 64 kbps.
                  </p>
                </div>

                {archivo && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {archivo.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-500">
                          {formatearTamano(archivo.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={limpiarArchivo}
                        disabled={enviando}
                        className="shrink-0 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-red-700 transition hover:bg-red-50"
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
                      className="text-xs font-bold text-slate-800"
                    >
                      Mensaje opcional
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {mensaje.length}/500
                    </span>
                  </div>
                  <textarea
                    ref={mensajeRef}
                    id={`mensaje-propuesta-${ideaId}`}
                    value={mensaje}
                    onChange={(evento) => setMensaje(evento.target.value)}
                    onFocus={programarAjusteMensaje}
                    onClick={programarAjusteMensaje}
                    maxLength={500}
                    rows={4}
                    disabled={enviando}
                    placeholder={
                      puedeEnviarCorreccion
                        ? "Cuéntale al artista qué corregiste en esta nueva versión."
                        : puedeReintentar
                          ? "Explícale qué cambiaste para este nuevo intento."
                          : "Cuéntale al artista qué agregaste o cómo imaginas la colaboración."
                    }
                    className="mt-2 w-full scroll-mt-4 scroll-mb-6 resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                {avisoAudio && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-700">
                    {avisoAudio}
                  </p>
                )}

                {error && (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700">
                    {error}
                  </p>
                )}

                {enviando && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
                      <span>Subiendo y convirtiendo el audio…</span>
                      <span>{progreso}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-[width]"
                        style={{ width: `${progreso}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:flex lg:justify-end lg:px-5 lg:pb-4 lg:pt-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={enviando}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 lg:px-4"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || !archivo}
                  className="min-h-11 rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45 lg:px-4"
                >
                  {enviando ? "Enviando…" : tituloFormulario}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </>
  );
}
