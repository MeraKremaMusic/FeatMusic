import { NextResponse, type NextRequest } from "next/server";

// FEATMUSIC_SESION_RECUPERABLE_V1
// El proxy ya no redirige basándose únicamente en la firma del JWT.
// Una cookie puede ser auténtica y, aun así, pertenecer a un usuario que ya
// no existe. La validación completa se realiza en el servidor/API y, cuando
// falla, la cookie se elimina antes de mostrar nuevamente el inicio de sesión.
const rutasSinCache = new Set([
  "/",
  "/iniciar-sesion",
  "/registro",
]);

export function proxy(request: NextRequest) {
  const respuesta = NextResponse.next();

  if (rutasSinCache.has(request.nextUrl.pathname)) {
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
