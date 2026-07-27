"use client";

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
}: {
  artistaId: number;
  nombreUsuario: string;
  sesionActiva: boolean;
  esPerfilPropio: boolean;
  siguiendoInicial: boolean;
  seguidoresIniciales: number;
  siguiendoCantidad: number;
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
          className={`inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-[11px] font-black transition focus:outline-none focus:ring-2 focus:ring-violet-500/40 disabled:cursor-wait disabled:opacity-65 lg:w-auto lg:min-w-32 ${
            siguiendo
              ? "border-white/15 bg-white/[0.055] text-zinc-200 hover:border-red-400/25 hover:bg-red-500/[0.07] hover:text-red-200"
              : "border-violet-400/35 bg-violet-500/15 text-violet-100 hover:border-violet-300/50 hover:bg-violet-500/25"
          }`}
        >
          <span aria-hidden="true">{siguiendo ? "✓" : "+"}</span>
          {procesando ? "Guardando..." : siguiendo ? "Siguiendo" : "Seguir"}
        </button>
      )}

      <ContadoresSeguimiento
        nombreUsuario={nombreUsuario}
        seguidores={seguidores}
        siguiendo={siguiendoCantidad}
        className="lg:justify-center"
      />

      {error && (
        <p role="alert" className="text-[10px] font-semibold text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
