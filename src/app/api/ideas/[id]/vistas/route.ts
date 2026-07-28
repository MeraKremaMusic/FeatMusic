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

const ELEMENTOS_POR_PAGINA = 20;

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

function obtenerEnteroPositivo(valor: string | null | undefined) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function nombreVisible(usuario: {
  id: number;
  nombre: string | null;
  nombreArtistico: string | null;
}) {
  return (
    usuario.nombreArtistico?.trim() ||
    usuario.nombre?.trim() ||
    `Artista ${usuario.id}`
  );
}

function usuarioVisible(usuario: { id: number; nombreUsuario: string | null }) {
  return usuario.nombreUsuario?.trim() || `artista-${usuario.id}`;
}

export async function GET(request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaJson(
      { ok: false, mensaje: "Inicia sesión para ver esta información." },
      401,
    );
  }

  const { id: valorId } = await contexto.params;
  const ideaId = obtenerEnteroPositivo(valorId);

  if (!ideaId) {
    return respuestaJson({ ok: false, mensaje: "La idea no es válida." }, 400);
  }

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: {
      id: true,
      usuarioId: true,
      titulo: true,
    },
  });

  if (!idea) {
    return respuestaJson({ ok: false, mensaje: "La idea no existe." }, 404);
  }

  if (idea.usuarioId !== sesion.usuarioId) {
    return respuestaJson(
      {
        ok: false,
        mensaje: "Solo el propietario puede ver quién visitó esta publicación.",
      },
      403,
    );
  }

  const url = new URL(request.url);
  const paginaSolicitada = obtenerEnteroPositivo(url.searchParams.get("pagina")) ?? 1;
  const total = await prisma.vistaIdea.count({ where: { ideaId } });
  const totalPaginas = Math.max(1, Math.ceil(total / ELEMENTOS_POR_PAGINA));
  const pagina = Math.min(paginaSolicitada, totalPaginas);

  const vistas = await prisma.vistaIdea.findMany({
    where: { ideaId },
    orderBy: [{ vistaEn: "desc" }, { id: "desc" }],
    skip: (pagina - 1) * ELEMENTOS_POR_PAGINA,
    take: ELEMENTOS_POR_PAGINA,
    select: {
      id: true,
      vistaEn: true,
      usuario: {
        select: {
          id: true,
          nombre: true,
          nombreArtistico: true,
          nombreUsuario: true,
          fotoPerfil: true,
          rolPrincipal: true,
          ciudad: true,
          pais: true,
          seguidores: {
            where: { seguidorId: sesion.usuarioId },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });

  return respuestaJson({
    ok: true,
    idea: {
      id: idea.id,
      titulo: idea.titulo,
    },
    artistas: vistas.map((vista) => ({
      vistaId: vista.id,
      vistaEn: vista.vistaEn.toISOString(),
      id: vista.usuario.id,
      nombreArtistico: nombreVisible(vista.usuario),
      nombreUsuario: usuarioVisible(vista.usuario),
      fotoPerfil: vista.usuario.fotoPerfil,
      rol: vista.usuario.rolPrincipal,
      ciudad: vista.usuario.ciudad,
      pais: vista.usuario.pais,
      siguiendo: vista.usuario.seguidores.length > 0,
    })),
    pagina,
    totalPaginas,
    total,
  });
}
