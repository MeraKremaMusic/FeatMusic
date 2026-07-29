import { NextResponse } from "next/server";

import { eliminarSesion } from "@/lib/session";

// FEATMUSIC_SESION_RECUPERABLE_V1
const DESTINOS_PERMITIDOS = new Set(["/", "/iniciar-sesion"]);

function obtenerDestino(request: Request) {
  const destinoSolicitado = new URL(request.url).searchParams.get("destino");
  return destinoSolicitado && DESTINOS_PERMITIDOS.has(destinoSolicitado)
    ? destinoSolicitado
    : "/";
}

async function cerrarSesionYRedirigir(request: Request, destino: string) {
  await eliminarSesion();

  const respuesta = NextResponse.redirect(new URL(destino, request.url), 303);

  // Se define también sobre la respuesta para garantizar que el navegador
  // elimine la cookie incluso durante una cadena de redirecciones.
  respuesta.cookies.set("featmusic_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  respuesta.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0",
  );

  return respuesta;
}

export async function GET(request: Request) {
  return cerrarSesionYRedirigir(request, obtenerDestino(request));
}

export async function POST(request: Request) {
  return cerrarSesionYRedirigir(request, "/");
}
