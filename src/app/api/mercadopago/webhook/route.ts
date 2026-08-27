import { after, NextResponse } from "next/server";

import {
  actualizarPlanSuscripcionMercadoPago,
  cancelarSuscripcionMercadoPago,
  convertirFechaMercadoPago,
  convertirMontoMercadoPago,
  normalizarEstadoMercadoPago,
  obtenerPagoAutorizadoMercadoPago,
  obtenerSuscripcionMercadoPago,
  validarFirmaWebhookMercadoPago,
} from "@/lib/mercadopago";
import { esPlanPago, obtenerDatosPagoPlan } from "@/lib/planes";
import { prisma } from "@/lib/prisma";
import {
  esEstadoPagoFallidoMercadoPago,
  ESTADOS_CANCELADOS_MERCADOPAGO,
  sincronizarPlanUsuario,
} from "@/lib/suscripciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ESTADOS_CORTAN_BENEFICIOS = new Set([
  "inactive",
  "expired",
]);

// FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
const DIAS_GRACIA_RENOVACION = 3;

function sumarDias(fecha: Date, dias: number) {
  return new Date(fecha.getTime() + dias * 24 * 60 * 60 * 1000);
}

function sumarUnMes(fecha: Date) {
  const copia = new Date(fecha);
  copia.setMonth(copia.getMonth() + 1);
  return copia;
}

async function cancelarOtrasSuscripciones(
  usuarioId: number,
  suscripcionActualId: number,
) {
  const ahora = new Date();

  const otras = await prisma.suscripcionMercadoPago.findMany({
    where: {
      usuarioId,
      id: { not: suscripcionActualId },
      mercadoPagoId: { not: null },
      OR: [
        { estado: "authorized" },
        {
          estado: { in: [...ESTADOS_CANCELADOS_MERCADOPAGO] },
          beneficiosHasta: { gt: ahora },
        },
      ],
    },
    select: {
      id: true,
      mercadoPagoId: true,
      estado: true,
    },
  });

  const fallidas: string[] = [];

  for (const otra of otras) {
    if (!otra.mercadoPagoId) continue;

    try {
      if (otra.estado === "authorized") {
        await cancelarSuscripcionMercadoPago(otra.mercadoPagoId);
      }

      await prisma.suscripcionMercadoPago.update({
        where: { id: otra.id },
        data: {
          estado: "canceled",
          canceladaEn: ahora,
          beneficiosHasta: ahora,
          proximoCobroEn: null,
          planProgramado: null,
          montoProgramado: null,
          cambioPlanEn: null,
        },
      });
    } catch (error) {
      console.error(
        `No se pudo cerrar la suscripción anterior ${otra.mercadoPagoId}.`,
        error,
      );
      fallidas.push(otra.mercadoPagoId);
    }
  }

  if (fallidas.length > 0) {
    throw new Error(
      "No se pudieron cancelar todas las suscripciones anteriores de Mercado Pago.",
    );
  }
}

async function procesarSuscripcion(preapprovalId: string) {
  const localPorId = await prisma.suscripcionMercadoPago.findUnique({
    where: { mercadoPagoId: preapprovalId },
  });

  const remota = await obtenerSuscripcionMercadoPago(preapprovalId, {
    payerEmail: localPorId?.payerEmail,
    referencia: localPorId?.referencia,
  });

  const referencia =
    remota.external_reference === null ||
    remota.external_reference === undefined
      ? null
      : String(remota.external_reference);

  const local =
    localPorId ??
    (await prisma.suscripcionMercadoPago.findFirst({
      where: {
        OR: [
          { mercadoPagoId: remota.id || preapprovalId },
          ...(referencia ? [{ referencia }] : []),
        ],
      },
    }));

  if (!local) {
    return;
  }

  const estado = normalizarEstadoMercadoPago(remota.status);
  const monto = convertirMontoMercadoPago(
    remota.auto_recurring?.transaction_amount,
  );
  const moneda = remota.auto_recurring?.currency_id?.toUpperCase() ?? null;

  const montoEsperado =
    esPlanPago(local.planProgramado) && local.montoProgramado !== null
      ? local.montoProgramado
      : local.monto;

  const datosCoinciden =
    monto !== null &&
    Math.abs(monto - montoEsperado) < 0.001 &&
    moneda === local.moneda;

  const ahora = new Date();

  if (estado === "authorized" && !datosCoinciden) {
    // FEATMUSIC_PROTEGER_BENEFICIOS_ERROR_DATOS_V1
    // FEATMUSIC_REVISION_RENOVACION_SEGURA_V1
    //
    // Compra nueva:
    //   monto/moneda incorrectos => nunca se activa Premium.
    //
    // Suscripción ya pagada:
    //   conserva los beneficios hasta beneficiosHasta, pero la renovación
    //   remota se pausa para impedir un cobro futuro con datos inconsistentes.
    const beneficiosPagadosVigentes = Boolean(
      local.activadaEn &&
        local.beneficiosHasta &&
        local.beneficiosHasta.getTime() > ahora.getTime(),
    );

    if (beneficiosPagadosVigentes) {
      let renovacionPausada = false;

      try {
        const remotaPausada = await cancelarSuscripcionMercadoPago(
          remota.id || preapprovalId,
        );
        renovacionPausada =
          normalizarEstadoMercadoPago(remotaPausada.status) === "paused";
      } catch (errorPausandoRenovacion) {
        console.error(
          `No se pudo pausar automáticamente la renovación inconsistente ${preapprovalId}.`,
          errorPausandoRenovacion,
        );
      }

      await prisma.suscripcionMercadoPago.update({
        where: { id: local.id },
        data: {
          mercadoPagoId: remota.id || preapprovalId,
          estado: "error_datos",
          proximoCobroEn: null,
          planProgramado: null,
          montoProgramado: null,
          cambioPlanEn: null,
        },
      });

      console.error(
        renovacionPausada
          ? `La suscripción ${preapprovalId} tiene monto o moneda inesperados. La renovación fue pausada y conserva los beneficios ya pagados hasta ${local.beneficiosHasta?.toISOString()}.`
          : `La suscripción ${preapprovalId} tiene monto o moneda inesperados. Conserva los beneficios ya pagados hasta ${local.beneficiosHasta?.toISOString()}, pero Mercado Pago no confirmó la pausa automática.`,
      );

      await sincronizarPlanUsuario(local.usuarioId, ahora);
      return;
    }

    await prisma.suscripcionMercadoPago.update({
      where: { id: local.id },
      data: {
        mercadoPagoId: remota.id || preapprovalId,
        estado: "error_datos",
      },
    });

    console.error(
      `Se rechazó la activación de ${preapprovalId}: monto o moneda inesperados.`,
    );

    // En una compra nueva no existe un período pagado que proteger.
    await sincronizarPlanUsuario(local.usuarioId, ahora);
    return;
  }

  const proximoCobroRemoto = convertirFechaMercadoPago(
    remota.next_payment_date,
  );
  const estaCancelada = ESTADOS_CANCELADOS_MERCADOPAGO.some(
    (item) => item === estado,
  );

  // FEATMUSIC_REVISION_RENOVACION_SEGURA_V1
  // Si Mercado Pago confirma "paused" después de que FeatMusic detectó una
  // inconsistencia de datos, mantenemos "error_datos" localmente para que la
  // interfaz siga mostrando "Renovación en revisión" y no lo confunda con una
  // cancelación solicitada por el usuario.
  const conservarRevisionDatos = Boolean(
    local.estado === "error_datos" &&
      estaCancelada &&
      local.activadaEn &&
      local.beneficiosHasta &&
      local.beneficiosHasta.getTime() > ahora.getTime(),
  );
  const estadoPersistido = conservarRevisionDatos ? "error_datos" : estado;

  const beneficiosHasta =
    estado === "authorized"
      ? local.activadaEn
        ? proximoCobroRemoto ?? local.beneficiosHasta
        : local.beneficiosHasta
      : estaCancelada
        ? local.beneficiosHasta ??
          local.proximoCobroEn ??
          proximoCobroRemoto
        : ESTADOS_CORTAN_BENEFICIOS.has(estado)
          ? ahora
          : local.beneficiosHasta;

  const actualizada = await prisma.suscripcionMercadoPago.update({
    where: { id: local.id },
    data: {
      mercadoPagoId: remota.id || preapprovalId,
      estado: estadoPersistido,
      payerEmail: remota.payer_email?.trim() || local.payerEmail,
      proximoCobroEn:
        estado === "authorized" ? proximoCobroRemoto : local.proximoCobroEn,
      // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
      // "authorized" confirma la preaprobación, no necesariamente el cobro.
      // activadaEn se establece únicamente en procesarPagoAutorizado cuando
      // el pago real llega aprobado.
      activadaEn: local.activadaEn,
      canceladaEn: conservarRevisionDatos
        ? local.canceladaEn
        : estado === "authorized"
          ? null
          : estaCancelada
            ? local.canceladaEn ?? ahora
            : local.canceladaEn,
      beneficiosHasta,
    },
    select: {
      id: true,
      usuarioId: true,
      plan: true,
      planProgramado: true,
      montoProgramado: true,
      cambioPlanEn: true,
      activadaEn: true,
    },
  });

  if (
    estado === "authorized" &&
    actualizada.activadaEn &&
    esPlanPago(actualizada.plan)
  ) {
    await cancelarOtrasSuscripciones(actualizada.usuarioId, actualizada.id);

    await prisma.usuario.update({
      where: { id: actualizada.usuarioId },
      data: { plan: actualizada.plan },
    });
    return;
  }

  await sincronizarPlanUsuario(actualizada.usuarioId, ahora);
}

async function procesarPagoAutorizado(id: string) {
  const pago = await obtenerPagoAutorizadoMercadoPago(id);
  const preapprovalId = pago.preapproval_id?.trim();

  if (!preapprovalId) {
    return;
  }

  await procesarSuscripcion(preapprovalId);

  const local = await prisma.suscripcionMercadoPago.findUnique({
    where: { mercadoPagoId: preapprovalId },
    select: {
      id: true,
      usuarioId: true,
      estado: true,
      plan: true,
      monto: true,
      activadaEn: true,
      beneficiosHasta: true,
      proximoCobroEn: true,
      ultimoPagoEstado: true,
      pagoFallidoEn: true,
      graciaHasta: true,
      planProgramado: true,
      montoProgramado: true,
      cambioPlanEn: true,
    },
  });

  if (!local) {
    return;
  }

  const estadoPago =
    pago.payment?.status?.trim().toLowerCase() ||
    pago.summarized?.trim().toLowerCase() ||
    pago.status?.trim().toLowerCase() ||
    "unknown";
  const estadoPagoReal = pago.payment?.status?.trim().toLowerCase() || null;
  const estadoParaEvaluar = estadoPagoReal ?? estadoPago;
  const pagoId = pago.payment?.id ?? pago.id;
  const fechaDebito = convertirFechaMercadoPago(pago.debit_date);
  const ahora = new Date();

  const cambioYaCorresponde = Boolean(
    esPlanPago(local.planProgramado) &&
      local.cambioPlanEn &&
      (fechaDebito ?? ahora).getTime() >=
        local.cambioPlanEn.getTime() - 5 * 60 * 1000,
  );

  const pagoAcreditado =
    estadoParaEvaluar === "approved" ||
    estadoParaEvaluar === "authorized";
  const pagoFallido =
    esEstadoPagoFallidoMercadoPago(estadoParaEvaluar);

  // FEATMUSIC_GRACIA_RENOVACION_3_DIAS_V1
  // Un rechazo del PRIMER cobro no activa Premium ni recibe período de gracia.
  // Una RENOVACIÓN rechazada conserva el plan durante 3 días desde el primer
  // fallo. Reintentos posteriores NO extienden esa fecha.
  if (pagoFallido) {
    if (local.activadaEn) {
      const pagoFallidoEn = local.pagoFallidoEn ?? ahora;
      const graciaHasta =
        local.graciaHasta ??
        sumarDias(pagoFallidoEn, DIAS_GRACIA_RENOVACION);

      await prisma.suscripcionMercadoPago.update({
        where: { id: local.id },
        data: {
          ultimoPagoId:
            pagoId === null || pagoId === undefined ? null : String(pagoId),
          ultimoPagoEstado: estadoPago,
          pagoFallidoEn,
          graciaHasta,
        },
      });

      console.warn(
        `Renovación rechazada para ${preapprovalId}. Beneficios en gracia hasta ${graciaHasta.toISOString()}.`,
      );
    } else {
      let estadoTrasFallo = local.estado;

      try {
        const remotaPausada = await cancelarSuscripcionMercadoPago(
          preapprovalId,
        );
        estadoTrasFallo = normalizarEstadoMercadoPago(
          remotaPausada.status,
        );
      } catch (errorPausaInicial) {
        console.error(
          `No se pudo pausar el primer cobro rechazado de ${preapprovalId}.`,
          errorPausaInicial,
        );
      }

      await prisma.suscripcionMercadoPago.update({
        where: { id: local.id },
        data: {
          estado: estadoTrasFallo,
          ultimoPagoId:
            pagoId === null || pagoId === undefined ? null : String(pagoId),
          ultimoPagoEstado: estadoPago,
          pagoFallidoEn: ahora,
          graciaHasta: null,
          beneficiosHasta: null,
          proximoCobroEn: null,
          planProgramado: null,
          montoProgramado: null,
          cambioPlanEn: null,
        },
      });

      console.warn(
        `Primer cobro rechazado para ${preapprovalId}. Premium no fue activado.`,
      );
    }

    await sincronizarPlanUsuario(local.usuarioId, ahora);
    return;
  }

  if (pagoAcreditado) {
    const beneficiosHasta =
      local.proximoCobroEn ??
      local.beneficiosHasta ??
      sumarUnMes(fechaDebito ?? ahora);

    if (
      cambioYaCorresponde &&
      esPlanPago(local.planProgramado)
    ) {
      const planNuevo = local.planProgramado;
      const datosPlanNuevo = obtenerDatosPagoPlan(planNuevo);

      await prisma.$transaction([
        prisma.suscripcionMercadoPago.update({
          where: { id: local.id },
          data: {
            plan: planNuevo,
            monto: local.montoProgramado ?? datosPlanNuevo.montoCop,
            planProgramado: null,
            montoProgramado: null,
            cambioPlanEn: null,
            activadaEn: local.activadaEn ?? ahora,
            beneficiosHasta,
            ultimoPagoId:
              pagoId === null || pagoId === undefined ? null : String(pagoId),
            ultimoPagoEstado: estadoPago,
            pagoFallidoEn: null,
            graciaHasta: null,
          },
        }),
        prisma.usuario.update({
          where: { id: local.usuarioId },
          data: { plan: planNuevo },
        }),
      ]);

      await actualizarPlanSuscripcionMercadoPago(
        preapprovalId,
        planNuevo,
        local.montoProgramado ?? datosPlanNuevo.montoCop,
        true,
      ).catch((error) => {
        console.error(
          `El plan cambió a ${planNuevo}, pero no se pudo actualizar el nombre en Mercado Pago.`,
          error,
        );
      });
    } else {
      await prisma.suscripcionMercadoPago.update({
        where: { id: local.id },
        data: {
          activadaEn: local.activadaEn ?? ahora,
          beneficiosHasta,
          ultimoPagoId:
            pagoId === null || pagoId === undefined ? null : String(pagoId),
          ultimoPagoEstado: estadoPago,
          pagoFallidoEn: null,
          graciaHasta: null,
        },
      });
    }

    await cancelarOtrasSuscripciones(local.usuarioId, local.id);
  } else {
    await prisma.suscripcionMercadoPago.update({
      where: { id: local.id },
      data: {
        ultimoPagoId:
          pagoId === null || pagoId === undefined ? null : String(pagoId),
        ultimoPagoEstado: estadoPago,
      },
    });
  }

  await sincronizarPlanUsuario(local.usuarioId);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataIdQuery =
    url.searchParams.get("data.id") ?? url.searchParams.get("data_id");
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  let body: {
    type?: string;
    data?: { id?: string | number };
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    // Algunas simulaciones pueden llegar sin body JSON utilizable.
  }

  const dataIdBody =
    body.data?.id === null || body.data?.id === undefined
      ? null
      : String(body.data.id);
  const dataId = dataIdQuery ?? dataIdBody;
  const tipo = (url.searchParams.get("type") ?? body.type ?? "").trim();

  if (
    !validarFirmaWebhookMercadoPago({
      xSignature,
      xRequestId,
      dataId: dataIdQuery,
    })
  ) {
    return NextResponse.json(
      { ok: false, mensaje: "Firma de webhook inválida." },
      { status: 401 },
    );
  }

  if (!dataId) {
    return NextResponse.json({ ok: true });
  }

  if (
    tipo === "subscription_preapproval" ||
    tipo === "subscription_authorized_payment"
  ) {
    const tipoPendiente = tipo;
    const dataIdPendiente = dataId;

    after(async () => {
      try {
        console.log(
          `[MercadoPago webhook] Procesando ${tipoPendiente} ${dataIdPendiente}`,
        );

        if (tipoPendiente === "subscription_preapproval") {
          await procesarSuscripcion(dataIdPendiente);
        } else {
          await procesarPagoAutorizado(dataIdPendiente);
        }

        console.log(
          `[MercadoPago webhook] Procesado correctamente ${tipoPendiente} ${dataIdPendiente}`,
        );
      } catch (error) {
        console.error("Error procesando webhook de Mercado Pago.", error);
      }
    });
  }

  return NextResponse.json({ ok: true });
}
