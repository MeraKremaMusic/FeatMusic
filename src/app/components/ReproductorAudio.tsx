"use client";

// FEATMUSIC_ACCIONES_INTEGRADAS_PERFIL_V1
// FEATMUSIC_VISTAS_BAJO_METADATOS_V1
// FEATMUSIC_PLAY_PAUSE_BLANCO_PORTADA_IDEA_V1

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

type ReproductorAudioProps = {
  id: number | string;
  src: string;
  titulo: string;
  bpm?: number | null;
  tonalidad?: string | null;
  duracionSegundos?: number | null;
  numero?: number;
  detalleMetadatos?: ReactNode;
  elementoJuntoTitulo?: ReactNode;
  elementoBajoDuracion?: ReactNode;
  className?: string;
};

const EVENTO_REPRODUCCION = "featmusic:reproducir-audio";

function IconoPlay({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M8 5.5v13l10-6.5-10-6.5Z" />
    </svg>
  );
}

function IconoPausa({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  );
}

function formatearTiempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) {
    return "0:00";
  }

  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.floor(segundos % 60)
    .toString()
    .padStart(2, "0");

  return `${minutos}:${segundosRestantes}`;
}

export default function ReproductorAudio({
  id,
  src,
  titulo,
  bpm,
  tonalidad,
  duracionSegundos = 0,
  numero,
  detalleMetadatos,
  elementoJuntoTitulo,
  elementoBajoDuracion,
  className = "",
}: ReproductorAudioProps) {
  const reactId = useId();
  const identificador = `${String(id)}-${reactId}`;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracion, setDuracion] = useState(duracionSegundos || 0);

  useEffect(() => {
    setTiempoActual(0);
    setDuracion(duracionSegundos || 0);
    setReproduciendo(false);
  }, [src, duracionSegundos]);

  useEffect(() => {
    function detenerOtroAudio(evento: Event) {
      const eventoPersonalizado = evento as CustomEvent<string>;

      if (eventoPersonalizado.detail === identificador) {
        return;
      }

      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
      }
    }

    window.addEventListener(EVENTO_REPRODUCCION, detenerOtroAudio);

    return () => {
      window.removeEventListener(EVENTO_REPRODUCCION, detenerOtroAudio);
    };
  }, [identificador]);

  async function alternarReproduccion() {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      window.dispatchEvent(
        new CustomEvent<string>(EVENTO_REPRODUCCION, {
          detail: identificador,
        }),
      );

      try {
        await audio.play();
      } catch (error) {
        console.error("No se pudo reproducir el audio.", error);
      }

      return;
    }

    audio.pause();
  }

  function cambiarPosicion(evento: ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;

    const nuevoTiempo = Number(evento.target.value);
    audio.currentTime = nuevoTiempo;
    setTiempoActual(nuevoTiempo);
  }

  const duracionSegura =
    Number.isFinite(duracion) && duracion > 0
      ? duracion
      : Number(duracionSegundos) || 0;

  const metadatos = [
    typeof bpm === "number" ? `${bpm} BPM` : null,
    tonalidad?.trim() || null,
  ].filter(Boolean);

  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/30 p-2.5 shadow-sm shadow-black/20 ${className}`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {typeof numero === "number" && (
          <span className="w-5 shrink-0 text-center text-[9px] font-black tabular-nums text-zinc-600">
            {numero.toString().padStart(2, "0")}
          </span>
        )}

        <button
          type="button"
          onClick={alternarReproduccion}
          aria-label={reproduciendo ? `Pausar ${titulo}` : `Reproducir ${titulo}`}
          className="featmusic-audio-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-500/15 text-yellow-200 transition hover:border-yellow-300/50 hover:bg-yellow-500/25 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
        >
          {reproduciendo ? <IconoPausa /> : <IconoPlay />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <p className="featmusic-audio-title min-w-0 truncate text-[11px] font-bold text-zinc-100">
                  {titulo}
                </p>
                {elementoJuntoTitulo && (
                  <div className="shrink-0">{elementoJuntoTitulo}</div>
                )}
              </div>

              {(metadatos.length > 0 || (detalleMetadatos && !elementoBajoDuracion)) && (
                <div className="mt-0.5 min-w-0">
                  {metadatos.length > 0 && (
                    <p className="truncate text-[9px] font-medium text-zinc-500">
                      {metadatos.join(" · ")}
                    </p>
                  )}

                  {detalleMetadatos && !elementoBajoDuracion && (
                    <div
                      className={`min-w-0 ${
                        metadatos.length > 0 ? "mt-0.5" : ""
                      }`}
                    >
                      {detalleMetadatos}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="shrink-0 pt-0.5 text-[9px] font-semibold tabular-nums text-zinc-500">
              {formatearTiempo(tiempoActual)} / {formatearTiempo(duracionSegura)}
            </span>
          </div>

          {elementoBajoDuracion && (
            <div className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                {detalleMetadatos}
              </div>
              <div className="shrink-0 whitespace-nowrap">
                {elementoBajoDuracion}
              </div>
            </div>
          )}

          <input
            type="range"
            min={0}
            max={Math.max(duracionSegura, 0)}
            step="0.1"
            value={Math.min(tiempoActual, Math.max(duracionSegura, 0))}
            onChange={cambiarPosicion}
            disabled={duracionSegura <= 0}
            aria-label={`Posición de reproducción de ${titulo}`}
            className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-yellow-400 disabled:cursor-not-allowed disabled:opacity-40 [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-yellow-400 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-yellow-300 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-300"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(evento) => {
          const duracionAudio = evento.currentTarget.duration;
          if (Number.isFinite(duracionAudio) && duracionAudio > 0) {
            setDuracion(duracionAudio);
          }
        }}
        onTimeUpdate={(evento) => {
          setTiempoActual(evento.currentTarget.currentTime);
        }}
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        onEnded={() => {
          setReproduciendo(false);
          setTiempoActual(0);
        }}
      />
    </div>
  );
}