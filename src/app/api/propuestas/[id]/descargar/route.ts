import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function convertirId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function limpiarNombre(valor: string) {
  return (
    valor
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 _-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 55) || "audio"
  );
}

function urlCloudinaryValida(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export async function GET(_request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const { id: idTexto } = await contexto.params;
  const propuestaId = convertirId(idTexto);

  if (!propuestaId) {
    return respuestaError(
      "El identificador de la propuesta no es válido.",
      400,
    );
  }

  const propuesta = await prisma.propuesta.findFirst({
    where: {
      id: propuestaId,
      estado: "ACEPTADA",
      OR: [
        {
          idea: {
            usuarioId: sesion.usuarioId,
          },
        },
        {
          remitenteId: sesion.usuarioId,
        },
      ],
    },
    select: {
      audioUrl: true,
      formato: true,
      idea: {
        select: {
          titulo: true,
        },
      },
      remitente: {
        select: {
          nombreArtistico: true,
          nombre: true,
          nombreUsuario: true,
        },
      },
    },
  });

  if (!propuesta) {
    return respuestaError(
      "No se encontró un audio aceptado disponible para tu cuenta.",
      404,
    );
  }

  if (!propuesta.audioUrl) {
    return respuestaError(
      "El archivo de esta propuesta ya no está disponible.",
      410,
    );
  }

  if (propuesta.formato?.toLowerCase() !== "mp3") {
    return respuestaError("El audio todavía no está disponible en MP3.", 409);
  }

  if (!urlCloudinaryValida(propuesta.audioUrl)) {
    return respuestaError("La dirección del audio no es válida.", 500);
  }

  try {
    const audioResponse = await fetch(propuesta.audioUrl, {
      cache: "no-store",
      redirect: "error",
    });

    if (!audioResponse.ok || !audioResponse.body) {
      return respuestaError("No se pudo obtener el archivo de audio.", 502);
    }

    const nombreRemitente =
      propuesta.remitente.nombreArtistico?.trim() ||
      propuesta.remitente.nombre?.trim() ||
      propuesta.remitente.nombreUsuario?.trim() ||
      "artista";

    const nombreArchivo = `${limpiarNombre(
      propuesta.idea.titulo,
    )}-propuesta-${limpiarNombre(nombreRemitente)}.mp3`;

    const headers = new Headers();
    headers.set("Content-Type", "audio/mpeg");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"; filename*=UTF-8''${encodeURIComponent(nombreArchivo)}`,
    );
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    const contentLength = audioResponse.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(audioResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("No se pudo descargar la propuesta.", error);
    return respuestaError("No se pudo descargar el audio.", 502);
  }
}
