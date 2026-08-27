// FEATMUSIC_PORTADA_DIRECT_CLOUDINARY_V1
import { NextResponse } from "next/server";

import {
  crearFirmaSubidaDirectaPortadaIdea,
  eliminarImagenPortadaIdea,
  esPublicIdPortadaIdeaUsuario,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PORTADA_SIZE = 5 * 1024 * 1024;
const PORTADA_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json(
    { ok: false, mensaje },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function obtenerExtension(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toLowerCase() ?? "";
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  try {
    const body = (await request.json()) as {
      nombreArchivo?: unknown;
      tamanoBytes?: unknown;
    };

    const nombreArchivo =
      typeof body.nombreArchivo === "string" ? body.nombreArchivo.trim() : "";
    const tamanoBytes = Number(body.tamanoBytes);

    if (!nombreArchivo || !Number.isFinite(tamanoBytes) || tamanoBytes <= 0) {
      return respuestaError("Selecciona una portada válida.", 400);
    }

    if (tamanoBytes > MAX_PORTADA_SIZE) {
      return respuestaError("La portada no puede pesar más de 5 MB.", 400);
    }

    if (!PORTADA_EXTENSIONS.has(obtenerExtension(nombreArchivo))) {
      return respuestaError("La portada debe ser una imagen JPG, PNG o WebP.", 400);
    }

    const firma = crearFirmaSubidaDirectaPortadaIdea(sesion.usuarioId);

    return NextResponse.json(
      { ok: true, ...firma },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("No se pudo preparar la subida directa de la portada.", error);
    return respuestaError(
      "No se pudo preparar la subida de la portada. Inténtalo nuevamente.",
      500,
    );
  }
}

export async function DELETE(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  try {
    const body = (await request.json()) as { publicId?: unknown };
    const publicId =
      typeof body.publicId === "string" ? body.publicId.trim() : "";

    if (!publicId || !esPublicIdPortadaIdeaUsuario(publicId, sesion.usuarioId)) {
      return respuestaError("La portada indicada no es válida.", 400);
    }

    const ideaExistente = await prisma.idea.findFirst({
      where: { portadaPublicId: publicId },
      select: { id: true },
    });

    if (ideaExistente) {
      return NextResponse.json(
        { ok: true, protegido: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    await eliminarImagenPortadaIdea(publicId);

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("No se pudo limpiar la portada temporal.", error);
    return respuestaError("No se pudo limpiar la portada temporal.", 500);
  }
}
