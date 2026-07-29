"use client";

// FEATMUSIC_SEGUIR_COMPACTO_CABECERA_V1
// FEATMUSIC_SEGUIMIENTO_UNA_FILA_V1

import { useState } from "react";

import ContadoresSeguimiento from "@/app/components/ContadoresSeguimiento";

type RespuestaSeguimiento = {
  ok: boolean;
  mensaje?: string;
  siguiendo?: boolean;
  seguidores?: number;
};

export default function SeguimientoPerfil({
  artistaId,
  nombreUsuario,
  sesionActiva,
  esPerfilPropio,
  siguiendoInicial,
  seguidoresIniciales,
  siguiendoCantidad,
  botonCompactoEnCabecera = false,
}: {
  artistaId: number;
  nombreUsuario: string;
  sesionActiva: boolean;
  esPerfilPropio: boolean;
  siguiendoInicial: boolean;
  seguidoresIniciales: number;
  siguiendoCantidad: number;
  botonCompactoEnCabecera?: boolean;
}) {
  const [siguiendo, setSiguiendo] = useState(siguiendoInicial);
  const [seguidores, setSeguidores] = useState(seguidoresIniciales);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

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

    setError("");
    setProcesando(true);
    setSiguiendo(nuevoEstado);
    setSeguidores((actual) => Math.max(0, actual + (nuevoEstado ? 1 : -1)));

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
      setSeguidores(
        typeof datos.seguidores === "number" && Number.isFinite(datos.seguidores)
          ? Math.max(0, datos.seguidores)
          : seguidoresAnteriores,
      );
    } catch (errorSeguimiento) {
      setSiguiendo(estadoAnterior);
      setSeguidores(seguidoresAnteriores);
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
    <div className="mt-3 grid gap-2.5 lg:justify-items-center">
      {!esPerfilPropio && (
        <button
          type="button"
          onClick={() => void alternarSeguimiento()}
          disabled={procesando}
          aria-pressed={siguiendo}
          className={`border font-black transition focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:cursor-wait disabled:opacity-65 ${
            botonCompactoEnCabecera
              ? "absolute right-[3.25rem] top-3 z-10 inline-flex h-5 min-w-[3.6rem] items-center justify-center gap-1 rounded-full px-2 text-[8px] shadow-sm sm:right-[3.75rem] sm:top-4"
              : "inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[11px] lg:w-auto lg:min-w-32"
          } ${
            botonCompactoEnCabecera
              ? siguiendo
                ? "border-slate-300 bg-slate-100 text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100"
              : siguiendo
                ? "border-white/15 bg-white/[0.055] text-zinc-200 hover:border-red-400/25 hover:bg-red-500/[0.07] hover:text-red-200"
                : "border-emerald-400/35 bg-emerald-500/15 text-emerald-100 hover:border-emerald-300/50 hover:bg-emerald-500/25"
          }`}
        >
          <span aria-hidden="true">{siguiendo ? "✓" : "+"}</span>
          {procesando
            ? botonCompactoEnCabecera
              ? "..."
              : "Guardando..."
            : siguiendo
              ? "Siguiendo"
              : "Seguir"}
        </button>
      )}

      <div className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ContadoresSeguimiento
          nombreUsuario={nombreUsuario}
          seguidores={seguidores}
          siguiendo={siguiendoCantidad}
          className="!flex-nowrap whitespace-nowrap lg:justify-center"
        />
      </div>

      {error && (
        <p role="alert" className="text-[10px] font-semibold text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
