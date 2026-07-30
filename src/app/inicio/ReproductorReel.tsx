"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const EVENTO_REPRODUCCION = "featmusic:reproducir-audio";

const ALTURAS_ONDA = [
  34, 58, 78, 46, 88, 64, 40, 72, 96, 62, 38, 82, 54, 92, 66, 44, 76, 100,
  68, 48, 86, 56, 94, 70, 42, 80, 60, 90, 52, 74, 98, 64, 46, 84, 58, 92,
  68, 40, 78, 54, 88, 62, 44, 72, 96, 60, 36, 82,
];

type ReproductorReelProps = {
  id: string;
  src: string;
  titulo: string;
  activa: boolean;
  duracionSegundos?: number | null;
  fotoArtista?: string | null;
  inicialesArtista: string;
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
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="currentColor">
      <path d="M8.2 5.5v13l10-6.5-10-6.5Z" />
    </svg>
  );
}

function IconoPausa() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="currentColor">
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
  fotoArtista,
  inicialesArtista,
  onEstadoChange,
}: ReproductorReelProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [autoplayBloqueado, setAutoplayBloqueado] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracionReal, setDuracionReal] = useState(
    Math.max(0, duracionSegundos ?? 0),
  );
  const [fotoInvalida, setFotoInvalida] = useState(false);

  const duracion = Math.max(duracionReal, duracionSegundos ?? 0, 0);
  const progreso = duracion > 0 ? Math.min(100, (tiempoActual / duracion) * 100) : 0;
  const barrasActivas = Math.round((progreso / 100) * ALTURAS_ONDA.length);

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
      setAutoplayBloqueado(false);
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
        if (!cancelado) setAutoplayBloqueado(false);
      } catch {
        if (!cancelado) setAutoplayBloqueado(true);
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
      setAutoplayBloqueado(false);
    } catch {
      setAutoplayBloqueado(true);
    }
  }

  function moverProgreso(valor: number) {
    const audio = audioRef.current;
    if (!audio || duracion <= 0) return;

    audio.currentTime = (valor / 100) * duracion;
    setTiempoActual(audio.currentTime);
  }

  return (
    <div className="feat-reel-player" data-playing={reproduciendo ? "true" : "false"}>
      <audio
        ref={audioRef}
        src={src}
        preload={activa ? "auto" : "metadata"}
        loop
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        onTimeUpdate={(evento) => setTiempoActual(evento.currentTarget.currentTime)}
        onLoadedMetadata={(evento) => {
          const nuevaDuracion = evento.currentTarget.duration;
          if (Number.isFinite(nuevaDuracion)) setDuracionReal(nuevaDuracion);
        }}
      />

      <button
        type="button"
        onClick={alternarReproduccion}
        className="feat-reel-disc"
        aria-label={reproduciendo ? `Pausar ${titulo}` : `Reproducir ${titulo}`}
      >
        <span className="feat-reel-disc-glow" aria-hidden="true" />
        <span className="feat-reel-disc-cover">
          {fotoArtista && !fotoInvalida ? (
            <img
              src={fotoArtista}
              alt=""
              draggable={false}
              onError={() => setFotoInvalida(true)}
            />
          ) : (
            <span className="feat-reel-disc-initials">{inicialesArtista}</span>
          )}
        </span>
        <span className="feat-reel-disc-control">
          {reproduciendo ? <IconoPausa /> : <IconoPlay />}
        </span>
      </button>

      <div className="feat-reel-wave-shell" style={estiloProgreso}>
        <div className="feat-reel-wave" aria-hidden="true">
          {ALTURAS_ONDA.map((altura, indice) => (
            <span
              key={`${indice}-${altura}`}
              className={indice < barrasActivas ? "is-progress" : undefined}
              style={
                {
                  "--bar-height": `${altura}%`,
                  "--bar-delay": `${-(indice % 9) * 90}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progreso}
          onChange={(evento) => moverProgreso(Number(evento.target.value))}
          className="feat-reel-seek"
          aria-label={`Posición de ${titulo}`}
        />
      </div>

      <div className="mt-2 flex w-full items-center justify-between text-[10px] font-bold tabular-nums text-white/55">
        <span>{formatearTiempo(tiempoActual)}</span>
        <span>{formatearTiempo(duracion)}</span>
      </div>

      <p
        className={`mt-2 min-h-4 text-center text-[10px] font-black uppercase tracking-[0.16em] transition ${
          autoplayBloqueado ? "text-emerald-200" : "text-white/45"
        }`}
      >
        {autoplayBloqueado
          ? "Toca el reproductor para escuchar"
          : reproduciendo
            ? "Reproduciendo ahora"
            : "Listo para reproducir"}
      </p>
    </div>
  );
}
