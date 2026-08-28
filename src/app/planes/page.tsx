// FEATMUSIC_REACTIVAR_RENOVACION_V1
import type { Metadata } from "next";
import Link from "next/link";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import { crearMetadataPagina } from "@/lib/seo";
import {
  BotonCambiarPlanMercadoPago,
  BotonCancelarSuscripcionMercadoPago,
  BotonComprarPlanMercadoPago,
  BotonReactivarSuscripcionMercadoPago,
  EstadoRetornoMercadoPago,
} from "@/app/planes/components/AccionesMercadoPago";
import {
  esPlanPago,
  formatearPrecioCop,
  PLANES_FEATMUSIC,
  type PlanPagoFeatMusic,
} from "@/lib/planes";
import { obtenerSesion } from "@/lib/session";
import {
  renovacionEstaCancelada,
  sincronizarPlanUsuario,
} from "@/lib/suscripciones";

// FEATMUSIC_PAGINA_PLANES_PREMIUM_COMPLETA_V2
// FEATMUSIC_MERCADOPAGO_SUSCRIPCIONES_V1

// FEATMUSIC_SEO_TECNICO_V1
export const metadata = crearMetadataPagina({
  title: "Planes para artistas: Gratuito, Creator y Pro | FeatMusic",
  description: "Compara los planes Gratuito, Creator y Pro de FeatMusic para publicar más ideas, recibir más propuestas y ampliar tus posibilidades de colaboración musical.",
  path: "/planes",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Plan = {
  id: "gratuito" | "creator" | "pro";
  codigo: "GRATUITO" | PlanPagoFeatMusic;
  nombre: string;
  precio: string;
  precioUsdAprox?: string;
  espacios: string;
  descripcion: string;
  beneficios: string[];
  destacado?: boolean;
};

const planes: Plan[] = [
  {
    id: "gratuito",
    codigo: "GRATUITO",
    nombre: "Plan gratuito",
    precio: formatearPrecioCop(PLANES_FEATMUSIC.GRATUITO.precioCop),
    espacios: "3 espacios",
    descripcion:
      "Mantén hasta 3 ideas activas y recibe un máximo de 3 propuestas en cada una.",
    beneficios: [
      "Hasta 3 ideas activas",
      "3 propuestas por cada idea",
    ],
  },
  {
    id: "creator",
    codigo: "CREATOR",
    nombre: "Plan Creator",
    precio: formatearPrecioCop(PLANES_FEATMUSIC.CREATOR.precioCop),
    precioUsdAprox: "US$3,20",
    espacios: "10 espacios",
    descripcion:
      "Publica hasta 10 ideas y recibe un máximo de 10 propuestas diferentes en cada una.",
    beneficios: [
      "Hasta 10 ideas activas",
      "Hasta 10 propuestas por idea",
      "Insignia Creator plateada",
    ],
    destacado: true,
  },
  {
    id: "pro",
    codigo: "PRO",
    nombre: "Plan Pro",
    precio: formatearPrecioCop(PLANES_FEATMUSIC.PRO.precioCop),
    precioUsdAprox: "US$6,40",
    espacios: "20 espacios",
    descripcion:
      "Publica hasta 20 ideas activas y recibe un máximo de 20 propuestas diferentes en cada una.",
    beneficios: [
      "Hasta 20 ideas activas",
      "Hasta 20 propuestas por idea",
      "Envía propuestas incluso con cupos completos",
      "Insignia Pro dorada",
      "Perfil destacado como artista",
    ],
  },
];

function IconoPlan({ tipo }: { tipo: Plan["id"] }) {
  if (tipo === "gratuito") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="9" width="18" height="12" rx="2" />
        <path d="M12 9v12M3 13h18M7.5 9C5 9 4 7.8 4 6.5S5 4 6.5 4C9 4 12 9 12 9s3-5 5.5-5C19 4 20 5.1 20 6.5S19 9 16.5 9" />
      </svg>
    );
  }

  if (tipo === "creator") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Z" />
        <path d="M5 21h14" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 2.1 6.1L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-1.9L12 2Z" />
      <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default async function PlanesPage() {
  const sesion = await obtenerSesion();
  const estadoPlan = sesion
    ? await sincronizarPlanUsuario(sesion.usuarioId)
    : null;
  const planActual = estadoPlan?.plan ?? "GRATUITO";
  const suscripcionActiva = estadoPlan?.suscripcion ?? null;
  const tieneSuscripcionActiva = Boolean(suscripcionActiva);
  const renovacionCancelada = renovacionEstaCancelada(
    suscripcionActiva?.estado,
  );
  // FEATMUSIC_REVISION_RENOVACION_SEGURA_V1
  const renovacionEnRevision = suscripcionActiva?.estado === "error_datos";
  const planProgramado = esPlanPago(suscripcionActiva?.planProgramado)
    ? suscripcionActiva.planProgramado
    : null;
  const cambioPlanEn = suscripcionActiva?.cambioPlanEn?.toISOString() ?? null;

  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#111111] text-white">
      <EncabezadoSecundario />

      <section className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden border-b border-yellow-200/10 bg-[#111111]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_12%,rgba(246,203,30,0.22),transparent_30%),radial-gradient(circle_at_88%_82%,rgba(237,191,5,0.16),transparent_32%),linear-gradient(145deg,#141414,#100c08_55%,#191919)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(30deg,rgba(253,225,115,0.15)_12%,transparent_12.5%,transparent_87%,rgba(253,225,115,0.15)_87.5%)] [background-size:72px_42px]"
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          <header className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-yellow-300/25 bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
              Planes FeatMusic
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Elige el espacio que necesita tu música.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-yellow-50/65 sm:text-base">
              Publica tus ideas, recibe propuestas y amplía tu capacidad a
              medida que crece tu catálogo musical.
            </p>
          </header>

          <div className="mt-7">
            <EstadoRetornoMercadoPago />
          </div>

          <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-yellow-300/20 bg-yellow-300/[0.07] px-4 py-3 text-center text-[11px] leading-5 text-yellow-50/70">
            Antes de comprar: los planes se pagan por períodos mensuales. No
            puedes cambiar Creator ↔ Pro de forma inmediata mientras tienes un
            período pagado activo. Si solicitas un cambio, se programará para
            tu siguiente renovación y conservarás el plan actual hasta ese día.
          </div>
          <p className="mx-auto mt-3 max-w-3xl text-center text-[10px] leading-4 text-yellow-50/45">
            Los pagos se procesan en pesos colombianos (COP). La equivalencia
            en USD es aproximada.
          </p>

          <div className="mt-9 grid gap-5 md:grid-cols-3 lg:mt-12">
            {planes.map((plan) => {
              const esPlanActual = planActual === plan.codigo;
              const esPlanProgramado = planProgramado === plan.codigo;

              return (
                <article
                  key={plan.id}
                  className={`group relative flex min-h-[510px] flex-col overflow-hidden rounded-3xl border p-6 backdrop-blur-sm transition duration-500 hover:-translate-y-2 sm:p-7 ${
                    plan.id === "gratuito"
                      ? "border-yellow-200/20 bg-[linear-gradient(145deg,rgba(25,25,25,0.94),rgba(8,8,8,0.9))] hover:border-yellow-300/45"
                      : plan.id === "creator"
                        ? "border-yellow-300/50 bg-[linear-gradient(145deg,rgba(34,34,34,0.98),rgba(11,11,11,0.94))] shadow-[0_24px_75px_rgba(245,158,11,0.18)] hover:border-yellow-200/75"
                        : "border-yellow-200/25 bg-[linear-gradient(145deg,rgba(15,15,15,0.96),rgba(20,20,20,0.92))] hover:border-yellow-300/50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-yellow-400/18 blur-3xl transition duration-500 group-hover:scale-125"
                  />

                  {plan.destacado && (
                    <span className="absolute right-5 top-5 rounded-full border border-yellow-200/30 bg-yellow-300/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-yellow-200">
                      Más popular
                    </span>
                  )}

                  <div className="relative flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-yellow-300/25 bg-yellow-400/10 text-yellow-300">
                      <IconoPlan tipo={plan.id} />
                    </span>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                        {plan.nombre}
                      </p>
                    </div>
                  </div>

                  <div className="relative mt-7 flex items-end gap-2">
                    <span className="pb-2 text-xl font-black text-white/70">$</span>
                    <span className="text-5xl font-black tracking-[-0.05em] text-white sm:text-6xl">
                      {plan.precio}
                    </span>
                    <span className="pb-2 text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-white/50">
                      COP
                      <br />
                      al mes
                    </span>
                  </div>

                  {plan.precioUsdAprox && (
                    <p className="relative mt-2 text-[11px] font-semibold text-yellow-100/55">
                      ≈ {plan.precioUsdAprox}
                    </p>
                  )}

                  <div className="relative mt-6 border-t border-white/10 pt-5">
                    <ul className="space-y-3">
                      {plan.beneficios.map((beneficio) => (
                        <li
                          key={beneficio}
                          className="flex items-start gap-3 text-sm font-semibold text-white/85"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400/15 text-yellow-300">
                            <IconoCheck />
                          </span>
                          <span>{beneficio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.codigo === "GRATUITO" ? (
                    <div className="relative mt-auto pt-6">
                      <div
                        className={`flex h-11 w-full items-center justify-center rounded-xl px-4 text-xs font-black ${
                          esPlanActual
                            ? "bg-yellow-400 text-black"
                            : "bg-white/10 text-white/50"
                        }`}
                      >
                        {esPlanActual ? "Plan actual" : "Incluido"}
                      </div>
                    </div>
                  ) : !esPlanActual &&
                    tieneSuscripcionActiva &&
                    esPlanPago(planActual) ? (
                    renovacionEnRevision ? (
                      <div className="relative mt-auto pt-6">
                        <div className="flex min-h-11 w-full items-center justify-center rounded-xl border border-yellow-300/25 bg-yellow-300/10 px-4 py-3 text-center text-[11px] font-black leading-5 text-yellow-100">
                          Cambio temporalmente no disponible mientras revisamos
                          la renovación de tu plan actual.
                        </div>
                      </div>
                    ) : (
                      <BotonCambiarPlanMercadoPago
                        planDestino={plan.codigo}
                        planActual={planActual}
                        fechaCambio={cambioPlanEn}
                        cambioProgramado={esPlanProgramado}
                        renovacionCancelada={renovacionCancelada}
                      />
                    )
                  ) : (
                    <BotonComprarPlanMercadoPago
                      plan={plan.codigo}
                      sesionActiva={Boolean(sesion)}
                      esPlanActual={esPlanActual && tieneSuscripcionActiva}
                    />
                  )}

                  {esPlanActual &&
                    plan.codigo !== "GRATUITO" &&
                    tieneSuscripcionActiva && (
                      <div className="relative mt-2 text-center">
                        {renovacionEnRevision ? (
                          <div className="flex flex-col items-center">
                            <p className="text-[10px] font-bold leading-5 text-yellow-200/80">
                              Renovación en revisión · tus beneficios siguen
                              vigentes hasta terminar el período ya pagado.
                            </p>
                          </div>
                        ) : renovacionCancelada ? (
                          <div className="flex flex-col items-center">
                            <p className="text-[10px] font-bold text-yellow-200/70">
                              Renovación cancelada · beneficios vigentes hasta el
                              final del período pagado.
                            </p>
                            {suscripcionActiva?.estado === "paused" && (
                              <BotonReactivarSuscripcionMercadoPago />
                            )}
                          </div>
                        ) : (
                          <BotonCancelarSuscripcionMercadoPago />
                        )}
                        <Link
                          href="/suscripcion"
                          className="mt-1 inline-flex text-[10px] font-black text-white/55 transition hover:text-yellow-200"
                        >
                          Ver mi suscripción
                        </Link>
                      </div>
                    )}

                  <span
                    aria-hidden="true"
                    className="absolute inset-x-7 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/65 to-transparent opacity-50 transition duration-500 group-hover:opacity-100"
                  />
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-center text-[10px] leading-5 text-yellow-50/45">
            Creator y Pro se cobran mensualmente en pesos colombianos. El pago
            y la renovación se procesan de forma segura mediante Mercado Pago.
          </p>
        </div>
      </section>
    </main>
  );
}
