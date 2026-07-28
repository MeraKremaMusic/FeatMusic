"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export type ArtistaVistaIdea = {
  vistaId: number;
  vistaEn: string;
  id: number;
  nombreArtistico: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  rol: string;
  ciudad: string | null;
  pais: string | null;
  siguiendo: boolean;
};

type RespuestaLista = {
  ok: boolean;
  mensaje?: string;
  artistas?: ArtistaVistaIdea[];
  pagina?: number;
  totalPaginas?: number;
  total?: number;
  idea?: {
    id: number;
    titulo: string;
  };
};

type RespuestaSeguimiento = {
  ok: boolean;
  mensaje?: string;
  siguiendo?: boolean;
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

function tiempoVista(vistaEn: string) {
  const diferencia = Math.max(0, Date.now() - new Date(vistaEn).getTime());
  const minutos = Math.floor(diferencia / 60_000);
  const horas = Math.floor(diferencia / 3_600_000);
  const dias = Math.floor(diferencia / 86_400_000);

  if (minutos < 2) return "Visto recientemente";
  if (minutos < 60) return `Visto hace ${minutos} min`;
  if (horas < 24) return `Visto hace ${horas} h`;
  if (dias === 1) return "Visto ayer";
  return `Visto hace ${dias} días`;
}

function IconoCerrar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export default function ListaArtistasVieronIdea({
  ideaId,
  abierto,
  onCerrar,
}: {
  ideaId: number;
  abierto: boolean;
  onCerrar: () => void;
}) {
  const [artistas, setArtistas] = useState<ArtistaVistaIdea[]>([]);
  const [tituloIdea, setTituloIdea] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const cargar = useCallback(
    async (paginaSolicitada: number, reemplazar: boolean) => {
      if (reemplazar) setCargando(true);
      else setCargandoMas(true);
      setError("");

      try {
        const respuesta = await fetch(
          `/api/ideas/${ideaId}/vistas?pagina=${paginaSolicitada}`,
          {
            cache: "no-store",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
          },
        );
        const datos = (await respuesta.json()) as RespuestaLista;

        if (!respuesta.ok || !datos.ok || !datos.artistas) {
          throw new Error(datos.mensaje ?? "No se pudieron cargar las vistas.");
        }

        const artistasRecibidos = datos.artistas;
        setTituloIdea(datos.idea?.titulo ?? "");
        setPagina(datos.pagina ?? paginaSolicitada);
        setTotalPaginas(datos.totalPaginas ?? 1);
        setTotal(datos.total ?? artistasRecibidos.length);
        setArtistas((actuales) =>
          reemplazar
            ? artistasRecibidos
            : [...actuales, ...artistasRecibidos],
        );
      } catch (errorCarga) {
        setError(
          errorCarga instanceof Error
            ? errorCarga.message
            : "No se pudieron cargar las vistas.",
        );
      } finally {
        setCargando(false);
        setCargandoMas(false);
      }
    },
    [ideaId],
  );

  useEffect(() => {
    if (!abierto) return;

    setArtistas([]);
    setPagina(1);
    setTotalPaginas(1);
    setTotal(0);
    setTituloIdea("");
    void cargar(1, true);

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrar();
    };

    document.addEventListener("keydown", cerrarConEscape);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto, cargar, onCerrar]);

  async function alternarSeguimiento(artista: ArtistaVistaIdea) {
    if (procesandoId !== null) return;

    const estadoAnterior = artista.siguiendo;
    const nuevoEstado = !estadoAnterior;
    setProcesandoId(artista.id);
    setError("");
    setArtistas((actuales) =>
      actuales.map((item) =>
        item.id === artista.id ? { ...item, siguiendo: nuevoEstado } : item,
      ),
    );

    try {
      const respuesta = await fetch(`/api/artistas/${artista.id}/seguir`, {
        method: nuevoEstado ? "POST" : "DELETE",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const datos = (await respuesta.json()) as RespuestaSeguimiento;

      if (!respuesta.ok || !datos.ok) {
        throw new Error(datos.mensaje ?? "No se pudo actualizar el seguimiento.");
      }

      setArtistas((actuales) =>
        actuales.map((item) =>
          item.id === artista.id
            ? { ...item, siguiendo: Boolean(datos.siguiendo) }
            : item,
        ),
      );
    } catch (errorSeguimiento) {
      setArtistas((actuales) =>
        actuales.map((item) =>
          item.id === artista.id
            ? { ...item, siguiendo: estadoAnterior }
            : item,
        ),
      );
      setError(
        errorSeguimiento instanceof Error
          ? errorSeguimiento.message
          : "No se pudo actualizar el seguimiento.",
      );
    } finally {
      setProcesandoId(null);
    }
  }

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`titulo-vistas-${ideaId}`}
        className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#08140f] shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Alcance real
            </p>
            <h2
              id={`titulo-vistas-${ideaId}`}
              className="mt-1 text-base font-black text-white sm:text-lg"
            >
              Artistas que vieron tu publicación
            </h2>
            <p className="mt-1 truncate text-[10px] text-zinc-500">
              {total.toLocaleString("es-CO")} {total === 1 ? "artista" : "artistas"}
              {tituloIdea ? ` · ${tituloIdea}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar lista de artistas"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <IconoCerrar />
          </button>
        </header>

        {error && (
          <p
            role="alert"
            className="mx-4 mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[10px] font-semibold text-red-200 sm:mx-5"
          >
            {error}
          </p>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] sm:px-4">
          {cargando ? (
            <div className="flex min-h-52 items-center justify-center">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-300/20 border-t-emerald-300" />
            </div>
          ) : artistas.length === 0 ? (
            <div className="flex min-h-52 items-center justify-center px-6 text-center">
              <div>
                <p className="text-sm font-black text-zinc-200">
                  Todavía nadie ha visto esta publicación
                </p>
                <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                  Las cuentas únicas aparecerán aquí cuando se detengan a verla.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2">
              {artistas.map((artista) => {
                const perfilHref = `/artistas/${encodeURIComponent(
                  artista.nombreUsuario,
                )}`;
                const ubicacion = [artista.ciudad, artista.pais]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article
                    key={artista.vistaId}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3"
                  >
                    <Link
                      href={perfilHref}
                      onClick={onCerrar}
                      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-emerald-500/10 text-sm font-black text-emerald-200"
                    >
                      {artista.fotoPerfil ? (
                        <img
                          src={artista.fotoPerfil}
                          alt={`Foto de ${artista.nombreArtistico}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        iniciales(artista.nombreArtistico)
                      )}
                    </Link>

                    <Link
                      href={perfilHref}
                      onClick={onCerrar}
                      className="min-w-0 flex-1"
                    >
                      <h3 className="truncate text-sm font-black text-white">
                        {artista.nombreArtistico}
                      </h3>
                      <p className="truncate text-[10px] font-semibold text-emerald-300">
                        @{artista.nombreUsuario}
                      </p>
                      <p className="mt-0.5 truncate text-[9px] text-zinc-500">
                        {formatearRol(artista.rol)}
                        {ubicacion ? ` · ${ubicacion}` : ""}
                      </p>
                      <p className="mt-1 text-[8px] font-semibold text-zinc-600">
                        {tiempoVista(artista.vistaEn)}
                      </p>
                    </Link>

                    <button
                      type="button"
                      onClick={() => void alternarSeguimiento(artista)}
                      disabled={procesandoId !== null}
                      aria-pressed={artista.siguiendo}
                      className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[9px] font-black transition disabled:cursor-wait disabled:opacity-60 ${
                        artista.siguiendo
                          ? "border-white/12 bg-white/[0.045] text-zinc-300 hover:border-red-400/20 hover:text-red-200"
                          : "border-emerald-400/30 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/20"
                      }`}
                    >
                      {procesandoId === artista.id
                        ? "..."
                        : artista.siguiendo
                          ? "Siguiendo"
                          : "Seguir"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {pagina < totalPaginas && !cargando && (
          <footer className="border-t border-white/10 px-4 py-3 sm:px-5">
            <button
              type="button"
              disabled={cargandoMas}
              onClick={() => void cargar(pagina + 1, false)}
              className="w-full rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2.5 text-[11px] font-black text-emerald-100 transition hover:bg-emerald-500/18 disabled:cursor-wait disabled:opacity-60"
            >
              {cargandoMas ? "Cargando..." : "Ver más artistas"}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}
