import { NextResponse } from "next/server";

import { limpiarIdeasExpiradasGlobales } from "@/lib/ideas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return respuestaError("La tarea de limpieza no está configurada.", 503);
  }

  const authorization = request.headers.get("authorization");
  const secretHeader = request.headers.get("x-cron-secret");
  const autorizado =
    authorization === `Bearer ${cronSecret}` || secretHeader === cronSecret;

  if (!autorizado) {
    return respuestaError("No autorizado.", 401);
  }

  try {
    const resultado = await limpiarIdeasExpiradasGlobales();

    return NextResponse.json({
      ok: true,
      mensaje: "Limpieza de ideas expiradas finalizada.",
      resultado,
    });
  } catch (error) {
    console.error("Falló la tarea global de limpieza de ideas.", error);
    return respuestaError("No se pudo completar la limpieza.", 500);
  }
}
