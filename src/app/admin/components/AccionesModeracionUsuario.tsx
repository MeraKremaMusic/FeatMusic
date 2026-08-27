"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Accion =
  | "ADVERTIR"
  | "SUSPENDER_24H"
  | "SUSPENDER_7D"
  | "SUSPENDER_30D"
  | "BLOQUEAR"
  | "REACTIVAR";

const OPCIONES: Array<{
  accion: Accion;
  etiqueta: string;
  detalle: string;
}> = [
  {
    accion: "ADVERTIR",
    etiqueta: "Advertir",
    detalle: "Envía una advertencia dentro de FeatMusic y deja historial.",
  },
  {
    accion: "SUSPENDER_24H",
    etiqueta: "Suspender 24 h",
    detalle: "Impide iniciar o mantener una sesión durante 24 horas.",
  },
  {
    accion: "SUSPENDER_7D",
    etiqueta: "Suspender 7 días",
    detalle: "Impide el acceso durante 7 días.",
  },
  {
    accion: "SUSPENDER_30D",
    etiqueta: "Suspender 30 días",
    detalle: "Impide el acceso durante 30 días.",
  },
  {
    accion: "BLOQUEAR",
    etiqueta: "Bloquear cuenta",
    detalle: "Bloquea el acceso indefinidamente hasta que un administrador reactive la cuenta.",
  },
];

const ETIQUETAS: Record<Accion, string> = {
  ADVERTIR: "Enviar advertencia",
  SUSPENDER_24H: "Suspender por 24 horas",
  SUSPENDER_7D: "Suspender por 7 días",
  SUSPENDER_30D: "Suspender por 30 días",
  BLOQUEAR: "Bloquear cuenta",
  REACTIVAR: "Reactivar cuenta",
};

export default function AccionesModeracionUsuario({
  usuarioId,
  reporteId,
  estadoActual,
  esAdministradorObjetivo,
}: {
  usuarioId: number;
  reporteId: number;
  estadoActual: "ACTIVA" | "SUSPENDIDA" | "BLOQUEADA";
  esAdministradorObjetivo: boolean;
}) {
  const router = useRouter();
  const [accion, setAccion] = useState<Accion | null>(null);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const opciones = useMemo(() => {
    if (estadoActual === "ACTIVA") return OPCIONES;

    return [
      ...OPCIONES,
      {
        accion: "REACTIVAR" as Accion,
        etiqueta: "Reactivar cuenta",
        detalle: "Quita la suspensión o el bloqueo actual y devuelve el acceso.",
      },
    ];
  }, [estadoActual]);

  async function confirmar() {
    if (!accion || enviando || esAdministradorObjetivo) return;

    const motivoLimpio = motivo.trim();

    if (motivoLimpio.length < 10) {
      setError("Escribe un motivo de al menos 10 caracteres.");
      return;
    }

    setEnviando(true);
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch(`/api/admin/usuarios/${usuarioId}/moderacion`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          accion,
          motivo: motivoLimpio,
          reporteId,
        }),
      });

      const datos = (await respuesta.json()) as {
        ok?: boolean;
        mensaje?: string;
      };

      if (!respuesta.ok || !datos.ok) {
        throw new Error(datos.mensaje || "No se pudo aplicar la acción.");
      }

      setMensaje(datos.mensaje || "Acción aplicada correctamente.");
      setAccion(null);
      setMotivo("");
      router.refresh();
    } catch (errorActual) {
      setError(
        errorActual instanceof Error
          ? errorActual.message
          : "No se pudo aplicar la acción.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (esAdministradorObjetivo) {
    return (
      <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/[0.06] p-4">
        <p className="text-sm font-black text-yellow-200">
          Cuenta administrativa protegida
        </p>
        <p className="mt-2 text-xs leading-6 text-zinc-400">
          Las cuentas ADMIN no pueden ser advertidas, suspendidas ni bloqueadas
          desde este panel.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-300">
            Moderación de la cuenta
          </p>
          <h3 className="mt-1 text-base font-black text-white">
            Acciones administrativas
          </h3>
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-black text-zinc-300">
          {estadoActual}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {opciones.map((opcion) => {
          const seleccionada = accion === opcion.accion;
          const peligrosa = opcion.accion === "BLOQUEAR";
          const reactivar = opcion.accion === "REACTIVAR";

          return (
            <button
              key={opcion.accion}
              type="button"
              disabled={enviando}
              onClick={() => {
                setAccion(opcion.accion);
                setError("");
                setMensaje("");
              }}
              className={`rounded-xl border p-3 text-left transition disabled:opacity-50 ${
                seleccionada
                  ? "border-yellow-300 bg-yellow-300/10"
                  : peligrosa
                    ? "border-white/10 bg-white/[0.03] hover:border-yellow-300/25"
                    : reactivar
                      ? "border-yellow-300/20 bg-yellow-300/[0.04] hover:border-yellow-300/35"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <span
                className={`block text-xs font-black ${
                  peligrosa ? "text-yellow-200" : "text-white"
                }`}
              >
                {opcion.etiqueta}
              </span>
              <span className="mt-1 block text-[10px] leading-5 text-zinc-500">
                {opcion.detalle}
              </span>
            </button>
          );
        })}
      </div>

      {accion ? (
        <div className="mt-4 rounded-xl border border-yellow-300/20 bg-yellow-300/[0.05] p-3">
          <p className="text-xs font-black text-yellow-100">
            {ETIQUETAS[accion]}
          </p>
          <p className="mt-1 text-[10px] leading-5 text-zinc-400">
            Escribe el motivo. Quedará registrado en el historial de moderación.
          </p>

          <textarea
            value={motivo}
            onChange={(event) => setMotivo(event.target.value.slice(0, 500))}
            rows={3}
            maxLength={500}
            placeholder="Ejemplo: Se verificó reincidencia de spam en varios reportes..."
            className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-yellow-300/40"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[9px] text-zinc-600">
              {motivo.trim().length}/500
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={enviando}
                onClick={() => {
                  setAccion(null);
                  setMotivo("");
                  setError("");
                }}
                className="min-h-9 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black text-zinc-300 transition hover:border-white/20 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={enviando || motivo.trim().length < 10}
                onClick={() => void confirmar()}
                className="min-h-9 rounded-lg bg-[#FFD400] px-3 py-2 text-[10px] font-black text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enviando ? "Aplicando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-xl border border-yellow-300/20 bg-yellow-300/10 px-3 py-2 text-xs text-yellow-100">
          {error}
        </p>
      ) : null}

      {mensaje ? (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-200">
          {mensaje}
        </p>
      ) : null}
    </div>
  );
}
