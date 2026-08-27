import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  eliminarImagenPerfil,
  eliminarImagenPortada,
  subirImagenPerfil,
  subirImagenPortada,
} from "@/lib/cloudinary";
import {
  MENSAJE_NOMBRE_USUARIO_INVALIDO,
  nombreUsuarioEsValido,
  normalizarNombreUsuario,
} from "@/lib/nombreUsuario";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
  biografia: z
    .string()
    .trim()
    .max(80, "La biografía no puede superar 80 caracteres."),
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

const selectPerfilActualizado = {
  nombreArtistico: true,
  nombreUsuario: true,
  biografia: true,
  fotoPerfil: true,
  portadaPerfil: true,
  spotifyUrl: true,
  youtubeUrl: true,
  instagramUrl: true,
  distribuidoraPreferida: true,
  softwarePreferido: true,
} as const;

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
    const nombreUsuarioSolicitado = normalizarNombreUsuario(
      formData.get("nombreUsuario"),
    );

    const resultado = perfilSchema.safeParse({
      nombreArtistico: formData.get("nombreArtistico"),
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

    const usuarioActual = await prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: { nombreUsuario: true },
    });

    if (!usuarioActual) {
      return respuestaError("No encontramos tu cuenta.", 404);
    }

    const actualNormalizado = normalizarNombreUsuario(
      usuarioActual.nombreUsuario,
    );
    const necesitaNombreUsuario = !usuarioActual.nombreUsuario;

    if (
      usuarioActual.nombreUsuario &&
      nombreUsuarioSolicitado &&
      nombreUsuarioSolicitado !== actualNormalizado
    ) {
      return respuestaError(
        "Tu nombre de usuario es único y permanente; no se puede cambiar.",
        409,
      );
    }

    if (
      necesitaNombreUsuario &&
      !nombreUsuarioEsValido(nombreUsuarioSolicitado)
    ) {
      return respuestaError(MENSAJE_NOMBRE_USUARIO_INVALIDO, 400);
    }

    if (necesitaNombreUsuario) {
      const ocupado = await prisma.usuario.findFirst({
        where: {
          nombreUsuario: nombreUsuarioSolicitado,
          NOT: { id: sesion.usuarioId },
        },
        select: { id: true },
      });

      if (ocupado) {
        return respuestaError(
          "Ese nombre de usuario ya está en uso. Elige otro.",
          409,
        );
      }
    }

    const imagen = formData.get("fotoPerfil");
    const portada = formData.get("portadaPerfil");
    const quitarFotoPerfil = formData.get("eliminarFotoPerfil") === "true";
    const quitarPortada = formData.get("eliminarPortada") === "true";
    let fotoPerfil: string | null | undefined;
    let portadaPerfil: string | null | undefined;

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
    } else if (quitarFotoPerfil) {
      try {
        await eliminarImagenPerfil(sesion.usuarioId);
      } catch (error) {
        console.warn(
          "No se pudo eliminar la imagen de perfil anterior de Cloudinary.",
          error,
        );
      }

      fotoPerfil = null;
    }

    if (portada instanceof File && portada.size > 0) {
      if (!IMAGE_TYPES.has(portada.type)) {
        return respuestaError(
          "La portada debe ser JPG, JPEG, PNG o WebP.",
          400,
        );
      }

      if (portada.size > MAX_IMAGE_SIZE) {
        return respuestaError("La portada no puede pesar más de 5 MB.", 400);
      }

      portadaPerfil = await subirImagenPortada(portada, sesion.usuarioId);
    } else if (quitarPortada) {
      try {
        await eliminarImagenPortada(sesion.usuarioId);
      } catch (error) {
        console.warn("No se pudo eliminar la portada anterior de Cloudinary.", error);
      }

      portadaPerfil = null;
    }

    const datosActualizacion = {
      nombreArtistico: resultado.data.nombreArtistico,
      biografia: resultado.data.biografia || null,
      spotifyUrl: resultado.data.spotifyUrl || null,
      youtubeUrl: resultado.data.youtubeUrl || null,
      instagramUrl: resultado.data.instagramUrl || null,
      distribuidoraPreferida: resultado.data.distribuidoraPreferida || null,
      softwarePreferido: resultado.data.softwarePreferido || null,
      ...(fotoPerfil !== undefined ? { fotoPerfil } : {}),
      ...(portadaPerfil !== undefined ? { portadaPerfil } : {}),
    };

    let usuarioActualizado;

    if (!necesitaNombreUsuario) {
      usuarioActualizado = await prisma.usuario.update({
        where: { id: sesion.usuarioId },
        data: datosActualizacion,
        select: selectPerfilActualizado,
      });
    } else {
      const asignacion = await prisma.usuario.updateMany({
        where: {
          id: sesion.usuarioId,
          nombreUsuario: null,
        },
        data: {
          ...datosActualizacion,
          nombreUsuario: nombreUsuarioSolicitado,
        },
      });

      if (asignacion.count === 0) {
        const usuarioDespues = await prisma.usuario.findUnique({
          where: { id: sesion.usuarioId },
          select: { nombreUsuario: true },
        });

        if (
          normalizarNombreUsuario(usuarioDespues?.nombreUsuario) !==
          nombreUsuarioSolicitado
        ) {
          return respuestaError(
            "Tu nombre de usuario ya fue establecido y es permanente.",
            409,
          );
        }

        usuarioActualizado = await prisma.usuario.update({
          where: { id: sesion.usuarioId },
          data: datosActualizacion,
          select: selectPerfilActualizado,
        });
      } else {
        const usuarioGuardado = await prisma.usuario.findUnique({
          where: { id: sesion.usuarioId },
          select: selectPerfilActualizado,
        });

        if (!usuarioGuardado) {
          return respuestaError("No encontramos tu cuenta.", 404);
        }

        usuarioActualizado = usuarioGuardado;
      }
    }

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
