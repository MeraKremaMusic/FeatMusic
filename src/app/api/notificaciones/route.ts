import { NextResponse } from "next/server";
import { z } from "zod";

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

const accionSchema = z.discriminatedUnion("accion", [
  z.object({
    accion: z.literal("MARCAR_LEIDA"),
    id: z.number().int().positive(),
  }),
  z.object({
    accion: z.literal("MARCAR_TODAS"),
  }),
]);

function respuestaJson(datos: unknown, status = 200) {
  return NextResponse.json(datos, {
    status,
    headers: CABECERAS_SIN_CACHE,
  });
}

function nombreVisible(actor: {
  nombre: string | null;
  nombreArtistico: string | null;
  nombreUsuario: string | null;
}) {
  return (
    actor.nombreArtistico?.trim() ||
    actor.nombre?.trim() ||
    (actor.nombreUsuario ? `@${actor.nombreUsuario}` : null) ||
    "Artista de FeatMusic"
  );
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
    const [notificaciones, totalNoLeidas] = await prisma.$transaction([
      prisma.notificacion.findMany({
        where: {
          usuarioId: sesion.usuarioId,
          tipo: {
            not: "MENSAJE_NUEVO",
          },
        },
        orderBy: {
          creadoEn: "desc",
        },
        take: 60,
        select: {
          id: true,
          tipo: true,
          titulo: true,
          mensaje: true,
          enlace: true,
          entidadTipo: true,
          entidadId: true,
          conversacionId: true,
          leidaEn: true,
          creadoEn: true,
          actor: {
            select: {
              id: true,
              nombre: true,
              nombreArtistico: true,
              nombreUsuario: true,
              fotoPerfil: true,
            },
          },
        },
      }),
      prisma.notificacion.count({
        where: {
          usuarioId: sesion.usuarioId,
          tipo: {
            not: "MENSAJE_NUEVO",
          },
          leidaEn: null,
        },
      }),
    ]);

    return respuestaJson({
      ok: true,
      totalNoLeidas,
      notificaciones: notificaciones.map((notificacion) => ({
        ...notificacion,
        actor: notificacion.actor
          ? {
              id: notificacion.actor.id,
              nombreVisible: nombreVisible(notificacion.actor),
              nombreUsuario: notificacion.actor.nombreUsuario,
              fotoPerfil: notificacion.actor.fotoPerfil,
            }
          : null,
        leidaEn: notificacion.leidaEn?.toISOString() ?? null,
        creadoEn: notificacion.creadoEn.toISOString(),
      })),
    });
  } catch (error) {
    console.error("No se pudieron cargar las notificaciones.", error);

    return respuestaJson(
      {
        ok: false,
        mensaje: "No se pudieron cargar las notificaciones.",
      },
      500,
    );
  }
}

export async function PATCH(request: Request) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return respuestaJson(
      {
        ok: false,
        mensaje: "El contenido enviado no es válido.",
      },
      400,
    );
  }

  const resultado = accionSchema.safeParse(body);

  if (!resultado.success) {
    return respuestaJson(
      {
        ok: false,
        mensaje:
          resultado.error.issues[0]?.message ??
          "La acción de notificación no es válida.",
      },
      400,
    );
  }

  try {
    const ahora = new Date();

    if (resultado.data.accion === "MARCAR_TODAS") {
      const actualizadas = await prisma.notificacion.updateMany({
        where: {
          usuarioId: sesion.usuarioId,
          tipo: {
            not: "MENSAJE_NUEVO",
          },
          leidaEn: null,
        },
        data: {
          leidaEn: ahora,
        },
      });

      return respuestaJson({
        ok: true,
        actualizadas: actualizadas.count,
        leidaEn: ahora.toISOString(),
      });
    }

    const actualizada = await prisma.notificacion.updateMany({
      where: {
        id: resultado.data.id,
        usuarioId: sesion.usuarioId,
        tipo: {
          not: "MENSAJE_NUEVO",
        },
        leidaEn: null,
      },
      data: {
        leidaEn: ahora,
      },
    });

    return respuestaJson({
      ok: true,
      actualizadas: actualizada.count,
      leidaEn: ahora.toISOString(),
    });
  } catch (error) {
    console.error("No se pudo actualizar la notificación.", error);

    return respuestaJson(
      {
        ok: false,
        mensaje: "No se pudo actualizar la notificación.",
      },
      500,
    );
  }
}
