import { NextResponse } from "next/server";

import { obtenerSesion } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const headersNoCache = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

export async function GET() {
  try {
    const sesion = await obtenerSesion();

    return NextResponse.json(
      {
        sesionActiva: Boolean(sesion),
      },
      {
        headers: headersNoCache,
      },
    );
  } catch (error) {
    console.error("No se pudo consultar el estado de la sesión:", error);

    return NextResponse.json(
      {
        sesionActiva: false,
        error: "No se pudo comprobar la sesión.",
      },
      {
        status: 503,
        headers: headersNoCache,
      },
    );
  }
}
