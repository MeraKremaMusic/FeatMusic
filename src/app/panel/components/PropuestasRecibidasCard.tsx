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

function AvatarArtista({ artista, nombre }: { artista: ArtistaResumen; nombre: string }) {
  if (artista.fotoPerfil) {
    return (
      <img
        src={artista.fotoPerfil}
        alt={`Foto de ${nombre}`}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-[10px] font-black text-violet-200">
      {iniciales(nombre)}
    </span>
  );
}

function NombreConEnlace({ artista, nombre }: { artista: ArtistaResumen; nombre: string }) {
  const usuario = artista.nombreUsuario?.trim();

  if (!usuario) {
    return <p className="truncate text-xs font-black text-zinc-100">{nombre}</p>;
  }

  return (
    <Link
      href={`/artistas/${encodeURIComponent(usuario)}`}
      className="block truncate text-xs font-black text-zinc-100 transition hover:text-violet-200"
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <IconoPropuestas />
            {mensajesNoLeidos > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full border border-[#100d15] bg-red-500 px-1 text-[7px] font-black leading-none text-white shadow-lg shadow-red-950/50">
                {etiquetaCantidad(mensajesNoLeidos)}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">Propuestas</p>
            <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
              {pendientesActivas} pendiente{pendientesActivas === 1 ? "" : "s"} ·{" "}
              {cantidadActiva} total
              {mensajesNoLeidos > 0 && (
                <>
                  {" "}· {mensajesNoLeidos} mensaje
                  {mensajesNoLeidos === 1 ? "" : "s"} sin leer
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/mensajes"
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[9px] font-black text-zinc-300 transition hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200"
          >
            Mensajes
          </Link>
          <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-black text-violet-200">
            {cantidadActiva}
          </span>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-t border-white/10 bg-black/20 p-1.5">
        <button
          type="button"
          onClick={() => {
            setPestana("RECIBIDAS");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black transition ${
            mostrandoRecibidas
              ? "bg-violet-500/15 text-violet-100 shadow-sm"
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          }`}
        >
          Recibidas
          <span
            className={`rounded-full px-1.5 py-0.5 text-[8px] ${
              mostrandoRecibidas
                ? "bg-violet-400/20 text-violet-100"
                : "bg-white/5 text-zinc-500"
            }`}
          >
            {propuestas.length}
          </span>
          {mensajesNoLeidosRecibidos > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] text-white">
              {etiquetaCantidad(mensajesNoLeidosRecibidos)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setPestana("ENVIADAS");
            setError("");
          }}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black transition ${
            !mostrandoRecibidas
              ? "bg-violet-500/15 text-violet-100 shadow-sm"
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          }`}
        >
          Enviadas
          <span
            className={`rounded-full px-1.5 py-0.5 text-[8px] ${
              !mostrandoRecibidas
                ? "bg-violet-400/20 text-violet-100"
                : "bg-white/5 text-zinc-500"
            }`}
          >
            {propuestasEnviadasIniciales.length}
          </span>
          {mensajesNoLeidosEnviados > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] text-white">
              {etiquetaCantidad(mensajesNoLeidosEnviados)}
            </span>
          )}
        </button>
      </div>

      {error && mostrandoRecibidas && (
        <p className="mx-3 mt-3 shrink-0 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] text-red-200">
          {error}
        </p>
      )}

      {mostrandoRecibidas ? (
        propuestas.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-5">
            <div className="flex max-w-xs flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <IconoPropuestas />
              </div>
              <p className="mt-4 text-sm font-semibold text-zinc-200">
                No has recibido ninguna propuesta
              </p>
              <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                Cuando otro artista envíe un audio a una de tus ideas, aparecerá
                aquí para que puedas escucharlo.
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 [scrollbar-width:thin]">
            {propuestas.map((propuesta, indice) => {
              const nombre = nombreArtista(propuesta.remitente);
              const procesando = procesandoId === propuesta.id;
              const mensajesPendientes = propuesta.conversacionId
                ? porConversacion[propuesta.conversacionId] ?? 0
                : 0;

              return (
                <article
                  key={propuesta.id}
                  className={`rounded-xl border p-3 transition ${
                    mensajesPendientes > 0
                      ? "border-violet-400/35 bg-violet-500/[0.07] shadow-[0_0_24px_rgba(139,92,246,0.08)]"
                      : "border-white/10 bg-white/[0.025]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <AvatarArtista artista={propuesta.remitente} nombre={nombre} />

                      <div className="min-w-0">
                        <NombreConEnlace artista={propuesta.remitente} nombre={nombre} />
                        <p className="mt-0.5 truncate text-[9px] font-medium text-zinc-500">
                          Para “{propuesta.idea.titulo}” ·{" "}
                          {formatearFecha(propuesta.creadoEn)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`rounded-full border px-2 py-1 text-[9px] font-bold ${claseEstado(
                          propuesta.estado,
                        )}`}
                      >
                        {etiquetaEstado(propuesta.estado)}
                      </span>
                      {mensajesPendientes > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-1 text-[8px] font-black text-white">
                          {mensajesPendientes} nuevo
                          {mensajesPendientes === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </div>

                  {propuesta.mensaje && (
                    <p className="mt-3 whitespace-pre-wrap rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] leading-4 text-zinc-400">
                      {propuesta.mensaje}
                    </p>
                  )}

                  {propuesta.motivoDecision &&
                    propuesta.estado !== "PENDIENTE" && (
                      <div className="mt-3 rounded-lg border border-sky-400/15 bg-sky-500/[0.06] px-3 py-2">
                        <p className="text-[8px] font-black uppercase tracking-[0.14em] text-sky-300/70">
                          Motivo enviado
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-zinc-400">
                          {propuesta.motivoDecision}
                        </p>
                      </div>
                    )}

                  {propuesta.audioUrl ? (
                    <ReproductorAudio
                      id={`propuesta-recibida-${propuesta.id}`}
                      src={propuesta.audioUrl}
                      titulo={`Propuesta de ${nombre}`}
                      duracionSegundos={propuesta.duracionSegundos}
                      numero={indice + 1}
                      className="mt-3"
                    />
                  ) : (
                    <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-semibold text-zinc-500">
                      {textoAudioNoDisponible(propuesta.estado)}
                    </p>
                  )}

                  {propuesta.estado === "PENDIENTE" ? (
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
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
                        className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-[9px] font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
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
                          className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-1.5 text-[9px] font-bold text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {procesando ? "Procesando…" : "Aceptar"}
                      </button>
                    </div>
                  ) : propuesta.estado === "ACEPTADA" ? (
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {propuesta.audioUrl && (
                        <a
                          href={`/api/propuestas/${propuesta.id}/descargar`}
                          className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-1.5 text-[9px] font-bold text-sky-200 transition hover:bg-sky-500/20"
                        >
                          Descargar MP3
                        </a>
                      )}

                      {propuesta.conversacionId ? (
                        <Link
                          href={`/mensajes/${propuesta.conversacionId}`}
                          className="flex items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[9px] font-black text-violet-100 transition hover:bg-violet-500/25"
                        >
                          Abrir chat
                          {mensajesPendientes > 0 && (
                            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] leading-none text-white">
                              {etiquetaCantidad(mensajesPendientes)}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-zinc-500">
                          Preparando chat…
                        </span>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )
      ) : propuestasEnviadasIniciales.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <div className="flex max-w-xs flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <IconoPropuestas />
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-200">
              No has enviado ninguna propuesta
            </p>
            <p className="mt-2 text-[10px] leading-4 text-zinc-500">
              Explora las ideas de otros artistas y envía tu audio para comenzar
              una colaboración.
            </p>
            <Link
              href="/artistas"
              className="mt-4 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-200 transition hover:bg-violet-500/20"
            >
              Explorar artistas
            </Link>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 [scrollbar-width:thin]">
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
                className={`rounded-xl border p-3 transition ${
                  mensajesPendientes > 0
                    ? "border-violet-400/35 bg-violet-500/[0.07] shadow-[0_0_24px_rgba(139,92,246,0.08)]"
                    : "border-white/10 bg-white/[0.025]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <AvatarArtista artista={destinatario} nombre={nombre} />

                    <div className="min-w-0">
                      <NombreConEnlace artista={destinatario} nombre={nombre} />
                      <p className="mt-0.5 truncate text-[9px] font-medium text-zinc-500">
                        Para “{propuesta.idea.titulo}” ·{" "}
                        {formatearFecha(propuesta.creadoEn)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full border px-2 py-1 text-[9px] font-bold ${claseEstado(
                        propuesta.estado,
                      )}`}
                    >
                      {etiquetaEstado(propuesta.estado)}
                    </span>
                    {mensajesPendientes > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-1 text-[8px] font-black text-white">
                        {mensajesPendientes} nuevo
                        {mensajesPendientes === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </div>

                {propuesta.mensaje && (
                  <div className="mt-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-zinc-600">
                      Tu mensaje
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-zinc-400">
                      {propuesta.mensaje}
                    </p>
                  </div>
                )}

                {propuesta.motivoDecision &&
                  propuesta.estado !== "PENDIENTE" && (
                    <div className="mt-3 rounded-lg border border-sky-400/20 bg-sky-500/[0.07] px-3 py-2">
                      <p className="text-[8px] font-black uppercase tracking-[0.14em] text-sky-300/80">
                        Motivo del artista
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-zinc-300">
                        {propuesta.motivoDecision}
                      </p>
                    </div>
                  )}

                {propuesta.audioUrl ? (
                  <ReproductorAudio
                    id={`propuesta-enviada-${propuesta.id}`}
                    src={propuesta.audioUrl}
                    titulo={`Tu propuesta para ${propuesta.idea.titulo}`}
                    duracionSegundos={propuesta.duracionSegundos}
                    numero={indice + 1}
                    className="mt-3"
                  />
                ) : (
                  <p className="mt-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-semibold text-zinc-500">
                    {textoAudioNoDisponible(propuesta.estado)}
                  </p>
                )}

                <p
                  className={`mt-3 rounded-lg border px-3 py-2 text-[9px] font-semibold ${claseEstado(
                    propuesta.estado,
                  )}`}
                >
                  {textoEstadoEnviado(propuesta.estado)}
                  {propuesta.estado === "RECHAZADA" &&
                    propuesta.permiteReintento && (
                      <> Puedes participar otra vez si todavía hay cupos.</>
                    )}
                </p>

                {rutaIdea &&
                  propuesta.numeroIntento < 2 &&
                  (propuesta.estado === "CAMBIOS_SOLICITADOS" ||
                    (propuesta.estado === "RECHAZADA" &&
                      propuesta.permiteReintento)) && (
                    <div className="mt-3 flex justify-end">
                      <Link
                        href={rutaIdea}
                        className="rounded-lg border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[9px] font-black text-violet-100 transition hover:bg-violet-500/25"
                      >
                        {propuesta.estado === "CAMBIOS_SOLICITADOS"
                          ? "Enviar corrección"
                          : "Intentar nuevamente"}
                      </Link>
                    </div>
                  )}

                {propuesta.estado === "ACEPTADA" && (
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    {propuesta.audioUrl && (
                      <a
                        href={`/api/propuestas/${propuesta.id}/descargar`}
                        className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-1.5 text-[9px] font-bold text-sky-200 transition hover:bg-sky-500/20"
                      >
                        Descargar MP3
                      </a>
                    )}

                    {propuesta.conversacionId ? (
                      <Link
                        href={`/mensajes/${propuesta.conversacionId}`}
                        className="flex items-center gap-2 rounded-lg border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[9px] font-black text-violet-100 transition hover:bg-violet-500/25"
                      >
                        Abrir chat
                        {mensajesPendientes > 0 && (
                          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] leading-none text-white">
                            {etiquetaCantidad(mensajesPendientes)}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-zinc-500">
                        Preparando chat…
                      </span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
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
