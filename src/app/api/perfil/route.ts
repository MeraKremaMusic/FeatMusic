import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import { subirImagenPerfil } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const perfilSchema = z.object({
  nombreArtistico: z
    .string()
    .trim()
    .min(2, "El nombre artístico debe tener al menos 2 caracteres.")
    .max(80, "El nombre artístico no puede superar 80 caracteres."),
  biografia: z
    .string()
    .trim()
    .max(300, "La biografía no puede superar 300 caracteres."),
});

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

export async function PATCH(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  try {
    const formData = await request.formData();

    const resultado = perfilSchema.safeParse({
      nombreArtistico: formData.get("nombreArtistico"),
      biografia: formData.get("biografia") ?? "",
    });

    if (!resultado.success) {
      return respuestaError(
        resultado.error.issues[0]?.message ?? "Los datos enviados no son válidos.",
        400,
      );
    }

    const imagen = formData.get("fotoPerfil");
    let fotoPerfil: string | undefined;

    if (imagen instanceof File && imagen.size > 0) {
      if (!IMAGE_TYPES.has(imagen.type)) {
        return respuestaError(
          "La imagen debe ser JPG, JPEG, PNG o WebP.",
          400,
        );
      }

      if (imagen.size > MAX_IMAGE_SIZE) {
        return respuestaError(
          "La imagen no puede pesar más de 5 MB.",
          400,
        );
      }

      fotoPerfil = await subirImagenPerfil(imagen, sesion.usuarioId);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: sesion.usuarioId },
      data: {
        nombreArtistico: resultado.data.nombreArtistico,
        biografia: resultado.data.biografia || null,
        ...(fotoPerfil ? { fotoPerfil } : {}),
      },
      select: {
        nombreArtistico: true,
        nombreUsuario: true,
        biografia: true,
        fotoPerfil: true,
      },
    });

    return NextResponse.json({
      ok: true,
      mensaje: "Perfil actualizado correctamente.",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("No se pudo actualizar el perfil.", error);

    return respuestaError(
      "No se pudo actualizar el perfil. Inténtalo nuevamente.",
      500,
    );
  }
}
