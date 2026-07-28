"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import NavegacionEscritorio from "../components/NavegacionEscritorio";
import RegistrarVistaIdea from "../components/RegistrarVistaIdea";
import ReproductorAudio from "../components/ReproductorAudio";
import ResumenColaboracionIdea from "../components/ResumenColaboracionIdea";
import MenuMovilPanel from "../panel/components/MenuMovilPanel";
import OportunidadesMusicales, {
  type OportunidadMusical,
  type OpcionesFiltrosOportunidades,
} from "./OportunidadesMusicales";

export type ArtistaExplorar = {
  id: number;
  nombreArtistico: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  biografia: string | null;
  siguiendoInicial: boolean;
  ciudad: string;
  pais: string;
  codigoPais: string;
  rol: string;
  generos: string[];
  ideasActivas: number;
  ideasRecientes: Array<{
    id: number;
    titulo: string;
    descripcion: string | null;
    audioUrl: string;
    duracionSegundos: number;
    bpm: number;
    tonalidad: string;
    rolBuscado: string | null;
    generoMusical: string | null;
    idiomaBuscado: string | null;
    modalidadColaboracion: string | null;
    paisPreferido: string | null;
    departamentoPreferido: string | null;
    ciudadPreferida: string | null;
    tipoAcuerdo: string | null;
    vistasUnicas: number;
  }>;
  creadoEn: string;
};

export type EstadisticasExplorar = {
  artistas: number;
  ideas: number;
  propuestas: number;
};

export type OpcionesFiltros = {
  paises: string[];
  ciudades: string[];
  generos: string[];
  roles: string[];
};

type ArtistasClientProps = {
  sesionActiva: boolean;
  usuarioActualId: number | null;
  artistasIniciales: ArtistaExplorar[];
  oportunidadesIniciales: OportunidadMusical[];
  estadisticas: EstadisticasExplorar;
  opciones: OpcionesFiltros;
  opcionesOportunidades: OpcionesFiltrosOportunidades;
  errorCarga: boolean;
};

const ARTISTAS_POR_PAGINA = 12;

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
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

function IconoSalir({ className = "h-3 w-3" }: { className?: string }) {
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
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M13 4h7v16h-7" />
    </svg>
  );
}

function IconoBuscar({ className = "h-4 w-4" }: { className?: string }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconoUsuarios({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M14.5 16.5a4.5 4.5 0 0 1 6 3.5" />
    </svg>
  );
}

function IconoIdea({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.2 14.5A7 7 0 1 1 15.8 14.5c-1.1.8-1.8 1.8-1.8 3.5h-4c0-1.7-.7-2.7-1.8-3.5Z" />
    </svg>
  );
}

function IconoPropuesta({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16v12H8l-4 3V5Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function IconoUbicacion({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconoDescripcion({
  className = "h-3.5 w-3.5",
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
      <path d="M4 5.5h16v10H9l-5 4v-14Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

function CargandoArtistas() {
  return (
    <section className="relative flex min-h-[calc(100vh-48px)] items-center justify-center overflow-hidden px-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.055)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-violet-400/20 bg-violet-500/5" />
          <span className="absolute inset-1 animate-ping rounded-full border border-violet-400/30" />
          <span className="absolute inset-3 animate-pulse rounded-full bg-violet-500/15" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/30 bg-violet-500/15 text-violet-200 shadow-[0_0_35px_rgba(139,92,246,0.25)]">
            <IconoUsuarios className="h-7 w-7" />
          </div>
        </div>

        <p className="mt-6 text-base font-bold tracking-tight text-zinc-100">
          Cargando artistas...
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Preparando nuevas conexiones musicales
        </p>
        <div className="mt-5 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-300" />
        </div>
      </div>
    </section>
  );
}

function TarjetaEstadistica({
  titulo,
  tituloMovil,
  valor,
  icono,
  nota,
}: {
  titulo: string;
  tituloMovil: string;
  valor: number;
  icono: ReactNode;
  nota?: string;
}) {
  return (
    <article className="flex min-w-0 items-center gap-2 px-2.5 py-2 md:gap-2.5 md:px-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-violet-400/20 bg-violet-500/10 text-violet-300 md:h-8 md:w-8">
        {icono}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[8px] font-semibold text-zinc-500 sm:hidden">
          {tituloMovil}
        </p>
        <p className="hidden truncate text-[9px] font-semibold text-zinc-500 sm:block lg:text-[10px]">
          {titulo}
        </p>
        <p className="mt-0.5 text-base font-black leading-none text-white md:text-lg">
          {valor.toLocaleString("es-CO")}
        </p>
      </div>

      {nota && (
        <span className="ml-auto hidden rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-2 py-0.5 text-[8px] font-bold text-violet-300/70 xl:inline-flex">
          Próximamente
        </span>
      )}
    </article>
  );
}

function FotoArtista({ artista }: { artista: ArtistaExplorar }) {
  const [fallo, setFallo] = useState(false);

  if (!artista.fotoPerfil || fallo) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/10 text-sm font-black text-violet-200 shadow-[0_10px_25px_rgba(0,0,0,0.2)]">
        {iniciales(artista.nombreArtistico)}
      </div>
    );
  }

  return (
    <img
      src={artista.fotoPerfil}
      alt={`Foto de ${artista.nombreArtistico}`}
      className="h-14 w-14 shrink-0 rounded-2xl border border-white/10 object-cover shadow-[0_10px_25px_rgba(0,0,0,0.2)]"
      onError={() => setFallo(true)}
    />
  );
}


function BanderaPais({
  codigoPais,
  pais,
}: {
  codigoPais: string;
  pais: string;
}) {
  const [falloImagen, setFalloImagen] = useState(false);
  const codigo = codigoPais.trim().toLowerCase();
  const codigoValido = /^[a-z]{2}$/.test(codigo);

  if (!codigoValido) {
    return null;
  }

  if (falloImagen) {
    return (
      <span
        title={pais}
        aria-label={`País: ${pais}`}
        className="shrink-0 text-[9px] font-black uppercase tracking-wide text-zinc-500"
      >
        {codigo}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${codigo}.png`}
      srcSet={`https://flagcdn.com/w80/${codigo}.png 2x`}
      width={28}
      height={20}
      alt={`Bandera de ${pais}`}
      title={pais}
      className="h-[18px] w-7 shrink-0 rounded-[3px] object-cover shadow-sm"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFalloImagen(true)}
    />
  );
}

type RespuestaSeguimiento = {
  ok: boolean;
  mensaje?: string;
  siguiendo?: boolean;
};

function BotonSeguirArtista({
  artistaId,
  nombreArtistico,
  sesionActiva,
  esPerfilPropio,
  siguiendoInicial,
}: {
  artistaId: number;
  nombreArtistico: string;
  sesionActiva: boolean;
  esPerfilPropio: boolean;
  siguiendoInicial: boolean;
}) {
  const [siguiendo, setSiguiendo] = useState(siguiendoInicial);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  if (esPerfilPropio) {
    return null;
  }

  async function alternarSeguimiento() {
    if (procesando) {
      return;
    }

    if (!sesionActiva) {
      window.location.assign("/iniciar-sesion");
      return;
    }

    const estadoAnterior = siguiendo;
    const nuevoEstado = !estadoAnterior;

    setError("");
    setProcesando(true);
    setSiguiendo(nuevoEstado);

    try {
      const respuesta = await fetch(`/api/artistas/${artistaId}/seguir`, {
        method: nuevoEstado ? "POST" : "DELETE",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });
      const datos = (await respuesta.json()) as RespuestaSeguimiento;

      if (!respuesta.ok || !datos.ok) {
        throw new Error(datos.mensaje ?? "No se pudo actualizar el seguimiento.");
      }

      setSiguiendo(Boolean(datos.siguiendo));
    } catch (errorSeguimiento) {
      setSiguiendo(estadoAnterior);
      setError(
        errorSeguimiento instanceof Error
          ? errorSeguimiento.message
          : "No se pudo actualizar el seguimiento.",
      );
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => void alternarSeguimiento()}
        disabled={procesando}
        aria-pressed={siguiendo}
        aria-label={
          siguiendo
            ? `Dejar de seguir a ${nombreArtistico}`
            : `Seguir a ${nombreArtistico}`
        }
        title={siguiendo ? "Dejar de seguir" : "Seguir artista"}
        className={`inline-flex h-7 min-w-[58px] items-center justify-center gap-1 rounded-lg border px-2 text-[9px] font-black transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-wait disabled:opacity-65 ${
          siguiendo
            ? "border-violet-300/30 bg-violet-500/10 text-violet-200 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            : "border-violet-500 bg-violet-600 text-white shadow-[0_6px_16px_rgba(124,58,237,0.22)] hover:bg-violet-700"
        }`}
      >
        <span aria-hidden="true">{siguiendo ? "✓" : "+"}</span>
        {procesando ? "..." : siguiendo ? "Siguiendo" : "Seguir"}
      </button>

      {error && (
        <span
          role="alert"
          className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-red-400/20 bg-[#181015]/95 px-2.5 py-2 text-[9px] font-semibold leading-3.5 text-red-200 shadow-xl backdrop-blur"
        >
          {error}
        </span>
      )}
    </div>
  );
}

function TarjetaArtista({
  artista,
  descripcionAbiertaId,
  onCambiarDescripcion,
  sesionActiva,
  usuarioActualId,
}: {
  artista: ArtistaExplorar;
  descripcionAbiertaId: number | null;
  onCambiarDescripcion: (ideaId: number | null) => void;
  sesionActiva: boolean;
  usuarioActualId: number | null;
}) {
  const ubicacion =
    [artista.ciudad, artista.pais].filter(Boolean).join(", ") ||
    "Ubicación sin completar";
  const ideasAdicionales =
    artista.ideasActivas - artista.ideasRecientes.length;
  const descripcionAbiertaEnTarjeta = artista.ideasRecientes.some(
    (idea) => idea.id === descripcionAbiertaId,
  );

  return (
    <article
      className={`group relative flex h-full min-h-[290px] flex-col overflow-visible rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(0,0,0,0.2)_45%,rgba(139,92,246,0.035))] shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/25 hover:shadow-[0_22px_60px_rgba(0,0,0,0.28)] ${
        descripcionAbiertaEnTarjeta ? "z-40" : "z-0 hover:z-20"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-14 -top-16 h-32 w-32 rounded-full bg-violet-500/[0.08] blur-3xl transition duration-300 group-hover:bg-violet-500/[0.12]" />
      </div>

      <div className="relative p-3.5 sm:p-4">
        <div className="flex items-start gap-3">
          <FotoArtista artista={artista} />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-black leading-tight text-white sm:text-base">
                  {artista.nombreArtistico}
                </h2>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-violet-300">
                  @{artista.nombreUsuario}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <BotonSeguirArtista
                  artistaId={artista.id}
                  nombreArtistico={artista.nombreArtistico}
                  sesionActiva={sesionActiva}
                  esPerfilPropio={usuarioActualId === artista.id}
                  siguiendoInicial={artista.siguiendoInicial}
                />
                <BanderaPais
                  codigoPais={artista.codigoPais}
                  pais={artista.pais}
                />
              </div>
            </div>

            <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[10px] text-zinc-500 sm:text-[11px]">
              <IconoUbicacion className="h-3 w-3 shrink-0" />
              <span className="truncate">{ubicacion}</span>
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-violet-400/20 bg-violet-500/[0.09] px-2.5 py-1 text-[9px] font-bold text-violet-200">
            {formatearRol(artista.rol)}
          </span>

          {artista.generos.slice(0, 3).map((genero) => (
            <span
              key={genero}
              className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-zinc-400"
            >
              {genero}
            </span>
          ))}

          {artista.generos.length === 0 && (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-2.5 py-1 text-[9px] text-zinc-600">
              Sin géneros
            </span>
          )}
        </div>

        <p className="mt-3 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2] text-[10px] leading-4 text-zinc-500 sm:text-[11px]">
          {artista.biografia?.trim() ||
            "Este artista todavía no ha agregado una descripción."}
        </p>
      </div>

      <div className="relative flex flex-1 flex-col border-t border-white/[0.07]">
        {artista.ideasRecientes.length > 0 ? (
          <div className="flex-1 divide-y divide-white/[0.06] px-3.5 sm:px-4">
            {artista.ideasRecientes.map((idea, indice) => {
              const descripcion = idea.descripcion?.trim() ?? "";
              const hayDatosColaboracion = [
                idea.rolBuscado,
                idea.generoMusical,
                idea.idiomaBuscado,
                idea.modalidadColaboracion,
                idea.paisPreferido,
                idea.departamentoPreferido,
                idea.ciudadPreferida,
                idea.tipoAcuerdo,
              ].some(
                (valor) =>
                  typeof valor === "string" && valor.trim().length > 0,
              );
              const mostrarDetalle =
                Boolean(descripcion) || hayDatosColaboracion;
              const descripcionAbierta = descripcionAbiertaId === idea.id;

              return (
                <div
                  key={idea.id}
                  data-vista-idea
                  className="relative py-2.5"
                >
                  <RegistrarVistaIdea
                    ideaId={idea.id}
                    sesionActiva={sesionActiva}
                    esPropietario={usuarioActualId === artista.id}
                  />
                  <ReproductorAudio
                    id={`explorar-${idea.id}`}
                    src={idea.audioUrl}
                    titulo={idea.titulo}
                    bpm={idea.bpm}
                    tonalidad={idea.tonalidad}
                    duracionSegundos={idea.duracionSegundos}
                    numero={indice + 1}
                    className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-8 [&_button]:w-8 [&_input[type='range']]:mt-5"
                  />

                  {mostrarDetalle && (
                    <div
                      data-descripcion-idea
                      className="absolute right-0 top-[31px] z-30"
                      onMouseEnter={() => onCambiarDescripcion(idea.id)}
                      onMouseLeave={() => onCambiarDescripcion(null)}
                    >
                      <button
                        type="button"
                        aria-label={`Ver descripción de ${idea.titulo}`}
                        aria-expanded={descripcionAbierta}
                        aria-controls={`descripcion-idea-${idea.id}`}
                        title="Ver descripción"
                        onClick={() =>
                          onCambiarDescripcion(
                            descripcionAbierta ? null : idea.id,
                          )
                        }
                        className={`inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[7px] font-bold transition focus:outline-none focus:ring-2 focus:ring-violet-400/40 sm:text-[8px] ${
                          descripcionAbierta
                            ? "border-violet-300/35 bg-violet-500/20 text-violet-100"
                            : "border-white/[0.08] bg-[#0d0a12]/90 text-zinc-500 hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200"
                        }`}
                      >
                        <IconoDescripcion className="h-2.5 w-2.5" />
                        <span>Descripción</span>
                      </button>

                      {descripcionAbierta && (
                        <div
                          id={`descripcion-idea-${idea.id}`}
                          role="dialog"
                          aria-label={`Descripción de ${idea.titulo}`}
                          className="absolute bottom-7 right-0 z-50 max-h-[min(420px,70vh)] w-[min(300px,calc(100vw-3rem))] overflow-y-auto rounded-xl border border-violet-400/20 bg-[#110d18]/95 p-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl [scrollbar-width:thin]"
                        >
                          <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-violet-400/20 bg-[#110d18]" />

                          <div className="relative">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                                <IconoDescripcion className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-violet-300">
                                  Descripción
                                </p>
                                <p className="truncate text-[10px] font-bold text-zinc-200">
                                  {idea.titulo}
                                </p>
                              </div>
                            </div>

                            {descripcion ? (
                              <p className="mt-2.5 max-h-28 overflow-y-auto whitespace-pre-wrap pr-1 text-[10px] leading-4 text-zinc-400 [scrollbar-width:thin] sm:text-[11px] sm:leading-[1.15rem]">
                                {descripcion}
                              </p>
                            ) : (
                              <p className="mt-2.5 text-[10px] leading-4 text-zinc-500 sm:text-[11px]">
                                Sin descripción adicional.
                              </p>
                            )}

                            {hayDatosColaboracion && (
                              <div className="mt-3 border-t border-white/[0.08] pt-3">
                                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-violet-300">
                                  Tipo de colaboración
                                </p>
                                <ResumenColaboracionIdea
                                  rolBuscado={idea.rolBuscado}
                                  generoMusical={idea.generoMusical}
                                  idiomaBuscado={idea.idiomaBuscado}
                                  modalidadColaboracion={
                                    idea.modalidadColaboracion
                                  }
                                  paisPreferido={idea.paisPreferido}
                                  departamentoPreferido={
                                    idea.departamentoPreferido
                                  }
                                  ciudadPreferida={idea.ciudadPreferida}
                                  tipoAcuerdo={idea.tipoAcuerdo}
                                  compacta
                                  className="!mt-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {ideasAdicionales > 0 && (
              <p className="py-2 text-center text-[9px] font-semibold text-zinc-600">
                +{ideasAdicionales} {ideasAdicionales === 1 ? "idea adicional" : "ideas adicionales"}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center px-4 py-8">
            <p className="text-center text-[10px] leading-5 text-zinc-600">
              Sin ideas publicadas actualmente
            </p>
          </div>
        )}
      </div>

      <Link
        href={`/artistas/${encodeURIComponent(artista.nombreUsuario)}`}
        className="relative flex items-center justify-center rounded-b-2xl border-t border-violet-500/20 bg-violet-600 px-4 py-3 text-center text-[11px] font-black text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:ring-offset-2 focus:ring-offset-transparent"
      >
        <span>Ver perfil</span>
      </Link>
    </article>
  );
}

export default function ArtistasClient({
  sesionActiva,
  usuarioActualId,
  artistasIniciales,
  oportunidadesIniciales,
  estadisticas,
  opciones,
  opcionesOportunidades,
  errorCarga,
}: ArtistasClientProps) {
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<"artistas" | "oportunidades">("artistas");
  const [busqueda, setBusqueda] = useState("");
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [genero, setGenero] = useState("");
  const [rol, setRol] = useState("");
  const [soloConIdeas, setSoloConIdeas] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [descripcionAbiertaId, setDescripcionAbiertaId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    function cerrarDescripcionFuera(evento: PointerEvent) {
      const objetivo = evento.target;

      if (
        objetivo instanceof Element &&
        objetivo.closest("[data-descripcion-idea]")
      ) {
        return;
      }

      setDescripcionAbiertaId(null);
    }

    function cerrarDescripcionConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setDescripcionAbiertaId(null);
      }
    }

    document.addEventListener("pointerdown", cerrarDescripcionFuera);
    document.addEventListener("keydown", cerrarDescripcionConEscape);

    return () => {
      document.removeEventListener("pointerdown", cerrarDescripcionFuera);
      document.removeEventListener("keydown", cerrarDescripcionConEscape);
    };
  }, []);

  useEffect(() => {
    const temporizador = window.setTimeout(() => setCargando(false), 700);
    return () => window.clearTimeout(temporizador);
  }, []);

  useEffect(() => {
    setPagina(1);
    setDescripcionAbiertaId(null);
  }, [busqueda, pais, ciudad, genero, rol, soloConIdeas]);

  useEffect(() => {
    setDescripcionAbiertaId(null);
  }, [vista]);

  const artistasFiltrados = useMemo(() => {
    const termino = normalizar(busqueda);

    return artistasIniciales.filter((artista) => {
      const coincideTexto =
        !termino ||
        [artista.nombreArtistico, artista.nombreUsuario, artista.ciudad, artista.pais].some(
          (valor) => normalizar(valor).includes(termino),
        );
      const coincidePais = !pais || artista.pais === pais;
      const coincideCiudad = !ciudad || artista.ciudad === ciudad;
      const coincideRol = !rol || artista.rol === rol;
      const coincideGenero =
        !genero || artista.generos.some((item) => item === genero);
      const coincideIdeas = !soloConIdeas || artista.ideasActivas > 0;

      return (
        coincideTexto &&
        coincidePais &&
        coincideCiudad &&
        coincideRol &&
        coincideGenero &&
        coincideIdeas
      );
    });
  }, [
    artistasIniciales,
    busqueda,
    pais,
    ciudad,
    genero,
    rol,
    soloConIdeas,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(artistasFiltrados.length / ARTISTAS_POR_PAGINA),
  );
  const paginaSegura = Math.min(pagina, totalPaginas);
  const artistasPagina = artistasFiltrados.slice(
    (paginaSegura - 1) * ARTISTAS_POR_PAGINA,
    paginaSegura * ARTISTAS_POR_PAGINA,
  );

  function limpiarFiltros() {
    setBusqueda("");
    setPais("");
    setCiudad("");
    setGenero("");
    setRol("");
    setPagina(1);
  }

  const hayFiltros = Boolean(busqueda || pais || ciudad || genero || rol);

  return (
    <main className="featmusic-app-light min-h-screen w-full max-w-full overflow-x-clip bg-[#09070d] pb-20 text-white lg:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-12 max-w-[1280px] items-center justify-between px-4">
          <Link
            href={sesionActiva ? "/panel" : "/"}
            className="text-lg font-black tracking-tight"
          >
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <NavegacionEscritorio />

          {sesionActiva ? (
            <form action="/api/cerrar-sesion" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-red-400/50 px-3 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10"
              >
                <IconoSalir />
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="rounded-lg border border-violet-400/50 px-3 py-1.5 text-[10px] font-bold text-violet-200 transition hover:bg-violet-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      {cargando ? (
        <CargandoArtistas />
      ) : (
        <div className="mx-auto w-full min-w-0 max-w-[1280px] overflow-x-clip px-4 py-4 md:py-5">
          <section className="grid grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-black/35 backdrop-blur-sm">
            <TarjetaEstadistica
              titulo="Artistas en FeatMusic"
              tituloMovil="Artistas"
              valor={estadisticas.artistas}
              icono={<IconoUsuarios className="h-3.5 w-3.5 md:h-4 md:w-4" />}
            />
            <TarjetaEstadistica
              titulo="Ideas musicales activas"
              tituloMovil="Ideas"
              valor={estadisticas.ideas}
              icono={<IconoIdea className="h-3.5 w-3.5 md:h-4 md:w-4" />}
            />
            <TarjetaEstadistica
              titulo="Propuestas enviadas"
              tituloMovil="Propuestas"
              valor={estadisticas.propuestas}
              icono={<IconoPropuesta className="h-3.5 w-3.5 md:h-4 md:w-4" />}
            />
          </section>

          <section className="mt-3 rounded-xl border border-white/10 bg-black/35 p-1.5 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-1.5" role="tablist" aria-label="Explorar FeatMusic">
              <button
                type="button"
                role="tab"
                aria-selected={vista === "artistas"}
                onClick={() => setVista("artistas")}
                className={`rounded-lg px-3 py-2.5 text-xs font-black transition ${
                  vista === "artistas"
                    ? "border border-violet-400/25 bg-violet-500/15 text-violet-100 shadow-[0_8px_25px_rgba(139,92,246,0.08)]"
                    : "border border-transparent text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200"
                }`}
              >
                Artistas
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={vista === "oportunidades"}
                onClick={() => setVista("oportunidades")}
                className={`rounded-lg px-3 py-2.5 text-xs font-black transition ${
                  vista === "oportunidades"
                    ? "border border-violet-400/25 bg-violet-500/15 text-violet-100 shadow-[0_8px_25px_rgba(139,92,246,0.08)]"
                    : "border border-transparent text-zinc-500 hover:bg-white/[0.035] hover:text-zinc-200"
                }`}
              >
                Oportunidades
                <span className="ml-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-1.5 py-0.5 text-[8px] text-violet-200">
                  {oportunidadesIniciales.length}
                </span>
              </button>
            </div>
          </section>

          {vista === "artistas" ? (
            <>
              <section className="mt-3 rounded-xl border border-white/10 bg-black/35 p-3 backdrop-blur-sm">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-[#100d15] px-3 py-2 focus-within:border-violet-400/40 lg:w-[320px] lg:flex-none">
                <IconoBuscar className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  placeholder="Nombre, usuario, ciudad o país"
                  className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:min-w-0 lg:flex-1">
                <select
                  value={pais}
                  onChange={(evento) => setPais(evento.target.value)}
                  aria-label="Filtrar por país"
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-[#100d15] px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-violet-400/40"
                >
                  <option value="">Todos los países</option>
                  {opciones.paises.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>

                <select
                  value={ciudad}
                  onChange={(evento) => setCiudad(evento.target.value)}
                  aria-label="Filtrar por ciudad"
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-[#100d15] px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-violet-400/40"
                >
                  <option value="">Todas las ciudades</option>
                  {opciones.ciudades.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>

                <select
                  value={genero}
                  onChange={(evento) => setGenero(evento.target.value)}
                  aria-label="Filtrar por género"
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-[#100d15] px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-violet-400/40"
                >
                  <option value="">Todos los géneros</option>
                  {opciones.generos.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                  ))}
                </select>

                <select
                  value={rol}
                  onChange={(evento) => setRol(evento.target.value)}
                  aria-label="Filtrar por rol"
                  className="w-full min-w-0 rounded-lg border border-white/10 bg-[#100d15] px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-violet-400/40"
                >
                  <option value="">Todos los roles</option>
                  {opciones.roles.map((opcion) => (
                    <option key={opcion} value={opcion}>{formatearRol(opcion)}</option>
                  ))}
                </select>
              </div>

              {hayFiltros && (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-zinc-300 transition hover:bg-white/5"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="mt-2 border-t border-white/5 pt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-0.5 text-[11px] font-semibold text-zinc-400 transition hover:text-white">
                <input
                  type="checkbox"
                  checked={soloConIdeas}
                  onChange={(evento) => setSoloConIdeas(evento.target.checked)}
                  className="h-3.5 w-3.5 cursor-pointer rounded border-white/20 bg-[#100d15] accent-violet-500"
                />
                <span>Mostrar solo artistas con ideas</span>
              </label>
            </div>
          </section>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold text-zinc-400">
              {artistasFiltrados.length.toLocaleString("es-CO")} {artistasFiltrados.length === 1 ? "artista encontrado" : "artistas encontrados"}
            </p>
            {totalPaginas > 1 && (
              <p className="text-[10px] font-semibold text-zinc-600">
                Página {paginaSegura} de {totalPaginas}
              </p>
            )}
          </div>

          {errorCarga ? (
            <section className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-5 py-14 text-center">
              <h2 className="text-base font-bold text-red-200">No se pudieron cargar los artistas</h2>
              <p className="mt-2 text-xs text-red-200/60">Revisa la conexión con la base de datos e inténtalo nuevamente.</p>
            </section>
          ) : artistasIniciales.length === 0 ? (
            <section className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-5 py-14 text-center text-sm font-semibold text-zinc-400">
              Todavía no hay artistas con el perfil completo
            </section>
          ) : artistasPagina.length === 0 ? (
            <section className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-5 py-14 text-center">
              <p className="text-sm font-semibold text-zinc-300">No encontramos artistas con esos filtros</p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-200"
              >
                Limpiar búsqueda
              </button>
            </section>
          ) : (
            <section className="mt-3 grid min-w-0 items-stretch gap-3.5 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3">
              {artistasPagina.map((artista) => (
                <TarjetaArtista
                  key={artista.id}
                  artista={artista}
                  descripcionAbiertaId={descripcionAbiertaId}
                  onCambiarDescripcion={setDescripcionAbiertaId}
                  sesionActiva={sesionActiva}
                  usuarioActualId={usuarioActualId}
                />
              ))}
            </section>
          )}

          {totalPaginas > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                disabled={paginaSegura === 1}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs font-bold text-zinc-500">{paginaSegura} / {totalPaginas}</span>
              <button
                type="button"
                onClick={() => setPagina((actual) => Math.min(totalPaginas, actual + 1))}
                disabled={paginaSegura === totalPaginas}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
            </>
          ) : (
            <OportunidadesMusicales
              sesionActiva={sesionActiva}
              usuarioActualId={usuarioActualId}
              oportunidadesIniciales={oportunidadesIniciales}
              opciones={opcionesOportunidades}
              errorCarga={errorCarga}
            />
          )}
        </div>
      )}

      {sesionActiva && <MenuMovilPanel />}
    </main>
  );
}