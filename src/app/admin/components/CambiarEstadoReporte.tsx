"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ESTADOS = [
  { valor: "PENDIENTE", etiqueta: "Pendiente" },
  { valor: "EN_REVISION", etiqueta: "En revisión" },
  { valor: "RESUELTO", etiqueta: "Resuelto" },
  { valor: "DESCARTADO", etiqueta: "Descartado" },
] as const;

export default function CambiarEstadoReporte({
  reporteId,
  estadoInicial,
}: {
  reporteId: number;
  estadoInicial: string;
}) {
  const router = useRouter();
  const [estado, setEstado] = useState(estadoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function cambiar(nuevoEstado: string) {
    if (guardando || nuevoEstado === estado) return;

    setGuardando(true);
    setError("");

    try {
      const respuesta = await fetch(`/api/admin/reportes/${reporteId}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const datos = (await respuesta.json()) as {
        ok?: boolean;
        mensaje?: string;
        estado?: string;
      };

      if (!respuesta.ok || !datos.ok || !datos.estado) {
        throw new Error(datos.mensaje || "No se pudo actualizar el reporte.");
      }

      setEstado(datos.estado);
      router.refresh();
    } catch (errorActual) {
      setError(
        errorActual instanceof Error
          ? errorActual.message
          : "No se pudo actualizar el reporte.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
        Estado del reporte
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ESTADOS.map((opcion) => {
          const activo = estado === opcion.valor;

          return (
            <button
              key={opcion.valor}
              type="button"
              disabled={guardando}
              onClick={() => cambiar(opcion.valor)}
              className={`min-h-10 rounded-xl border px-3 py-2 text-[10px] font-black transition disabled:cursor-wait disabled:opacity-60 ${
                activo
                  ? "border-yellow-300 bg-[#FFD400] text-black"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-yellow-300/30"
              }`}
            >
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-yellow-300/20 bg-yellow-300/10 px-3 py-2 text-xs text-yellow-100">
          {error}
        </p>
      )}
    </div>
  );
}
