import { NextResponse } from "next/server";

import { obtenerSesion } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const sesion = await obtenerSesion();

  const respuesta = NextResponse.json(
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

  // Si la cookie está vencida, dañada o ya no representa una sesión válida,
  // la eliminamos para que el navegador no siga enviándola en cada visita.
  if (!sesion) {
    respuesta.cookies.set("featmusic_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  return respuesta;
}
