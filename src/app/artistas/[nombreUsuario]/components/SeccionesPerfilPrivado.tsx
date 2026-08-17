"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import ReproductorAudio from "@/app/components/ReproductorAudio";
import DescripcionPropuestaRecibida from "./DescripcionPropuestaRecibida";
import { useNotificacionesChat } from "@/app/components/useNotificacionesChat";

type EstadoPropuesta =
  | "PENDIENTE"
  | "CAMBIOS_SOLICITADOS"
  | "ACEPTADA"
  | "RECHAZADA"
  | "RECHAZANDO"
  | "EXPIRADA"
  | string;

type ArtistaResumen = {
  id: number;
  nombre: string | null;
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  fotoPerfil: string | null;
};

type PropuestaBase = {
  id: number;
  mensaje: string | null;
  audioUrl: string | null;
  duracionSegundos: number;
  estado: EstadoPropuesta;
  motivoDecision: string | null;
  permiteReintento: boolean;
  numeroIntento: number;
  decisionEn: string | null;
  creadoEn: string;
  conversacionId: number | null;
};

export type PropuestaRecibidaPerfil = PropuestaBase & {
  idea: {
    id: number;
    titulo: string;
  };
  remitente: ArtistaResumen;
};

export type PropuestaEnviadaPerfil = PropuestaBase & {
  idea: {
    id: number;
    titulo: string;
    usuario: ArtistaResumen;
  };
};

export type IdeaRecibidasPerfil = {
  id: number;
  titulo: string;
  portadaUrl: string | null;
};

type PestanaPerfil = "ACTIVAS" | "ENVIADAS" | "RECIBIDAS";

type RespuestaActualizacion = {
  ok: boolean;
  mensaje?: string;
  propuesta?: {
    id: number;
    estado: string;
    audioUrl: string | null;
    conversacionId: number | null;
    motivoDecision: string | null;
    permiteReintento: boolean;
    numeroIntento: number;
    decisionEn: string | null;
  };
};

function nombreArtista(artista: ArtistaResumen) {
  return (
    artista.nombreArtistico?.trim() ||
    artista.nombre?.trim() ||
    artista.nombreUsuario?.trim() ||
    "Artista"
  );
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

function formatearFecha(fecha: string) {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}

function etiquetaEstado(estado: EstadoPropuesta) {
  const etiquetas: Record<string, string> = {
    PENDIENTE: "Pendiente",
    CAMBIOS_SOLICITADOS: "Cambios solicitados",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
    RECHAZANDO: "Procesando",
    EXPIRADA: "Expirada",
  };

  return etiquetas[estado] ?? estado;
}

function claseEstado(estado: EstadoPropuesta) {
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

function textoEstadoEnviado(estado: EstadoPropuesta) {
  if (estado === "ACEPTADA") return "El artista aceptó tu propuesta.";
  if (estado === "CAMBIOS_SOLICITADOS") {
    return "El artista solicitó cambios. Tu cupo continúa reservado.";
  }
  if (estado === "RECHAZADA") return "El artista rechazó tu propuesta.";
  if (estado === "EXPIRADA") {
    return "La idea terminó antes de recibir una respuesta.";
  }
  if (estado === "RECHAZANDO") return "La propuesta se está procesando.";
  return "Esperando la respuesta del artista.";
}

function textoAudioNoDisponible(estado: EstadoPropuesta) {
  if (estado === "RECHAZADA") {
    return "El archivo MP3 fue eliminado al rechazar la propuesta.";
  }
  if (estado === "EXPIRADA") {
    return "El archivo MP3 fue eliminado cuando terminó la idea.";
  }
  return "El archivo de audio ya no está disponible.";
}

function etiquetaCantidad(cantidad: number) {
  return cantidad > 99 ? "99+" : String(cantidad);
}

function Avatar({ artista }: { artista: ArtistaResumen }) {
  const nombre = nombreArtista(artista);

  if (artista.fotoPerfil) {
    return (
      <img
        src={artista.fotoPerfil}
        alt={`Foto de ${nombre}`}
        className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm"
      />
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-[10px] font-black text-emerald-700">
      {iniciales(nombre)}
    </span>
  );
}

function EnlaceArtista({ artista }: { artista: ArtistaResumen }) {
  const nombre = nombreArtista(artista);
  const usuario = artista.nombreUsuario?.trim();

  if (!usuario) {
    return <p className="truncate text-xs font-black text-slate-900">{nombre}</p>;
  }

  return (
    <Link
      href={`/artistas/${encodeURIComponent(usuario)}`}
      className="block truncate text-xs font-black text-slate-900 transition hover:text-emerald-700"
    >
      {nombre}
    </Link>
  );
}

function IconoIdea({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

function IconoEnviar({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <path d="m4 4 16 8-16 8 3-8-3-8Z" />
      <path d="M7 12h13" />
    </svg>
  );
}

function IconoRecibir({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function BotonPestana({
  activa,
  etiqueta,
  cantidad,
  notificaciones = 0,
  icono,
  onClick,
}: {
  activa: boolean;
  etiqueta: string;
  cantidad: number;
  notificaciones?: number;
  icono: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-9 w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border px-1 text-[10px] font-black transition sm:h-10 sm:w-auto sm:shrink-0 sm:gap-2 sm:px-3 sm:text-[11px] ${
        activa
          ? "border-[#FFD400] bg-[#FFD400] text-black shadow-sm"
          : "border-black/15 bg-white text-black/60 hover:border-[#FFD400] hover:bg-[#FFD400]/15 hover:text-black"
      }`}
    >
      <span className="flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-[18px] sm:[&>svg]:w-[18px]">
        {icono}
      </span>
      <span className="min-w-0 whitespace-nowrap text-center">{etiqueta}</span>
      <span
        className={`shrink-0 rounded-full px-1 py-0.5 text-[8px] tabular-nums sm:px-1.5 sm:text-[9px] ${
          activa ? "bg-black/10 text-black" : "bg-black/5 text-black/60"
        }`}
      >
        {cantidad}
      </span>
      {notificaciones > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] text-white shadow-sm">
          {etiquetaCantidad(notificaciones)}
        </span>
      )}
    </button>
  );
}

function EstadoVacio({
  titulo,
  descripcion,
  enlace,
  textoEnlace,
  amarillo = false,
}: {
  titulo: string;
  descripcion: string;
  enlace?: string;
  textoEnlace?: string;
  amarillo?: boolean;
}) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
      <span
        className={
          amarillo
            ? "mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#FFD400] bg-[#FFD400] text-black"
            : "mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700"
        }
      >
        <IconoIdea className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-black text-slate-800">{titulo}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-[10px] leading-4 text-slate-500 sm:text-[11px]">
        {descripcion}
      </p>
      {enlace && textoEnlace && (
        <Link
          href={enlace}
          className={
            amarillo
              ? "mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-[#FFD400] bg-[#FFD400] px-3 text-[10px] font-black text-black transition hover:bg-[#e6bf00]"
              : "mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[10px] font-black text-emerald-700 transition hover:bg-emerald-100"
          }
        >
          {textoEnlace}
        </Link>
      )}
    </div>
  );
}

// FEATMUSIC_SECCIONES_PERFIL_NOTIFICACIONES_V1
function leerPestanaDesdeUrl(): PestanaPerfil | null {
  if (typeof window === "undefined") {
    return null;
  }

  const seccion = new URLSearchParams(window.location.search)
    .get("seccion")
    ?.trim()
    .toLowerCase();

  if (seccion === "enviadas") return "ENVIADAS";
  if (seccion === "recibidas") return "RECIBIDAS";
  if (seccion === "activas") return "ACTIVAS";

  return null;
}

function valorUrlPestana(pestana: PestanaPerfil) {
  if (pestana === "ENVIADAS") return "enviadas";
  if (pestana === "RECIBIDAS") return "recibidas";
  return "activas";
}

export default function SeccionesPerfilPrivado({
  ideasActivas,
  ideasRecibidasIniciales,
  cantidadIdeasActivas,
  propuestasRecibidasIniciales,
  propuestasEnviadasIniciales,
}: {
  ideasActivas: ReactNode;
  ideasRecibidasIniciales: IdeaRecibidasPerfil[];
  cantidadIdeasActivas: number;
  propuestasRecibidasIniciales: PropuestaRecibidaPerfil[];
  propuestasEnviadasIniciales: PropuestaEnviadaPerfil[];
}) {
  const [pestana, setPestana] = useState<PestanaPerfil>("ACTIVAS");
  const [recibidas, setRecibidas] = useState(propuestasRecibidasIniciales);
  const [enviadas, setEnviadas] = useState(propuestasEnviadasIniciales);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<{
    propuestaId: number;
    accion: "SOLICITAR_CAMBIOS" | "RECHAZAR";
    numeroIntento: number;
  } | null>(null);
  const [motivo, setMotivo] = useState("");
  const [permiteReintento, setPermiteReintento] = useState(false);
  const { porConversacion } = useNotificacionesChat();

  const propuestasPorIdea = useMemo(() => {
    const mapa = new Map<number, PropuestaRecibidaPerfil[]>();

    for (const propuesta of recibidas) {
      const actuales = mapa.get(propuesta.idea.id) ?? [];
      actuales.push(propuesta);
      mapa.set(propuesta.idea.id, actuales);
    }

    return mapa;
  }, [recibidas]);

  useEffect(() => {
    const aplicarPestanaDesdeUrl = () => {
      const pestanaUrl = leerPestanaDesdeUrl();

      if (pestanaUrl) {
        setPestana(pestanaUrl);
        setError("");
      }
    };

    aplicarPestanaDesdeUrl();
    window.addEventListener("popstate", aplicarPestanaDesdeUrl);

    return () => {
      window.removeEventListener("popstate", aplicarPestanaDesdeUrl);
    };
  }, []);

  const mensajesRecibidos = useMemo(
    () =>
      recibidas.reduce(
        (total, propuesta) =>
          total +
          (propuesta.conversacionId
            ? porConversacion[propuesta.conversacionId] ?? 0
            : 0),
        0,
      ),
    [recibidas, porConversacion],
  );

  const mensajesEnviados = useMemo(
    () =>
      enviadas.reduce(
        (total, propuesta) =>
          total +
          (propuesta.conversacionId
            ? porConversacion[propuesta.conversacionId] ?? 0
            : 0),
        0,
      ),
    [enviadas, porConversacion],
  );

  function cambiarPestana(nueva: PestanaPerfil) {
    setPestana(nueva);
    setError("");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("seccion", valorUrlPestana(nueva));
      window.history.replaceState(
        window.history.state,
        "",
        url.pathname + url.search + url.hash,
      );
    }
  }

  async function enviarDecision(
    propuestaId: number,
    payload:
      | { accion: "ACEPTAR" }
      | { accion: "SOLICITAR_CAMBIOS"; motivo: string }
      | { accion: "RECHAZAR"; motivo: string; permiteReintento: boolean },
  ) {
    if (procesandoId !== null) return;

    setError("");
    setProcesandoId(propuestaId);

    try {
      const response = await fetch(`/api/propuestas/${propuestaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as RespuestaActualizacion;

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje || "No se pudo actualizar la propuesta.");
      }

      setRecibidas((actuales) =>
        actuales.map((propuesta) =>
          propuesta.id === propuestaId
            ? {
                ...propuesta,
                estado: data.propuesta?.estado ?? propuesta.estado,
                audioUrl: data.propuesta
                  ? data.propuesta.audioUrl
                  : propuesta.audioUrl,
                conversacionId: data.propuesta
                  ? data.propuesta.conversacionId
                  : propuesta.conversacionId,
                motivoDecision: data.propuesta
                  ? data.propuesta.motivoDecision
                  : propuesta.motivoDecision,
                permiteReintento: data.propuesta
                  ? data.propuesta.permiteReintento
                  : propuesta.permiteReintento,
                numeroIntento:
                  data.propuesta?.numeroIntento ?? propuesta.numeroIntento,
                decisionEn: data.propuesta
                  ? data.propuesta.decisionEn
                  : propuesta.decisionEn,
              }
            : propuesta,
        ),
      );

      setModal(null);
      setMotivo("");
      setPermiteReintento(false);
    } catch (errorActualizacion) {
      setError(
        errorActualizacion instanceof Error
          ? errorActualizacion.message
          : "No se pudo actualizar la propuesta.",
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function cancelarPropuesta(propuestaId: number) {
    if (procesandoId !== null) return;

    const confirmada = window.confirm(
      "¿Quieres cancelar esta propuesta? El audio enviado se eliminará y podrás enviar una versión nueva.",
    );

    if (!confirmada) return;

    setError("");
    setProcesandoId(propuestaId);

    try {
      const response = await fetch(`/api/propuestas/${propuestaId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as RespuestaActualizacion;

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje || "No se pudo cancelar la propuesta.");
      }

      setEnviadas((actuales) =>
        actuales.filter((propuesta) => propuesta.id !== propuestaId),
      );
    } catch (errorCancelacion) {
      setError(
        errorCancelacion instanceof Error
          ? errorCancelacion.message
          : "No se pudo cancelar la propuesta.",
      );
    } finally {
      setProcesandoId(null);
    }
  }

  async function confirmarModal() {
    if (!modal || procesandoId !== null) return;

    const motivoLimpio = motivo.trim();
    if (motivoLimpio.length < 3) {
      setError("Escribe un motivo de al menos 3 caracteres.");
      return;
    }

    if (modal.accion === "SOLICITAR_CAMBIOS") {
      await enviarDecision(modal.propuestaId, {
        accion: "SOLICITAR_CAMBIOS",
        motivo: motivoLimpio,
      });
      return;
    }

    await enviarDecision(modal.propuestaId, {
      accion: "RECHAZAR",
      motivo: motivoLimpio,
      permiteReintento: modal.numeroIntento < 2 && permiteReintento,
    });
  }

  return (
    <div className="min-w-0">
      <div className="grid w-full grid-cols-3 gap-1.5 px-1 pb-1 sm:flex sm:w-auto sm:items-center sm:gap-2 sm:overflow-visible lg:px-0">
        <BotonPestana
          activa={pestana === "ACTIVAS"}
          etiqueta="Activas"
          cantidad={cantidadIdeasActivas}
          icono={<IconoIdea />}
          onClick={() => cambiarPestana("ACTIVAS")}
        />
        <BotonPestana
          activa={pestana === "ENVIADAS"}
          etiqueta="Enviadas"
          cantidad={enviadas.length}
          notificaciones={mensajesEnviados}
          icono={<IconoEnviar />}
          onClick={() => cambiarPestana("ENVIADAS")}
        />
        <BotonPestana
          activa={pestana === "RECIBIDAS"}
          etiqueta="Recibidas"
          cantidad={recibidas.length}
          notificaciones={mensajesRecibidos}
          icono={<IconoRecibir />}
          onClick={() => cambiarPestana("RECIBIDAS")}
        />
      </div>

      {pestana === "ACTIVAS" && (
        <div className="mt-3 sm:mt-4">
          <div className="mb-3 px-1">
            <p className="text-[10px] font-semibold text-slate-500 sm:text-[11px]">
              Ideas que has publicado y siguen activas.
            </p>
          </div>

          {ideasActivas}
        </div>
      )}

      {pestana === "ENVIADAS" && (
        <div className="mt-3 sm:mt-4">
          <div className="mb-3 px-1">
            <p className="text-[10px] font-semibold text-slate-500 sm:text-[11px]">
              Propuestas que enviaste a las ideas de otros artistas.
            </p>
          </div>

          {error && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-semibold text-red-700 sm:text-[10px]">
              {error}
            </p>
          )}

          {enviadas.length === 0 ? (
            <EstadoVacio
              titulo="No has enviado propuestas"
              descripcion="Explora las ideas activas de otros artistas y envía tu audio para comenzar una colaboración."
              amarillo
            />
          ) : (
            <div className="grid gap-2.5">
              {enviadas.map((propuesta, indice) => {
                const destinatario = propuesta.idea.usuario;
                const mensajes = propuesta.conversacionId
                  ? porConversacion[propuesta.conversacionId] ?? 0
                  : 0;
                const rutaIdea = destinatario.nombreUsuario?.trim()
                  ? `/artistas/${encodeURIComponent(
                      destinatario.nombreUsuario.trim(),
                    )}#idea-${propuesta.idea.id}`
                  : null;

                return (
                  <article
                    key={propuesta.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
                  >
                    <div className="p-3 sm:p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar artista={destinatario} />
                          <div className="min-w-0">
                            <EnlaceArtista artista={destinatario} />
                            {rutaIdea ? (
                              <Link
                                href={rutaIdea}
                                className="mt-0.5 block truncate text-[9px] font-semibold text-emerald-700 hover:underline sm:text-[10px]"
                              >
                                Para “{propuesta.idea.titulo}”
                              </Link>
                            ) : (
                              <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-[10px]">
                                Para “{propuesta.idea.titulo}”
                              </p>
                            )}
                            <p className="mt-0.5 text-[8px] text-slate-400 sm:text-[9px]">
                              {formatearFecha(propuesta.creadoEn)} · Intento {propuesta.numeroIntento}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[8px] font-bold ${claseEstado(
                              propuesta.estado,
                            )}`}
                          >
                            {etiquetaEstado(propuesta.estado)}
                          </span>
                          {mensajes > 0 && (
                            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] font-black text-white">
                              {etiquetaCantidad(mensajes)} nuevo{mensajes === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-2.5 rounded-lg bg-slate-50 px-2.5 py-2 text-[9px] font-semibold leading-4 text-slate-600 sm:text-[10px]">
                        {textoEstadoEnviado(propuesta.estado)}
                      </p>

                      {propuesta.mensaje && (
                        <p className="mt-2.5 whitespace-pre-wrap text-[9px] leading-4 text-slate-600 sm:text-[10px]">
                          {propuesta.mensaje}
                        </p>
                      )}

                      {propuesta.motivoDecision && propuesta.estado !== "PENDIENTE" && (
                        <div className="mt-2.5 border-l-2 border-sky-300 pl-2.5">
                          <p className="text-[8px] font-black uppercase tracking-[0.12em] text-sky-700">
                            Respuesta del artista
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-[9px] leading-4 text-slate-600 sm:text-[10px]">
                            {propuesta.motivoDecision}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 border-t border-slate-100 pt-3">
                        {propuesta.audioUrl ? (
                          <ReproductorAudio
                            id={`perfil-propuesta-enviada-${propuesta.id}`}
                            src={propuesta.audioUrl}
                            titulo={`Propuesta para ${nombreArtista(destinatario)}`}
                            duracionSegundos={propuesta.duracionSegundos}
                            numero={indice + 1}
                            className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-8 [&_button]:w-8"
                          />
                        ) : (
                          <p className="text-[9px] font-semibold text-slate-500">
                            {textoAudioNoDisponible(propuesta.estado)}
                          </p>
                        )}
                      </div>
                    </div>

                    {(rutaIdea ||
                      propuesta.conversacionId ||
                      propuesta.estado === "PENDIENTE") && (
                      <div className="flex min-h-[44px] border-t border-slate-200 bg-white">
                        {rutaIdea && (
                          <Link
                            href={rutaIdea}
                            className={`flex min-w-0 flex-1 items-center justify-center px-2 py-3 text-center text-[9px] font-black text-slate-600 transition hover:bg-slate-50 hover:text-emerald-700 ${
                              propuesta.conversacionId ||
                              propuesta.estado === "PENDIENTE"
                                ? "border-r border-slate-200"
                                : ""
                            }`}
                          >
                            Ver idea
                          </Link>
                        )}
                        {propuesta.conversacionId && (
                          <Link
                            href={`/mensajes/${propuesta.conversacionId}`}
                            className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2 py-3 text-center text-[9px] font-black text-emerald-700 transition hover:bg-emerald-50 ${
                              propuesta.estado === "PENDIENTE"
                                ? "border-r border-slate-200"
                                : ""
                            }`}
                          >
                            Abrir chat
                            {mensajes > 0 && (
                              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] text-white">
                                {etiquetaCantidad(mensajes)}
                              </span>
                            )}
                          </Link>
                        )}
                        {propuesta.estado === "PENDIENTE" && (
                          <button
                            type="button"
                            disabled={procesandoId !== null}
                            onClick={() => cancelarPropuesta(propuesta.id)}
                            className="flex min-w-0 flex-1 items-center justify-center px-2 py-3 text-center text-[9px] font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {procesandoId === propuesta.id
                              ? "Cancelando…"
                              : "Cancelar envío"}
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {pestana === "RECIBIDAS" && (
        <div className="mt-3 sm:mt-4">
          <div className="mb-3 px-1">
            <p className="text-[10px] font-semibold text-slate-500 sm:text-[11px]">
              Tus ideas publicadas y las propuestas que ha recibido cada una.
            </p>
          </div>

          {error && (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-semibold text-red-700 sm:text-[10px]">
              {error}
            </p>
          )}

          {ideasRecibidasIniciales.length === 0 ? (
            <EstadoVacio
              titulo="Aún no tienes ideas activas"
              descripcion="Publica una idea y aquí podrás ver las propuestas agrupadas por canción."
              amarillo
            />
          ) : (
            <div className="grid gap-3">
              {ideasRecibidasIniciales.map((idea) => {
                const propuestasIdea = propuestasPorIdea.get(idea.id) ?? [];
                const portada = idea.portadaUrl?.trim() || null;

                return (
                  <article
                    key={idea.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
                  >
                    <div
                      className={`relative overflow-hidden px-3 py-3.5 sm:px-4 sm:py-4 ${
                        portada ? "bg-black" : "bg-slate-950"
                      }`}
                    >
                      {portada && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
                        >
                          <img
                            src={portada}
                            alt=""
                            className="h-full w-full object-cover object-center"
                            loading="lazy"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.96) 24%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.30) 78%, rgba(0,0,0,0.12) 100%)",
                            }}
                          />
                        </div>
                      )}

                      <div className="relative z-10 flex min-w-0 items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-yellow-400 sm:text-[9px]">
                            Idea publicada
                          </p>
                          <h3 className="mt-0.5 truncate text-sm font-black text-white sm:text-base">
                            {idea.titulo}
                          </h3>
                        </div>

                        <span className="shrink-0 rounded-full border border-yellow-400 bg-yellow-400 px-2.5 py-1 text-[8px] font-black text-black sm:text-[9px]">
                          {propuestasIdea.length} {propuestasIdea.length === 1 ? "propuesta" : "propuestas"}
                        </span>
                      </div>
                    </div>

                    {propuestasIdea.length === 0 ? (
                      <div className="px-4 py-8 text-center sm:py-9">
                        <p className="text-[11px] font-black text-slate-700 sm:text-xs">
                          No has recibido ninguna propuesta
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                          Cuando otro artista envíe una propuesta a esta idea, aparecerá aquí.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {propuestasIdea.map((propuesta, indicePropuesta) => {
                          const remitente = propuesta.remitente;
                          const mensajes = propuesta.conversacionId
                            ? porConversacion[propuesta.conversacionId] ?? 0
                            : 0;
                          const procesando = procesandoId === propuesta.id;

                          return (
                            <div
                              key={propuesta.id}
                              className={indicePropuesta > 0 ? "border-t border-slate-200" : ""}
                            >
                              <div className="p-3 sm:p-3.5">
                                <div className="flex items-start justify-between gap-2.5">
                                  <div className="flex min-w-0 items-start gap-2.5">
                                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-yellow-400 bg-yellow-400 text-[9px] font-black text-black">
                                      {indicePropuesta + 1}
                                    </span>

                                    <div className="min-w-0">
                                      <p className="truncate text-[11px] font-black text-slate-900 sm:text-xs">
                                        Propuesta de {nombreArtista(remitente)}
                                      </p>
                                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                        <span
                                          className={`rounded-full border px-2 py-0.5 text-[7px] font-bold sm:text-[8px] ${claseEstado(
                                            propuesta.estado,
                                          )}`}
                                        >
                                          {etiquetaEstado(propuesta.estado)}
                                        </span>
                                        <span className="text-[8px] text-slate-400 sm:text-[9px]">
                                          {formatearFecha(propuesta.creadoEn)}
                                        </span>
                                        <span className="text-[8px] text-slate-400 sm:text-[9px]">
                                          · Intento {propuesta.numeroIntento}
                                        </span>
                                        {mensajes > 0 && (
                                          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] font-black text-white">
                                            {etiquetaCantidad(mensajes)} nuevo{mensajes === 1 ? "" : "s"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <DescripcionPropuestaRecibida
                                    tituloIdea={idea.titulo}
                                    nombreRemitente={nombreArtista(remitente)}
                                    nombreUsuario={remitente.nombreUsuario}
                                    fecha={formatearFecha(propuesta.creadoEn)}
                                    descripcion={propuesta.mensaje}
                                  />
                                </div>

                                {propuesta.motivoDecision && propuesta.estado !== "PENDIENTE" && (
                                  <div className="mt-2.5 border-l-2 border-sky-300 pl-2.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.12em] text-sky-700">
                                      Motivo enviado
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-[9px] leading-4 text-slate-600 sm:text-[10px]">
                                      {propuesta.motivoDecision}
                                    </p>
                                  </div>
                                )}

                                <div className="mt-3 border-t border-slate-100 pt-2.5">
                                  {propuesta.audioUrl ? (
                                    <ReproductorAudio
                                      id={`perfil-propuesta-recibida-${propuesta.id}`}
                                      src={propuesta.audioUrl}
                                      titulo="Audio de la propuesta"
                                      duracionSegundos={propuesta.duracionSegundos}
                                      numero={indicePropuesta + 1}
                                      className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-8 [&_button]:w-8"
                                    />
                                  ) : (
                                    <p className="text-[9px] font-semibold text-slate-500">
                                      {textoAudioNoDisponible(propuesta.estado)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {propuesta.estado === "PENDIENTE" ? (
                                <div className="flex min-h-[44px] border-t border-slate-200 bg-white">
                                  <button
                                    type="button"
                                    disabled={procesando}
                                    onClick={() => {
                                      setError("");
                                      setMotivo("");
                                      setPermiteReintento(false);
                                      setModal({
                                        propuestaId: propuesta.id,
                                        accion: "RECHAZAR",
                                        numeroIntento: propuesta.numeroIntento,
                                      });
                                    }}
                                    className="flex min-w-0 flex-1 items-center justify-center border-r border-slate-200 px-1.5 py-2 text-center text-[8px] font-black leading-tight text-red-700 transition hover:bg-red-50 disabled:opacity-50 sm:text-[9px]"
                                  >
                                    Rechazar
                                  </button>
                                  {propuesta.numeroIntento < 2 && (
                                    <button
                                      type="button"
                                      disabled={procesando}
                                      onClick={() => {
                                        setError("");
                                        setMotivo("");
                                        setPermiteReintento(false);
                                        setModal({
                                          propuestaId: propuesta.id,
                                          accion: "SOLICITAR_CAMBIOS",
                                          numeroIntento: propuesta.numeroIntento,
                                        });
                                      }}
                                      className="flex min-w-0 flex-1 items-center justify-center border-r border-slate-200 px-1.5 py-2 text-center text-[8px] font-black leading-tight text-sky-700 transition hover:bg-sky-50 disabled:opacity-50 sm:text-[9px]"
                                    >
                                      Solicitar cambios
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    disabled={procesando}
                                    onClick={() =>
                                      enviarDecision(propuesta.id, { accion: "ACEPTAR" })
                                    }
                                    className="flex min-w-0 flex-1 items-center justify-center px-1.5 py-2 text-center text-[8px] font-black leading-tight text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 sm:text-[9px]"
                                  >
                                    {procesando ? "Procesando…" : "Aceptar"}
                                  </button>
                                </div>
                              ) : propuesta.estado === "ACEPTADA" ? (
                                <div className="flex min-h-[44px] border-t border-slate-200 bg-white">
                                  {propuesta.audioUrl && (
                                    <a
                                      href={`/api/propuestas/${propuesta.id}/descargar`}
                                      className={`flex min-w-0 flex-1 items-center justify-center px-2 py-3 text-center text-[9px] font-black text-sky-700 transition hover:bg-sky-50 ${
                                        propuesta.conversacionId
                                          ? "border-r border-slate-200"
                                          : ""
                                      }`}
                                    >
                                      Descargar MP3
                                    </a>
                                  )}
                                  {propuesta.conversacionId && (
                                    <Link
                                      href={`/mensajes/${propuesta.conversacionId}`}
                                      className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-2 py-3 text-center text-[9px] font-black text-emerald-700 transition hover:bg-emerald-50"
                                    >
                                      Abrir chat
                                      {mensajes > 0 && (
                                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] text-white">
                                          {etiquetaCantidad(mensajes)}
                                        </span>
                                      )}
                                    </Link>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
            <h3 className="text-base font-black text-slate-900">
              {modal.accion === "RECHAZAR"
                ? "Rechazar propuesta"
                : "Solicitar cambios"}
            </h3>
            <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-[11px]">
              Explica claramente el motivo para que el otro artista entienda tu decisión.
            </p>

            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              maxLength={500}
              rows={5}
              autoFocus
              className="mt-4 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Escribe el motivo..."
            />

            {modal.accion === "RECHAZAR" && modal.numeroIntento < 2 && (
              <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={permiteReintento}
                  onChange={(event) => setPermiteReintento(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />
                <span className="text-[10px] leading-4 text-slate-600">
                  Permitir que este artista envíe un nuevo intento.
                </span>
              </label>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={procesandoId !== null}
                onClick={() => {
                  setModal(null);
                  setMotivo("");
                  setPermiteReintento(false);
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={procesandoId !== null}
                onClick={confirmarModal}
                className="h-9 rounded-lg border border-emerald-600 bg-emerald-600 px-3 text-[10px] font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {procesandoId !== null ? "Procesando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
