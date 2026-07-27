import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

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
      usuarioAId: true,
      usuarioBId: true,
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
    return respuestaError("No tienes permiso para abrir esta conversación.", 403);
  }

  const url = new URL(request.url);
  const despuesDe = convertirId(url.searchParams.get("despuesDe")) ?? 0;

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

  const ahora = new Date();

  await prisma.mensaje.updateMany({
    where: {
      conversacionId,
      remitenteId: {
        not: sesion.usuarioId,
      },
      leidoEn: null,
    },
    data: {
      leidoEn: ahora,
    },
  });

  await prisma.notificacion
    .updateMany({
      where: {
        usuarioId: sesion.usuarioId,
        tipo: "MENSAJE_NUEVO",
        conversacionId,
        leidaEn: null,
      },
      data: {
        leidaEn: ahora,
      },
    })
    .catch((error) => {
      console.error(
        "No se pudieron marcar como leídas las notificaciones del chat.",
        error,
      );
    });

  return respuestaJson({
    ok: true,
    consultadoEn: new Date().toISOString(),
    mensajes: mensajes.map((mensaje) => ({
      ...mensaje,
      creadoEn: mensaje.creadoEn.toISOString(),
      leidoEn: mensaje.leidoEn?.toISOString() ?? null,
    })),
  });
}
