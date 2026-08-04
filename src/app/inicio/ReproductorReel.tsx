"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

const EVENTO_REPRODUCCION = "featmusic:reproducir-audio";
const EVENTO_ALTERNAR_REEL = "featmusic:alternar-reproduccion-reel";

type ReproductorReelProps = {
  id: string;
  src: string;
  titulo: string;
  fotoArtista?: string | null;
  inicialesArtista: string;
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
  fotoArtista,
  inicialesArtista,
  activa,
  duracionSegundos,
  onEstadoChange,
}: ReproductorReelProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [falloFoto, setFalloFoto] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [desplazando, setDesplazando] = useState(false);
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
    setFalloFoto(false);
  }, [fotoArtista]);

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
    function alternarDesdePantalla(evento: Event) {
      const detalle = (evento as CustomEvent<string>).detail;
      if (detalle !== id) return;
      void alternarReproduccion();
    }

    window.addEventListener(EVENTO_ALTERNAR_REEL, alternarDesdePantalla);
    return () =>
      window.removeEventListener(EVENTO_ALTERNAR_REEL, alternarDesdePantalla);
  }, [id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!activa) {
      audio.pause();
      audio.currentTime = 0;
      setTiempoActual(0);
      setDesplazando(false);
      return;
    }

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

  function iniciarDesplazamiento(
    evento: ReactPointerEvent<HTMLInputElement>,
  ) {
    if (duracion <= 0) return;

    try {
      evento.currentTarget.setPointerCapture(evento.pointerId);
    } catch {
      // Algunos navegadores no permiten capturar el puntero del range.
    }

    setDesplazando(true);
  }

  function finalizarDesplazamiento(
    evento?: ReactPointerEvent<HTMLInputElement>,
  ) {
    if (evento) {
      try {
        if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
          evento.currentTarget.releasePointerCapture(evento.pointerId);
        }
      } catch {
        // El indicador igualmente se oculta aunque no exista captura.
      }
    }

    setDesplazando(false);
  }

  return (
    <div
      className="feat-reel-audio-stage"
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

      <div className="feat-reel-artist-visual" aria-hidden="true">
        <span className="feat-reel-artist-ring feat-reel-artist-ring-one" />
        <span className="feat-reel-artist-ring feat-reel-artist-ring-two" />
        <span className="feat-reel-artist-spark feat-reel-artist-spark-one" />
        <span className="feat-reel-artist-spark feat-reel-artist-spark-two" />

        <div className="feat-reel-artist-photo">
          {fotoArtista && !falloFoto ? (
            <img
              src={fotoArtista}
              alt=""
              draggable={false}
              onError={() => setFalloFoto(true)}
            />
          ) : (
            <span>{inicialesArtista}</span>
          )}
        </div>
      </div>

      <div
        className="feat-reel-linear-player"
        data-playing={reproduciendo ? "true" : "false"}
        data-scrubbing={desplazando ? "true" : "false"}
        data-no-toggle-reel
      >
        <button
          type="button"
          onClick={alternarReproduccion}
          className="feat-reel-linear-toggle"
          aria-label={
            reproduciendo ? `Pausar ${titulo}` : `Reproducir ${titulo}`
          }
        >
          {reproduciendo ? <IconoPausa /> : <IconoPlay />}
        </button>

        <div className="feat-reel-linear-track-shell">
          <output
            className="feat-reel-scrub-time"
            aria-live="off"
            aria-hidden={!desplazando}
          >
            {formatearTiempo(tiempoActual)} / {formatearTiempo(duracion)}
          </output>

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
            onPointerDown={iniciarDesplazamiento}
            onPointerUp={finalizarDesplazamiento}
            onPointerCancel={finalizarDesplazamiento}
            onBlur={() => setDesplazando(false)}
            onChange={(evento) => moverProgreso(Number(evento.target.value))}
            className="feat-reel-linear-seek"
            aria-label={`Posición de ${titulo}`}
            aria-valuetext={`${formatearTiempo(tiempoActual)} de ${formatearTiempo(duracion)}`}
          />
        </div>
      </div>
    </div>
  );
}
