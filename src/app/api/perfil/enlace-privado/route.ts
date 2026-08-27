import { NextResponse } from "next/server";

import { crearEnlaceAccesoPerfilPrivado } from "@/lib/perfil-privado";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CABECERAS_SIN_CACHE = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function responder(datos: unknown, status = 200) {
  return NextResponse.json(datos, {
    status,
    headers: CABECERAS_SIN_CACHE,
  });
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return responder(
      { ok: false, mensaje: "Tu sesión expiró. Inicia sesión nuevamente." },
      401,
    );
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: sesion.usuarioId },
      data: {
        versionEnlacePrivado: { increment: 1 },
      },
      select: {
        id: true,
        nombreUsuario: true,
        versionEnlacePrivado: true,
      },
    });

    const nombreUsuario =
      usuario.nombreUsuario?.trim() || `artista-${usuario.id}`;
    const origen = (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin
    ).replace(/\/+$/, "");

    const enlacePerfilPrivado = crearEnlaceAccesoPerfilPrivado({
      origen,
      nombreUsuario,
      usuarioId: usuario.id,
      version: usuario.versionEnlacePrivado,
    });

    return responder({
      ok: true,
      mensaje:
        "Nuevo enlace privado generado. El enlace anterior dejó de funcionar.",
      enlacePerfilPrivado,
    });
  } catch (error) {
    console.error("No se pudo regenerar el enlace privado del perfil.", error);
    return responder(
      { ok: false, mensaje: "No se pudo generar un nuevo enlace privado." },
      500,
    );
  }
}
