import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  crearSuscripcionPendienteMercadoPago,
  ErrorMercadoPago,
  obtenerCorreoPagadorMercadoPago,
} from "@/lib/mercadopago";
import { esPlanPago, obtenerDatosPagoPlan } from "@/lib/planes";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import {
  ESTADOS_PAGO_FALLIDO_MERCADOPAGO,
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

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return respuestaError("La solicitud de compra no es válida.", 400);
  }

  const resultado = schema.safeParse(body);

  if (!resultado.success) {
    return respuestaError("Selecciona un plan válido.", 400);
  }

  const estadoActual = await sincronizarPlanUsuario(sesion.usuarioId);

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
    select: {
      id: true,
      correo: true,
      plan: true,
    },
  });

  if (!usuario) {
    return respuestaError("No se encontró tu cuenta.", 404);
  }

  // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
  // Evita crear una segunda suscripción mientras Mercado Pago todavía tiene
  // una preaprobación autorizada con un cobro rechazado/reintentándose.
  const cobroPendiente = await prisma.suscripcionMercadoPago.findFirst({
    where: {
      usuarioId: usuario.id,
      estado: "authorized",
      mercadoPagoId: { not: null },
      ultimoPagoEstado: {
        in: [...ESTADOS_PAGO_FALLIDO_MERCADOPAGO],
      },
    },
    select: { id: true },
  });

  if (cobroPendiente) {
    return respuestaError(
      "Mercado Pago todavía está procesando un cobro pendiente de una suscripción anterior. Revisa Mi suscripción antes de iniciar otra compra.",
      409,
    );
  }

  const plan = resultado.data.plan;
  const datosPlan = obtenerDatosPagoPlan(plan);

  if (estadoActual?.plan === plan && estadoActual.suscripcion) {
    return respuestaError(
      estadoActual.suscripcion.estado === "authorized"
        ? `Ya tienes activo el plan ${plan === "PRO" ? "Pro" : "Creator"}.`
        : `Tu plan ${plan === "PRO" ? "Pro" : "Creator"} sigue activo hasta terminar el período que ya pagaste.`,
      409,
    );
  }

  if (
    estadoActual?.suscripcion &&
    esPlanPago(estadoActual.plan) &&
    estadoActual.plan !== plan
  ) {
    return respuestaError(
      `Actualmente tienes ${estadoActual.plan === "PRO" ? "Pro" : "Creator"}. Los cambios entre Creator y Pro se programan para la siguiente renovación desde la página de planes.`,
      409,
    );
  }

  const pendienteReciente = await prisma.suscripcionMercadoPago.findFirst({
    where: {
      usuarioId: usuario.id,
      plan,
      estado: "pending",
      monto: datosPlan.montoCop,
      moneda: "COP",
      checkoutUrl: { not: null },
      actualizadoEn: {
        gt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    },
    orderBy: { actualizadoEn: "desc" },
    select: {
      checkoutUrl: true,
    },
  });

  if (pendienteReciente?.checkoutUrl) {
    return NextResponse.json({
      ok: true,
      url: pendienteReciente.checkoutUrl,
      reutilizada: true,
    });
  }

  const correoMercadoPago = obtenerCorreoPagadorMercadoPago(usuario.correo);
  const referencia = `featmusic-${usuario.id}-${plan.toLowerCase()}-${randomUUID()}`;

  const registro = await prisma.suscripcionMercadoPago.create({
    data: {
      usuarioId: usuario.id,
      referencia,
      plan,
      estado: "pending",
      monto: datosPlan.montoCop,
      moneda: "COP",
      payerEmail: correoMercadoPago,
    },
    select: { id: true },
  });

  try {
    const suscripcion = await crearSuscripcionPendienteMercadoPago({
      plan,
      referencia,
      correo: correoMercadoPago,
    });

    if (!suscripcion.id || !suscripcion.init_point) {
      throw new Error("Mercado Pago no devolvió el checkout de la suscripción.");
    }

    await prisma.suscripcionMercadoPago.update({
      where: { id: registro.id },
      data: {
        mercadoPagoId: suscripcion.id,
        checkoutUrl: suscripcion.init_point,
        estado: suscripcion.status?.toLowerCase() || "pending",
      },
    });

    return NextResponse.json({
      ok: true,
      url: suscripcion.init_point,
    });
  } catch (error) {
    await prisma.suscripcionMercadoPago
      .update({
        where: { id: registro.id },
        data: { estado: "error" },
      })
      .catch(() => undefined);

    console.error("No se pudo crear la suscripción de Mercado Pago.", error);

    if (error instanceof ErrorMercadoPago) {
      return respuestaError(
        error.message,
        error.status >= 400 && error.status < 500 ? 400 : 502,
      );
    }

    return respuestaError(
      "No se pudo iniciar el pago en Mercado Pago. Intenta nuevamente.",
      502,
    );
  }
}
