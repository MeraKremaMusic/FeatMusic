"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import ReproductorAudio from "@/app/components/ReproductorAudio";

type EstadoPropuesta = "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "EXPIRADA";
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

  if (estado === "RECHAZADA" || estado === "EXPIRADA") {
    return "border-red-400/20 bg-red-500/10 text-red-200";
  }

  return "border-amber-400/25 bg-amber-500/10 text-amber-200";
}

function textoEstadoEnviado(estado: string) {
  if (estado === "ACEPTADA") {
    return "El artista aceptó tu propuesta.";
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

  const mostrandoRecibidas = pestana === "RECIBIDAS";
  const cantidadActiva = mostrandoRecibidas
    ? propuestas.length
    : propuestasEnviadasIniciales.length;
  const pendientesActivas = mostrandoRecibidas
    ? pendientesRecibidas
    : pendientesEnviadas;

  async function actualizarEstado(
    propuestaId: number,
    estado: "ACEPTADA" | "RECHAZADA",
  ) {
    if (procesandoId !== null) return;

    if (
      estado === "RECHAZADA" &&
      !window.confirm(
        "¿Seguro que deseas rechazar esta propuesta? La decisión será definitiva y el archivo MP3 se eliminará.",
      )
    ) {
      return;
    }

    setError("");
    setProcesandoId(propuestaId);

    try {
      const response = await fetch(`/api/propuestas/${propuestaId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado }),
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
                estado: data.propuesta?.estado ?? estado,
                audioUrl:
                  estado === "RECHAZADA"
                    ? null
                    : data.propuesta?.audioUrl ?? propuesta.audioUrl,
                conversacionId:
                  data.propuesta?.conversacionId ?? propuesta.conversacionId,
              }
            : propuesta,
        ),
      );
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

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-3 pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <IconoPropuestas />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">Propuestas</p>
            <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
              {pendientesActivas} pendiente{pendientesActivas === 1 ? "" : "s"} ·{" "}
              {cantidadActiva} total
            </p>
          </div>
        </div>

        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-black text-violet-200">
          {cantidadActiva}
        </span>
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

              return (
                <article
                  key={propuesta.id}
                  className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
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

                    <span
                      className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${claseEstado(
                        propuesta.estado,
                      )}`}
                    >
                      {etiquetaEstado(propuesta.estado)}
                    </span>
                  </div>

                  {propuesta.mensaje && (
                    <p className="mt-3 whitespace-pre-wrap rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-[10px] leading-4 text-zinc-400">
                      {propuesta.mensaje}
                    </p>
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
                        onClick={() => actualizarEstado(propuesta.id, "RECHAZADA")}
                        className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-[9px] font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {procesando ? "Procesando…" : "Rechazar"}
                      </button>

                      <button
                        type="button"
                        disabled={procesando}
                        onClick={() => actualizarEstado(propuesta.id, "ACEPTADA")}
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
                          className="rounded-lg border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[9px] font-black text-violet-100 transition hover:bg-violet-500/25"
                        >
                          Abrir chat
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

            return (
              <article
                key={propuesta.id}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
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

                  <span
                    className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold ${claseEstado(
                      propuesta.estado,
                    )}`}
                  >
                    {etiquetaEstado(propuesta.estado)}
                  </span>
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
                </p>

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
                        className="rounded-lg border border-violet-400/30 bg-violet-500/15 px-3 py-1.5 text-[9px] font-black text-violet-100 transition hover:bg-violet-500/25"
                      >
                        Abrir chat
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
    </div>
  );
}
