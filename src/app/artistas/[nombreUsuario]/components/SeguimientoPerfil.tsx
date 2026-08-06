"use client";

// FEATMUSIC_SEGUIR_COMPACTO_CABECERA_V1
// FEATMUSIC_SEGUIMIENTO_UNA_FILA_V1
// FEATMUSIC_SEGUIR_DEBAJO_BANDERA_V2
// FEATMUSIC_ICONO_SEGUIR_IGUAL_REDES_V3
// FEATMUSIC_SEGUIR_DENTRO_COLUMNA_REDES_V4
// FEATMUSIC_BIOGRAFIA_Y_TOQUES_ICONOS_V5

import { useEffect, useState } from "react";

import ContadoresSeguimiento from "@/app/components/ContadoresSeguimiento";

type RespuestaSeguimiento = {
  ok: boolean;
  mensaje?: string;
  siguiendo?: boolean;
  seguidores?: number;
};

type ModoSeguimiento = "completo" | "boton" | "contadores";

type DetalleSeguimiento = {
  artistaId: number;
  siguiendo: boolean;
  seguidores: number;
};

const EVENTO_SEGUIMIENTO = "featmusic:seguimiento-actualizado";

export default function SeguimientoPerfil({
  artistaId,
  nombreUsuario,
  sesionActiva,
  esPerfilPropio,
  siguiendoInicial,
  seguidoresIniciales,
  siguiendoCantidad,
  modo = "completo",
}: {
  artistaId: number;
  nombreUsuario: string;
  sesionActiva: boolean;
  esPerfilPropio: boolean;
  siguiendoInicial: boolean;
  seguidoresIniciales: number;
  siguiendoCantidad: number;
  modo?: ModoSeguimiento;
}) {
  const [siguiendo, setSiguiendo] = useState(siguiendoInicial);
  const [seguidores, setSeguidores] = useState(seguidoresIniciales);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const mostrarBoton = modo !== "contadores" && !esPerfilPropio;
  const mostrarContadores = modo !== "boton";

  useEffect(() => {
    function sincronizarSeguimiento(evento: Event) {
      const detalle = (evento as CustomEvent<DetalleSeguimiento>).detail;

      if (!detalle || detalle.artistaId !== artistaId) {
        return;
      }

      setSiguiendo(detalle.siguiendo);
      setSeguidores(Math.max(0, detalle.seguidores));
    }

    window.addEventListener(EVENTO_SEGUIMIENTO, sincronizarSeguimiento);

    return () => {
      window.removeEventListener(EVENTO_SEGUIMIENTO, sincronizarSeguimiento);
    };
  }, [artistaId]);

  function emitirActualizacion(
    siguiendoActualizado: boolean,
    seguidoresActualizados: number,
  ) {
    window.dispatchEvent(
      new CustomEvent<DetalleSeguimiento>(EVENTO_SEGUIMIENTO, {
        detail: {
          artistaId,
          siguiendo: siguiendoActualizado,
          seguidores: Math.max(0, seguidoresActualizados),
        },
      }),
    );
  }

  function IconoSeguir() {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="7" r="3" />
        <path d="M3.8 19c.6-4 2.4-6 5.2-6s4.6 2 5.2 6" />
        <path d="M18 8v6M15 11h6" />
      </svg>
    );
  }

  function IconoSeguido() {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8.5" cy="7" r="3" />
        <path d="M3.5 19c.6-4 2.3-6 5-6 2.2 0 3.8 1.3 4.6 3.8" />
        <path d="m15 12.5 2 2 4-4" />
      </svg>
    );
  }

  function IconoCargando() {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 animate-spin"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      </svg>
    );
  }

  async function alternarSeguimiento() {
    if (procesando || esPerfilPropio) {
      return;
    }

    if (!sesionActiva) {
      window.location.assign("/iniciar-sesion");
      return;
    }

    const estadoAnterior = siguiendo;
    const seguidoresAnteriores = seguidores;
    const nuevoEstado = !estadoAnterior;
    const seguidoresOptimistas = Math.max(
      0,
      seguidoresAnteriores + (nuevoEstado ? 1 : -1),
    );

    setError("");
    setProcesando(true);
    setSiguiendo(nuevoEstado);
    setSeguidores(seguidoresOptimistas);
    emitirActualizacion(nuevoEstado, seguidoresOptimistas);

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

      const siguiendoConfirmado = Boolean(datos.siguiendo);
      const seguidoresConfirmados =
        typeof datos.seguidores === "number" &&
        Number.isFinite(datos.seguidores)
          ? Math.max(0, datos.seguidores)
          : seguidoresOptimistas;

      setSiguiendo(siguiendoConfirmado);
      setSeguidores(seguidoresConfirmados);
      emitirActualizacion(siguiendoConfirmado, seguidoresConfirmados);
    } catch (errorSeguimiento) {
      setSiguiendo(estadoAnterior);
      setSeguidores(seguidoresAnteriores);
      emitirActualizacion(estadoAnterior, seguidoresAnteriores);
      setError(
        errorSeguimiento instanceof Error
          ? errorSeguimiento.message
          : "No se pudo actualizar el seguimiento.",
      );
    } finally {
      setProcesando(false);
    }
  }

  const boton = mostrarBoton ? (
    <button
      type="button"
      onClick={() => void alternarSeguimiento()}
      disabled={procesando}
      aria-pressed={siguiendo}
      aria-label={
        procesando
          ? "Guardando seguimiento"
          : siguiendo
            ? `Dejar de seguir a @${nombreUsuario}`
            : `Seguir a @${nombreUsuario}`
      }
      title={
        siguiendo
          ? `Dejar de seguir a @${nombreUsuario}`
          : `Seguir a @${nombreUsuario}`
      }
      className="group relative z-40 inline-flex h-11 w-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-xl bg-transparent p-0 outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-wait disabled:opacity-65 [-webkit-tap-highlight-color:transparent]"
    >
      <span
        className={`pointer-events-none inline-flex h-8 w-8 items-center justify-center rounded-lg border !bg-white shadow-sm transition ${
          siguiendo
            ? "border-emerald-300 text-emerald-700 group-hover:border-red-300 group-hover:!bg-red-50 group-hover:text-red-700"
            : "border-slate-200 text-slate-700 group-hover:border-emerald-300 group-hover:!bg-emerald-50 group-hover:text-emerald-700"
        }`}
      >
        {procesando ? (
          <IconoCargando />
        ) : siguiendo ? (
          <IconoSeguido />
        ) : (
          <IconoSeguir />
        )}
      </span>
    </button>
  ) : null;

  if (modo === "boton") {
    return (
      <>
        {boton}
        {error && (
          <span role="alert" className="sr-only">
            {error}
          </span>
        )}
      </>
    );
  }

  return (
    <div className="mt-3 grid gap-2.5 lg:justify-items-center">
      {boton}

      {mostrarContadores && (
        <div className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ContadoresSeguimiento
            nombreUsuario={nombreUsuario}
            seguidores={seguidores}
            siguiendo={siguiendoCantidad}
            className="!flex-nowrap whitespace-nowrap lg:justify-center"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-[10px] font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
