"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import ReproductorAudio from "@/app/components/ReproductorAudio";

type EstadoPropuesta = "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "EXPIRADA";

export type PropuestaPanel = {
  id: number;
  mensaje: string | null;
  audioUrl: string;
  duracionSegundos: number;
  estado: EstadoPropuesta | string;
  creadoEn: string;
  idea: {
    id: number;
    titulo: string;
  };
  remitente: {
    id: number;
    nombre: string | null;
    nombreArtistico: string | null;
    nombreUsuario: string | null;
    fotoPerfil: string | null;
  };
};

type RespuestaActualizacion = {
  ok: boolean;
  mensaje?: string;
  propuesta?: {
    id: number;
    estado: string;
  };
};

function nombreArtista(propuesta: PropuestaPanel) {
  return (
    propuesta.remitente.nombreArtistico?.trim() ||
    propuesta.remitente.nombre?.trim() ||
    propuesta.remitente.nombreUsuario?.trim() ||
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

export default function PropuestasRecibidasCard({
  propuestasIniciales,
}: {
  propuestasIniciales: PropuestaPanel[];
}) {
  const [propuestas, setPropuestas] = useState(propuestasIniciales);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const pendientes = useMemo(
    () =>
      propuestas.filter((propuesta) => propuesta.estado === "PENDIENTE")
        .length,
    [propuestas],
  );

  async function actualizarEstado(
    propuestaId: number,
    estado: "ACEPTADA" | "RECHAZADA",
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
        body: JSON.stringify({ estado }),
      });

      const data = (await response.json()) as RespuestaActualizacion;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.mensaje || "No se pudo actualizar la propuesta.",
        );
      }

      setPropuestas((actuales) =>
        actuales.map((propuesta) =>
          propuesta.id === propuestaId
            ? {
                ...propuesta,
                estado: data.propuesta?.estado ?? estado,
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
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <IconoPropuestas />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">
              Propuestas recibidas
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
              {pendientes} pendiente{pendientes === 1 ? "" : "s"} ·{" "}
              {propuestas.length} total
            </p>
          </div>
        </div>

        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-black text-violet-200">
          {propuestas.length}
        </span>
      </div>

      {error && (
        <p className="mx-3 mt-3 shrink-0 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] text-red-200">
          {error}
        </p>
      )}

      {propuestas.length === 0 ? (
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
            const nombre = nombreArtista(propuesta);
            const usuario = propuesta.remitente.nombreUsuario?.trim();
            const procesando = procesandoId === propuesta.id;

            return (
              <article
                key={propuesta.id}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {propuesta.remitente.fotoPerfil ? (
                      <img
                        src={propuesta.remitente.fotoPerfil}
                        alt={`Foto de ${nombre}`}
                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-[10px] font-black text-violet-200">
                        {iniciales(nombre)}
                      </span>
                    )}

                    <div className="min-w-0">
                      {usuario ? (
                        <Link
                          href={`/artistas/${encodeURIComponent(usuario)}`}
                          className="block truncate text-xs font-black text-zinc-100 transition hover:text-violet-200"
                        >
                          {nombre}
                        </Link>
                      ) : (
                        <p className="truncate text-xs font-black text-zinc-100">
                          {nombre}
                        </p>
                      )}
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

                <ReproductorAudio
                  id={`propuesta-${propuesta.id}`}
                  src={propuesta.audioUrl}
                  titulo={`Propuesta de ${nombre}`}
                  duracionSegundos={propuesta.duracionSegundos}
                  numero={indice + 1}
                  className="mt-3"
                />

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  {propuesta.estado === "ACEPTADA" && (
                    <a
                      href={`/api/propuestas/${propuesta.id}/descargar`}
                      className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-1.5 text-[9px] font-bold text-sky-200 transition hover:bg-sky-500/20"
                    >
                      Descargar MP3
                    </a>
                  )}

                  <button
                    type="button"
                    disabled={procesando || propuesta.estado === "RECHAZADA"}
                    onClick={() =>
                      actualizarEstado(propuesta.id, "RECHAZADA")
                    }
                    className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-[9px] font-bold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {procesando ? "Procesando…" : "Rechazar"}
                  </button>

                  <button
                    type="button"
                    disabled={procesando || propuesta.estado === "ACEPTADA"}
                    onClick={() =>
                      actualizarEstado(propuesta.id, "ACEPTADA")
                    }
                    className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-bold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {procesando ? "Procesando…" : "Aceptar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
