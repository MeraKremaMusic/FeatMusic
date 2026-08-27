import { NextResponse } from "next/server";

import { crearNotificacionSegura } from "@/lib/notificaciones";
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

function nombreVisible(usuario: {
  nombre: string | null;
  nombreArtistico: string | null;
  nombreUsuario: string | null;
}) {
  return (
    usuario.nombreArtistico?.trim() ||
    usuario.nombre?.trim() ||
    (usuario.nombreUsuario ? `@${usuario.nombreUsuario}` : null) ||
    "Un artista"
  );
}

function enlacePerfil(usuario: { id: number; nombreUsuario: string | null }) {
  const identificador = usuario.nombreUsuario?.trim() || `artista-${usuario.id}`;
  return `/artistas/${encodeURIComponent(identificador)}`;
}

function codigoErrorPrisma(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return "";
  }

  return String((error as { code?: unknown }).code ?? "");
}

async function obtenerEstado(seguidorId: number, seguidoId: number) {
  const [seguimiento, seguidores] = await prisma.$transaction([
    prisma.seguimiento.findUnique({
      where: {
        seguidorId_seguidoId: {
          seguidorId,
          seguidoId,
        },
      },
      select: { id: true },
    }),
    prisma.seguimiento.count({
      where: { seguidoId },
    }),
  ]);

  return {
    siguiendo: Boolean(seguimiento),
    seguidores,
  };
}

export async function GET(_request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();
  const { id: valorId } = await contexto.params;
  const seguidoId = obtenerId(valorId);

  if (!seguidoId) {
    return respuestaJson({ ok: false, mensaje: "El artista no es válido." }, 400);
  }

  const artista = await prisma.usuario.findFirst({
    where: {
      id: seguidoId,
      perfilCompleto: true,
    },
    select: { id: true },
  });

  if (!artista) {
    return respuestaJson({ ok: false, mensaje: "El artista no existe." }, 404);
  }

  if (!sesion) {
    const seguidores = await prisma.seguimiento.count({ where: { seguidoId } });
    return respuestaJson({ ok: true, siguiendo: false, seguidores });
  }

  const estado = await obtenerEstado(sesion.usuarioId, seguidoId);
  return respuestaJson({ ok: true, ...estado });
}

export async function POST(_request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaJson(
      { ok: false, mensaje: "Inicia sesión para seguir artistas." },
      401,
    );
  }

  const { id: valorId } = await contexto.params;
  const seguidoId = obtenerId(valorId);

  if (!seguidoId) {
    return respuestaJson({ ok: false, mensaje: "El artista no es válido." }, 400);
  }

  if (seguidoId === sesion.usuarioId) {
    return respuestaJson(
      { ok: false, mensaje: "No puedes seguir tu propio perfil." },
      400,
    );
  }

  const [artista, seguidor] = await prisma.$transaction([
    prisma.usuario.findFirst({
      where: {
        id: seguidoId,
        perfilCompleto: true,
      },
      select: {
        id: true,
        nombreUsuario: true,
      },
    }),
    prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: {
        id: true,
        nombre: true,
        nombreArtistico: true,
        nombreUsuario: true,
      },
    }),
  ]);

  if (!artista) {
    return respuestaJson({ ok: false, mensaje: "El artista no existe." }, 404);
  }

  if (!seguidor) {
    return respuestaJson(
      { ok: false, mensaje: "Tu cuenta ya no está disponible." },
      404,
    );
  }

  let seguimientoId: number | null = null;
  let creado = false;

  try {
    const seguimiento = await prisma.seguimiento.create({
      data: {
        seguidorId: sesion.usuarioId,
        seguidoId,
      },
      select: { id: true },
    });

    seguimientoId = seguimiento.id;
    creado = true;
  } catch (error) {
    if (codigoErrorPrisma(error) !== "P2002") {
      console.error("No se pudo seguir al artista.", error);
      return respuestaJson(
        { ok: false, mensaje: "No se pudo seguir al artista." },
        500,
      );
    }
  }

  if (creado) {
    await crearNotificacionSegura({
      usuarioId: seguidoId,
      actorId: sesion.usuarioId,
      tipo: "NUEVO_SEGUIDOR",
      titulo: "Nuevo seguidor",
      mensaje: `${nombreVisible(seguidor)} empezó a seguirte.`,
      enlace: enlacePerfil(seguidor),
      entidadTipo: "SEGUIMIENTO",
      entidadId: seguimientoId,
    });
  }

  const seguidores = await prisma.seguimiento.count({ where: { seguidoId } });

  return respuestaJson({
    ok: true,
    siguiendo: true,
    seguidores,
    mensaje: creado ? "Ahora sigues a este artista." : "Ya seguías a este artista.",
  });
}

export async function DELETE(_request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaJson(
      { ok: false, mensaje: "Inicia sesión para administrar artistas." },
      401,
    );
  }

  const { id: valorId } = await contexto.params;
  const seguidoId = obtenerId(valorId);

  if (!seguidoId) {
    return respuestaJson({ ok: false, mensaje: "El artista no es válido." }, 400);
  }

  if (seguidoId === sesion.usuarioId) {
    return respuestaJson(
      { ok: false, mensaje: "No puedes dejar de seguir tu propio perfil." },
      400,
    );
  }

  await prisma.seguimiento.deleteMany({
    where: {
      seguidorId: sesion.usuarioId,
      seguidoId,
    },
  });

  const seguidores = await prisma.seguimiento.count({ where: { seguidoId } });

  return respuestaJson({
    ok: true,
    siguiendo: false,
    seguidores,
    mensaje: "Dejaste de seguir a este artista.",
  });
}
