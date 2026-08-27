import { obtenerAdministradorActual } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ESTADOS_PERMITIDOS = new Set([
  "PENDIENTE",
  "EN_REVISION",
  "RESUELTO",
  "DESCARTADO",
]);

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

type CuerpoEstado = {
  estado?: unknown;
};

export async function PATCH(request: Request, contexto: ContextoRuta) {
  const administrador = await obtenerAdministradorActual();

  if (!administrador) {
    return Response.json(
      { ok: false, mensaje: "No tienes permisos de administrador." },
      { status: 403 },
    );
  }

  const { id: idTexto } = await contexto.params;
  const id = Number(idTexto);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return Response.json(
      { ok: false, mensaje: "El reporte indicado no es válido." },
      { status: 400 },
    );
  }

  let cuerpo: CuerpoEstado;

  try {
    cuerpo = (await request.json()) as CuerpoEstado;
  } catch {
    return Response.json(
      { ok: false, mensaje: "Los datos enviados no son válidos." },
      { status: 400 },
    );
  }

  const estado =
    typeof cuerpo.estado === "string" ? cuerpo.estado.trim().toUpperCase() : "";

  if (!ESTADOS_PERMITIDOS.has(estado)) {
    return Response.json(
      { ok: false, mensaje: "Selecciona un estado de moderación válido." },
      { status: 400 },
    );
  }

  const existente = await prisma.reporteUsuario.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existente) {
    return Response.json(
      { ok: false, mensaje: "No encontramos ese reporte." },
      { status: 404 },
    );
  }

  const reporte = await prisma.reporteUsuario.update({
    where: { id },
    data: { estado },
    select: {
      id: true,
      estado: true,
      actualizadoEn: true,
    },
  });

  return Response.json({
    ok: true,
    reporteId: reporte.id,
    estado: reporte.estado,
    actualizadoEn: reporte.actualizadoEn.toISOString(),
  });
}
