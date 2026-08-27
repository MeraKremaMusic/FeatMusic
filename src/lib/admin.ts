import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

// FEATMUSIC_ADMIN_FASE1_V1

export async function obtenerAdministradorActual() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return null;
  }

  return prisma.usuario.findFirst({
    where: {
      id: sesion.usuarioId,
      rolSistema: "ADMIN",
    },
    select: {
      id: true,
      correo: true,
      nombreArtistico: true,
      nombreUsuario: true,
      rolSistema: true,
    },
  });
}
