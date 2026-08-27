import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { expirarPlanesVencidos } from "@/lib/suscripciones";

// FEATMUSIC_EXPIRACION_AUTOMATICA_PLANES_V1
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function compararSeguro(valorA: string, valorB: string) {
  const a = Buffer.from(valorA, "utf8");
  const b = Buffer.from(valorB, "utf8");

  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}

function obtenerBearer(request: Request) {
  const authorization = request.headers.get("authorization")?.trim();

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7).trim() || null;
}

function respuesta(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    console.error(
      "CRON_SECRET no está configurado. El cron de expiración no puede ejecutarse.",
    );
    return respuesta(
      {
        ok: false,
        mensaje: "El proceso automático no está configurado.",
      },
      503,
    );
  }

  const recibido = obtenerBearer(request);

  if (!recibido || !compararSeguro(recibido, secret)) {
    return respuesta(
      {
        ok: false,
        mensaje: "No autorizado.",
      },
      401,
    );
  }

  const ahora = new Date();

  try {
    const resultado = await expirarPlanesVencidos(ahora);

    console.log(
      "[Cron suscripciones] Expiración completada:",
      JSON.stringify(resultado),
    );

    return respuesta({
      ok: true,
      ejecutadoEn: ahora.toISOString(),
      ...resultado,
    });
  } catch (error) {
    console.error(
      "No se pudo ejecutar el cron de expiración de suscripciones.",
      error,
    );

    return respuesta(
      {
        ok: false,
        mensaje: "No se pudo completar la revisión de suscripciones.",
      },
      500,
    );
  }
}
