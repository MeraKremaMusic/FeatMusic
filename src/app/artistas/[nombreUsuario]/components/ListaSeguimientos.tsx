"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import ContadoresSeguimiento from "@/app/components/ContadoresSeguimiento";

type ArtistaLista = {
  id: number;
  nombreArtistico: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  rol: string;
  ubicacion: string;
  siguiendo: boolean;
  esPerfilPropio: boolean;
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

export default function ListaSeguimientos({
  perfil,
  tipo,
  artistasIniciales,
  sesionActiva,
  eliminarAlDejarDeSeguir,
}: {
  perfil: {
    nombreArtistico: string;
    nombreUsuario: string;
    seguidores: number;
    siguiendo: number;
  };
  tipo: "seguidores" | "siguiendo";
  artistasIniciales: ArtistaLista[];
  sesionActiva: boolean;
  eliminarAlDejarDeSeguir: boolean;
}) {
  const [artistas, setArtistas] = useState(artistasIniciales);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [cantidadSiguiendo, setCantidadSiguiendo] = useState(perfil.siguiendo);

  const titulo =
    tipo === "seguidores"
      ? `Seguidores de ${perfil.nombreArtistico}`
      : `${perfil.nombreArtistico} sigue a`;

  const vacio = useMemo(
    () =>
      tipo === "seguidores"
        ? "Este artista todavía no tiene seguidores."
        : "Este artista todavía no sigue a nadie.",
    [tipo],
  );

  async function alternar(artista: ArtistaLista) {
    if (procesandoId || artista.esPerfilPropio) {
      return;
    }

    if (!sesionActiva) {
      window.location.assign("/iniciar-sesion");
      return;
    }

    const estadoAnterior = artista.siguiendo;
    const nuevoEstado = !estadoAnterior;

    setError("");
    setProcesandoId(artista.id);
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

      const estadoServidor = Boolean(datos.siguiendo);

      if (!estadoServidor && eliminarAlDejarDeSeguir) {
        setArtistas((actuales) =>
          actuales.filter((item) => item.id !== artista.id),
        );
        setCantidadSiguiendo((actual) => Math.max(0, actual - 1));
      } else {
        setArtistas((actuales) =>
          actuales.map((item) =>
            item.id === artista.id
              ? { ...item, siguiendo: estadoServidor }
              : item,
          ),
        );
      }
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

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm sm:p-5">
        <Link
          href={`/artistas/${encodeURIComponent(perfil.nombreUsuario)}`}
          className="inline-flex items-center gap-2 text-[11px] font-bold text-violet-300 transition hover:text-violet-200"
        >
          <span aria-hidden="true">←</span>
          Volver al perfil
        </Link>

        <div className="mt-4 flex flex-col gap-3 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-400">
              Comunidad
            </p>
            <h1 className="mt-1 text-xl font-black text-white sm:text-2xl">
              {titulo}
            </h1>
            <p className="mt-1 text-[11px] text-zinc-500">
              @{perfil.nombreUsuario}
            </p>
          </div>

          <ContadoresSeguimiento
            nombreUsuario={perfil.nombreUsuario}
            seguidores={perfil.seguidores}
            siguiendo={cantidadSiguiendo}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-200"
          >
            {error}
          </p>
        )}

        {artistas.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-semibold text-zinc-300">{vacio}</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Cuando haya actividad, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-2.5">
            {artistas.map((artista) => (
              <article
                key={artista.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 transition hover:border-violet-400/20"
              >
                <Link
                  href={`/artistas/${encodeURIComponent(artista.nombreUsuario)}`}
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-violet-500/10 text-sm font-black text-violet-200"
                >
                  {artista.fotoPerfil ? (
                    // eslint-disable-next-line @next/next/no-img-element
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
                  href={`/artistas/${encodeURIComponent(artista.nombreUsuario)}`}
                  className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                >
                  <h2 className="truncate text-sm font-black text-white">
                    {artista.nombreArtistico}
                  </h2>
                  <p className="truncate text-[10px] font-semibold text-violet-300">
                    @{artista.nombreUsuario}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-zinc-500">
                    {artista.rol} · {artista.ubicacion}
                  </p>
                </Link>

                {artista.esPerfilPropio ? (
                  <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-zinc-400">
                    Tu perfil
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void alternar(artista)}
                    disabled={procesandoId === artista.id}
                    aria-pressed={artista.siguiendo}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-black transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-wait disabled:opacity-60 ${
                      artista.siguiendo
                        ? "border-white/15 bg-white/[0.05] text-zinc-200 hover:border-red-400/25 hover:text-red-200"
                        : "border-violet-400/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
                    }`}
                  >
                    {procesandoId === artista.id
                      ? "..."
                      : artista.siguiendo
                        ? "Siguiendo"
                        : "Seguir"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
