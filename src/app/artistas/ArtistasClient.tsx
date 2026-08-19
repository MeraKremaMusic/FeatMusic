"use client";

// FEATMUSIC_PORTADAS_TARJETAS_EXPLORAR_V1
// FEATMUSIC_QUITAR_PORTADA_IDEAS_EXPLORAR_V1
// FEATMUSIC_MENU_MAS_PAGINAS_NUEVAS_V1

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import NavegacionEscritorio from "../components/NavegacionEscritorio";
import { MenuMasMovil } from "../components/MenuMasNavegacion";
import RegistrarVistaIdea from "../components/RegistrarVistaIdea";
import ReproductorAudio from "../components/ReproductorAudio";
import ResumenColaboracionIdea from "../components/ResumenColaboracionIdea";
import MenuMovilPanel from "../panel/components/MenuMovilPanel";

export type ArtistaExplorar = {
  id: number;
  nombreArtistico: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  portadaPerfil: string | null;
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
    portadaUrl: string | null;
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
  estadisticas: EstadisticasExplorar;
  opciones: OpcionesFiltros;
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

function IconoFiltro({ className = "h-4 w-4" }: { className?: string }) {
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
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
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
    <section className="featmusic-explore-loading relative flex min-h-[calc(100dvh-48px)] items-center justify-center overflow-hidden px-4 pb-20 pt-6 lg:pb-6">
      <div className="relative w-full max-w-[520px]">
        <div className="flex flex-col items-center text-center">
          <div className="featmusic-explore-loading-badge inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFD400] text-black">
              <IconoUsuarios className="h-4 w-4" />
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.18em]">
              Explorando FeatMusic
            </span>
          </div>

          <div
            className="featmusic-explore-loading-stack relative mx-auto mt-7 h-[190px] w-full max-w-[420px]"
            aria-hidden="true"
          >
            <article className="featmusic-explore-loading-card featmusic-explore-loading-card--left">
              <div className="flex items-center gap-3">
                <span className="featmusic-explore-skeleton h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <span className="featmusic-explore-skeleton block h-2.5 w-28 max-w-full rounded-full" />
                  <span className="featmusic-explore-skeleton block h-2 w-16 rounded-full" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <span className="featmusic-explore-skeleton block h-2 w-full rounded-full" />
                <span className="featmusic-explore-skeleton block h-2 w-2/3 rounded-full" />
              </div>
            </article>

            <article className="featmusic-explore-loading-card featmusic-explore-loading-card--right">
              <div className="flex items-center gap-3">
                <span className="featmusic-explore-skeleton h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <span className="featmusic-explore-skeleton block h-2.5 w-24 max-w-full rounded-full" />
                  <span className="featmusic-explore-skeleton block h-2 w-20 rounded-full" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <span className="featmusic-explore-skeleton block h-2 w-5/6 rounded-full" />
                <span className="featmusic-explore-skeleton block h-2 w-1/2 rounded-full" />
              </div>
            </article>

            <article className="featmusic-explore-loading-card featmusic-explore-loading-card--front">
              <div className="flex items-center gap-3">
                <span className="featmusic-explore-skeleton h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <span className="featmusic-explore-skeleton block h-2.5 w-32 max-w-full rounded-full" />
                  <span className="featmusic-explore-skeleton block h-2 w-20 rounded-full" />
                </div>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#FFD400]" />
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <span className="featmusic-explore-skeleton block h-2 w-full rounded-full" />
                  <span className="featmusic-explore-skeleton block h-2 w-3/4 rounded-full" />
                </div>
                <div className="featmusic-explore-loading-wave flex h-7 shrink-0 items-end gap-1">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </article>
          </div>

          <p className="mt-2 text-base font-black tracking-tight">
            Buscando conexiones...
          </p>
          <p className="featmusic-explore-loading-subtitle mt-1.5 text-[11px]">
            Preparando artistas e ideas para ti
          </p>

          <div
            className="featmusic-explore-loading-progress mt-5 h-1 w-36 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <span className="block h-full w-1/3 rounded-full bg-[#FFD400]" />
          </div>
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
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-yellow-400/20 bg-yellow-500/10 text-yellow-300 md:h-8 md:w-8">
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
        <span className="ml-auto hidden rounded-full border border-yellow-400/15 bg-yellow-500/[0.07] px-2 py-0.5 text-[8px] font-bold text-yellow-300/70 xl:inline-flex">
          Próximamente
        </span>
      )}
    </article>
  );
}

function FotoArtista({ artista }: { artista: ArtistaExplorar }) {
  const [fallo, setFallo] = useState(false);
  const tienePortada = Boolean(artista.portadaPerfil?.trim());

  if (!artista.fotoPerfil || fallo) {
    return (
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-sm font-black shadow-[0_10px_25px_rgba(0,0,0,0.2)] ${
          tienePortada
            ? "featmusic-explore-cover-text border-white/30 bg-black/45 text-white backdrop-blur-sm"
            : "border-yellow-400/25 bg-yellow-500/10 text-yellow-200"
        }`}
      >
        {iniciales(artista.nombreArtistico)}
      </div>
    );
  }

  return (
    <img
      src={artista.fotoPerfil}
      alt={`Foto de ${artista.nombreArtistico}`}
      className={`h-14 w-14 shrink-0 rounded-2xl border object-cover shadow-[0_10px_25px_rgba(0,0,0,0.2)] ${
        tienePortada ? "border-white/30" : "border-white/10"
      }`}
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
        className={`inline-flex h-7 min-w-[58px] items-center justify-center gap-1 rounded-lg border px-2 text-[9px] font-black transition focus:outline-none focus:ring-2 focus:ring-yellow-500/40 disabled:cursor-wait disabled:opacity-65 ${
          siguiendo
            ? "border-yellow-300/30 bg-yellow-500/10 text-yellow-200 hover:border-yellow-400/30 hover:bg-yellow-500/10 hover:text-yellow-300"
            : "border-yellow-500 bg-yellow-600 text-white shadow-[0_6px_16px_rgba(5,150,105,0.22)] hover:bg-yellow-700"
        }`}
      >
        <span aria-hidden="true">{siguiendo ? "✓" : "+"}</span>
        {procesando ? "..." : siguiendo ? "Siguiendo" : "Seguir"}
      </button>

      {error && (
        <span
          role="alert"
          className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-yellow-400/20 bg-[#161616]/95 px-2.5 py-2 text-[9px] font-semibold leading-3.5 text-yellow-200 shadow-xl backdrop-blur"
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
  const portadaPerfilVisible = artista.portadaPerfil?.trim() || null;

  return (
    <article
      className={`group relative flex h-full min-h-[290px] flex-col overflow-visible rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(0,0,0,0.2)_45%,rgba(221,180,18,0.035))] shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/25 hover:shadow-[0_22px_60px_rgba(0,0,0,0.28)] ${
        descripcionAbiertaEnTarjeta ? "z-40" : "z-0 hover:z-20"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-14 -top-16 h-32 w-32 rounded-full bg-yellow-500/[0.08] blur-3xl transition duration-300 group-hover:bg-yellow-500/[0.12]" />
      </div>

      <div
        className={`relative overflow-hidden rounded-t-2xl p-3.5 sm:p-4 ${
          portadaPerfilVisible ? "featmusic-explore-cover bg-black" : ""
        }`}
      >
        {portadaPerfilVisible && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-2xl"
          >
            <img
              src={portadaPerfilVisible}
              alt=""
              className="h-full w-full object-cover object-center contrast-[1.04] saturate-[1.08]"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, #000000 0%, rgba(0,0,0,0.98) 16%, rgba(0,0,0,0.78) 38%, rgba(0,0,0,0.38) 64%, rgba(0,0,0,0.08) 82%, rgba(0,0,0,0) 100%)",
              }}
            />
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-start gap-3">
          <FotoArtista artista={artista} />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <h2
                  className={`truncate text-[15px] font-black leading-tight sm:text-base ${
                    portadaPerfilVisible
                      ? "featmusic-explore-cover-text text-white"
                      : "text-white"
                  }`}
                >
                  {artista.nombreArtistico}
                </h2>
                <p
                  className={`mt-0.5 truncate text-[11px] font-semibold ${
                    portadaPerfilVisible
                      ? "featmusic-explore-cover-text text-white"
                      : "text-yellow-300"
                  }`}
                >
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

            <p
              className={`mt-2 flex min-w-0 items-center gap-1.5 text-[10px] sm:text-[11px] ${
                portadaPerfilVisible
                  ? "featmusic-explore-cover-text text-white"
                  : "text-zinc-500"
              }`}
            >
              <IconoUbicacion className="h-3 w-3 shrink-0" />
              <span className="truncate">{ubicacion}</span>
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${
              portadaPerfilVisible
                ? "featmusic-explore-cover-chip featmusic-explore-cover-text border-white/20 bg-black/40 text-white backdrop-blur-sm"
                : "border-yellow-400/20 bg-yellow-500/[0.09] text-yellow-200"
            }`}
          >
            {formatearRol(artista.rol)}
          </span>

          {artista.generos.slice(0, 3).map((genero) => (
            <span
              key={genero}
              className={`rounded-full border px-2.5 py-1 text-[9px] font-medium ${
                portadaPerfilVisible
                  ? "featmusic-explore-cover-chip featmusic-explore-cover-text border-white/20 bg-black/40 text-white backdrop-blur-sm"
                  : "border-white/[0.08] bg-white/[0.035] text-zinc-400"
              }`}
            >
              {genero}
            </span>
          ))}

          {artista.generos.length === 0 && (
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] ${
                portadaPerfilVisible
                  ? "featmusic-explore-cover-chip featmusic-explore-cover-text border-white/20 bg-black/40 text-white backdrop-blur-sm"
                  : "border-white/[0.08] bg-white/[0.025] text-zinc-600"
              }`}
            >
              Sin géneros
            </span>
          )}
        </div>

          <p
            className={`mt-3 [display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:2] text-[10px] leading-4 sm:text-[11px] ${
              portadaPerfilVisible
                ? "featmusic-explore-cover-text text-white"
                : "text-zinc-500"
            }`}
          >
            {artista.biografia?.trim() ||
              "Este artista todavía no ha agregado una descripción."}
          </p>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col border-t border-slate-200 bg-white">
        {artista.ideasRecientes.length > 0 ? (
          <div className="flex-1 divide-y divide-slate-200 px-3.5 sm:px-4">
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
                  <div className="relative z-10">
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
                        className={`inline-flex h-5 items-center gap-1 rounded-full border px-1.5 text-[7px] font-bold transition focus:outline-none focus:ring-2 focus:ring-yellow-400/40 sm:text-[8px] ${
                          descripcionAbierta
                            ? "border-yellow-300/35 bg-yellow-500/20 text-yellow-100"
                            : "border-white/[0.08] bg-[#0f0f0f]/90 text-zinc-500 hover:border-yellow-400/25 hover:bg-yellow-500/10 hover:text-yellow-200"
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
                          className="absolute bottom-7 right-0 z-50 max-h-[min(420px,70vh)] w-[min(300px,calc(100vw-3rem))] overflow-y-auto rounded-xl border border-yellow-400/20 bg-[#131313]/95 p-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl [scrollbar-width:thin]"
                        >
                          <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 border-b border-r border-yellow-400/20 bg-[#131313]" />

                          <div className="relative">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-300">
                                <IconoDescripcion className="h-3.5 w-3.5" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-yellow-300">
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
                                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-yellow-300">
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
        className="relative flex items-center justify-center rounded-b-2xl border-t border-yellow-500/20 bg-yellow-600 px-4 py-3 text-center text-[11px] font-black text-white transition hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:ring-offset-2 focus:ring-offset-transparent"
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
  estadisticas,
  opciones,
  errorCarga,
}: ArtistasClientProps) {
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [genero, setGenero] = useState("");
  const [rol, setRol] = useState("");
  const [soloConIdeas, setSoloConIdeas] = useState(false);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
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
    function cerrarFiltrosFuera(evento: PointerEvent) {
      const objetivo = evento.target;

      if (
        objetivo instanceof Element &&
        objetivo.closest("[data-filtros-artistas]")
      ) {
        return;
      }

      setFiltrosAbiertos(false);
    }

    function cerrarFiltrosConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setFiltrosAbiertos(false);
      }
    }

    document.addEventListener("pointerdown", cerrarFiltrosFuera);
    document.addEventListener("keydown", cerrarFiltrosConEscape);

    return () => {
      document.removeEventListener("pointerdown", cerrarFiltrosFuera);
      document.removeEventListener("keydown", cerrarFiltrosConEscape);
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
    setSoloConIdeas(false);
    setPagina(1);
  }

  function limpiarFiltrosAvanzados() {
    setPais("");
    setCiudad("");
    setGenero("");
    setRol("");
    setSoloConIdeas(false);
    setPagina(1);
  }

  const hayFiltros = Boolean(busqueda || pais || ciudad || genero || rol || soloConIdeas);
  const cantidadFiltrosActivos =
    Number(Boolean(pais)) +
    Number(Boolean(ciudad)) +
    Number(Boolean(genero)) +
    Number(Boolean(rol)) +
    Number(soloConIdeas);

  return (
    <main className="featmusic-app-light featmusic-page-contrast min-h-screen w-full max-w-full overflow-x-clip bg-[#0e0e0e] pb-20 text-white lg:pb-0">
      <header className="featmusic-solid-black-chrome sticky top-0 z-50">
        <div className="relative mx-auto flex h-12 max-w-[1280px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-0.5">
            <MenuMasMovil sesionActiva={sesionActiva} />
            <Link
              href={sesionActiva ? "/artistas/mi-perfil" : "/"}
              className="text-lg font-black tracking-tight"
            >
              Feat<span className="text-yellow-400">Music</span>
            </Link>
          </div>

          <NavegacionEscritorio />

          {sesionActiva ? (
            <form action="/api/cerrar-sesion" method="post" className="hidden lg:block">
              <button
                type="submit"
                className="featmusic-logout-plain flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-white transition"
              >
                <IconoSalir />
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="rounded-lg border border-yellow-400/50 px-3 py-1.5 text-[10px] font-bold text-yellow-200 transition hover:bg-yellow-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      {cargando ? (
        <CargandoArtistas />
      ) : (
        <div className="featmusic-explore-content mx-auto w-full min-w-0 max-w-[1280px] overflow-x-clip px-4 py-4 md:py-5">
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

          <section className="relative mt-3" data-filtros-artistas>
            <div className="flex min-w-0 items-center rounded-xl border border-white/10 bg-black/35 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] backdrop-blur-sm transition focus-within:border-yellow-400/35">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5">
                <IconoBuscar className="h-4 w-4 shrink-0 text-zinc-500" />
                <input
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                  placeholder="Buscar por nombre, usuario, ciudad o país"
                  aria-label="Buscar artistas"
                  className="h-9 min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <button
                type="button"
                aria-label="Abrir filtros de artistas"
                aria-expanded={filtrosAbiertos}
                aria-controls="panel-filtros-artistas"
                title="Filtros"
                onClick={() => setFiltrosAbiertos((actual) => !actual)}
                className={`relative inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-yellow-400/40 ${
                  filtrosAbiertos || cantidadFiltrosActivos > 0
                    ? "border-yellow-400/35 bg-yellow-500/15 text-yellow-200"
                    : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-yellow-400/25 hover:bg-yellow-500/10 hover:text-yellow-200"
                }`}
              >
                <IconoFiltro className="h-4 w-4" />
                {cantidadFiltrosActivos > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-[#0e0e0e] bg-yellow-500 px-1 text-[8px] font-black leading-none text-white">
                    {cantidadFiltrosActivos}
                  </span>
                )}
              </button>
            </div>

            {filtrosAbiertos && (
              <>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Cerrar filtros de artistas"
                  onClick={() => setFiltrosAbiertos(false)}
                  className={`fixed inset-x-0 top-12 z-30 cursor-default bg-slate-950/10 backdrop-blur-[3px] ${
            sesionActiva
              ? "bottom-[var(--featmusic-menu-movil-altura,4.25rem)]"
              : "bottom-0"
          } lg:bottom-0`}
                />

                <div
                id="panel-filtros-artistas"
                role="dialog"
                aria-modal="true"
                aria-label="Filtros de artistas"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-40 max-h-[calc(100vh-8rem)] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-3 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-xl [scrollbar-width:thin] sm:w-[520px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black text-slate-900">
                      Filtrar artistas
                    </p>
                    <p className="mt-0.5 text-[9px] text-slate-500">
                      Refina los resultados sin ocupar espacio en la página.
                    </p>
                  </div>
                  {cantidadFiltrosActivos > 0 && (
                    <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2 py-1 text-[8px] font-black text-yellow-700">
                      {cantidadFiltrosActivos} activos
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select
                    value={pais}
                    onChange={(evento) => setPais(evento.target.value)}
                    aria-label="Filtrar por país"
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
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
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
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
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
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
                    className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2.5 text-[11px] text-slate-700 shadow-sm outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                  >
                    <option value="">Todos los roles</option>
                    {opciones.roles.map((opcion) => (
                      <option key={opcion} value={opcion}>{formatearRol(opcion)}</option>
                    ))}
                  </select>
                </div>

                <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-semibold text-slate-700 transition hover:border-yellow-200 hover:bg-yellow-50/60">
                  <span>Mostrar solo artistas con ideas</span>
                  <input
                    type="checkbox"
                    checked={soloConIdeas}
                    onChange={(evento) => setSoloConIdeas(evento.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 bg-white accent-yellow-500"
                  />
                </label>

                <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
                  <button
                    type="button"
                    onClick={limpiarFiltrosAvanzados}
                    disabled={cantidadFiltrosActivos === 0}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltrosAbiertos(false)}
                    className="rounded-lg border border-yellow-600 bg-yellow-600 px-4 py-2 text-[10px] font-black text-white shadow-sm transition hover:bg-yellow-700"
                  >
                    Listo
                  </button>
                </div>
              </div>
              </>
            )}
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
            <section className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-500/[0.05] px-5 py-14 text-center">
              <h2 className="text-base font-bold text-yellow-200">No se pudieron cargar los artistas</h2>
              <p className="mt-2 text-xs text-yellow-200/60">Revisa la conexión con la base de datos e inténtalo nuevamente.</p>
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
                className="mt-4 rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-200"
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
        </div>
      )}

      {sesionActiva && <MenuMovilPanel />}
    </main>
  );
}