import { NextResponse } from "next/server";

import { obtenerSesion } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sesion = await obtenerSesion();

  return NextResponse.json(
    {
      sesionActiva: Boolean(sesion),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}