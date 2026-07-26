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
    const propuestas = await prisma.propuesta.findMany({
      where: {
        estado: "ACEPTADA",
        OR: [
          {
            remitenteId: sesion.usuarioId,
          },
          {
            idea: {
              usuarioId: sesion.usuarioId,
            },
          },
        ],
      },
      select: {
        conversacion: {
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
        },
      },
    });

    const conversaciones = propuestas.flatMap((propuesta) => {
      const conversacion = propuesta.conversacion;
      const cantidad = conversacion?._count.mensajes ?? 0;

      if (!conversacion || cantidad <= 0) {
        return [];
      }

      return [
        {
          conversacionId: conversacion.id,
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
