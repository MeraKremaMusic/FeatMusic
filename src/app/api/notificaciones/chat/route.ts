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

function respuestaJson(datos: unknown, status = 200) {
  return NextResponse.json(datos, {
    status,
    headers: CABECERAS_SIN_CACHE,
  });
}

export async function GET() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaJson(
      {
        ok: false,
        mensaje: "Tu sesión expiró. Inicia sesión nuevamente.",
      },
      401,
    );
  }

  try {
    const chats = await prisma.conversacion.findMany({
      where: {
        OR: [
          {
            usuarioAId: sesion.usuarioId,
          },
          {
            usuarioBId: sesion.usuarioId,
          },
        ],
        propuestas: {
          some: {
            estado: "ACEPTADA",
          },
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            mensajes: {
              where: {
                remitenteId: {
                  not: sesion.usuarioId,
                },
                leidoEn: null,
              },
            },
          },
        },
      },
    });

    const conversaciones = chats.flatMap((chat) => {
      const cantidad = chat._count.mensajes;

      if (cantidad <= 0) {
        return [];
      }

      return [
        {
          conversacionId: chat.id,
          cantidad,
        },
      ];
    });

    const total = conversaciones.reduce(
      (acumulado, conversacion) => acumulado + conversacion.cantidad,
      0,
    );

    return respuestaJson({
      ok: true,
      total,
      conversaciones,
      consultadoEn: new Date().toISOString(),
    });
  } catch (error) {
    console.error("No se pudieron consultar los mensajes sin leer.", error);

    return respuestaJson(
      {
        ok: false,
        mensaje: "No se pudieron consultar las notificaciones del chat.",
      },
      500,
    );
  }
}
