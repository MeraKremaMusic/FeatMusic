import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

// FEATMUSIC_API_REPORTES_USUARIOS_V1

export const dynamic = "force-dynamic";

const MOTIVOS_PERMITIDOS = new Set([
  "SPAM",
  "SUPLANTACION",
  "ACOSO",
  "CONTENIDO_ROBADO",
  "CONTENIDO_INAPROPIADO",
  "OTRO",
]);

type CuerpoReporte = {
  nombreUsuario?: unknown;
  motivo?: unknown;
  descripcion?: unknown;
};

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : "";
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return Response.json(
      { ok: false, mensaje: "Debes iniciar sesión para enviar un reporte." },
      { status: 401 },
    );
  }

  let cuerpo: CuerpoReporte;

  try {
    cuerpo = (await request.json()) as CuerpoReporte;
  } catch {
    return Response.json(
      { ok: false, mensaje: "El contenido del reporte no es válido." },
      { status: 400 },
    );
  }

  const nombreUsuario = texto(cuerpo.nombreUsuario)
    .replace(/^@+/, "")
    .slice(0, 80);
  const motivo = texto(cuerpo.motivo).toUpperCase();
  const descripcion = texto(cuerpo.descripcion).slice(0, 1000);

  if (nombreUsuario.length < 2) {
    return Response.json(
      { ok: false, mensaje: "Escribe un nombre de usuario válido." },
      { status: 400 },
    );
  }

  if (!MOTIVOS_PERMITIDOS.has(motivo)) {
    return Response.json(
      { ok: false, mensaje: "Selecciona un motivo válido." },
      { status: 400 },
    );
  }

  if (descripcion.length < 20) {
    return Response.json(
      {
        ok: false,
        mensaje: "Explica lo ocurrido usando al menos 20 caracteres.",
      },
      { status: 400 },
    );
  }

  const reportado = await prisma.usuario.findFirst({
    where: {
      nombreUsuario,
    },
    select: {
      id: true,
      nombreUsuario: true,
    },
  });

  if (!reportado) {
    return Response.json(
      {
        ok: false,
        mensaje: "No encontramos un usuario con ese nombre.",
      },
      { status: 404 },
    );
  }

  if (reportado.id === sesion.usuarioId) {
    return Response.json(
      { ok: false, mensaje: "No puedes reportar tu propia cuenta." },
      { status: 400 },
    );
  }

  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const reportesRecientes = await prisma.reporteUsuario.count({
    where: {
      reportanteId: sesion.usuarioId,
      creadoEn: {
        gte: desde,
      },
    },
  });

  if (reportesRecientes >= 5) {
    return Response.json(
      {
        ok: false,
        mensaje:
          "Alcanzaste el límite de reportes por hoy. Inténtalo nuevamente más tarde.",
      },
      { status: 429 },
    );
  }

  const reportePendiente = await prisma.reporteUsuario.findFirst({
    where: {
      reportanteId: sesion.usuarioId,
      reportadoId: reportado.id,
      estado: "PENDIENTE",
      creadoEn: {
        gte: desde,
      },
    },
    select: {
      id: true,
    },
  });

  if (reportePendiente) {
    return Response.json(
      {
        ok: false,
        mensaje:
          "Ya enviaste recientemente un reporte pendiente sobre este usuario.",
      },
      { status: 409 },
    );
  }

  await prisma.reporteUsuario.create({
    data: {
      reportanteId: sesion.usuarioId,
      reportadoId: reportado.id,
      motivo,
      descripcion,
    },
  });

  return Response.json(
    {
      ok: true,
      mensaje:
        "Reporte enviado. Gracias por ayudar a proteger la comunidad de FeatMusic.",
    },
    { status: 201 },
  );
}
