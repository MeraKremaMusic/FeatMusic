"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import BotonGuardarIdea, {
  EVENTO_CAMBIO_IDEA_GUARDADA,
  type DetalleCambioIdeaGuardada,
} from "@/app/components/BotonGuardarIdea";
import ContadorVistasIdea from "@/app/components/ContadorVistasIdea";
import RegistrarVistaIdea from "@/app/components/RegistrarVistaIdea";
import type { OportunidadFeed } from "@/lib/feed-inicio";

import ReproductorReel from "./ReproductorReel";

const MAX_PROPUESTAS = 3;
const EVENTO_REPRODUCCION = "featmusic:reproducir-audio";

type VistaFeed = "para-ti" | "siguiendo" | "recientes" | "guardadas";

type FeedInicioProps = {
  oportunidadesIniciales: OportunidadFeed[];
  usuarioActualId: number;
};

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

function formatearRol(rol: string) {
  const roles: Record<string, string> = {
    CANTANTE: "Cantante",
    COMPOSITOR: "Compositor",
    PRODUCTOR: "Productor",
    BEATMAKER: "Beatmaker",
  };

  return roles[rol] ?? rol;
}

function tiempoPublicacion(creadoEn: string) {
  const diferencia = Math.max(0, Date.now() - new Date(creadoEn).getTime());
  const minutos = Math.floor(diferencia / 60_000);
  const horas = Math.floor(diferencia / 3_600_000);
  const dias = Math.floor(diferencia / 86_400_000);

  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas} h`;
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

function FotoArtista({ oportunidad }: { oportunidad: OportunidadFeed }) {
  const [fallo, setFallo] = useState(false);
  const { artista } = oportunidad;

  if (!artista.fotoPerfil || fallo) {
    return (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200/25 bg-emerald-400/15 text-xs font-black text-emerald-100 shadow-lg shadow-black/30">
        {iniciales(artista.nombreArtistico)}
      </span>
    );
  }

  return (
    <img
      src={artista.fotoPerfil}
      alt={`Foto de ${artista.nombreArtistico}`}
      className="h-11 w-11 shrink-0 rounded-full border border-white/20 object-cover shadow-lg shadow-black/40"
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

function TarjetaFeed({
  oportunidad,
  activa,
  usuarioActualId,
}: {
  oportunidad: OportunidadFeed;
  activa: boolean;
  usuarioActualId: number;
}) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const { artista } = oportunidad;
  const perfilHref = `/artistas/${encodeURIComponent(artista.nombreUsuario)}`;
  const cuposDisponibles = Math.max(
    0,
    MAX_PROPUESTAS - oportunidad.propuestasActuales,
  );
  const estiloFondo = artista.fotoPerfil
    ? ({
        "--reel-cover": `url("${artista.fotoPerfil.replaceAll('"', '\\"')}")`,
      } as CSSProperties)
    : undefined;

  return (
    <section
      data-feed-item
      data-oportunidad-id={oportunidad.id}
      className="h-full min-h-full snap-start snap-always sm:px-4 sm:py-3 lg:px-8"
    >
      <article
        data-vista-idea
        data-playing={reproduciendo ? "true" : "false"}
        style={estiloFondo}
        className="feat-reel-card relative mx-auto flex h-full w-full max-w-[760px] flex-col overflow-hidden bg-[#020907] shadow-[0_26px_90px_rgba(0,0,0,0.55)] transition duration-300 sm:rounded-[30px]"
      >
        <div className="feat-reel-cover-bg" aria-hidden="true" />
        <div className="feat-reel-shade" aria-hidden="true" />
        <div className="feat-reel-grid" aria-hidden="true" />
        <span className="feat-reel-orb feat-reel-orb-one" aria-hidden="true" />
        <span className="feat-reel-orb feat-reel-orb-two" aria-hidden="true" />
        <span className="feat-reel-orb feat-reel-orb-three" aria-hidden="true" />

        <RegistrarVistaIdea
          ideaId={oportunidad.id}
          sesionActiva
          esPropietario={usuarioActualId === artista.id}
          activa={activa}
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-3 pt-[4.15rem] sm:px-6 sm:pb-5 sm:pt-[4.5rem]">
          <header className="flex min-w-0 items-center gap-3">
            <Link href={perfilHref} className="shrink-0">
              <FotoArtista oportunidad={oportunidad} />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <Link
                  href={perfilHref}
                  className="truncate text-sm font-black text-white transition hover:text-emerald-200"
                >
                  {artista.nombreArtistico}
                </Link>
                {oportunidad.esSeguido && (
                  <span className="shrink-0 rounded-full border border-emerald-200/20 bg-emerald-400/10 px-2 py-0.5 text-[8px] font-black text-emerald-100">
                    Siguiendo
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[10px] font-semibold text-white/50">
                @{artista.nombreUsuario} · {tiempoPublicacion(oportunidad.creadoEn)}
              </p>
            </div>

            <BotonGuardarIdea
              ideaId={oportunidad.id}
              guardadaInicial={oportunidad.guardada}
              sesionActiva
              esPropietario={usuarioActualId === artista.id}
              disponible={cuposDisponibles > 0}
              variante="icono"
            />
          </header>

          <div className="flex min-h-0 flex-1 items-center justify-center py-3 sm:py-5">
            <ReproductorReel
              id={`reel-${oportunidad.id}`}
              src={oportunidad.audioUrl}
              titulo={oportunidad.titulo}
              activa={activa}
              duracionSegundos={oportunidad.duracionSegundos}
              fotoArtista={artista.fotoPerfil}
              inicialesArtista={iniciales(artista.nombreArtistico)}
              onEstadoChange={setReproduciendo}
            />
          </div>

          <div className="shrink-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300/75">
              Idea musical
            </p>
            <h1 className="mt-1.5 line-clamp-2 break-words text-[1.45rem] font-black leading-[1.03] tracking-[-0.025em] text-white sm:text-3xl">
              {oportunidad.titulo}
            </h1>
            <p className="mt-2 line-clamp-1 text-[11px] font-medium text-white/60 sm:text-xs">
              {oportunidad.descripcion}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {oportunidad.bpm ? (
                <span className="feat-reel-chip">{oportunidad.bpm} BPM</span>
              ) : null}
              {oportunidad.tonalidad ? (
                <span className="feat-reel-chip">♪ {oportunidad.tonalidad}</span>
              ) : null}
              <span className="feat-reel-chip feat-reel-chip-muted">
                {formatearRol(artista.rol)}
              </span>
            </div>

            <div className="mt-2 min-h-5 text-[10px] font-semibold text-white/55">
              <ContadorVistasIdea
                ideaId={oportunidad.id}
                totalInicial={oportunidad.vistasUnicas}
                esPropietario={usuarioActualId === artista.id}
                variante="compacta"
              />
            </div>

          </div>
        </div>
      </article>
    </section>
  );
}

function EstadoVacio({ vista }: { vista: VistaFeed }) {
  if (vista === "guardadas") {
    return (
      <div className="flex h-full min-h-full snap-start items-center justify-center px-6 text-center">
        <section className="max-w-sm rounded-3xl border border-white/10 bg-black/35 p-7 shadow-2xl shadow-black/30">
          <h2 className="text-lg font-black text-white">
            Todavía no guardaste oportunidades
          </h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Guarda las ideas que te interesen para escucharlas o preparar tu propuesta después.
          </p>
          <Link
            href="/artistas"
            className="mt-5 inline-flex rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-100"
          >
            Explorar oportunidades
          </Link>
        </section>
      </div>
    );
  }

  if (vista === "siguiendo") {
    return (
      <div className="flex h-full min-h-full snap-start items-center justify-center px-6 text-center">
        <section className="max-w-sm rounded-3xl border border-white/10 bg-black/35 p-7 shadow-2xl shadow-black/30">
          <h2 className="text-lg font-black text-white">
            Aún no hay oportunidades de artistas que sigues
          </h2>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Sigue artistas que te interesen y sus nuevas ideas aparecerán aquí.
          </p>
          <Link
            href="/artistas"
            className="mt-5 inline-flex rounded-xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-2.5 text-xs font-black text-emerald-100"
          >
            Explorar artistas
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-full snap-start items-center justify-center px-6 text-center">
      <section className="max-w-sm rounded-3xl border border-white/10 bg-black/35 p-7">
        <h2 className="text-lg font-black text-white">
          Todavía no hay oportunidades activas
        </h2>
        <p className="mt-2 text-xs leading-5 text-zinc-500">
          Cuando los artistas publiquen nuevas ideas musicales aparecerán aquí.
        </p>
      </section>
    </div>
  );
}

function usarOportunidadActiva(
  contenedorRef: RefObject<HTMLDivElement | null>,
  ids: number[],
) {
  const [activaId, setActivaId] = useState<number | null>(ids[0] ?? null);

  useEffect(() => {
    setActivaId(ids[0] ?? null);
  }, [ids]);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const elementos = Array.from(
      contenedor.querySelectorAll<HTMLElement>("[data-feed-item]"),
    );
    if (elementos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible || visible.intersectionRatio < 0.62) return;

        const id = Number((visible.target as HTMLElement).dataset.oportunidadId);
        if (Number.isFinite(id)) setActivaId(id);
      },
      {
        root: contenedor,
        threshold: [0.62, 0.76, 0.9],
      },
    );

    elementos.forEach((elemento) => observador.observe(elemento));
    return () => observador.disconnect();
  }, [contenedorRef, ids]);

  return activaId;
}

export default function FeedInicio({
  oportunidadesIniciales,
  usuarioActualId,
}: FeedInicioProps) {
  const [vista, setVista] = useState<VistaFeed>("para-ti");
  const [guardadasIds, setGuardadasIds] = useState<Set<number>>(
    () =>
      new Set(
        oportunidadesIniciales
          .filter((oportunidad) => oportunidad.guardada)
          .map((oportunidad) => oportunidad.id),
      ),
  );
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setGuardadasIds(
      new Set(
        oportunidadesIniciales
          .filter((oportunidad) => oportunidad.guardada)
          .map((oportunidad) => oportunidad.id),
      ),
    );
  }, [oportunidadesIniciales]);

  useEffect(() => {
    function actualizarGuardadas(evento: Event) {
      const detalle = (evento as CustomEvent<DetalleCambioIdeaGuardada>).detail;
      if (!detalle) return;

      setGuardadasIds((actuales) => {
        const siguientes = new Set(actuales);
        if (detalle.guardada) siguientes.add(detalle.ideaId);
        else siguientes.delete(detalle.ideaId);
        return siguientes;
      });
    }

    window.addEventListener(EVENTO_CAMBIO_IDEA_GUARDADA, actualizarGuardadas);
    return () =>
      window.removeEventListener(
        EVENTO_CAMBIO_IDEA_GUARDADA,
        actualizarGuardadas,
      );
  }, []);

  const oportunidades = useMemo(() => {
    const recientes = oportunidadesIniciales
      .map((oportunidad) => ({
        ...oportunidad,
        guardada: guardadasIds.has(oportunidad.id),
      }))
      .sort(
        (a, b) =>
          new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
      );

    if (vista === "recientes") return recientes;
    if (vista === "siguiendo") {
      return recientes.filter((oportunidad) => oportunidad.esSeguido);
    }
    if (vista === "guardadas") {
      return recientes.filter(
        (oportunidad) =>
          oportunidad.guardada && oportunidad.propuestasActuales < MAX_PROPUESTAS,
      );
    }

    const recomendadas = recientes.filter(
      (oportunidad) => oportunidad.compatibilidad.porcentaje >= 40,
    );
    const baseParaTi = recomendadas.length > 0 ? recomendadas : recientes;

    return [...baseParaTi].sort((a, b) => {
      const completaA = a.propuestasActuales >= MAX_PROPUESTAS ? 1 : 0;
      const completaB = b.propuestasActuales >= MAX_PROPUESTAS ? 1 : 0;

      if (completaA !== completaB) return completaA - completaB;
      if (b.compatibilidad.porcentaje !== a.compatibilidad.porcentaje) {
        return b.compatibilidad.porcentaje - a.compatibilidad.porcentaje;
      }

      return new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime();
    });
  }, [guardadasIds, oportunidadesIniciales, vista]);

  const ids = useMemo(
    () => oportunidades.map((oportunidad) => oportunidad.id),
    [oportunidades],
  );
  const activaId = usarOportunidadActiva(contenedorRef, ids);
  const indiceActivo = Math.max(
    0,
    oportunidades.findIndex((oportunidad) => oportunidad.id === activaId),
  );

  function cambiarVista(nuevaVista: VistaFeed) {
    if (nuevaVista === vista) return;

    window.dispatchEvent(
      new CustomEvent<string>(EVENTO_REPRODUCCION, {
        detail: `feed-pestana-${nuevaVista}`,
      }),
    );
    setVista(nuevaVista);
    contenedorRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }

  const pestanas: Array<{ id: VistaFeed; etiqueta: string }> = [
    { id: "para-ti", etiqueta: "Para ti" },
    { id: "siguiendo", etiqueta: "Siguiendo" },
    { id: "recientes", etiqueta: "Recientes" },
    { id: "guardadas", etiqueta: "Guardadas" },
  ];

  return (
    <div className="relative flex h-[calc(100dvh-48px)] min-h-0 flex-col overflow-hidden bg-[#020806] pb-[calc(4.65rem+env(safe-area-inset-bottom))] lg:h-[calc(100vh-48px)] lg:pb-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.13),transparent_36%)]" />

      <div className="feat-reel-tabs pointer-events-none absolute inset-x-0 top-0 z-30 px-3 pt-2.5 sm:px-5 sm:pt-3">
        <div className="pointer-events-auto mx-auto flex max-w-[760px] items-center gap-2">
          <div
            className="grid min-w-0 flex-1 grid-cols-4"
            role="tablist"
            aria-label="Feed de oportunidades"
          >
            {pestanas.map((pestana) => (
              <button
                key={pestana.id}
                type="button"
                role="tab"
                aria-selected={vista === pestana.id}
                onClick={() => cambiarVista(pestana.id)}
                className="feat-reel-tab px-1 py-2 text-[10px] transition sm:px-2 sm:text-xs"
              >
                {pestana.etiqueta}
              </button>
            ))}
          </div>

          {oportunidades.length > 0 && (
            <span className="feat-reel-position hidden shrink-0 px-2 py-2 text-[9px] tabular-nums sm:block">
              {indiceActivo + 1} / {oportunidades.length}
            </span>
          )}
        </div>
      </div>

      <div
        ref={contenedorRef}
        className="relative z-10 min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {oportunidades.length === 0 ? (
          <EstadoVacio vista={vista} />
        ) : (
          oportunidades.map((oportunidad) => (
            <TarjetaFeed
              key={`${vista}-${oportunidad.id}`}
              oportunidad={oportunidad}
              activa={activaId === oportunidad.id}
              usuarioActualId={usuarioActualId}
            />
          ))
        )}
      </div>

    </div>
  );
}
