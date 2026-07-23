import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const rutasPublicas = new Set(["/", "/iniciar-sesion", "/registro"]);
const secreto = process.env.SESSION_SECRET;
const clave = secreto ? new TextEncoder().encode(secreto) : undefined;

async function tieneSesionValida(request: NextRequest) {
  const token = request.cookies.get("featmusic_session")?.value;
  if (!token || !clave) return false;

  try {
    await jwtVerify(token, clave);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  if (rutasPublicas.has(request.nextUrl.pathname) && (await tieneSesionValida(request))) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/iniciar-sesion", "/registro"],
};
