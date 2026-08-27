import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

// FEATMUSIC_SESION_RECUPERABLE_V1
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET() {
  let sesionActiva = false;

  try {
    const sesion = await obtenerSesion();

    if (sesion) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: sesion.usuarioId },
        select: { id: true },
      });

      sesionActiva = Boolean(usuario);
    }
  } catch (error) {
    // La página pública nunca debe quedar bloqueada si la comprobación falla.
    console.error("No se pudo validar completamente la sesión.", error);
    sesionActiva = false;
  }

  const respuesta = NextResponse.json(
    { sesionActiva },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );

  if (!sesionActiva) {
    respuesta.cookies.set("featmusic_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return respuesta;
}
