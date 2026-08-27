import {
  cancelarSuscripcionMercadoPago,
  normalizarEstadoMercadoPago,
} from "@/lib/mercadopago";
import { esPlanPago, type PlanFeatMusic } from "@/lib/planes";
import { prisma } from "@/lib/prisma";

export const ESTADOS_CANCELADOS_MERCADOPAGO = [
  "canceled",
  "cancelled",
  // FeatMusic usa "paused" como renovación detenida cuando Mercado Pago
  // no permite la transición directa a canceled.
  "paused",
] as const;

const ESTADOS_CANCELADOS = [...ESTADOS_CANCELADOS_MERCADOPAGO];
const ESTADOS_CANCELADOS_SET = new Set<string>(ESTADOS_CANCELADOS);

// FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
export const ESTADOS_PAGO_FALLIDO_MERCADOPAGO = [
  "rejected",
  "cancelled",
  "canceled",
] as const;

const ESTADOS_PAGO_FALLIDO_SET = new Set<string>(
  ESTADOS_PAGO_FALLIDO_MERCADOPAGO,
);

export function esEstadoPagoFallidoMercadoPago(
  estado: string | null | undefined,
) {
  return Boolean(estado && ESTADOS_PAGO_FALLIDO_SET.has(estado.toLowerCase()));
}

// FEATMUSIC_EXPIRACION_AUTOMATICA_PLANES_V1
// Estados que pueden dejar de otorgar Premium automáticamente.
// "authorized" NO se incluye aquí: una suscripción autorizada sigue activa
// hasta que Mercado Pago/webhook indique lo contrario.
const ESTADOS_REVISAR_EXPIRACION = [
  ...ESTADOS_CANCELADOS,
  "error_datos",
] as const;

const ESTADOS_TERMINALES = ["inactive", "expired"] as const;

export async function sincronizarPlanUsuario(
  usuarioId: number,
  ahora = new Date(),
) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      plan: true,
      suscripcionesMercadoPago: {
        where: {
          plan: { in: ["CREATOR", "PRO"] },
          OR: [
            {
              // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
              // Una preaprobación "authorized" por sí sola NO demuestra que
              // el primer cobro haya sido acreditado. Premium comienza cuando
              // existe activadaEn, que se establece al recibir un pago aprobado.
              estado: "authorized",
              activadaEn: { not: null },
            },
            {
              estado: { in: ESTADOS_CANCELADOS },
              beneficiosHasta: { gt: ahora },
            },
            // FEATMUSIC_PROTEGER_BENEFICIOS_ERROR_DATOS_V1
            // Si una suscripción YA PAGADA queda marcada para revisión por
            // una diferencia inesperada de monto/moneda, respetamos el
            // período que el usuario ya pagó. Una compra nueva sin activación
            // previa NO entra por esta condición.
            {
              estado: "error_datos",
              activadaEn: { not: null },
              beneficiosHasta: { gt: ahora },
            },
          ],
        },
        orderBy: { actualizadoEn: "desc" },
        take: 1,
        select: {
          id: true,
          mercadoPagoId: true,
          plan: true,
          estado: true,
          monto: true,
          moneda: true,
          activadaEn: true,
          canceladaEn: true,
          beneficiosHasta: true,
          proximoCobroEn: true,
          planProgramado: true,
          montoProgramado: true,
          cambioPlanEn: true,
          ultimoPagoEstado: true,
          pagoFallidoEn: true,
          graciaHasta: true,
          actualizadoEn: true,
        },
      },
    },
  });

  if (!usuario) {
    return null;
  }

  const suscripcion = usuario.suscripcionesMercadoPago[0] ?? null;
  const plan: PlanFeatMusic =
    suscripcion && esPlanPago(suscripcion.plan)
      ? suscripcion.plan
      : "GRATUITO";

  if (usuario.plan !== plan) {
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { plan },
    });
  }

  return {
    plan,
    suscripcion,
  };
}

// FEATMUSIC_EXPIRACION_AUTOMATICA_PLANES_V1
// Revisa en lotes usuarios que todavía figuran como Creator/Pro pero cuyo
// período pagado ya terminó. sincronizarPlanUsuario() decide el resultado final,
// por lo que si el usuario tiene otra suscripción válida no será degradado.
export async function expirarPlanesVencidos(
  ahora = new Date(),
  limite = 500,
) {
  // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
  //
  // Además de los planes cancelados/vencidos, este cron cierra una renovación
  // cuyo cobro falló una vez terminados los 3 días de gracia. Primero pausa la
  // preaprobación en Mercado Pago y SOLO después permite bajar a Gratuito.
  const candidatas = await prisma.suscripcionMercadoPago.findMany({
    where: {
      OR: [
        {
          plan: { in: ["CREATOR", "PRO"] },
          usuario: {
            plan: { in: ["CREATOR", "PRO"] },
          },
          OR: [
            {
              estado: { in: [...ESTADOS_REVISAR_EXPIRACION] },
              OR: [
                { beneficiosHasta: null },
                { beneficiosHasta: { lte: ahora } },
              ],
            },
            {
              estado: { in: [...ESTADOS_TERMINALES] },
            },
          ],
        },
        {
          plan: { in: ["CREATOR", "PRO"] },
          estado: "authorized",
          ultimoPagoEstado: {
            in: [...ESTADOS_PAGO_FALLIDO_MERCADOPAGO],
          },
          OR: [
            { graciaHasta: null },
            { graciaHasta: { lte: ahora } },
          ],
        },
      ],
    },
    distinct: ["usuarioId"],
    orderBy: { actualizadoEn: "asc" },
    take: Math.max(1, Math.min(limite, 1000)),
    select: {
      id: true,
      usuarioId: true,
      estado: true,
      mercadoPagoId: true,
      ultimoPagoEstado: true,
      graciaHasta: true,
      beneficiosHasta: true,
    },
  });

  let degradados = 0;
  let conservados = 0;
  let pausadasPorPago = 0;
  let errores = 0;

  for (const candidata of candidatas) {
    try {
      const pagoFallidoAutorizado =
        candidata.estado === "authorized" &&
        esEstadoPagoFallidoMercadoPago(candidata.ultimoPagoEstado) &&
        (!candidata.graciaHasta ||
          candidata.graciaHasta.getTime() <= ahora.getTime());

      if (pagoFallidoAutorizado) {
        const beneficiosHasta = candidata.graciaHasta ?? ahora;
        let estadoRemoto = "paused";

        if (candidata.mercadoPagoId) {
          const remota = await cancelarSuscripcionMercadoPago(
            candidata.mercadoPagoId,
          );
          estadoRemoto = normalizarEstadoMercadoPago(remota.status);

          if (!ESTADOS_CANCELADOS_SET.has(estadoRemoto)) {
            throw new Error(
              `Mercado Pago no confirmó la pausa de ${candidata.mercadoPagoId}.`,
            );
          }
        }

        await prisma.suscripcionMercadoPago.update({
          where: { id: candidata.id },
          data: {
            estado: estadoRemoto,
            canceladaEn: ahora,
            beneficiosHasta,
            proximoCobroEn: null,
            planProgramado: null,
            montoProgramado: null,
            cambioPlanEn: null,
          },
        });

        pausadasPorPago += 1;
      }

      const resultado = await sincronizarPlanUsuario(
        candidata.usuarioId,
        ahora,
      );

      if (resultado?.plan === "GRATUITO") {
        degradados += 1;
      } else {
        conservados += 1;
      }
    } catch (error) {
      errores += 1;
      console.error(
        `No se pudo sincronizar la expiración del usuario ${candidata.usuarioId}.`,
        error,
      );
    }
  }

  return {
    revisados: candidatas.length,
    degradados,
    conservados,
    pausadasPorPago,
    errores,
  };
}

export function renovacionEstaCancelada(estado: string | null | undefined) {
  return Boolean(estado && ESTADOS_CANCELADOS_SET.has(estado));
}

export function beneficiosSiguenVigentes(
  beneficiosHasta: Date | null | undefined,
  ahora = new Date(),
) {
  return Boolean(beneficiosHasta && beneficiosHasta.getTime() > ahora.getTime());
}
