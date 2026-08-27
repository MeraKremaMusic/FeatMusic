import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

// FEATMUSIC_CHAT_USUARIO_ELIMINADO_CERRADO_V1
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CABECERAS_SIN_CACHE = {
  "Cache-Control":
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

const mensajeSchema = z.object({
  contenido: z
    .string()
    .trim()
    .min(1, "Escribe un mensaje antes de enviarlo.")
    .max(2000, "El mensaje no puede superar los 2000 caracteres."),
});

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

function respuestaJson(datos: unknown, status = 200) {
  return NextResponse.json(datos, {
    status,
    headers: CABECERAS_SIN_CACHE,
  });
}

function respuestaError(mensaje: string, status: number) {
  return respuestaJson({ ok: false, mensaje }, status);
}

function convertirId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function POST(request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const { id: idTexto } = await contexto.params;
  const conversacionId = convertirId(idTexto);

  if (!conversacionId) {
    return respuestaError("La conversación no es válida.", 400);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return respuestaError("El contenido enviado no es válido.", 400);
  }

  const resultado = mensajeSchema.safeParse(body);

  if (!resultado.success) {
    return respuestaError(
      resultado.error.issues[0]?.message ?? "El mensaje no es válido.",
      400,
    );
  }

  const conversacion = await prisma.conversacion.findUnique({
    where: {
      id: conversacionId,
    },
    select: {
      usuarioAId: true,
      usuarioBId: true,
      usuarioA: {
        select: { estadoCuenta: true },
      },
      usuarioB: {
        select: { estadoCuenta: true },
      },
      propuestas: {
        where: {
          estado: "ACEPTADA",
        },
        take: 1,
        select: {
          id: true,
        },
      },
    },
  });

  if (!conversacion || conversacion.propuestas.length === 0) {
    return respuestaError("La conversación no está disponible.", 404);
  }

  const participa =
    conversacion.usuarioAId === sesion.usuarioId ||
    conversacion.usuarioBId === sesion.usuarioId;

  if (!participa) {
    return respuestaError("No tienes permiso para enviar mensajes aquí.", 403);
  }

  const otroUsuario =
    conversacion.usuarioAId === sesion.usuarioId
      ? conversacion.usuarioB
      : conversacion.usuarioA;

  if (otroUsuario.estadoCuenta === "ELIMINADA") {
    return respuestaError(
      "Esta cuenta fue eliminada. Ya no puedes enviar mensajes.",
      410,
    );
  }

  try {
    const nuevoMensaje = await prisma.$transaction(async (tx) => {
      const mensaje = await tx.mensaje.create({
        data: {
          conversacionId,
          remitenteId: sesion.usuarioId,
          contenido: resultado.data.contenido,
        },
        select: {
          id: true,
          remitenteId: true,
          contenido: true,
          creadoEn: true,
          leidoEn: true,
        },
      });

      await tx.conversacion.update({
        where: {
          id: conversacionId,
        },
        data: {
          ultimoMensajeEn: mensaje.creadoEn,
          ultimaActividadEn: mensaje.creadoEn,
        },
      });

      return mensaje;
    });

    return respuestaJson({
      ok: true,
      nuevoMensaje: {
        ...nuevoMensaje,
        creadoEn: nuevoMensaje.creadoEn.toISOString(),
        leidoEn: nuevoMensaje.leidoEn?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("No se pudo enviar el mensaje.", error);
    return respuestaError("No se pudo enviar el mensaje.", 500);
  }
}
