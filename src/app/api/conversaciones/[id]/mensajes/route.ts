import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
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
      propuesta: {
        select: {
          estado: true,
          remitenteId: true,
          idea: {
            select: {
              usuarioId: true,
            },
          },
        },
      },
    },
  });

  if (!conversacion || conversacion.propuesta.estado !== "ACEPTADA") {
    return respuestaError("La conversación no está disponible.", 404);
  }

  const participa =
    conversacion.propuesta.remitenteId === sesion.usuarioId ||
    conversacion.propuesta.idea.usuarioId === sesion.usuarioId;

  if (!participa) {
    return respuestaError("No tienes permiso para enviar mensajes aquí.", 403);
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
        },
      });

      return mensaje;
    });

    return NextResponse.json({
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
