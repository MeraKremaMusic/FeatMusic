import { createHmac, timingSafeEqual } from "node:crypto";

import { obtenerDatosPagoPlan, type PlanPagoFeatMusic } from "@/lib/planes";

const MERCADOPAGO_API = "https://api.mercadopago.com";

export type SuscripcionMercadoPagoApi = {
  id: string;
  external_reference?: string | number | null;
  payer_email?: string | null;
  status?: string | null;
  init_point?: string | null;
  next_payment_date?: string | null;
  auto_recurring?: {
    transaction_amount?: number | string | null;
    currency_id?: string | null;
  } | null;
};

export type PagoAutorizadoMercadoPagoApi = {
  id: number | string;
  preapproval_id?: string | null;
  external_reference?: string | number | null;
  currency_id?: string | null;
  transaction_amount?: number | string | null;
  debit_date?: string | null;
  status?: string | null;
  summarized?: string | null;
  payment?: {
    id?: number | string | null;
    status?: string | null;
    status_detail?: string | null;
  } | null;
};

export class ErrorMercadoPago extends Error {
  constructor(
    mensaje: string,
    public status: number,
  ) {
    super(mensaje);
  }
}

function obtenerAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "Falta MERCADOPAGO_ACCESS_TOKEN en las variables de entorno del servidor.",
    );
  }

  return token;
}

export function esCredencialPruebaMercadoPago() {
  return obtenerAccessToken().startsWith("TEST-");
}

export function obtenerCorreoPagadorMercadoPago(correoReal: string) {
  const correoPruebaConfigurado =
    process.env.MERCADOPAGO_PAYER_EMAIL_PRUEBA?.trim();

  if (correoPruebaConfigurado) {
    return correoPruebaConfigurado;
  }

  return esCredencialPruebaMercadoPago() ? "test@testuser.com" : correoReal;
}

export function obtenerUrlAplicacion() {
  const configurada = process.env.APP_URL?.trim();

  if (configurada) {
    return configurada.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return "https://featmusic.pro";
}

async function solicitarMercadoPago<T>(
  ruta: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${obtenerAccessToken()}`);
  headers.set("Accept", "application/json");

  // Mercado Pago puede responder bad_request_data a ciertos GET cuando
  // enviamos Content-Type: application/json sin existir un body.
  // Solo lo enviamos cuando realmente mandamos contenido JSON.
  if (init.body !== undefined && init.body !== null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${MERCADOPAGO_API}${ruta}`, {
    ...init,
    cache: "no-store",
    headers,
    signal: AbortSignal.timeout(15_000),
  });

  const texto = await response.text();
  let data: unknown = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = texto;
    }
  }

  if (!response.ok) {
    const objeto =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : null;

    const mensajeApi =
      objeto && typeof objeto.message === "string" ? objeto.message : null;
    const errorApi =
      objeto && typeof objeto.error === "string" ? objeto.error : null;

    const causas =
      objeto && Array.isArray(objeto.cause)
        ? objeto.cause
            .map((causa) => {
              if (typeof causa !== "object" || causa === null) return null;
              const item = causa as Record<string, unknown>;
              const codigo =
                typeof item.code === "string" || typeof item.code === "number"
                  ? String(item.code)
                  : null;
              const descripcion =
                typeof item.description === "string"
                  ? item.description
                  : typeof item.message === "string"
                    ? item.message
                    : null;

              if (codigo && descripcion) return `${codigo}: ${descripcion}`;
              return descripcion ?? codigo;
            })
            .filter((valor): valor is string => Boolean(valor))
        : [];

    const partes = [mensajeApi, errorApi, ...causas].filter(
      (valor, indice, todos): valor is string =>
        Boolean(valor) && todos.indexOf(valor) === indice,
    );

    throw new ErrorMercadoPago(
      partes.length > 0
        ? `Mercado Pago (${response.status}): ${partes.join(" · ")}`
        : `Mercado Pago no pudo procesar la solicitud (HTTP ${response.status}).`,
      response.status,
    );
  }

  return data as T;
}

export async function crearSuscripcionPendienteMercadoPago({
  plan,
  referencia,
  correo,
}: {
  plan: PlanPagoFeatMusic;
  referencia: string;
  correo: string;
}) {
  const datosPlan = obtenerDatosPagoPlan(plan);

  return solicitarMercadoPago<SuscripcionMercadoPagoApi>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: datosPlan.motivo,
      external_reference: referencia,
      payer_email: correo,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: datosPlan.montoCop,
        currency_id: "COP",
      },
      back_url: `${obtenerUrlAplicacion()}/planes?mercadopago=retorno`,
      status: "pending",
    }),
  });
}

export async function obtenerSuscripcionMercadoPago(
  id: string,
  _opciones: {
    payerEmail?: string | null;
    referencia?: string | null;
  } = {},
) {
  // El diagnóstico contra la misma cuenta de prueba confirmó que este
  // endpoint devuelve HTTP 200 para el preapproval_id real.
  // Una sola consulta evita reintentos y timeouts del webhook.
  return solicitarMercadoPago<SuscripcionMercadoPagoApi>(
    `/preapproval/${encodeURIComponent(id)}`,
  );
}

export async function actualizarPlanSuscripcionMercadoPago(
  id: string,
  plan: PlanPagoFeatMusic,
  montoCop?: number,
  actualizarMotivo = true,
) {
  const datosPlan = obtenerDatosPagoPlan(plan);

  return solicitarMercadoPago<SuscripcionMercadoPagoApi>(
    `/preapproval/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...(actualizarMotivo ? { reason: datosPlan.motivo } : {}),
        auto_recurring: {
          transaction_amount: montoCop ?? datosPlan.montoCop,
          currency_id: "COP",
        },
      }),
    },
  );
}

export async function cancelarSuscripcionMercadoPago(id: string) {
  // En producción de Mercado Pago Colombia algunas suscripciones autorizadas
  // están rechazando la transición directa a "canceled" aunque esté
  // documentada. "paused" detiene los cobros recurrentes y nos permite
  // conservar internamente los beneficios hasta el final del período pagado.
  return solicitarMercadoPago<SuscripcionMercadoPagoApi>(
    `/preapproval/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: "paused" }),
    },
  );
}

// FEATMUSIC_REACTIVAR_RENOVACION_V1
export async function reactivarSuscripcionMercadoPago(id: string) {
  return solicitarMercadoPago<SuscripcionMercadoPagoApi>(
    `/preapproval/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: "authorized" }),
    },
  );
}

export async function obtenerPagoAutorizadoMercadoPago(id: string) {
  return solicitarMercadoPago<PagoAutorizadoMercadoPagoApi>(
    `/authorized_payments/${encodeURIComponent(id)}`,
  );
}

function compararSeguroHex(a: string, b: string) {
  if (!/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b)) {
    return false;
  }

  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return timingSafeEqual(bufferA, bufferB);
}

export function validarFirmaWebhookMercadoPago({
  xSignature,
  xRequestId,
  dataId,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();

  if (!secret || !xSignature) {
    return false;
  }

  const partes = Object.fromEntries(
    xSignature
      .split(",")
      .map((parte) => parte.trim().split("=", 2))
      .filter((par) => par.length === 2 && par[0] && par[1]),
  );

  const ts = partes.ts;
  const firmaRecibida = partes.v1;

  if (!ts || !firmaRecibida) {
    return false;
  }

  const manifiesto = [
    dataId ? `id:${dataId};` : "",
    xRequestId ? `request-id:${xRequestId};` : "",
    `ts:${ts};`,
  ].join("");

  const firmaEsperada = createHmac("sha256", secret)
    .update(manifiesto)
    .digest("hex");

  return compararSeguroHex(firmaEsperada, firmaRecibida);
}

export function normalizarEstadoMercadoPago(estado: string | null | undefined) {
  return estado?.trim().toLowerCase() || "unknown";
}

export function convertirFechaMercadoPago(valor: string | null | undefined) {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function convertirMontoMercadoPago(
  valor: number | string | null | undefined,
) {
  const monto = Number(valor);
  return Number.isFinite(monto) ? monto : null;
}
