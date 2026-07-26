import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const estadoSchema = z.object({
  estado: z.enum(["ACEPTADA", "RECHAZADA"]),
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

export async function PATCH(request: Request, contexto: ContextoRuta) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return respuestaError("El contenido enviado no es válido.", 400);
  }

  const resultado = estadoSchema.safeParse(body);

  if (!resultado.success) {
    return respuestaError(
      resultado.error.issues[0]?.message ?? "El estado no es válido.",
      400,
    );
  }

  const propuesta = await prisma.propuesta.findFirst({
    where: {
      id: propuestaId,
      idea: {
        usuarioId: sesion.usuarioId,
        estado: "ACTIVA",
        expiraEn: { gt: new Date() },
      },
    },
    select: {
      id: true,
    },
  });

  if (!propuesta) {
    return respuestaError(
      "No se encontró la propuesta o no tienes permiso para modificarla.",
      404,
    );
  }

  try {
    const actualizada = await prisma.propuesta.update({
      where: {
        id: propuesta.id,
      },
      data: {
        estado: resultado.data.estado,
      },
      select: {
        id: true,
        estado: true,
        actualizadoEn: true,
      },
    });

    return NextResponse.json({
      ok: true,
      mensaje:
        actualizada.estado === "ACEPTADA"
          ? "Propuesta aceptada."
          : "Propuesta rechazada.",
      propuesta: {
        ...actualizada,
        actualizadoEn: actualizada.actualizadoEn.toISOString(),
      },
    });
  } catch (error) {
    console.error("No se pudo actualizar la propuesta.", error);

    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar la propuesta.",
      500,
    );
  }
}
