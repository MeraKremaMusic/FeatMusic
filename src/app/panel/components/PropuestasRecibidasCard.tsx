"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

import ReproductorAudio from "@/app/components/ReproductorAudio";
import { useNotificacionesChat } from "@/app/components/useNotificacionesChat";

type EstadoPropuesta =
  | "PENDIENTE"
  | "CAMBIOS_SOLICITADOS"
  | "ACEPTADA"
  | "RECHAZADA"
  | "EXPIRADA";
type PestanaPropuestas = "RECIBIDAS" | "ENVIADAS";

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
  estado: EstadoPropuesta | string;
  motivoDecision: string | null;
  permiteReintento: boolean;
  numeroIntento: number;
  decisionEn: string | null;
  creadoEn: string;
  conversacionId: number | null;
};

export type PropuestaPanel = PropuestaBase & {
  idea: {
    id: number;
    titulo: string;
  };
  remitente: ArtistaResumen;
};

export type PropuestaEnviadaPanel = PropuestaBase & {
  idea: {
    id: number;
    titulo: string;
    usuario: ArtistaResumen;
  };
};

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

function etiquetaEstado(estado: string) {
  const etiquetas: Record<string, string> = {
    PENDIENTE: "Pendiente",
    CAMBIOS_SOLICITADOS: "Cambios solicitados",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
    EXPIRADA: "Expirada",
  };

  return etiquetas[estado] ?? estado;
}

function claseEstado(estado: string) {
  if (estado === "ACEPTADA") {
    return "border-emerald-400/25 bg-emerald-500/10 text-emerald-200";
  }

  if (estado === "CAMBIOS_SOLICITADOS") {
    return "border-sky-400/25 bg-sky-500/10 text-sky-200";
  }

  if (estado === "RECHAZADA" || estado === "EXPIRADA") {
    return "border-red-400/20 bg-red-500/10 text-red-200";
  }

  return "border-amber-400/25 bg-amber-500/10 text-amber-200";
}

function textoEstadoEnviado(estado: string) {
  if (estado === "ACEPTADA") {
    return "El artista aceptó tu propuesta.";
  }

  if (estado === "CAMBIOS_SOLICITADOS") {
    return "El artista solicitó cambios. Tu cupo continúa reservado.";
  }

  if (estado === "RECHAZADA") {
    return "El artista rechazó tu propuesta.";
  }

  if (estado === "EXPIRADA") {
    return "La idea terminó antes de recibir una respuesta. El audio fue eliminado.";
  }

  if (estado === "RECHAZANDO") {
    return "La propuesta se está procesando.";
  }

  return "Esperando la respuesta del artista.";
}

function textoAudioNoDisponible(estado: string) {
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

function sumarMensajesConversacionesUnicas(
  propuestas: Array<{ conversacionId: number | null }>,
  porConversacion: Record<number, number>,
) {
  const ids = new Set<number>();

  for (const propuesta of propuestas) {
    if (propuesta.conversacionId) {
      ids.add(propuesta.conversacionId);
    }
  }

  return Array.from(ids).reduce(
    (total, conversacionId) =>
      total + (porConversacion[conversacionId] ?? 0),
    0,
  );
}

function IconoMensaje({
  className = "h-3 w-3",
}: {
  className?: string;
}) {
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
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

function IconoDescargar({
  className = "h-3 w-3",
}: {
  className?: string;
}) {
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

function IconoChat({
  className = "h-3 w-3",
}: {
  className?: string;
}) {
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
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  );
}

function IconoPropuestas() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="3" />
      <circle cx="16.5" cy="9.5" r="2.5" />
      <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M13.5 17a4.5 4.5 0 0 1 8 3" />
    </svg>
  );
}

function AvatarArtista({
  artista,
  nombre,
}: {
  artista: ArtistaResumen;
  nombre: string;
}) {
  if (artista.fotoPerfil) {
    return (
      <img
        src={artista.fotoPerfil}
        alt={`Foto de ${nombre}`}
        className="h-10 w-10 shrink-0 rounded-xl border border-white/[0.09] object-cover shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
      />
    );
  }

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-[10px] font-black text-violet-200 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
      {iniciales(nombre)}
    </span>
  );
}

function NombreConEnlace({
  artista,
  nombre,
}: {
  artista: ArtistaResumen;
  nombre: string;
}) {
  const usuario = artista.nombreUsuario?.trim();

  if (!usuario) {
    return (
      <p className="truncate text-[11px] font-black text-zinc-100 sm:text-xs">
        {nombre}
      </p>
    );
  }

  return (
    <Link
      href={`/artistas/${encodeURIComponent(usuario)}`}
      className="block truncate text-[11px] font-black text-zinc-100 transition hover:text-violet-200 sm:text-xs"
    >
      {nombre}
    </Link>
  );
}

export default function PropuestasRecibidasCard({
  propuestasIniciales,
  propuestasEnviadasIniciales,
}: {
  propuestasIniciales: PropuestaPanel[];
  propuestasEnviadasIniciales: PropuestaEnviadaPanel[];
}) {
  const [pestana, setPestana] = useState<PestanaPropuestas>("RECIBIDAS");
  const [propuestas, setPropuestas] = useState(propuestasIniciales);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [modalDecision, setModalDecision] = useState<{
    propuestaId: number;
    accion: "SOLICITAR_CAMBIOS" | "RECHAZAR";
    numeroIntento: number;
  } | null>(null);
  const [motivoDecision, setMotivoDecision] = useState("");
  const [permiteReintento, setPermiteReintento] = useState(false);
  const { total: mensajesNoLeidos, porConversacion } = useNotificacionesChat();

  useEffect(() => {
    if (!modalDecision) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [modalDecision]);

  const pendientesRecibidas = useMemo(
    () => propuestas.filter((propuesta) => propuesta.estado === "PENDIENTE").length,
    [propuestas],
  );

  const pendientesEnviadas = useMemo(
    () =>
      propuestasEnviadasIniciales.filter(
        (propuesta) => propuesta.estado === "PENDIENTE",
      ).length,
    [propuestasEnviadasIniciales],
  );

  const mensajesNoLeidosRecibidos = useMemo(
    () => sumarMensajesConversacionesUnicas(propuestas, porConversacion),
    [propuestas, porConversacion],
  );

  const mensajesNoLeidosEnviados = useMemo(
    () =>
      sumarMensajesConversacionesUnicas(
        propuestasEnviadasIniciales,
        porConversacion,
      ),
    [propuestasEnviadasIniciales, porConversacion],
  );

  const mostrandoRecibidas = pestana === "RECIBIDAS";
  const cantidadActiva = mostrandoRecibidas
    ? propuestas.length
    : propuestasEnviadasIniciales.length;
  const pendientesActivas = mostrandoRecibidas
    ? pendientesRecibidas
    : pendientesEnviadas;

  function abrirModalDecision(
    propuestaId: number,
    accion: "SOLICITAR_CAMBIOS" | "RECHAZAR",
    numeroIntento: number,
  ) {
    setError("");
    setMotivoDecision("");
    setPermiteReintento(false);
    setModalDecision({ propuestaId, accion, numeroIntento });
  }

  function cerrarModalDecision() {
    if (procesandoId !== null) return;
    setModalDecision(null);
    setMotivoDecision("");
    setPermiteReintento(false);
  }

  async function enviarDecision(
    propuestaId: number,
    payload:
      | { accion: "ACEPTAR" }
      | { accion: "SOLICITAR_CAMBIOS"; motivo: string }
      | {
          accion: "RECHAZAR";
          motivo: string;
          permiteReintento: boolean;
        },
  ) {
    if (procesandoId !== null) return;

    setError("");
    setProcesandoId(propuestaId);

    try {
      const response = await fetch(`/api/propuestas/${propuestaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as RespuestaActualizacion;

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje || "No se pudo actualizar la propuesta.");
      }

      setPropuestas((actuales) =>
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

      setModalDecision(null);
      setMotivoDecision("");
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

  async function confirmarModalDecision() {
    if (!modalDecision || procesandoId !== null) return;

    const motivo = motivoDecision.trim();

    if (motivo.length < 3) {
      setError("Escribe un motivo de al menos 3 caracteres.");
      return;
    }

    if (modalDecision.accion === "SOLICITAR_CAMBIOS") {
      await enviarDecision(modalDecision.propuestaId, {
        accion: "SOLICITAR_CAMBIOS",
        motivo,
      });
      return;
    }

    await enviarDecision(modalDecision.propuestaId, {
      accion: "RECHAZAR",
      motivo,
      permiteReintento:
        modalDecision.numeroIntento < 2 && permiteReintento,
    });
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(0,0,0,0.22)_48%,rgba(139,92,246,0.035))] shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-violet-500/[0.08] blur-3xl" />
      </div>

      <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-3.5 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <IconoPropuestas />
            {mensajesNoLeidos > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full border border-[#100d15] bg-red-500 px-1 text-[7px] font-black leading-none text-white shadow-lg shadow-red-950/50">
                {etiquetaCantidad(mensajesNoLeidos)}
              </span>
            )}
          </span>

          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-violet-300">
              Colaboraciones
            </p>
            <h2 className="mt-0.5 truncate text-base font-black text-white">
              Propuestas
            </h2>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/mensajes"
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.025] px-2.5 text-[8px] font-black text-zinc-400 transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200 sm:text-[9px]"
          >
            <IconoChat />
            Mensajes
          </Link>

          <span className="rounded-full border border-violet-400/20 bg-violet-500/[0.09] px-2 py-1 text-[8px] font-black tabular-nums text-violet-200 sm:text-[9px]">
            {cantidadActiva}
          </span>
        </div>
      </div>

      <div className="relative grid shrink-0 grid-cols-2 border-b border-white/[0.07]">
        <button
          type="button"
          onClick={() => {
            setPestana("RECIBIDAS");
            setError("");
          }}
          className={`relative flex min-h-10 items-center justify-center gap-1.5 px-3 text-[9px] font-black transition sm:text-[10px] ${
            mostrandoRecibidas
              ? "text-violet-100"
              : "text-zinc-600 hover:text-zinc-300"
          }`}
        >
          Recibidas
          <span
            className={`rounded-full px-1.5 py-0.5 text-[7px] ${
              mostrandoRecibidas
                ? "bg-violet-500/15 text-violet-200"
                : "bg-white/[0.04] text-zinc-600"
            }`}
          >
            {propuestas.length}
          </span>
          {mensajesNoLeidosRecibidos > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] text-white">
              {etiquetaCantidad(mensajesNoLeidosRecibidos)}
            </span>
          )}
          {mostrandoRecibidas && (
            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-violet-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setPestana("ENVIADAS");
            setError("");
          }}
          className={`relative flex min-h-10 items-center justify-center gap-1.5 px-3 text-[9px] font-black transition sm:text-[10px] ${
            !mostrandoRecibidas
              ? "text-violet-100"
              : "text-zinc-600 hover:text-zinc-300"
          }`}
        >
          Enviadas
          <span
            className={`rounded-full px-1.5 py-0.5 text-[7px] ${
              !mostrandoRecibidas
                ? "bg-violet-500/15 text-violet-200"
                : "bg-white/[0.04] text-zinc-600"
            }`}
          >
            {propuestasEnviadasIniciales.length}
          </span>
          {mensajesNoLeidosEnviados > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] text-white">
              {etiquetaCantidad(mensajesNoLeidosEnviados)}
            </span>
          )}
          {!mostrandoRecibidas && (
            <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-violet-400" />
          )}
        </button>
      </div>

      <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.05] px-3.5 py-2 sm:px-4">
        <p className="text-[8px] font-semibold text-zinc-600 sm:text-[9px]">
          {pendientesActivas} pendiente{pendientesActivas === 1 ? "" : "s"} ·{" "}
          {cantidadActiva} total
        </p>

        {mensajesNoLeidos > 0 && (
          <p className="text-[8px] font-bold text-red-300 sm:text-[9px]">
            {mensajesNoLeidos} mensaje
            {mensajesNoLeidos === 1 ? "" : "s"} sin leer
          </p>
        )}
      </div>

      {error && mostrandoRecibidas && (
        <p className="relative mx-3.5 mt-2.5 shrink-0 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-3 py-2 text-[9px] text-red-200 sm:mx-4 sm:text-[10px]">
          {error}
        </p>
      )}

      {mostrandoRecibidas ? (
        propuestas.length === 0 ? (
          <div className="relative flex flex-1 items-center justify-center px-5 py-8">
            <div className="flex max-w-xs flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <IconoPropuestas />
              </div>
              <p className="mt-4 text-sm font-black text-zinc-200">
                No has recibido propuestas
              </p>
              <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                Cuando otro artista envíe un audio a una de tus ideas,
                aparecerá aquí para que puedas escucharlo.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
            <div className="divide-y divide-white/[0.07]">
              {propuestas.map((propuesta, indice) => {
                const nombre = nombreArtista(propuesta.remitente);
                const procesando = procesandoId === propuesta.id;
                const mensajesPendientes = propuesta.conversacionId
                  ? porConversacion[propuesta.conversacionId] ?? 0
                  : 0;

                return (
                  <article
                    key={propuesta.id}
                    className={`relative px-3.5 py-3.5 transition sm:px-4 ${
                      mensajesPendientes > 0
                        ? "bg-violet-500/[0.045]"
                        : "hover:bg-white/[0.012]"
                    }`}
                  >
                    {mensajesPendientes > 0 && (
                      <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-violet-400" />
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <AvatarArtista
                          artista={propuesta.remitente}
                          nombre={nombre}
                        />

                        <div className="min-w-0">
                          <NombreConEnlace
                            artista={propuesta.remitente}
                            nombre={nombre}
                          />
                          <p className="mt-0.5 truncate text-[8px] font-medium text-zinc-600 sm:text-[9px]">
                            Para “{propuesta.idea.titulo}”
                          </p>
                          <p className="mt-0.5 truncate text-[8px] text-zinc-700 sm:text-[9px]">
                            {formatearFecha(propuesta.creadoEn)}
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

                        {mensajesPendientes > 0 && (
                          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] font-black text-white">
                            {mensajesPendientes} nuevo
                            {mensajesPendientes === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>

                    {propuesta.mensaje && (
                      <div className="mt-2.5 flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.025] text-zinc-600">
                          <IconoMensaje />
                        </span>
                        <p className="min-w-0 flex-1 whitespace-pre-wrap text-[9px] leading-4 text-zinc-500 sm:text-[10px]">
                          {propuesta.mensaje}
                        </p>
                      </div>
                    )}

                    {propuesta.motivoDecision &&
                      propuesta.estado !== "PENDIENTE" && (
                        <div className="mt-2.5 border-l-2 border-sky-400/35 pl-2.5">
                          <p className="text-[7px] font-black uppercase tracking-[0.14em] text-sky-300/70">
                            Motivo enviado
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-[9px] leading-4 text-zinc-500 sm:text-[10px]">
                            {propuesta.motivoDecision}
                          </p>
                        </div>
                      )}

                    <div className="mt-2.5 border-t border-white/[0.06] pt-2.5">
                      {propuesta.audioUrl ? (
                        <ReproductorAudio
                          id={`propuesta-recibida-${propuesta.id}`}
                          src={propuesta.audioUrl}
                          titulo={`Propuesta de ${nombre}`}
                          duracionSegundos={propuesta.duracionSegundos}
                          numero={indice + 1}
                          className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-8 [&_button]:w-8"
                        />
                      ) : (
                        <p className="text-[8px] font-semibold leading-4 text-zinc-600 sm:text-[9px]">
                          {textoAudioNoDisponible(propuesta.estado)}
                        </p>
                      )}
                    </div>

                    {propuesta.estado === "PENDIENTE" ? (
                      <div className="mt-2.5 flex flex-wrap items-center justify-end gap-1.5 border-t border-white/[0.06] pt-2.5">
                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() =>
                            abrirModalDecision(
                              propuesta.id,
                              "RECHAZAR",
                              propuesta.numeroIntento,
                            )
                          }
                          className="rounded-lg border border-red-400/20 bg-red-500/[0.06] px-2.5 py-1.5 text-[8px] font-bold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[9px]"
                        >
                          Rechazar
                        </button>

                        {propuesta.numeroIntento < 2 && (
                          <button
                            type="button"
                            disabled={procesando}
                            onClick={() =>
                              abrirModalDecision(
                                propuesta.id,
                                "SOLICITAR_CAMBIOS",
                                propuesta.numeroIntento,
                              )
                            }
                            className="rounded-lg border border-sky-400/20 bg-sky-500/[0.06] px-2.5 py-1.5 text-[8px] font-bold text-sky-200 transition hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[9px]"
                          >
                            Solicitar cambios
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={procesando}
                          onClick={() =>
                            enviarDecision(propuesta.id, {
                              accion: "ACEPTAR",
                            })
                          }
                          className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.07] px-2.5 py-1.5 text-[8px] font-bold text-emerald-200 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[9px]"
                        >
                          {procesando ? "Procesando…" : "Aceptar"}
                        </button>
                      </div>
                    ) : propuesta.estado === "ACEPTADA" ? (
                      <div className="mt-2.5 flex flex-wrap justify-end gap-1.5 border-t border-white/[0.06] pt-2.5">
                        {propuesta.audioUrl && (
                          <a
                            href={`/api/propuestas/${propuesta.id}/descargar`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-500/[0.06] px-2.5 py-1.5 text-[8px] font-bold text-sky-200 transition hover:bg-sky-500/15 sm:text-[9px]"
                          >
                            <IconoDescargar />
                            Descargar MP3
                          </a>
                        )}

                        {propuesta.conversacionId ? (
                          <Link
                            href={`/mensajes/${propuesta.conversacionId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1.5 text-[8px] font-black text-violet-100 transition hover:bg-violet-500/20 sm:text-[9px]"
                          >
                            <IconoChat />
                            Abrir chat
                            {mensajesPendientes > 0 && (
                              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] leading-none text-white">
                                {etiquetaCantidad(mensajesPendientes)}
                              </span>
                            )}
                          </Link>
                        ) : (
                          <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[8px] font-semibold text-zinc-600 sm:text-[9px]">
                            Preparando chat…
                          </span>
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        )
      ) : propuestasEnviadasIniciales.length === 0 ? (
        <div className="relative flex flex-1 items-center justify-center px-5 py-8">
          <div className="flex max-w-xs flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <IconoPropuestas />
            </div>
            <p className="mt-4 text-sm font-black text-zinc-200">
              No has enviado propuestas
            </p>
            <p className="mt-2 text-[10px] leading-4 text-zinc-500">
              Explora las ideas de otros artistas y envía tu audio para
              comenzar una colaboración.
            </p>
            <Link
              href="/artistas"
              className="mt-4 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3.5 py-2 text-[10px] font-black text-violet-200 transition hover:bg-violet-500/20"
            >
              Explorar artistas
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin]">
          <div className="divide-y divide-white/[0.07]">
            {propuestasEnviadasIniciales.map((propuesta, indice) => {
              const destinatario = propuesta.idea.usuario;
              const nombre = nombreArtista(destinatario);
              const mensajesPendientes = propuesta.conversacionId
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
                  className={`relative px-3.5 py-3.5 transition sm:px-4 ${
                    mensajesPendientes > 0
                      ? "bg-violet-500/[0.045]"
                      : "hover:bg-white/[0.012]"
                  }`}
                >
                  {mensajesPendientes > 0 && (
                    <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-violet-400" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <AvatarArtista
                        artista={destinatario}
                        nombre={nombre}
                      />

                      <div className="min-w-0">
                        <NombreConEnlace
                          artista={destinatario}
                          nombre={nombre}
                        />
                        <p className="mt-0.5 truncate text-[8px] font-medium text-zinc-600 sm:text-[9px]">
                          Para “{propuesta.idea.titulo}”
                        </p>
                        <p className="mt-0.5 truncate text-[8px] text-zinc-700 sm:text-[9px]">
                          {formatearFecha(propuesta.creadoEn)}
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

                      {mensajesPendientes > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] font-black text-white">
                          {mensajesPendientes} nuevo
                          {mensajesPendientes === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </div>

                  {propuesta.mensaje && (
                    <div className="mt-2.5 flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.025] text-zinc-600">
                        <IconoMensaje />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[7px] font-black uppercase tracking-[0.14em] text-zinc-700">
                          Tu mensaje
                        </p>
                        <p className="mt-0.5 whitespace-pre-wrap text-[9px] leading-4 text-zinc-500 sm:text-[10px]">
                          {propuesta.mensaje}
                        </p>
                      </div>
                    </div>
                  )}

                  {propuesta.motivoDecision &&
                    propuesta.estado !== "PENDIENTE" && (
                      <div className="mt-2.5 border-l-2 border-sky-400/35 pl-2.5">
                        <p className="text-[7px] font-black uppercase tracking-[0.14em] text-sky-300/70">
                          Motivo del artista
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[9px] leading-4 text-zinc-500 sm:text-[10px]">
                          {propuesta.motivoDecision}
                        </p>
                      </div>
                    )}

                  <div className="mt-2.5 border-t border-white/[0.06] pt-2.5">
                    {propuesta.audioUrl ? (
                      <ReproductorAudio
                        id={`propuesta-enviada-${propuesta.id}`}
                        src={propuesta.audioUrl}
                        titulo={`Tu propuesta para ${propuesta.idea.titulo}`}
                        duracionSegundos={propuesta.duracionSegundos}
                        numero={indice + 1}
                        className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-8 [&_button]:w-8"
                      />
                    ) : (
                      <p className="text-[8px] font-semibold leading-4 text-zinc-600 sm:text-[9px]">
                        {textoAudioNoDisponible(propuesta.estado)}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-start gap-2 border-t border-white/[0.06] pt-2.5">
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        propuesta.estado === "ACEPTADA"
                          ? "bg-emerald-400"
                          : propuesta.estado === "CAMBIOS_SOLICITADOS"
                            ? "bg-sky-400"
                            : propuesta.estado === "PENDIENTE"
                              ? "bg-amber-400"
                              : "bg-red-400"
                      }`}
                    />
                    <p className="min-w-0 flex-1 text-[8px] font-semibold leading-4 text-zinc-500 sm:text-[9px]">
                      {textoEstadoEnviado(propuesta.estado)}
                      {propuesta.estado === "RECHAZADA" &&
                        propuesta.permiteReintento && (
                          <> Puedes participar otra vez si todavía hay cupos.</>
                        )}
                    </p>
                  </div>

                  {(rutaIdea &&
                    propuesta.numeroIntento < 2 &&
                    (propuesta.estado === "CAMBIOS_SOLICITADOS" ||
                      (propuesta.estado === "RECHAZADA" &&
                        propuesta.permiteReintento))) ||
                  propuesta.estado === "ACEPTADA" ? (
                    <div className="mt-2.5 flex flex-wrap justify-end gap-1.5 border-t border-white/[0.06] pt-2.5">
                      {rutaIdea &&
                        propuesta.numeroIntento < 2 &&
                        (propuesta.estado === "CAMBIOS_SOLICITADOS" ||
                          (propuesta.estado === "RECHAZADA" &&
                            propuesta.permiteReintento)) && (
                          <Link
                            href={rutaIdea}
                            className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1.5 text-[8px] font-black text-violet-100 transition hover:bg-violet-500/20 sm:text-[9px]"
                          >
                            {propuesta.estado === "CAMBIOS_SOLICITADOS"
                              ? "Enviar corrección"
                              : "Intentar nuevamente"}
                          </Link>
                        )}

                      {propuesta.estado === "ACEPTADA" && (
                        <>
                          {propuesta.audioUrl && (
                            <a
                              href={`/api/propuestas/${propuesta.id}/descargar`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-500/[0.06] px-2.5 py-1.5 text-[8px] font-bold text-sky-200 transition hover:bg-sky-500/15 sm:text-[9px]"
                            >
                              <IconoDescargar />
                              Descargar MP3
                            </a>
                          )}

                          {propuesta.conversacionId ? (
                            <Link
                              href={`/mensajes/${propuesta.conversacionId}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/25 bg-violet-500/10 px-2.5 py-1.5 text-[8px] font-black text-violet-100 transition hover:bg-violet-500/20 sm:text-[9px]"
                            >
                              <IconoChat />
                              Abrir chat
                              {mensajesPendientes > 0 && (
                                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[7px] leading-none text-white">
                                  {etiquetaCantidad(mensajesPendientes)}
                                </span>
                              )}
                            </Link>
                          ) : (
                            <span className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 text-[8px] font-semibold text-zinc-600 sm:text-[9px]">
                              Preparando chat…
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {modalDecision &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-decision-propuesta"
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onPointerDown={(evento) => {
              if (evento.target === evento.currentTarget) {
                cerrarModalDecision();
              }
            }}
          >
            <div className="w-full rounded-t-2xl border border-white/10 bg-[#120e18] p-4 shadow-2xl shadow-black/70 sm:max-w-md sm:rounded-2xl sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-300">
                    Decisión de la propuesta
                  </p>
                  <h3
                    id="titulo-decision-propuesta"
                    className="mt-1 text-lg font-black text-white"
                  >
                    {modalDecision.accion === "SOLICITAR_CAMBIOS"
                      ? "Solicitar una nueva versión"
                      : "Rechazar propuesta"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={cerrarModalDecision}
                  disabled={procesandoId !== null}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-xl text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                >
                  ×
                </button>
              </div>

              <p className="mt-3 text-[10px] leading-4 text-zinc-400">
                {modalDecision.accion === "SOLICITAR_CAMBIOS"
                  ? "El cupo seguirá ocupado mientras la persona prepara la corrección."
                  : "El archivo actual se eliminará y el cupo quedará disponible inmediatamente."}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="motivo-decision-propuesta"
                    className="text-xs font-bold text-zinc-200"
                  >
                    Motivo obligatorio
                  </label>
                  <span className="text-[10px] text-zinc-600">
                    {motivoDecision.length}/500
                  </span>
                </div>
                <textarea
                  id="motivo-decision-propuesta"
                  value={motivoDecision}
                  onChange={(evento) => {
                    setMotivoDecision(evento.target.value);
                    setError("");
                  }}
                  maxLength={500}
                  rows={4}
                  disabled={procesandoId !== null}
                  placeholder={
                    modalDecision.accion === "SOLICITAR_CAMBIOS"
                      ? "Explícale exactamente qué debe corregir en la nueva versión."
                      : "Explícale de forma respetuosa por qué la propuesta no fue elegida."
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/40"
                />
              </div>

              {modalDecision.accion === "RECHAZAR" && (
                <div className="mt-4 space-y-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <input
                      type="radio"
                      name="tipo-rechazo"
                      checked={!permiteReintento}
                      onChange={() => setPermiteReintento(false)}
                      disabled={procesandoId !== null}
                      className="mt-0.5 accent-violet-500"
                    />
                    <span>
                      <span className="block text-[10px] font-black text-zinc-200">
                        Rechazo definitivo
                      </span>
                      <span className="mt-1 block text-[9px] leading-4 text-zinc-500">
                        Libera el cupo y esta persona no podrá volver a participar en esta idea.
                      </span>
                    </span>
                  </label>

                  {modalDecision.numeroIntento < 2 && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/15 bg-violet-500/[0.05] p-3">
                      <input
                        type="radio"
                        name="tipo-rechazo"
                        checked={permiteReintento}
                        onChange={() => setPermiteReintento(true)}
                        disabled={procesandoId !== null}
                        className="mt-0.5 accent-violet-500"
                      />
                      <span>
                        <span className="block text-[10px] font-black text-violet-200">
                          Permitir otro intento
                        </span>
                        <span className="mt-1 block text-[9px] leading-4 text-zinc-500">
                          Libera el cupo y no se lo reserva. Podrá intentarlo otra vez solo si encuentra espacio disponible.
                        </span>
                      </span>
                    </label>
                  )}
                </div>
              )}

              {error && (
                <p className="mt-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] text-red-200">
                  {error}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={cerrarModalDecision}
                  disabled={procesandoId !== null}
                  className="min-h-10 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/5 disabled:opacity-40"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarModalDecision}
                  disabled={procesandoId !== null || motivoDecision.trim().length < 3}
                  className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    modalDecision.accion === "SOLICITAR_CAMBIOS"
                      ? "border-sky-400/30 bg-sky-500/15 text-sky-100 hover:bg-sky-500/25"
                      : "border-red-400/30 bg-red-500/15 text-red-100 hover:bg-red-500/25"
                  }`}
                >
                  {procesandoId !== null
                    ? "Procesando…"
                    : modalDecision.accion === "SOLICITAR_CAMBIOS"
                      ? "Solicitar cambios"
                      : "Confirmar rechazo"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
