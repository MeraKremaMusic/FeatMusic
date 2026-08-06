import { enviarReporteUsuarioPorCorreo } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

// FEATMUSIC_API_REPORTES_DIRECTOS_CORREO_V1

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

  /*
   * Solo se consultan las cuentas para comprobar que existan.
   * No se crea ni se actualiza ningún reporte en la base de datos.
   */
  const [reportado, reportante] = await Promise.all([
    prisma.usuario.findFirst({
      where: { nombreUsuario },
      select: { id: true, nombreUsuario: true },
    }),
    prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: { nombreUsuario: true },
    }),
  ]);

  if (!reportado) {
    return Response.json(
      { ok: false, mensaje: "No encontramos un usuario con ese nombre." },
      { status: 404 },
    );
  }

  if (reportado.id === sesion.usuarioId) {
    return Response.json(
      { ok: false, mensaje: "No puedes reportar tu propia cuenta." },
      { status: 400 },
    );
  }

  try {
    await enviarReporteUsuarioPorCorreo({
      reportanteUsuario:
        reportante?.nombreUsuario || `usuario-${sesion.usuarioId}`,
      reportadoUsuario: reportado.nombreUsuario,
      motivo,
      descripcion,
      enviadoEn: new Date(),
    });
  } catch (error) {
    console.error(
      "[FeatMusic] No se pudo enviar el reporte a contact@featmusic.pro.",
      error,
    );

    return Response.json(
      {
        ok: false,
        mensaje:
          "No pudimos enviar el reporte en este momento. Inténtalo nuevamente más tarde.",
      },
      { status: 503 },
    );
  }

  return Response.json(
    {
      ok: true,
      mensaje:
        "Reporte enviado. Gracias por ayudar a proteger la comunidad de FeatMusic.",
    },
    { status: 200 },
  );
}
