import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ESTADOS_QUE_OCUPAN_CUPO = [
  "PENDIENTE",
  "CAMBIOS_SOLICITADOS",
  "ACEPTADA",
  "RECHAZANDO",
];
const MAX_PROPUESTAS = 3;

const CABECERAS_SIN_CACHE = {
  "Cache-Control":
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

type ContextoRuta = {
  params: Promise<{
    id: string;
  }>;
};

function respuestaJson(datos: unknown, status = 200) {
  return NextResponse.json(datos, {
    status,
    headers: CABECERAS_SIN_CACHE,
  });
}

function obtenerId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function codigoErrorPrisma(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return "";
  }

  return String((error as { code?: unknown }).code ?? "");
}

export async function POST(_request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaJson(
      { ok: false, mensaje: "Inicia sesión para guardar oportunidades." },
      401,
    );
  }

  const { id: valorId } = await contexto.params;
  const ideaId = obtenerId(valorId);

  if (!ideaId) {
    return respuestaJson({ ok: false, mensaje: "La idea no es válida." }, 400);
  }

  const [idea, usuario] = await prisma.$transaction([
    prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        id: true,
        usuarioId: true,
        estado: true,
        expiraEn: true,
        _count: {
          select: {
            propuestas: {
              where: { estado: { in: ESTADOS_QUE_OCUPAN_CUPO } },
            },
          },
        },
      },
    }),
    prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: { id: true, perfilCompleto: true },
    }),
  ]);

  if (!idea) {
    return respuestaJson({ ok: false, mensaje: "La idea no existe." }, 404);
  }

  if (!usuario || !usuario.perfilCompleto) {
    return respuestaJson(
      { ok: false, mensaje: "Completa tu perfil para guardar oportunidades." },
      403,
    );
  }

  if (idea.usuarioId === sesion.usuarioId) {
    return respuestaJson(
      { ok: false, mensaje: "No necesitas guardar tu propia idea." },
      400,
    );
  }

  if (idea.estado !== "ACTIVA" || idea.expiraEn.getTime() <= Date.now()) {
    return respuestaJson(
      { ok: false, mensaje: "Esta oportunidad ya no está activa." },
      409,
    );
  }

  if (idea._count.propuestas >= MAX_PROPUESTAS) {
    return respuestaJson(
      { ok: false, mensaje: "Esta oportunidad ya no tiene cupos disponibles." },
      409,
    );
  }

  try {
    await prisma.ideaGuardada.create({
      data: {
        usuarioId: sesion.usuarioId,
        ideaId,
      },
      select: { id: true },
    });
  } catch (error) {
    if (codigoErrorPrisma(error) !== "P2002") {
      console.error("No se pudo guardar la oportunidad.", error);
      return respuestaJson(
        { ok: false, mensaje: "No se pudo guardar la oportunidad." },
        500,
      );
    }
  }

  return respuestaJson({
    ok: true,
    guardada: true,
    mensaje: "Oportunidad guardada.",
  });
}

export async function DELETE(_request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaJson(
      { ok: false, mensaje: "Inicia sesión para administrar tus guardadas." },
      401,
    );
  }

  const { id: valorId } = await contexto.params;
  const ideaId = obtenerId(valorId);

  if (!ideaId) {
    return respuestaJson({ ok: false, mensaje: "La idea no es válida." }, 400);
  }

  await prisma.ideaGuardada.deleteMany({
    where: {
      usuarioId: sesion.usuarioId,
      ideaId,
    },
  });

  return respuestaJson({
    ok: true,
    guardada: false,
    mensaje: "Oportunidad eliminada de Guardadas.",
  });
}
