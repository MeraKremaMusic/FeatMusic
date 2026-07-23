import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const rutasSoloParaVisitantes = new Set([
  "/",
  "/iniciar-sesion",
  "/registro",
]);

const secreto = process.env.SESSION_SECRET;
const clave = secreto
  ? new TextEncoder().encode(secreto)
  : undefined;

async function tieneSesionValida(request: NextRequest) {
  const token = request.cookies.get("featmusic_session")?.value;

  if (!token || !clave) {
    return false;
  }

  try {
    await jwtVerify(token, clave);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const esRutaSoloParaVisitantes =
    rutasSoloParaVisitantes.has(pathname);

  if (
    esRutaSoloParaVisitantes &&
    (await tieneSesionValida(request))
  ) {
    const respuesta = NextResponse.redirect(
      new URL("/panel", request.url),
    );

    respuesta.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );

    return respuesta;
  }

  const respuesta = NextResponse.next();

  if (esRutaSoloParaVisitantes) {
    respuesta.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, max-age=0",
    );
    respuesta.headers.set("Pragma", "no-cache");
    respuesta.headers.set("Expires", "0");
  }

  return respuesta;
}

export const config = {
  matcher: ["/", "/iniciar-sesion", "/registro"],
};