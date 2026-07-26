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

function convertirId(valor: string | null) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const { id: idTexto } = await contexto.params;
  const conversacionId = convertirId(idTexto);

  if (!conversacionId) {
    return respuestaError("La conversación no es válida.", 400);
  }

  const conversacion = await prisma.conversacion.findUnique({
    where: {
      id: conversacionId,
    },
    select: {
      id: true,
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
    return respuestaError("No tienes permiso para abrir esta conversación.", 403);
  }

  const url = new URL(request.url);
  const despuesDe =
    convertirId(url.searchParams.get("despuesDe")) ?? 0;

  const mensajes = await prisma.mensaje.findMany({
    where: {
      conversacionId,
      id: {
        gt: despuesDe,
      },
    },
    orderBy: {
      id: "asc",
    },
    take: 100,
    select: {
      id: true,
      remitenteId: true,
      contenido: true,
      creadoEn: true,
      leidoEn: true,
    },
  });

  await prisma.mensaje.updateMany({
    where: {
      conversacionId,
      remitenteId: {
        not: sesion.usuarioId,
      },
      leidoEn: null,
    },
    data: {
      leidoEn: new Date(),
    },
  });

  return NextResponse.json({
    ok: true,
    mensajes: mensajes.map((mensaje) => ({
      ...mensaje,
      creadoEn: mensaje.creadoEn.toISOString(),
      leidoEn: mensaje.leidoEn?.toISOString() ?? null,
    })),
  });
}
