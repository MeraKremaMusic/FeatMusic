import { NextResponse } from "next/server";
import { z } from "zod";

import { actualizarPlanSuscripcionMercadoPago } from "@/lib/mercadopago";
import {
  esPlanPago,
  obtenerDatosPagoPlan,
  type PlanPagoFeatMusic,
} from "@/lib/planes";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import {
  esEstadoPagoFallidoMercadoPago,
  renovacionEstaCancelada,
  sincronizarPlanUsuario,
} from "@/lib/suscripciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  plan: z.enum(["CREATOR", "PRO"]),
});

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function nombrePlan(plan: PlanPagoFeatMusic) {
  return plan === "PRO" ? "Pro" : "Creator";
}

function fechaCambioValida(
  proximoCobroEn: Date | null | undefined,
  beneficiosHasta: Date | null | undefined,
) {
  const ahora = new Date();
  const candidatas = [proximoCobroEn, beneficiosHasta].filter(
    (fecha): fecha is Date => Boolean(fecha && fecha.getTime() > ahora.getTime()),
  );

  return candidatas.sort((a, b) => a.getTime() - b.getTime())[0] ?? null;
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return respuestaError("La solicitud no es válida.", 400);
  }

  const resultado = schema.safeParse(body);
  if (!resultado.success) {
    return respuestaError("Selecciona un plan válido.", 400);
  }

  const estadoActual = await sincronizarPlanUsuario(sesion.usuarioId);
  const suscripcion = estadoActual?.suscripcion;
  const planActual = estadoActual?.plan;
  const planDestino = resultado.data.plan;

  if (!suscripcion || !esPlanPago(planActual)) {
    return respuestaError(
      "Necesitas una suscripción Creator o Pro activa para programar un cambio.",
      409,
    );
  }

  if (renovacionEstaCancelada(suscripcion.estado)) {
    return respuestaError(
      "Tu renovación está cancelada. Cuando termine el período pagado podrás elegir un nuevo plan.",
      409,
    );
  }

  // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
  if (esEstadoPagoFallidoMercadoPago(suscripcion.ultimoPagoEstado)) {
    return respuestaError(
      "No puedes cambiar de plan mientras Mercado Pago está reintentando el cobro de tu renovación.",
      409,
    );
  }

  if (suscripcion.estado !== "authorized" || !suscripcion.mercadoPagoId) {
    return respuestaError(
      "Tu suscripción todavía no permite programar cambios de plan.",
      409,
    );
  }

  if (planActual === planDestino) {
    return respuestaError(`Ya tienes activo el plan ${nombrePlan(planDestino)}.`, 409);
  }

  const cambioPlanEn = fechaCambioValida(
    suscripcion.proximoCobroEn,
    suscripcion.beneficiosHasta,
  );

  if (!cambioPlanEn) {
    return respuestaError(
      "No encontramos la fecha de tu próxima renovación. Intenta nuevamente más tarde.",
      409,
    );
  }

  const datosDestino = obtenerDatosPagoPlan(planDestino);

  await prisma.suscripcionMercadoPago.update({
    where: { id: suscripcion.id },
    data: {
      planProgramado: planDestino,
      montoProgramado: datosDestino.montoCop,
      cambioPlanEn,
    },
  });

  try {
    // Guardamos primero la intención local para que un webhook disparado por
    // Mercado Pago al modificar el monto ya encuentre el monto esperado.
    await actualizarPlanSuscripcionMercadoPago(
      suscripcion.mercadoPagoId,
      planDestino,
      datosDestino.montoCop,
      false,
    );

    return NextResponse.json({
      ok: true,
      mensaje: `El cambio a ${nombrePlan(planDestino)} quedó programado para tu próxima renovación.`,
      planProgramado: planDestino,
      cambioPlanEn: cambioPlanEn.toISOString(),
    });
  } catch (error) {
    await prisma.suscripcionMercadoPago
      .update({
        where: { id: suscripcion.id },
        data: {
          planProgramado: null,
          montoProgramado: null,
          cambioPlanEn: null,
        },
      })
      .catch(() => undefined);

    console.error("No se pudo programar el cambio de plan.", error);
    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo programar el cambio de plan.",
      502,
    );
  }
}

export async function DELETE() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const estadoActual = await sincronizarPlanUsuario(sesion.usuarioId);
  const suscripcion = estadoActual?.suscripcion;
  const planActual = estadoActual?.plan;

  if (
    suscripcion &&
    esEstadoPagoFallidoMercadoPago(suscripcion.ultimoPagoEstado)
  ) {
    return respuestaError(
      "No puedes modificar un cambio de plan mientras Mercado Pago está reintentando el cobro de tu renovación.",
      409,
    );
  }

  if (
    !suscripcion ||
    !esPlanPago(planActual) ||
    !esPlanPago(suscripcion.planProgramado) ||
    !suscripcion.mercadoPagoId
  ) {
    return respuestaError("No tienes un cambio de plan programado.", 404);
  }

  const cambioAnterior = {
    planProgramado: suscripcion.planProgramado,
    montoProgramado: suscripcion.montoProgramado,
    cambioPlanEn: suscripcion.cambioPlanEn,
  };

  await prisma.suscripcionMercadoPago.update({
    where: { id: suscripcion.id },
    data: {
      planProgramado: null,
      montoProgramado: null,
      cambioPlanEn: null,
    },
  });

  try {
    // Limpiamos primero el cambio local para que cualquier webhook de la
    // restauración vuelva a validar contra el monto del plan actual.
    await actualizarPlanSuscripcionMercadoPago(
      suscripcion.mercadoPagoId,
      planActual,
      suscripcion.monto,
      false,
    );

    return NextResponse.json({
      ok: true,
      mensaje: `El cambio fue cancelado. Continuarás con ${nombrePlan(planActual)}.`,
    });
  } catch (error) {
    await prisma.suscripcionMercadoPago
      .update({
        where: { id: suscripcion.id },
        data: cambioAnterior,
      })
      .catch(() => undefined);

    console.error("No se pudo cancelar el cambio de plan.", error);
    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo cancelar el cambio de plan.",
      502,
    );
  }
}
