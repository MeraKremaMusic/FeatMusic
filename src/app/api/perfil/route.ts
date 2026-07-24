import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { subirImagenPerfil } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const USUARIO_REGEX = /^[a-z0-9._]{3,24}$/;

const urlOpcionalSchema = (plataforma: string) =>
  z
    .string()
    .trim()
    .max(500, `El enlace de ${plataforma} no puede superar 500 caracteres.`)
    .refine(
      (valor) => valor === "" || /^https?:\/\//i.test(valor),
      `El enlace de ${plataforma} debe comenzar con http:// o https://.`,
    )
    .refine((valor) => {
      if (valor === "") return true;

      try {
        const url = new URL(valor);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, `El enlace de ${plataforma} no es válido.`);

const perfilSchema = z.object({
  nombreArtistico: z
    .string()
    .trim()
    .min(2, "El nombre artístico debe tener al menos 2 caracteres.")
    .max(80, "El nombre artístico no puede superar 80 caracteres."),
  nombreUsuario: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      USUARIO_REGEX,
      "El nombre de usuario debe tener entre 3 y 24 caracteres y usar solo letras, números, punto o guion bajo.",
    ),
  biografia: z
    .string()
    .trim()
    .max(300, "La biografía no puede superar 300 caracteres."),
  spotifyUrl: urlOpcionalSchema("Spotify"),
  youtubeUrl: urlOpcionalSchema("YouTube"),
  instagramUrl: urlOpcionalSchema("Instagram"),
  distribuidoraPreferida: z
    .string()
    .trim()
    .max(120, "La distribuidora no puede superar 120 caracteres."),
  softwarePreferido: z
    .string()
    .trim()
    .max(120, "El software preferido no puede superar 120 caracteres."),
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
    const nombreUsuario = String(formData.get("nombreUsuario") ?? "")
      .trim()
      .toLowerCase()
      .replace(/^@+/, "");

    const resultado = perfilSchema.safeParse({
      nombreArtistico: formData.get("nombreArtistico"),
      nombreUsuario,
      biografia: formData.get("biografia") ?? "",
      spotifyUrl: formData.get("spotifyUrl") ?? "",
      youtubeUrl: formData.get("youtubeUrl") ?? "",
      instagramUrl: formData.get("instagramUrl") ?? "",
      distribuidoraPreferida: formData.get("distribuidoraPreferida") ?? "",
      softwarePreferido: formData.get("softwarePreferido") ?? "",
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
        return respuestaError("La imagen no puede pesar más de 5 MB.", 400);
      }

      fotoPerfil = await subirImagenPerfil(imagen, sesion.usuarioId);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: sesion.usuarioId },
      data: {
        nombreArtistico: resultado.data.nombreArtistico,
        nombreUsuario: resultado.data.nombreUsuario,
        biografia: resultado.data.biografia || null,
        spotifyUrl: resultado.data.spotifyUrl || null,
        youtubeUrl: resultado.data.youtubeUrl || null,
        instagramUrl: resultado.data.instagramUrl || null,
        distribuidoraPreferida:
          resultado.data.distribuidoraPreferida || null,
        softwarePreferido: resultado.data.softwarePreferido || null,
        ...(fotoPerfil ? { fotoPerfil } : {}),
      },
      select: {
        nombreArtistico: true,
        nombreUsuario: true,
        biografia: true,
        fotoPerfil: true,
        spotifyUrl: true,
        youtubeUrl: true,
        instagramUrl: true,
        distribuidoraPreferida: true,
        softwarePreferido: true,
      },
    });

    return NextResponse.json({
      ok: true,
      mensaje: "Perfil actualizado correctamente.",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return respuestaError(
        "Ese nombre de usuario ya está en uso. Elige otro.",
        409,
      );
    }

    console.error("No se pudo actualizar el perfil.", error);
    return respuestaError(
      "No se pudo actualizar el perfil. Inténtalo nuevamente.",
      500,
    );
  }
}
