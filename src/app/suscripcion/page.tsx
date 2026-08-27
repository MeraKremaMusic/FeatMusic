// FEATMUSIC_REACTIVAR_RENOVACION_V1
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import {
  BotonCancelarCambioPlanMercadoPago,
  BotonCancelarSuscripcionMercadoPago,
  BotonReactivarSuscripcionMercadoPago,
} from "@/app/planes/components/AccionesMercadoPago";
import {
  esPlanPago,
  formatearPrecioCop,
  PLANES_FEATMUSIC,
} from "@/lib/planes";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import {
  beneficiosSiguenVigentes,
  esEstadoPagoFallidoMercadoPago,
  renovacionEstaCancelada,
  sincronizarPlanUsuario,
} from "@/lib/suscripciones";

export const metadata: Metadata = {
  title: "Mi suscripción | FeatMusic",
  description:
    "Consulta el estado, renovación, cobros y vigencia de tu suscripción de FeatMusic.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatearFecha(fecha: Date | null | undefined) {
  if (!fecha) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

function nombrePlan(plan: string) {
  if (plan === "PRO") return "Pro";
  if (plan === "CREATOR") return "Creator";
  return "Gratuito";
}

function estadoPago(estado: string | null) {
  if (!estado) return "Sin información";
  if (estado === "approved") return "Aprobado";
  if (estado === "pending") return "Pendiente";
  if (estado === "rejected") return "Rechazado";
  return estado;
}

export default async function SuscripcionPage() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  const estadoActual = await sincronizarPlanUsuario(sesion.usuarioId);
  const ahora = new Date();

  const suscripcion = estadoActual?.suscripcion
    ? await prisma.suscripcionMercadoPago.findUnique({
        where: { id: estadoActual.suscripcion.id },
      })
    : await prisma.suscripcionMercadoPago.findFirst({
        where: { usuarioId: sesion.usuarioId },
        orderBy: { actualizadoEn: "desc" },
      });

  const cancelada = renovacionEstaCancelada(suscripcion?.estado);
  const beneficiosVigentes = beneficiosSiguenVigentes(
    suscripcion?.beneficiosHasta,
    ahora,
  );
  // FEATMUSIC_REVISION_RENOVACION_SEGURA_V1
  const renovacionEnRevision =
    suscripcion?.estado === "error_datos" && beneficiosVigentes;

  // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
  const pagoRenovacionFallido =
    suscripcion?.estado === "authorized" &&
    esEstadoPagoFallidoMercadoPago(suscripcion.ultimoPagoEstado);
  const graciaVigente = beneficiosSiguenVigentes(
    suscripcion?.graciaHasta,
    ahora,
  );

  const activa =
    Boolean(suscripcion) &&
    ((suscripcion?.estado === "authorized" &&
      Boolean(suscripcion.activadaEn)) ||
      (cancelada && beneficiosVigentes) ||
      renovacionEnRevision);

  const planMostrado =
    estadoActual?.plan ??
    (activa && suscripcion ? suscripcion.plan : "GRATUITO");

  const estadoTexto = !suscripcion
    ? "Sin suscripción"
    : pagoRenovacionFallido && !suscripcion.activadaEn
      ? "Pago rechazado"
      : pagoRenovacionFallido && graciaVigente
        ? "Pago pendiente"
        : pagoRenovacionFallido
          ? "Procesando vencimiento"
          : suscripcion.estado === "authorized"
            ? "Activa"
            : renovacionEnRevision
              ? "Renovación en revisión"
              : cancelada && beneficiosVigentes
                ? "Renovación cancelada"
                : "Finalizada";
  const planProgramado = esPlanPago(suscripcion?.planProgramado)
    ? suscripcion.planProgramado
    : null;

  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#111111] text-white">
      <EncabezadoSecundario />

      <section className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#111111]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_12%,rgba(246,203,30,0.20),transparent_30%),radial-gradient(circle_at_88%_82%,rgba(237,191,5,0.12),transparent_32%),linear-gradient(145deg,#141414,#100c08_55%,#191919)]"
        />

        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-yellow-300/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                Suscripción
              </span>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Mi suscripción
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Consulta el estado de tu plan, la renovación y hasta cuándo
                conservas tus beneficios.
              </p>
            </div>

            <Link
              href="/planes"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-white/80 transition hover:border-yellow-300/30 hover:text-yellow-200"
            >
              Ver planes
            </Link>
          </div>

          {!suscripcion ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 p-6">
              <h2 className="text-lg font-black">Aún no tienes una suscripción</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Cuando actives Creator o Pro, aquí aparecerán los datos de tu
                suscripción.
              </p>
              <Link
                href="/planes"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-yellow-400 px-5 text-xs font-black text-black"
              >
                Elegir un plan
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-8 overflow-hidden rounded-3xl border border-yellow-300/25 bg-[linear-gradient(145deg,rgba(30,30,30,0.97),rgba(10,10,10,0.95))] shadow-[0_24px_80px_rgba(245,158,11,0.12)]">
                <div className="border-b border-white/10 p-6 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                        Plan actual
                      </p>
                      <h2 className="mt-2 text-3xl font-black">
                        {nombrePlan(planMostrado)}
                      </h2>
                      <p className="mt-2 text-sm font-semibold text-white/55">
                        ${formatearPrecioCop(suscripcion.monto)} COP / mes
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                        activa
                          ? cancelada ||
                            renovacionEnRevision ||
                            pagoRenovacionFallido
                            ? "border-yellow-300/30 bg-yellow-300/10 text-yellow-200"
                            : "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                          : "border-white/10 bg-white/[0.04] text-white/50"
                      }`}
                    >
                      {estadoTexto}
                    </span>
                  </div>
                </div>

                <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                  <Dato
                    etiqueta="Fecha de activación"
                    valor={formatearFecha(
                      suscripcion.activadaEn ?? suscripcion.creadoEn,
                    )}
                  />
                  <Dato
                    etiqueta={
                      pagoRenovacionFallido
                        ? "Período de gracia hasta"
                        : cancelada || renovacionEnRevision
                          ? "Beneficios hasta"
                          : "Próximo cobro"
                    }
                    valor={formatearFecha(
                      pagoRenovacionFallido
                        ? suscripcion.graciaHasta ??
                          suscripcion.beneficiosHasta
                        : cancelada || renovacionEnRevision
                          ? suscripcion.beneficiosHasta
                          : suscripcion.proximoCobroEn,
                    )}
                  />
                  <Dato
                    etiqueta="Renovación automática"
                    valor={
                      pagoRenovacionFallido
                        ? graciaVigente
                          ? "Reintentando cobro"
                          : "Pendiente de cierre"
                        : suscripcion.estado === "authorized"
                          ? "Activada"
                          : renovacionEnRevision
                          ? "En revisión"
                          : cancelada
                            ? "Cancelada"
                            : "No disponible"
                    }
                  />
                  <Dato
                    etiqueta="Último pago"
                    valor={estadoPago(suscripcion.ultimoPagoEstado)}
                  />
                  <Dato etiqueta="Moneda" valor={suscripcion.moneda} />
                  <Dato etiqueta="Procesado por" valor="Mercado Pago" />
                </div>
              </div>

              {planProgramado &&
                suscripcion.cambioPlanEn &&
                !cancelada &&
                !pagoRenovacionFallido && (
                <div className="mt-5 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-4 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-300">
                    Cambio de plan programado
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                        Próximo plan
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {nombrePlan(planProgramado)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                        Cambio programado
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {formatearFecha(suscripcion.cambioPlanEn)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                        Precio en la renovación
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        ${formatearPrecioCop(
                          suscripcion.montoProgramado ??
                            PLANES_FEATMUSIC[planProgramado].precioCop,
                        )} COP / mes
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-yellow-50/70">
                    Tu plan actual seguirá funcionando normalmente hasta esa
                    fecha. No se realizará un cobro adicional antes de la
                    siguiente renovación.
                  </p>
                  <BotonCancelarCambioPlanMercadoPago />
                </div>
              )}

              {pagoRenovacionFallido && suscripcion.activadaEn && (
                <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-4 py-4 text-sm leading-6 text-yellow-50/85">
                  <p className="font-black text-yellow-200">
                    No pudimos procesar tu renovación
                  </p>
                  <p className="mt-1">
                    {graciaVigente
                      ? `Mantendremos tus beneficios mientras Mercado Pago reintenta el cobro, hasta el ${formatearFecha(suscripcion.graciaHasta)}. Si el pago se acredita antes de esa fecha, tu plan continuará normalmente.`
                      : "El período de gracia terminó. FeatMusic está cerrando esta renovación y aplicará el plan Gratuito automáticamente."}
                  </p>
                </div>
              )}

              {pagoRenovacionFallido && !suscripcion.activadaEn && (
                <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-4 text-sm leading-6 text-red-50/80">
                  <p className="font-black text-red-200">
                    El pago no fue aprobado
                  </p>
                  <p className="mt-1">
                    El plan Premium no llegó a activarse. Puedes volver a
                    intentarlo desde la página de planes cuando Mercado Pago
                    haya cerrado este intento.
                  </p>
                </div>
              )}

              {renovacionEnRevision && (
                <div className="mt-5 rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-4 py-4 text-sm leading-6 text-yellow-50/85">
                  <p className="font-black text-yellow-200">
                    Renovación en revisión
                  </p>
                  <p className="mt-1">
                    Detectamos una inconsistencia en los datos de la próxima
                    renovación. Tu plan {nombrePlan(planMostrado)} y
                    todos sus beneficios continúan vigentes hasta el{" "}
                    {formatearFecha(suscripcion.beneficiosHasta)}. Mientras se
                    revisa, no permitimos cambios de plan ni nuevas compras
                    duplicadas.
                  </p>
                </div>
              )}

              {cancelada && beneficiosVigentes && (
                <div className="mt-5 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 px-4 py-4 text-sm leading-6 text-yellow-50/80">
                  <p>
                    La renovación está cancelada. Tu plan seguirá funcionando
                    normalmente hasta el {formatearFecha(suscripcion.beneficiosHasta)}.
                    Después, FeatMusic aplicará automáticamente el plan Gratuito.
                  </p>
                  {suscripcion.estado === "paused" && (
                    <div className="mt-3">
                      <BotonReactivarSuscripcionMercadoPago />
                    </div>
                  )}
                </div>
              )}

              {suscripcion.estado === "authorized" && activa && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs leading-5 text-white/55">
                    Si cancelas, no perderás los beneficios de inmediato.
                    Solo se detendrá el próximo cobro y conservarás el plan
                    hasta terminar el período ya pagado.
                  </p>
                  <BotonCancelarSuscripcionMercadoPago />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="bg-[#151515] px-5 py-4 sm:px-6">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
        {etiqueta}
      </p>
      <p className="mt-1.5 text-sm font-bold text-white/85">{valor}</p>
    </div>
  );
}
