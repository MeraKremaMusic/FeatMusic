"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import NavegacionEscritorio from "../components/NavegacionEscritorio";
import MenuMovilPanel from "../panel/components/MenuMovilPanel";

export type ArtistaExplorar = {
  id: number;
  nombreArtistico: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  ciudad: string;
  pais: string;
  rol: string;
  generos: string[];
  ideasActivas: number;
  ideasRecientes: Array<{
    id: number;
    titulo: string;
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
      strokeWidth={1.8}
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
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.5 15.5A7 7 0 1 1 15.5 15.5c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" />
    </svg>
  );
}

function IconoPropuesta({
  className = "h-5 w-5",
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
      <path d="M8 12h8" />
      <path d="m13 9 3 3-3 3" />
      <path d="M5 5h14v14H5z" />
    </svg>
  );
}

function IconoUbicacion({
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
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CargandoArtistas() {
  return (
    <section
      className="relative flex h-full min-h-[420px] items-center justify-center overflow-hidden px-6 pb-20 md:pb-0"
      role="status"
      aria-live="polite"
      aria-label="Cargando artistas"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full border border-violet-400/20 bg-violet-500/5" />
          <span className="absolute inset-2 animate-spin rounded-full border-2 border-zinc-800 border-t-violet-400" />
          <span className="absolute inset-5 animate-pulse rounded-full border border-violet-300/30 bg-violet-500/10" />

          <IconoUsuarios className="relative h-6 w-6 text-violet-300" />
        </div>

        <p className="mt-5 text-sm font-bold text-zinc-100">
          Cargando artistas
          <span className="inline-block w-4 animate-pulse text-left">...</span>
        </p>

        <p className="mt-1 text-[11px] text-zinc-500">
          Preparando nuevas conexiones musicales
        </p>
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
  icono: React.ReactNode;
  nota?: string;
}) {
  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-2 py-2 backdrop-blur-sm md:rounded-2xl md:p-4">
      {/* Diseño compacto exclusivo para celular y tablet. */}
      <div className="flex items-center justify-center gap-1.5 md:hidden">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-violet-400/20 bg-violet-500/10 text-violet-300">
          {icono}
        </div>

        <div className="min-w-0 text-left">
          <p className="text-base font-black leading-none tracking-tight text-white">
            {valor.toLocaleString("es-CO")}
          </p>
          <p className="mt-1 truncate text-[8px] font-semibold leading-none text-zinc-400">
            {tituloMovil}
          </p>
        </div>
      </div>

      {/* Diseño amplio exclusivo para computador. */}
      <div className="hidden items-start justify-between gap-4 md:flex">
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-400">{titulo}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-white">
            {valor.toLocaleString("es-CO")}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
          {icono}
        </div>
      </div>

      {nota && (
        <p className="mt-2 hidden text-[10px] text-zinc-500 md:block">
          {nota}
        </p>
      )}
    </article>
  );
}

function FotoArtista({ artista }: { artista: ArtistaExplorar }) {
  const [fallo, setFallo] = useState(false);

  if (!artista.fotoPerfil || fallo) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/10 text-base font-black text-violet-200">
        {iniciales(artista.nombreArtistico)}
      </div>
    );
  }

  return (
    <img
      src={artista.fotoPerfil}
      alt={`Foto de ${artista.nombreArtistico}`}
      className="h-16 w-16 shrink-0 rounded-full border border-white/10 object-cover"
      onError={() => setFallo(true)}
    />
  );
}

function TarjetaArtista({ artista }: { artista: ArtistaExplorar }) {
  const ubicacion =
    [artista.ciudad, artista.pais].filter(Boolean).join(", ") ||
    "Ubicación sin completar";

  return (
    <article className="flex min-h-[290px] flex-col rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-black/45">
      <div className="flex items-start gap-3">
        <FotoArtista artista={artista} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-white">
            {artista.nombreArtistico}
          </h2>

          <p className="truncate text-xs font-medium text-violet-300">
            @{artista.nombreUsuario}
          </p>

          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-400">
            <IconoUbicacion />
            <span className="truncate">{ubicacion}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-200">
          {formatearRol(artista.rol)}
        </span>

        {artista.generos.slice(0, 3).map((genero) => (
          <span
            key={genero}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-300"
          >
            {genero}
          </span>
        ))}

        {artista.generos.length === 0 && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-500">
            Sin géneros
          </span>
        )}
      </div>

      <div className="mt-4 flex-1 rounded-xl border border-white/8 bg-white/[0.025] p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold text-zinc-300">
            Ideas publicadas
          </p>
          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">
            {artista.ideasActivas}
          </span>
        </div>

        {artista.ideasRecientes.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {artista.ideasRecientes.map((idea) => (
              <p
                key={idea.id}
                className="truncate text-[11px] text-zinc-400"
                title={idea.titulo}
              >
                • {idea.titulo}
              </p>
            ))}

            {artista.ideasActivas > artista.ideasRecientes.length && (
              <p className="text-[10px] font-medium text-violet-300">
                +{artista.ideasActivas - artista.ideasRecientes.length} ideas
                adicionales
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-zinc-500">
            Sin ideas publicadas actualmente
          </p>
        )}
      </div>

      <Link
        href={`/artistas/${encodeURIComponent(artista.nombreUsuario)}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:border-violet-300/50 hover:bg-violet-500/20"
      >
        Ver perfil
      </Link>
    </article>
  );
}

export default function ArtistasClient({
  sesionActiva,
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
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setCargando(false);
    }, 700);

    return () => window.clearTimeout(temporizador);
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, pais, ciudad, genero, rol]);

  const artistasFiltrados = useMemo(() => {
    const termino = normalizar(busqueda);

    return artistasIniciales.filter((artista) => {
      const coincideTexto =
        !termino ||
        [
          artista.nombreArtistico,
          artista.nombreUsuario,
          artista.ciudad,
          artista.pais,
        ].some((valor) => normalizar(valor).includes(termino));

      const coincidePais = !pais || artista.pais === pais;
      const coincideCiudad = !ciudad || artista.ciudad === ciudad;
      const coincideRol = !rol || artista.rol === rol;
      const coincideGenero =
        !genero || artista.generos.some((item) => item === genero);

      return (
        coincideTexto &&
        coincidePais &&
        coincideCiudad &&
        coincideRol &&
        coincideGenero
      );
    });
  }, [artistasIniciales, busqueda, pais, ciudad, genero, rol]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(artistasFiltrados.length / ARTISTAS_POR_PAGINA),
  );

  const artistasPagina = artistasFiltrados.slice(
    (pagina - 1) * ARTISTAS_POR_PAGINA,
    pagina * ARTISTAS_POR_PAGINA,
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
    <main className="h-[100dvh] overflow-hidden bg-[#09070d] text-white md:h-screen">
      <header className="relative z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4">
          <Link
            href={sesionActiva ? "/panel" : "/"}
            className="text-lg font-black tracking-tight"
          >
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <NavegacionEscritorio mostrarDesde="md" />

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

      <div className="relative h-[calc(100dvh-48px)] overflow-hidden md:h-[calc(100vh-48px)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.045)_1px,transparent_1px)] bg-[size:30px_30px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-950/30 to-transparent" />

        <div className="relative z-10 h-full">
          {cargando ? (
            <CargandoArtistas />
          ) : (
            <div className="h-full overflow-y-auto overscroll-y-contain px-4 pb-28 pt-4 md:px-6 md:pb-8 md:pt-6 xl:px-8">
              <div className="mx-auto w-full max-w-[1460px]">
                <section className="mx-auto grid w-full max-w-[360px] grid-cols-3 gap-1.5 md:max-w-none md:gap-4">
                  <TarjetaEstadistica
                    titulo="Artistas en FeatMusic"
                    tituloMovil="Artistas"
                    valor={estadisticas.artistas}
                    icono={
                      <IconoUsuarios className="h-3.5 w-3.5 md:h-5 md:w-5" />
                    }
                  />
                  <TarjetaEstadistica
                    titulo="Ideas de artistas"
                    tituloMovil="Ideas"
                    valor={estadisticas.ideas}
                    icono={
                      <IconoIdea className="h-3.5 w-3.5 md:h-5 md:w-5" />
                    }
                  />
                  <TarjetaEstadistica
                    titulo="Propuestas de colaboradores"
                    tituloMovil="Propuestas"
                    valor={estadisticas.propuestas}
                    icono={
                      <IconoPropuesta className="h-3.5 w-3.5 md:h-5 md:w-5" />
                    }
                    nota="Disponible cuando se active el sistema de propuestas."
                  />
                </section>

                <section className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm md:p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.7fr)] md:items-end xl:grid-cols-[minmax(260px,0.9fr)_minmax(0,2fr)_auto]">
                    <label className="mx-auto w-full max-w-[330px] md:mx-0 md:min-w-0 md:max-w-none">
                      <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Buscar artistas
                      </span>
                      <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2 focus-within:border-violet-400/40 md:py-2.5">
                        <IconoBuscar className="h-4 w-4 shrink-0 text-zinc-500" />
                        <input
                          type="search"
                          value={busqueda}
                          onChange={(evento) => setBusqueda(evento.target.value)}
                          placeholder="Nombre, usuario, ciudad o país"
                          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                        />
                      </span>
                    </label>

                    <div className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-4">
                      <label>
                        <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                          País
                        </span>
                        <select
                          value={pais}
                          onChange={(evento) => setPais(evento.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#100d15] px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-violet-400/40"
                        >
                          <option value="">Todos</option>
                          {opciones.paises.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                          Ciudad
                        </span>
                        <select
                          value={ciudad}
                          onChange={(evento) => setCiudad(evento.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#100d15] px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-violet-400/40"
                        >
                          <option value="">Todas</option>
                          {opciones.ciudades.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                          Género
                        </span>
                        <select
                          value={genero}
                          onChange={(evento) => setGenero(evento.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#100d15] px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-violet-400/40"
                        >
                          <option value="">Todos</option>
                          {opciones.generos.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                          Rol
                        </span>
                        <select
                          value={rol}
                          onChange={(evento) => setRol(evento.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#100d15] px-3 py-2.5 text-xs text-zinc-200 outline-none focus:border-violet-400/40"
                        >
                          <option value="">Todos</option>
                          {opciones.roles.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {formatearRol(opcion)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      disabled={!hayFiltros}
                      className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 md:col-span-2 md:w-auto md:min-w-[86px] md:justify-self-end xl:col-span-1"
                    >
                      Limpiar
                    </button>
                  </div>
                </section>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-400">
                    {artistasFiltrados.length.toLocaleString("es-CO")}{" "}
                    {artistasFiltrados.length === 1
                      ? "artista encontrado"
                      : "artistas encontrados"}
                  </p>

                  {totalPaginas > 1 && (
                    <p className="text-[11px] text-zinc-500">
                      Página {pagina} de {totalPaginas}
                    </p>
                  )}
                </div>

                {errorCarga ? (
                  <section className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/5 px-5 py-10 text-center">
                    <p className="text-sm font-semibold text-red-200">
                      No se pudieron cargar los artistas
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Revisa la conexión con la base de datos e inténtalo nuevamente.
                    </p>
                  </section>
                ) : artistasIniciales.length === 0 ? (
                  <section className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-5 py-12 text-center">
                    <p className="text-sm font-semibold text-zinc-200">
                      Todavía no hay artistas con el perfil completo
                    </p>
                  </section>
                ) : artistasPagina.length === 0 ? (
                  <section className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-5 py-12 text-center">
                    <p className="text-sm font-semibold text-zinc-200">
                      No encontramos artistas con esos filtros
                    </p>
                    <button
                      type="button"
                      onClick={limpiarFiltros}
                      className="mt-4 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-200"
                    >
                      Limpiar búsqueda
                    </button>
                  </section>
                ) : (
                  <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {artistasPagina.map((artista) => (
                      <TarjetaArtista key={artista.id} artista={artista} />
                    ))}
                  </section>
                )}

                {totalPaginas > 1 && (
                  <nav
                    aria-label="Paginación de artistas"
                    className="mt-6 flex items-center justify-center gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                      disabled={pagina === 1}
                      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>

                    <span className="text-xs text-zinc-500">
                      {pagina} / {totalPaginas}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setPagina((actual) =>
                          Math.min(totalPaginas, actual + 1),
                        )
                      }
                      disabled={pagina === totalPaginas}
                      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </nav>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {sesionActiva && <MenuMovilPanel ocultarDesde="md" />}
    </main>
  );
}