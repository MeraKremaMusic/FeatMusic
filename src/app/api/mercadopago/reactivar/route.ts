// FEATMUSIC_REACTIVAR_RENOVACION_V1
import { NextResponse } from "next/server";

import {
  convertirFechaMercadoPago,
  normalizarEstadoMercadoPago,
  obtenerSuscripcionMercadoPago,
  reactivarSuscripcionMercadoPago,
} from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import { sincronizarPlanUsuario } from "@/lib/suscripciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

export async function POST() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const ahora = new Date();
  await sincronizarPlanUsuario(sesion.usuarioId, ahora);

  const suscripcion = await prisma.suscripcionMercadoPago.findFirst({
    where: {
      usuarioId: sesion.usuarioId,
      estado: "paused",
      mercadoPagoId: { not: null },
      beneficiosHasta: { gt: ahora },
    },
    orderBy: { actualizadoEn: "desc" },
  });

  if (!suscripcion?.mercadoPagoId) {
    const activa = await prisma.suscripcionMercadoPago.findFirst({
      where: {
        usuarioId: sesion.usuarioId,
        estado: "authorized",
        mercadoPagoId: { not: null },
      },
      orderBy: { actualizadoEn: "desc" },
      select: { id: true },
    });

    if (activa) {
      return NextResponse.json({
        ok: true,
        mensaje: "Tu renovación ya está activa.",
      });
    }

    return respuestaError(
      "No encontramos una renovación pausada que todavía pueda reactivarse.",
      404,
    );
  }

  try {
    const remotaAntes = await obtenerSuscripcionMercadoPago(
      suscripcion.mercadoPagoId,
    );
    const estadoAntes = normalizarEstadoMercadoPago(remotaAntes.status);

    if (estadoAntes === "authorized") {
      const proximoCobro =
        convertirFechaMercadoPago(remotaAntes.next_payment_date) ??
        suscripcion.beneficiosHasta;

      await prisma.suscripcionMercadoPago.update({
        where: { id: suscripcion.id },
        data: {
          estado: "authorized",
          canceladaEn: null,
          proximoCobroEn: proximoCobro,
          beneficiosHasta: proximoCobro ?? suscripcion.beneficiosHasta,
        },
      });
      await sincronizarPlanUsuario(sesion.usuarioId);

      return NextResponse.json({
        ok: true,
        mensaje: "Tu renovación ya estaba activa en Mercado Pago.",
      });
    }

    if (estadoAntes !== "paused") {
      return respuestaError(
        "Esta suscripción ya no está en pausa y no puede reactivarse desde FeatMusic.",
        409,
      );
    }

    const remota = await reactivarSuscripcionMercadoPago(
      suscripcion.mercadoPagoId,
    );
    const estadoRemoto = normalizarEstadoMercadoPago(remota.status);

    if (estadoRemoto !== "authorized") {
      return respuestaError(
        "Mercado Pago recibió la solicitud, pero la renovación todavía no aparece activa.",
        502,
      );
    }

    const proximoCobroEn =
      convertirFechaMercadoPago(remota.next_payment_date) ??
      suscripcion.beneficiosHasta;

    await prisma.suscripcionMercadoPago.update({
      where: { id: suscripcion.id },
      data: {
        estado: "authorized",
        canceladaEn: null,
        proximoCobroEn,
        beneficiosHasta: proximoCobroEn ?? suscripcion.beneficiosHasta,
        planProgramado: null,
        montoProgramado: null,
        cambioPlanEn: null,
      },
    });

    await sincronizarPlanUsuario(sesion.usuarioId);

    return NextResponse.json({
      ok: true,
      mensaje: "Renovación reactivada correctamente.",
      proximoCobroEn: proximoCobroEn?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("No se pudo reactivar la renovación en Mercado Pago.", error);
    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo reactivar la renovación.",
      502,
    );
  }
}
