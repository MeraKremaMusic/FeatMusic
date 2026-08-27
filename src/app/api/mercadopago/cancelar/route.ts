import { NextResponse } from "next/server";

import {
  actualizarPlanSuscripcionMercadoPago,
  cancelarSuscripcionMercadoPago,
  convertirFechaMercadoPago,
  obtenerSuscripcionMercadoPago,
} from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import {
  esEstadoPagoFallidoMercadoPago,
  ESTADOS_CANCELADOS_MERCADOPAGO,
  sincronizarPlanUsuario,
} from "@/lib/suscripciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function sumarUnMes(fecha: Date) {
  const copia = new Date(fecha);
  copia.setMonth(copia.getMonth() + 1);
  return copia;
}

function primeraFechaFutura(
  fechas: Array<Date | null | undefined>,
  ahora: Date,
) {
  return (
    fechas.find(
      (fecha): fecha is Date =>
        Boolean(fecha && fecha.getTime() > ahora.getTime()),
    ) ?? ahora
  );
}

export async function POST() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const ahora = new Date();
  await sincronizarPlanUsuario(sesion.usuarioId, ahora);

  const activas = await prisma.suscripcionMercadoPago.findMany({
    where: {
      usuarioId: sesion.usuarioId,
      estado: "authorized",
      mercadoPagoId: { not: null },
    },
    orderBy: { actualizadoEn: "desc" },
    select: {
      id: true,
      mercadoPagoId: true,
      plan: true,
      monto: true,
      planProgramado: true,
      montoProgramado: true,
      cambioPlanEn: true,
      proximoCobroEn: true,
      beneficiosHasta: true,
      graciaHasta: true,
      ultimoPagoEstado: true,
      activadaEn: true,
      creadoEn: true,
    },
  });

  if (activas.length === 0) {
    const yaCancelada = await prisma.suscripcionMercadoPago.findFirst({
      where: {
        usuarioId: sesion.usuarioId,
        estado: { in: [...ESTADOS_CANCELADOS_MERCADOPAGO] },
        beneficiosHasta: { gt: ahora },
      },
      orderBy: { actualizadoEn: "desc" },
      select: { beneficiosHasta: true },
    });

    if (yaCancelada?.beneficiosHasta) {
      return NextResponse.json({
        ok: true,
        mensaje:
          "La renovación ya estaba cancelada. Mantendrás tus beneficios hasta terminar el período pagado.",
        beneficiosHasta: yaCancelada.beneficiosHasta.toISOString(),
      });
    }

    return respuestaError("No tienes una suscripción activa de Mercado Pago.", 404);
  }

  const fallidas: string[] = [];
  const fechasBeneficios: Date[] = [];

  for (const suscripcion of activas) {
    if (!suscripcion.mercadoPagoId) continue;

    try {
      const remota = await obtenerSuscripcionMercadoPago(
        suscripcion.mercadoPagoId,
      );
      const siguienteCobroRemoto = convertirFechaMercadoPago(
        remota.next_payment_date,
      );

      // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
      // Si el último cobro fue rechazado, cancelar la renovación NO debe
      // convertir la fecha de un reintento de Mercado Pago en días Premium.
      // Se respeta únicamente la gracia ya concedida.
      const pagoFallido = esEstadoPagoFallidoMercadoPago(
        suscripcion.ultimoPagoEstado,
      );
      const beneficiosHasta = pagoFallido
        ? suscripcion.graciaHasta &&
          suscripcion.graciaHasta.getTime() > ahora.getTime()
          ? suscripcion.graciaHasta
          : ahora
        : primeraFechaFutura(
            [
              siguienteCobroRemoto,
              suscripcion.beneficiosHasta,
              suscripcion.proximoCobroEn,
              suscripcion.activadaEn
                ? sumarUnMes(suscripcion.activadaEn)
                : null,
              sumarUnMes(suscripcion.creadoEn),
            ],
            ahora,
          );

      // FEATMUSIC_CANCELAR_RESTAURA_MONTO_V1
      //
      // Si el usuario tenía un cambio Creator <-> Pro programado, Mercado Pago
      // ya tenía guardado el monto del PLAN DESTINO para la próxima renovación.
      // Antes de pausar la renovación restauramos el monto del PLAN ACTUAL.
      //
      // Ejemplo:
      //   Pro 19.990 -> programa Creator 9.900 -> cancela renovación
      // Resultado correcto:
      //   Mercado Pago vuelve a 19.990 y luego queda paused.
      const planActual =
        suscripcion.plan === "CREATOR" || suscripcion.plan === "PRO"
          ? suscripcion.plan
          : null;

      const planProgramadoAnterior =
        suscripcion.planProgramado === "CREATOR" ||
        suscripcion.planProgramado === "PRO"
          ? suscripcion.planProgramado
          : null;

      const teniaCambioProgramado =
        Boolean(planActual) &&
        Boolean(planProgramadoAnterior) &&
        suscripcion.montoProgramado !== null;

      if (teniaCambioProgramado && planActual) {
        // Primero borramos la intención local. Así, si Mercado Pago envía un
        // webhook inmediatamente al restaurar el monto, FeatMusic validará
        // contra el monto del plan actual y no contra el monto programado.
        await prisma.suscripcionMercadoPago.update({
          where: { id: suscripcion.id },
          data: {
            planProgramado: null,
            montoProgramado: null,
            cambioPlanEn: null,
          },
        });

        try {
          await actualizarPlanSuscripcionMercadoPago(
            suscripcion.mercadoPagoId,
            planActual,
            suscripcion.monto,
            false,
          );
        } catch (errorRestaurandoMonto) {
          // Si no logramos restaurar Mercado Pago, devolvemos el estado local
          // anterior y NO pausamos. Así evitamos dejar una suscripción en una
          // combinación incoherente.
          await prisma.suscripcionMercadoPago
            .update({
              where: { id: suscripcion.id },
              data: {
                planProgramado: planProgramadoAnterior,
                montoProgramado: suscripcion.montoProgramado,
                cambioPlanEn: suscripcion.cambioPlanEn,
              },
            })
            .catch(() => undefined);

          throw errorRestaurandoMonto;
        }
      }

      const remotaCancelada = await cancelarSuscripcionMercadoPago(
        suscripcion.mercadoPagoId,
      );

      const estadoRemoto =
        remotaCancelada.status?.trim().toLowerCase() || "paused";

      await prisma.suscripcionMercadoPago.update({
        where: { id: suscripcion.id },
        data: {
          // "paused" en Mercado Pago significa que no habrá nuevos cobros.
          // Para FeatMusic equivale a renovación cancelada mientras se
          // conservan los beneficios ya pagados hasta beneficiosHasta.
          estado: estadoRemoto,
          canceladaEn: ahora,
          beneficiosHasta,
          proximoCobroEn: null,
          planProgramado: null,
          montoProgramado: null,
          cambioPlanEn: null,
        },
      });

      fechasBeneficios.push(beneficiosHasta);
    } catch (error) {
      console.error(
        `No se pudo cancelar ${suscripcion.mercadoPagoId} en Mercado Pago.`,
        error,
      );
      fallidas.push(suscripcion.mercadoPagoId);
    }
  }

  if (fallidas.length > 0) {
    return respuestaError(
      "No pudimos cancelar completamente la renovación. Intenta nuevamente antes de cerrar la página.",
      502,
    );
  }

  const estadoActual = await sincronizarPlanUsuario(sesion.usuarioId, ahora);
  const beneficiosHasta =
    fechasBeneficios.sort((a, b) => b.getTime() - a.getTime())[0] ??
    estadoActual?.suscripcion?.beneficiosHasta ??
    null;

  return NextResponse.json({
    ok: true,
    mensaje:
      "Renovación cancelada. Tu plan seguirá activo hasta terminar el período que ya pagaste.",
    beneficiosHasta: beneficiosHasta?.toISOString() ?? null,
  });
}
