"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const EVENTO_REPRODUCCION = "featmusic:reproducir-audio";

type ReproductorReelProps = {
  id: string;
  src: string;
  titulo: string;
  activa: boolean;
  duracionSegundos?: number | null;
  onEstadoChange?: (reproduciendo: boolean) => void;
};

function formatearTiempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";

  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return `${minutos}:${resto.toString().padStart(2, "0")}`;
}

function IconoPlay() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M8.2 5.5v13l10-6.5-10-6.5Z" />
    </svg>
  );
}

function IconoPausa() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" />
    </svg>
  );
}

export default function ReproductorReel({
  id,
  src,
  titulo,
  activa,
  duracionSegundos,
  onEstadoChange,
}: ReproductorReelProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracionReal, setDuracionReal] = useState(
    Math.max(0, duracionSegundos ?? 0),
  );

  const duracion = Math.max(duracionReal, duracionSegundos ?? 0, 0);
  const progreso =
    duracion > 0 ? Math.min(100, (tiempoActual / duracion) * 100) : 0;

  const estiloProgreso = useMemo(
    () =>
      ({
        "--reel-progress": `${progreso}%`,
      }) as CSSProperties,
    [progreso],
  );

  useEffect(() => {
    onEstadoChange?.(reproduciendo);
  }, [onEstadoChange, reproduciendo]);

  useEffect(() => {
    function detenerOtros(evento: Event) {
      const detalle = (evento as CustomEvent<string>).detail;
      if (detalle === id) return;

      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
    }

    window.addEventListener(EVENTO_REPRODUCCION, detenerOtros);
    return () => window.removeEventListener(EVENTO_REPRODUCCION, detenerOtros);
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activa) {
      audio.pause();
      audio.currentTime = 0;
      setTiempoActual(0);
      return;
    }

    let cancelado = false;
    const temporizador = window.setTimeout(async () => {
      try {
        window.dispatchEvent(
          new CustomEvent<string>(EVENTO_REPRODUCCION, { detail: id }),
        );
        audio.currentTime = 0;
        await audio.play();
      } catch {
        // El navegador puede bloquear el primer autoplay con sonido.
        // El botón de reproducción permanece disponible sin mostrar mensajes.
      }
    }, 180);

    return () => {
      cancelado = true;
      window.clearTimeout(temporizador);
    };
  }, [activa, id, src]);

  async function alternarReproduccion() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    try {
      window.dispatchEvent(
        new CustomEvent<string>(EVENTO_REPRODUCCION, { detail: id }),
      );
      await audio.play();
    } catch {
      // El control seguirá disponible para un nuevo intento.
    }
  }

  function moverProgreso(valor: number) {
    const audio = audioRef.current;
    if (!audio || duracion <= 0) return;

    audio.currentTime = (valor / 100) * duracion;
    setTiempoActual(audio.currentTime);
  }

  return (
    <div
      className="feat-reel-linear-player"
      data-playing={reproduciendo ? "true" : "false"}
      style={estiloProgreso}
    >
      <audio
        ref={audioRef}
        src={src}
        preload={activa ? "auto" : "metadata"}
        loop
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        onTimeUpdate={(evento) =>
          setTiempoActual(evento.currentTarget.currentTime)
        }
        onLoadedMetadata={(evento) => {
          const nuevaDuracion = evento.currentTarget.duration;
          if (Number.isFinite(nuevaDuracion)) {
            setDuracionReal(nuevaDuracion);
          }
        }}
      />

      <button
        type="button"
        onClick={alternarReproduccion}
        className="feat-reel-linear-toggle"
        aria-label={reproduciendo ? `Pausar ${titulo}` : `Reproducir ${titulo}`}
      >
        {reproduciendo ? <IconoPausa /> : <IconoPlay />}
      </button>

      <span className="feat-reel-linear-time">
        {formatearTiempo(tiempoActual)}
      </span>

      <div className="feat-reel-linear-track-shell">
        <span className="feat-reel-linear-track" aria-hidden="true">
          <span className="feat-reel-linear-fill" />
          <span className="feat-reel-linear-thumb" />
        </span>

        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progreso}
          onChange={(evento) => moverProgreso(Number(evento.target.value))}
          className="feat-reel-linear-seek"
          aria-label={`Posición de ${titulo}`}
        />
      </div>

      <span className="feat-reel-linear-time">
        {formatearTiempo(duracion)}
      </span>
    </div>
  );
}
