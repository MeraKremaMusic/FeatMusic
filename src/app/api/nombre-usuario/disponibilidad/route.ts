import {
  MENSAJE_NOMBRE_USUARIO_INVALIDO,
  nombreUsuarioEsValido,
  normalizarNombreUsuario,
} from "@/lib/nombreUsuario";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return Response.json(
      { estado: "no-autorizado", disponible: false },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { searchParams } = new URL(request.url);
  const nombreUsuario = normalizarNombreUsuario(
    searchParams.get("nombreUsuario"),
  );

  if (!nombreUsuarioEsValido(nombreUsuario)) {
    return Response.json(
      {
        estado: "invalido",
        disponible: false,
        mensaje: MENSAJE_NOMBRE_USUARIO_INVALIDO,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { nombreUsuario },
    select: { id: true },
  });

  const disponible =
    !usuarioExistente || usuarioExistente.id === sesion.usuarioId;

  return Response.json(
    disponible
      ? {
          estado: "disponible",
          disponible: true,
          mensaje: "Nombre de usuario disponible.",
        }
      : {
          estado: "ocupado",
          disponible: false,
          mensaje: "Ese nombre de usuario ya está en uso.",
        },
    { headers: { "Cache-Control": "no-store" } },
  );
}
