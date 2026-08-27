"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { PlanPagoFeatMusic } from "@/lib/planes";

type RespuestaApi = {
  ok?: boolean;
  mensaje?: string;
  url?: string;
  plan?: string;
  planProgramado?: string | null;
  cambioPlanEn?: string | null;
};

export function EstadoRetornoMercadoPago() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("mercadopago") !== "retorno") {
      return;
    }

    setVisible(true);
    const esperado = window.localStorage.getItem("featmusic_plan_pendiente");
    let intentos = 0;
    let cancelado = false;

    async function comprobar() {
      intentos += 1;

      try {
        const response = await fetch("/api/planes/mi-plan", {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as RespuestaApi;

        if (
          response.ok &&
          data.ok &&
          ((esperado && data.plan === esperado) ||
            (!esperado && (data.plan === "CREATOR" || data.plan === "PRO")))
        ) {
          window.localStorage.removeItem("featmusic_plan_pendiente");
          setConfirmado(true);
          router.refresh();
          return;
        }
      } catch {
        // El webhook puede tardar unos segundos; volvemos a consultar.
      }

      if (!cancelado && intentos < 12) {
        window.setTimeout(comprobar, 1500);
      }
    }

    void comprobar();

    return () => {
      cancelado = true;
    };
  }, [router]);

  if (!visible) return null;

  return (
    <div
      className={`mx-auto mb-6 max-w-3xl rounded-2xl border px-4 py-3 text-center text-xs font-bold ${
        confirmado
          ? "border-yellow-300/35 bg-yellow-300/10 text-yellow-200"
          : "border-white/10 bg-white/[0.04] text-white/70"
      }`}
    >
      {confirmado
        ? "Pago confirmado. Tu plan de FeatMusic ya está activo."
        : "Estamos confirmando tu suscripción con Mercado Pago. Puede tardar unos segundos."}
    </div>
  );
}

export function BotonComprarPlanMercadoPago({
  plan,
  sesionActiva,
  esPlanActual,
}: {
  plan: PlanPagoFeatMusic;
  sesionActiva: boolean;
  esPlanActual: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function comprar() {
    if (esPlanActual || cargando) return;

    if (!sesionActiva) {
      router.push("/iniciar-sesion");
      return;
    }

    setError(null);
    setCargando(true);

    try {
      const response = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await response.json().catch(() => ({}))) as RespuestaApi;

      if (response.status === 401) {
        router.push("/iniciar-sesion");
        return;
      }

      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.mensaje ?? "No se pudo abrir Mercado Pago.");
      }

      window.localStorage.setItem("featmusic_plan_pendiente", plan);
      window.location.assign(data.url);
    } catch (errorCompra) {
      setError(
        errorCompra instanceof Error
          ? errorCompra.message
          : "No se pudo iniciar el pago.",
      );
      setCargando(false);
    }
  }

  return (
    <>
      <div className="relative mt-auto pt-6">
        <button
          type="button"
          disabled={esPlanActual || cargando}
          onClick={() => {
            if (esPlanActual || cargando) return;
            if (!sesionActiva) {
              router.push("/iniciar-sesion");
              return;
            }
            setError(null);
            setAbierto(true);
          }}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-yellow-400 px-4 text-xs font-black text-black transition hover:bg-yellow-300 disabled:cursor-default disabled:bg-white/10 disabled:text-white/45"
        >
          {esPlanActual
            ? "Plan actual"
            : cargando
              ? "Abriendo Mercado Pago..."
              : plan === "PRO"
                ? "Elegir Pro"
                : "Elegir Creator"}
        </button>

        {error && (
          <p className="mt-2 text-center text-[10px] font-semibold leading-4 text-red-300">
            {error}
          </p>
        )}
      </div>

      {abierto && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black">
              i
            </div>
            <h2 className="mt-4 text-lg font-black text-white">
              Antes de activar {plan === "PRO" ? "Pro" : "Creator"}
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/60">
              Los planes se cobran por períodos mensuales. Si después quieres
              cambiar entre Creator y Pro, conservarás tu plan actual hasta
              terminar el período pagado y el nuevo plan comenzará en tu
              siguiente renovación. El cambio no es inmediato.
            </p>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-[10px] font-semibold text-red-200">
                {error}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cargando}
                onClick={() => setAbierto(false)}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-black text-white/80"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={comprar}
                className="h-10 rounded-xl bg-yellow-400 text-xs font-black text-black disabled:opacity-50"
              >
                {cargando ? "Abriendo..." : "Entiendo, continuar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatearFechaCambio(fechaIso: string | null) {
  if (!fechaIso) return "tu próxima renovación";
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return "tu próxima renovación";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

export function BotonCambiarPlanMercadoPago({
  planDestino,
  planActual,
  fechaCambio,
  cambioProgramado,
  renovacionCancelada,
}: {
  planDestino: PlanPagoFeatMusic;
  planActual: PlanPagoFeatMusic;
  fechaCambio: string | null;
  cambioProgramado: boolean;
  renovacionCancelada: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nombreActual = planActual === "PRO" ? "Pro" : "Creator";
  const nombreDestino = planDestino === "PRO" ? "Pro" : "Creator";

  async function programarCambio() {
    if (cargando || cambioProgramado || renovacionCancelada) return;
    setCargando(true);
    setError(null);

    try {
      const response = await fetch("/api/mercadopago/cambio-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planDestino }),
      });
      const data = (await response.json().catch(() => ({}))) as RespuestaApi;

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje ?? "No se pudo programar el cambio.");
      }

      setAbierto(false);
      router.refresh();
    } catch (errorCambio) {
      setError(
        errorCambio instanceof Error
          ? errorCambio.message
          : "No se pudo programar el cambio.",
      );
    } finally {
      setCargando(false);
    }
  }

  const etiqueta = renovacionCancelada
    ? "Disponible al finalizar"
    : cambioProgramado
      ? "Cambio programado"
      : `Cambiar a ${nombreDestino}`;

  return (
    <>
      <div className="relative mt-auto pt-6">
        <button
          type="button"
          disabled={renovacionCancelada || cambioProgramado || cargando}
          onClick={() => {
            setError(null);
            setAbierto(true);
          }}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-yellow-400 px-4 text-xs font-black text-black transition hover:bg-yellow-300 disabled:cursor-default disabled:bg-white/10 disabled:text-white/45"
        >
          {cargando ? "Programando..." : etiqueta}
        </button>
        {renovacionCancelada && (
          <p className="mt-2 text-center text-[10px] font-semibold leading-4 text-white/45">
            Tu renovación está cancelada. Podrás elegir otro plan cuando
            termine el período pagado.
          </p>
        )}
      </div>

      {abierto && !renovacionCancelada && !cambioProgramado && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black">
              ↗
            </div>
            <h2 className="mt-4 text-lg font-black text-white">
              Cambiar a {nombreDestino}
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/60">
              Seguirás usando {nombreActual} hasta el {formatearFechaCambio(fechaCambio)}.
              No se hará un cobro adicional hoy. En tu siguiente renovación
              comenzará {nombreDestino} y se cobrará el precio mensual de ese plan.
            </p>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-[10px] font-semibold text-red-200">
                {error}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cargando}
                onClick={() => setAbierto(false)}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-black text-white/80"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={programarCambio}
                className="h-10 rounded-xl bg-yellow-400 text-xs font-black text-black disabled:opacity-50"
              >
                {cargando ? "Programando..." : "Programar cambio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function BotonCancelarCambioPlanMercadoPago() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelarCambio() {
    if (cargando) return;
    setCargando(true);
    setError(null);

    try {
      const response = await fetch("/api/mercadopago/cambio-plan", {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as RespuestaApi;

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje ?? "No se pudo cancelar el cambio.");
      }

      router.refresh();
    } catch (errorCambio) {
      setError(
        errorCambio instanceof Error
          ? errorCambio.message
          : "No se pudo cancelar el cambio.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={cargando}
        onClick={cancelarCambio}
        className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[10px] font-black text-white/75 transition hover:border-yellow-300/30 hover:text-yellow-200 disabled:opacity-50"
      >
        {cargando ? "Cancelando cambio..." : "Cancelar cambio de plan"}
      </button>
      {error && (
        <p className="mt-2 text-[10px] font-semibold text-red-300">{error}</p>
      )}
    </div>
  );
}

// FEATMUSIC_REACTIVAR_RENOVACION_V1
export function BotonReactivarSuscripcionMercadoPago() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reactivar() {
    if (cargando) return;
    setCargando(true);
    setError(null);

    try {
      const response = await fetch("/api/mercadopago/reactivar", {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as RespuestaApi;

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje ?? "No se pudo reactivar la renovación.");
      }

      setAbierto(false);
      router.refresh();
    } catch (errorReactivacion) {
      setError(
        errorReactivacion instanceof Error
          ? errorReactivacion.message
          : "No se pudo reactivar la renovación.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={cargando}
        onClick={() => {
          setError(null);
          setAbierto(true);
        }}
        className="mt-2 inline-flex h-9 items-center justify-center rounded-xl bg-yellow-400 px-4 text-[10px] font-black text-black transition hover:bg-yellow-300 disabled:opacity-50"
      >
        {cargando ? "Reactivando..." : "Reactivar renovación"}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black">
              ↻
            </div>
            <h2 className="mt-4 text-lg font-black text-white">
              ¿Reactivar la renovación?
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/60">
              Continuarás con el mismo plan. Mercado Pago volverá a habilitar
              la renovación automática y los próximos cobros seguirán la
              programación de tu suscripción.
            </p>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-[10px] font-semibold text-red-200">
                {error}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cargando}
                onClick={() => setAbierto(false)}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-black text-white/80"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={reactivar}
                className="h-10 rounded-xl bg-yellow-400 text-xs font-black text-black disabled:opacity-50"
              >
                {cargando ? "Reactivando..." : "Sí, reactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function BotonCancelarSuscripcionMercadoPago() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelar() {
    if (cargando) return;
    setCargando(true);
    setError(null);

    try {
      const response = await fetch("/api/mercadopago/cancelar", {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as RespuestaApi;

      if (!response.ok || !data.ok) {
        throw new Error(data.mensaje ?? "No se pudo cancelar la suscripción.");
      }

      window.localStorage.removeItem("featmusic_plan_pendiente");
      setAbierto(false);
      router.refresh();
    } catch (errorCancelacion) {
      setError(
        errorCancelacion instanceof Error
          ? errorCancelacion.message
          : "No se pudo cancelar la suscripción.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setAbierto(true);
        }}
        className="mt-2 w-full py-1 text-center text-[10px] font-bold text-white/45 transition hover:text-yellow-200"
      >
        Cancelar renovación
      </button>

      {abierto && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#171717] p-5 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-lg font-black text-black">
              !
            </div>
            <h2 className="mt-4 text-lg font-black text-white">
              ¿Cancelar la renovación?
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/60">
              Mercado Pago dejará de hacer cobros futuros. Mantendrás tu plan
              y todos sus beneficios hasta terminar el período que ya pagaste.
            </p>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-[10px] font-semibold text-red-200">
                {error}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={cargando}
                onClick={() => setAbierto(false)}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-black text-white/80"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={cargando}
                onClick={cancelar}
                className="h-10 rounded-xl bg-yellow-400 text-xs font-black text-black disabled:opacity-50"
              >
                {cargando ? "Cancelando..." : "Sí, cancelar renovación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
