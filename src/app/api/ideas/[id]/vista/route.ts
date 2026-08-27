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
      { ok: false, mensaje: "Inicia sesión para registrar la vista." },
      401,
    );
  }

  const { id: valorId } = await contexto.params;
  const ideaId = obtenerId(valorId);

  if (!ideaId) {
    return respuestaJson({ ok: false, mensaje: "La idea no es válida." }, 400);
  }

  const [idea, visitante] = await prisma.$transaction([
    prisma.idea.findUnique({
      where: { id: ideaId },
      select: {
        id: true,
        usuarioId: true,
        estado: true,
        expiraEn: true,
      },
    }),
    prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: {
        id: true,
        perfilCompleto: true,
      },
    }),
  ]);

  if (!idea) {
    return respuestaJson({ ok: false, mensaje: "La idea no existe." }, 404);
  }

  if (!visitante || !visitante.perfilCompleto) {
    return respuestaJson(
      { ok: false, mensaje: "Completa tu perfil para registrar la vista." },
      403,
    );
  }

  if (idea.usuarioId === sesion.usuarioId) {
    const total = await prisma.vistaIdea.count({ where: { ideaId } });
    return respuestaJson({ ok: true, registrada: false, total });
  }

  if (idea.estado !== "ACTIVA" || idea.expiraEn.getTime() <= Date.now()) {
    return respuestaJson(
      { ok: false, mensaje: "Esta publicación ya no está activa." },
      409,
    );
  }

  let registrada = false;

  try {
    await prisma.vistaIdea.create({
      data: {
        ideaId,
        usuarioId: sesion.usuarioId,
      },
      select: { id: true },
    });
    registrada = true;
  } catch (error) {
    if (codigoErrorPrisma(error) !== "P2002") {
      console.error("No se pudo registrar la vista de la idea.", error);
      return respuestaJson(
        { ok: false, mensaje: "No se pudo registrar la vista." },
        500,
      );
    }
  }

  const total = await prisma.vistaIdea.count({ where: { ideaId } });

  return respuestaJson({
    ok: true,
    registrada,
    total,
  });
}
