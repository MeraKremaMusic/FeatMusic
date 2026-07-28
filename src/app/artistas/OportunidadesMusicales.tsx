"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatearIdiomaBuscado,
  formatearModalidadColaboracion,
  formatearRolBuscado,
  formatearTipoAcuerdo,
  formatearUbicacionPreferida,
} from "@/lib/colaboracion-ideas";
import BotonGuardarIdea from "../components/BotonGuardarIdea";
import ContadorVistasIdea from "../components/ContadorVistasIdea";
import RegistrarVistaIdea from "../components/RegistrarVistaIdea";
import ReproductorAudio from "../components/ReproductorAudio";
import ResumenColaboracionIdea from "../components/ResumenColaboracionIdea";
import EnviarPropuesta from "./[nombreUsuario]/components/EnviarPropuesta";

export type PropuestaOportunidad = {
  estado: string;
  motivoDecision: string | null;
  permiteReintento: boolean;
  numeroIntento: number;
};

export type OportunidadMusical = {
  id: number;
  titulo: string;
  descripcion: string;
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
  creadoEn: string;
  expiraEn: string;
  propuestasActuales: number;
  vistasUnicas: number;
  guardada: boolean;
  propuestaUsuario: PropuestaOportunidad | null;
  artista: {
    id: number;
    nombreArtistico: string;
    nombreUsuario: string;
    fotoPerfil: string | null;
    ciudad: string;
    pais: string;
    codigoPais: string;
    rol: string;
    generos: string[];
  };
};

export type OpcionesFiltrosOportunidades = {
  roles: string[];
  generos: string[];
  idiomas: string[];
  modalidades: string[];
  acuerdos: string[];
  paises: string[];
  ciudades: string[];
};

type OportunidadesMusicalesProps = {
  sesionActiva: boolean;
  usuarioActualId: number | null;
  oportunidadesIniciales: OportunidadMusical[];
  opciones: OpcionesFiltrosOportunidades;
  errorCarga: boolean;
};

const OPORTUNIDADES_POR_PAGINA = 8;
const MAX_PROPUESTAS = 3;

function normalizar(texto: string | null | undefined) {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
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

function formatearRolPerfil(rol: string) {
  const roles: Record<string, string> = {
    CANTANTE: "Cantante",
    COMPOSITOR: "Compositor",
    PRODUCTOR: "Productor",
    BEATMAKER: "Beatmaker",
  };

  return roles[rol] ?? rol;
}

function diasRestantes(expiraEn: string) {
  const diferencia = new Date(expiraEn).getTime() - Date.now();
  return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)));
}

function textoPublicacion(creadoEn: string) {
  const diferencia = Date.now() - new Date(creadoEn).getTime();
  const dias = Math.max(0, Math.floor(diferencia / (1000 * 60 * 60 * 24)));

  if (dias === 0) return "Publicada hoy";
  if (dias === 1) return "Publicada ayer";
  return `Publicada hace ${dias} días`;
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

function IconoReloj({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function IconoFlecha({ className = "h-3.5 w-3.5" }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

function FotoOportunidad({ oportunidad }: { oportunidad: OportunidadMusical }) {
  const [fallo, setFallo] = useState(false);
  const { artista } = oportunidad;

  if (!artista.fotoPerfil || fallo) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-xs font-black text-emerald-200">
        {iniciales(artista.nombreArtistico)}
      </div>
    );
  }

  return (
    <img
      src={artista.fotoPerfil}
      alt={`Foto de ${artista.nombreArtistico}`}
      className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
      loading="lazy"
      onError={() => setFallo(true)}
    />
  );
}

function BanderaPais({ codigoPais, pais }: { codigoPais: string; pais: string }) {
  const [fallo, setFallo] = useState(false);
  const codigo = codigoPais.trim().toLowerCase();

  if (!/^[a-z]{2}$/.test(codigo) || fallo) return null;

  return (
    <img
      src={`https://flagcdn.com/w40/${codigo}.png`}
      srcSet={`https://flagcdn.com/w80/${codigo}.png 2x`}
      width={24}
      height={17}
      alt={`Bandera de ${pais}`}
      title={pais}
      className="h-4 w-6 shrink-0 rounded-[3px] object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
    />
  );
}

function TarjetaOportunidad({
  oportunidad,
  sesionActiva,
  usuarioActualId,
}: {
  oportunidad: OportunidadMusical;
  sesionActiva: boolean;
  usuarioActualId: number | null;
}) {
  const { artista } = oportunidad;
  const ubicacionArtista = [artista.ciudad, artista.pais]
    .filter(Boolean)
    .join(", ");
  const restantes = diasRestantes(oportunidad.expiraEn);
  const cuposDisponibles = Math.max(
    0,
    MAX_PROPUESTAS - oportunidad.propuestasActuales,
  );
  const perfilHref = `/artistas/${encodeURIComponent(artista.nombreUsuario)}`;

  return (
    <article data-vista-idea className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(0,0,0,0.22)_50%,rgba(16,185,129,0.045))] shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/25 hover:shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-emerald-500/[0.08] blur-3xl transition group-hover:bg-emerald-500/[0.13]" />
      <RegistrarVistaIdea
        ideaId={oportunidad.id}
        sesionActiva={sesionActiva}
        esPropietario={usuarioActualId === artista.id}
      />

      <div className="relative border-b border-white/[0.07] p-3.5 sm:p-4">
        <div className="flex min-w-0 items-start gap-3">
          <Link href={perfilHref} className="shrink-0">
            <FotoOportunidad oportunidad={oportunidad} />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={perfilHref}
                  className="block truncate text-sm font-black text-white transition hover:text-emerald-200"
                >
                  {artista.nombreArtistico}
                </Link>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-emerald-300">
                  @{artista.nombreUsuario}
                </p>
              </div>

              <BanderaPais
                codigoPais={artista.codigoPais}
                pais={artista.pais}
              />
            </div>

            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-zinc-500">
              <span className="inline-flex min-w-0 items-center gap-1">
                <IconoUbicacion className="h-3 w-3 shrink-0" />
                <span className="truncate">{ubicacionArtista}</span>
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-semibold text-zinc-400">
                {formatearRolPerfil(artista.rol)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300/80">
              Oportunidad musical
            </p>
            <h2 className="mt-1 break-words text-base font-black leading-tight text-white sm:text-[17px]">
              {oportunidad.titulo}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <BotonGuardarIdea
              ideaId={oportunidad.id}
              guardadaInicial={oportunidad.guardada}
              sesionActiva={sesionActiva}
              esPropietario={usuarioActualId === artista.id}
              disponible={cuposDisponibles > 0}
              variante="icono"
            />
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${
                cuposDisponibles > 0
                  ? "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-200"
                  : "border-zinc-400/15 bg-white/[0.04] text-zinc-500"
              }`}
            >
              {cuposDisponibles > 0
                ? `${cuposDisponibles} ${cuposDisponibles === 1 ? "cupo" : "cupos"}`
                : "Completa"}
            </span>
          </div>
        </div>

        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[10px] leading-[1.05rem] text-zinc-400 sm:text-[11px] sm:leading-[1.15rem]">
          {oportunidad.descripcion}
        </p>

        <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/20 p-2.5">
          <ReproductorAudio
            id={`oportunidad-${oportunidad.id}`}
            src={oportunidad.audioUrl}
            titulo={oportunidad.titulo}
            bpm={oportunidad.bpm}
            tonalidad={oportunidad.tonalidad}
            duracionSegundos={oportunidad.duracionSegundos}
            className="!rounded-none !border-0 !bg-transparent !p-0 !shadow-none [&>div]:gap-2 [&_button]:h-9 [&_button]:w-9 [&_input[type='range']]:mt-2"
          />
        </div>

        <ResumenColaboracionIdea
          rolBuscado={oportunidad.rolBuscado}
          generoMusical={oportunidad.generoMusical}
          idiomaBuscado={oportunidad.idiomaBuscado}
          modalidadColaboracion={oportunidad.modalidadColaboracion}
          paisPreferido={oportunidad.paisPreferido}
          departamentoPreferido={oportunidad.departamentoPreferido}
          ciudadPreferida={oportunidad.ciudadPreferida}
          tipoAcuerdo={oportunidad.tipoAcuerdo}
        />

        <div className="mt-auto pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3 text-[9px] font-semibold text-zinc-500">
            <span>{textoPublicacion(oportunidad.creadoEn)}</span>
            <ContadorVistasIdea
              ideaId={oportunidad.id}
              totalInicial={oportunidad.vistasUnicas}
              esPropietario={usuarioActualId === artista.id}
              variante="compacta"
            />
            <span
              className={`inline-flex items-center gap-1 ${
                restantes <= 7 ? "text-amber-300" : "text-zinc-500"
              }`}
            >
              <IconoReloj className="h-3 w-3" />
              {restantes === 0
                ? "Expira hoy"
                : `Expira en ${restantes} ${restantes === 1 ? "día" : "días"}`}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-end">
            <Link
              href={`${perfilHref}#idea-${oportunidad.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[10px] font-bold text-zinc-300 transition hover:border-emerald-400/25 hover:bg-emerald-500/[0.08] hover:text-emerald-100"
            >
              Ver artista
              <IconoFlecha className="h-3 w-3" />
            </Link>
          </div>

          <div className="[&>div]:mt-2.5">
            <EnviarPropuesta
              ideaId={oportunidad.id}
              sesionActiva={sesionActiva}
              esPropietario={usuarioActualId === artista.id}
              propuestasActuales={oportunidad.propuestasActuales}
              propuestaUsuario={oportunidad.propuestaUsuario}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function OportunidadesMusicales({
  sesionActiva,
  usuarioActualId,
  oportunidadesIniciales,
  opciones,
  errorCarga,
}: OportunidadesMusicalesProps) {
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState("");
  const [genero, setGenero] = useState("");
  const [idioma, setIdioma] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [acuerdo, setAcuerdo] = useState("");
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const contenedorFiltrosRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, rol, genero, idioma, modalidad, acuerdo, pais, ciudad]);

  useEffect(() => {
    function cerrarFiltrosFuera(evento: PointerEvent) {
      const objetivo = evento.target;

      if (
        objetivo instanceof Node &&
        contenedorFiltrosRef.current?.contains(objetivo)
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

  const oportunidadesFiltradas = useMemo(() => {
    const termino = normalizar(busqueda);

    return oportunidadesIniciales.filter((oportunidad) => {
      const ubicacion = formatearUbicacionPreferida({
        ciudadPreferida: oportunidad.ciudadPreferida,
        departamentoPreferido: oportunidad.departamentoPreferido,
        paisPreferido: oportunidad.paisPreferido,
      });
      const textos = [
        oportunidad.titulo,
        oportunidad.descripcion,
        oportunidad.generoMusical,
        formatearRolBuscado(oportunidad.rolBuscado),
        formatearIdiomaBuscado(oportunidad.idiomaBuscado),
        formatearModalidadColaboracion(oportunidad.modalidadColaboracion),
        formatearTipoAcuerdo(oportunidad.tipoAcuerdo),
        ubicacion,
        oportunidad.artista.nombreArtistico,
        oportunidad.artista.nombreUsuario,
        oportunidad.artista.ciudad,
        oportunidad.artista.pais,
      ];

      const coincideTexto =
        !termino || textos.some((texto) => normalizar(texto).includes(termino));
      const coincideRol = !rol || oportunidad.rolBuscado === rol;
      const coincideGenero =
        !genero || oportunidad.generoMusical === genero;
      const coincideIdioma =
        !idioma || oportunidad.idiomaBuscado === idioma;
      const coincideModalidad =
        !modalidad || oportunidad.modalidadColaboracion === modalidad;
      const coincideAcuerdo =
        !acuerdo || oportunidad.tipoAcuerdo === acuerdo;
      const coincidePais = !pais || oportunidad.paisPreferido === pais;
      const coincideCiudad = !ciudad || oportunidad.ciudadPreferida === ciudad;

      return (
        coincideTexto &&
        coincideRol &&
        coincideGenero &&
        coincideIdioma &&
        coincideModalidad &&
        coincideAcuerdo &&
        coincidePais &&
        coincideCiudad
      );
    });
  }, [
    oportunidadesIniciales,
    busqueda,
    rol,
    genero,
    idioma,
    modalidad,
    acuerdo,
    pais,
    ciudad,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(oportunidadesFiltradas.length / OPORTUNIDADES_POR_PAGINA),
  );
  const paginaSegura = Math.min(pagina, totalPaginas);
  const oportunidadesPagina = oportunidadesFiltradas.slice(
    (paginaSegura - 1) * OPORTUNIDADES_POR_PAGINA,
    paginaSegura * OPORTUNIDADES_POR_PAGINA,
  );
  const hayFiltros = Boolean(
    busqueda || rol || genero || idioma || modalidad || acuerdo || pais || ciudad,
  );
  const cantidadFiltrosActivos = [
    rol,
    genero,
    idioma,
    modalidad,
    acuerdo,
    pais,
    ciudad,
  ].filter(Boolean).length;

  function limpiarFiltros() {
    setBusqueda("");
    setRol("");
    setGenero("");
    setIdioma("");
    setModalidad("");
    setAcuerdo("");
    setPais("");
    setCiudad("");
    setPagina(1);
  }

  const claseSelect =
    "w-full min-w-0 rounded-lg border border-white/10 bg-[#08140f] px-2.5 py-2 text-[11px] text-zinc-200 outline-none focus:border-emerald-400/40";

  return (
    <div className="min-w-0">
      <section
        ref={contenedorFiltrosRef}
        className="relative mt-3"
      >
        <div className="flex min-w-0 items-center rounded-xl border border-white/10 bg-black/35 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] backdrop-blur-sm transition focus-within:border-emerald-400/35">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2.5">
            <IconoBuscar className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por canción, artista, género o ciudad"
              aria-label="Buscar oportunidades"
              className="h-9 min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <button
            type="button"
            aria-label="Abrir filtros de oportunidades"
            aria-expanded={filtrosAbiertos}
            aria-controls="filtros-oportunidades"
            title="Filtros"
            onClick={() => setFiltrosAbiertos((abiertos) => !abiertos)}
            className={`relative inline-flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-emerald-400/40 ${
              filtrosAbiertos || cantidadFiltrosActivos > 0
                ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-emerald-400/25 hover:bg-emerald-500/10 hover:text-emerald-200"
            }`}
          >
            <IconoFiltro className="h-4 w-4" />

            {cantidadFiltrosActivos > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-[#06100c] bg-emerald-500 px-1 text-[8px] font-black leading-none text-white">
                {cantidadFiltrosActivos}
              </span>
            )}
          </button>
        </div>

        {filtrosAbiertos && (
          <div
            id="filtros-oportunidades"
            role="dialog"
            aria-label="Filtros de oportunidades"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#07110d]/95 shadow-[0_22px_65px_rgba(0,0,0,0.5)] backdrop-blur-xl md:w-[680px]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-4 py-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-300">
                  Filtros
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  Encuentra oportunidades que encajen contigo
                </p>
              </div>

              {cantidadFiltrosActivos > 0 && (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-200">
                  {cantidadFiltrosActivos} activos
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 md:grid-cols-4">
              <select
                value={rol}
                onChange={(evento) => setRol(evento.target.value)}
                aria-label="Filtrar oportunidades por rol buscado"
                className={claseSelect}
              >
                <option value="">Cualquier rol</option>
                {opciones.roles.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {formatearRolBuscado(opcion)}
                  </option>
                ))}
              </select>

              <select
                value={genero}
                onChange={(evento) => setGenero(evento.target.value)}
                aria-label="Filtrar oportunidades por género"
                className={claseSelect}
              >
                <option value="">Cualquier género</option>
                {opciones.generos.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>

              <select
                value={idioma}
                onChange={(evento) => setIdioma(evento.target.value)}
                aria-label="Filtrar oportunidades por idioma"
                className={claseSelect}
              >
                <option value="">Cualquier idioma</option>
                {opciones.idiomas.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {formatearIdiomaBuscado(opcion)}
                  </option>
                ))}
              </select>

              <select
                value={modalidad}
                onChange={(evento) => setModalidad(evento.target.value)}
                aria-label="Filtrar oportunidades por modalidad"
                className={claseSelect}
              >
                <option value="">Cualquier modalidad</option>
                {opciones.modalidades.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {formatearModalidadColaboracion(opcion)}
                  </option>
                ))}
              </select>

              <select
                value={acuerdo}
                onChange={(evento) => setAcuerdo(evento.target.value)}
                aria-label="Filtrar oportunidades por tipo de acuerdo"
                className={claseSelect}
              >
                <option value="">Cualquier acuerdo</option>
                {opciones.acuerdos.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {formatearTipoAcuerdo(opcion)}
                  </option>
                ))}
              </select>

              <select
                value={pais}
                onChange={(evento) => setPais(evento.target.value)}
                aria-label="Filtrar oportunidades por país preferido"
                className={claseSelect}
              >
                <option value="">Cualquier país</option>
                {opciones.paises.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>

              <select
                value={ciudad}
                onChange={(evento) => setCiudad(evento.target.value)}
                aria-label="Filtrar oportunidades por ciudad preferida"
                className={claseSelect}
              >
                <option value="">Cualquier ciudad</option>
                {opciones.ciudades.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] px-3 py-3">
              <button
                type="button"
                onClick={limpiarFiltros}
                disabled={!hayFiltros}
                className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(false)}
                className="rounded-lg border border-emerald-400/30 bg-emerald-500 px-4 py-2 text-[10px] font-black text-white transition hover:bg-emerald-600"
              >
                Listo
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-zinc-400">
          {oportunidadesFiltradas.length.toLocaleString("es-CO")} {" "}
          {oportunidadesFiltradas.length === 1
            ? "oportunidad encontrada"
            : "oportunidades encontradas"}
        </p>
        {totalPaginas > 1 && (
          <p className="text-[10px] font-semibold text-zinc-600">
            Página {paginaSegura} de {totalPaginas}
          </p>
        )}
      </div>

      {errorCarga ? (
        <section className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/[0.05] px-5 py-14 text-center">
          <h2 className="text-base font-bold text-red-200">
            No se pudieron cargar las oportunidades
          </h2>
          <p className="mt-2 text-xs text-red-200/60">
            Revisa la conexión con la base de datos e inténtalo nuevamente.
          </p>
        </section>
      ) : oportunidadesIniciales.length === 0 ? (
        <section className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-5 py-14 text-center">
          <p className="text-sm font-semibold text-zinc-300">
            Todavía no hay oportunidades musicales activas
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Las ideas publicadas por los artistas aparecerán aquí.
          </p>
        </section>
      ) : oportunidadesPagina.length === 0 ? (
        <section className="mt-5 rounded-2xl border border-white/10 bg-black/35 px-5 py-14 text-center">
          <p className="text-sm font-semibold text-zinc-300">
            No encontramos oportunidades con esos filtros
          </p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200"
          >
            Limpiar búsqueda
          </button>
        </section>
      ) : (
        <section className="mt-3 grid min-w-0 items-stretch gap-3.5 lg:grid-cols-2 lg:gap-4">
          {oportunidadesPagina.map((oportunidad) => (
            <TarjetaOportunidad
              key={oportunidad.id}
              oportunidad={oportunidad}
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
          <span className="text-xs font-bold text-zinc-500">
            {paginaSegura} / {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() =>
              setPagina((actual) => Math.min(totalPaginas, actual + 1))
            }
            disabled={paginaSegura === totalPaginas}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
