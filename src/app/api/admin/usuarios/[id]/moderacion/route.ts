import { obtenerAdministradorActual } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ACCIONES_PERMITIDAS = new Set([
  "ADVERTIR",
  "SUSPENDER_24H",
  "SUSPENDER_7D",
  "SUSPENDER_30D",
  "BLOQUEAR",
  "REACTIVAR",
]);

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

type CuerpoModeracion = {
  accion?: unknown;
  motivo?: unknown;
  reporteId?: unknown;
};

function sumarHoras(fecha: Date, horas: number) {
  return new Date(fecha.getTime() + horas * 60 * 60 * 1000);
}

function descripcionAccion(accion: string) {
  if (accion === "ADVERTIR") return "Advertencia enviada.";
  if (accion === "SUSPENDER_24H") return "Cuenta suspendida durante 24 horas.";
  if (accion === "SUSPENDER_7D") return "Cuenta suspendida durante 7 días.";
  if (accion === "SUSPENDER_30D") return "Cuenta suspendida durante 30 días.";
  if (accion === "BLOQUEAR") return "Cuenta bloqueada.";
  return "Cuenta reactivada.";
}

function tituloNotificacion(accion: string) {
  if (accion === "ADVERTIR") return "Advertencia de FeatMusic";
  if (accion.startsWith("SUSPENDER_")) return "Tu cuenta fue suspendida";
  if (accion === "BLOQUEAR") return "Tu cuenta fue bloqueada";
  return "Tu cuenta fue reactivada";
}

export async function POST(request: Request, contexto: ContextoRuta) {
  const administrador = await obtenerAdministradorActual();

  if (!administrador) {
    return Response.json(
      { ok: false, mensaje: "No tienes permisos de administrador." },
      { status: 403 },
    );
  }

  const { id: idTexto } = await contexto.params;
  const usuarioId = Number(idTexto);

  if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
    return Response.json(
      { ok: false, mensaje: "El usuario indicado no es válido." },
      { status: 400 },
    );
  }

  if (usuarioId === administrador.id) {
    return Response.json(
      { ok: false, mensaje: "No puedes moderar tu propia cuenta ADMIN." },
      { status: 403 },
    );
  }

  let cuerpo: CuerpoModeracion;

  try {
    cuerpo = (await request.json()) as CuerpoModeracion;
  } catch {
    return Response.json(
      { ok: false, mensaje: "Los datos enviados no son válidos." },
      { status: 400 },
    );
  }

  const accion =
    typeof cuerpo.accion === "string" ? cuerpo.accion.trim().toUpperCase() : "";
  const motivo =
    typeof cuerpo.motivo === "string" ? cuerpo.motivo.trim().slice(0, 500) : "";

  if (!ACCIONES_PERMITIDAS.has(accion)) {
    return Response.json(
      { ok: false, mensaje: "Selecciona una acción de moderación válida." },
      { status: 400 },
    );
  }

  if (motivo.length < 10) {
    return Response.json(
      { ok: false, mensaje: "Explica el motivo usando al menos 10 caracteres." },
      { status: 400 },
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      rolSistema: true,
      estadoCuenta: true,
      suspendidoHasta: true,
    },
  });

  if (!usuario) {
    return Response.json(
      { ok: false, mensaje: "No encontramos esa cuenta." },
      { status: 404 },
    );
  }

  if (usuario.rolSistema === "ADMIN") {
    return Response.json(
      {
        ok: false,
        mensaje:
          "Las cuentas ADMIN están protegidas y no pueden sancionarse desde este panel.",
      },
      { status: 403 },
    );
  }

  let reporteId: number | null = null;

  if (cuerpo.reporteId !== undefined && cuerpo.reporteId !== null) {
    const posibleReporteId = Number(cuerpo.reporteId);

    if (!Number.isSafeInteger(posibleReporteId) || posibleReporteId <= 0) {
      return Response.json(
        { ok: false, mensaje: "El reporte asociado no es válido." },
        { status: 400 },
      );
    }

    const reporte = await prisma.reporteUsuario.findFirst({
      where: {
        id: posibleReporteId,
        reportadoId: usuarioId,
      },
      select: { id: true },
    });

    if (!reporte) {
      return Response.json(
        {
          ok: false,
          mensaje: "El reporte no corresponde al usuario que intentas moderar.",
        },
        { status: 400 },
      );
    }

    reporteId = reporte.id;
  }

  const ahora = new Date();
  let suspendidoHasta: Date | null = null;

  if (accion === "SUSPENDER_24H") {
    suspendidoHasta = sumarHoras(ahora, 24);
  } else if (accion === "SUSPENDER_7D") {
    suspendidoHasta = sumarHoras(ahora, 24 * 7);
  } else if (accion === "SUSPENDER_30D") {
    suspendidoHasta = sumarHoras(ahora, 24 * 30);
  }

  const resultado = await prisma.$transaction(async (tx) => {
    if (accion === "BLOQUEAR") {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          estadoCuenta: "BLOQUEADA",
          suspendidoHasta: null,
          motivoRestriccion: motivo,
        },
      });
    } else if (accion === "REACTIVAR") {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          estadoCuenta: "ACTIVA",
          suspendidoHasta: null,
          motivoRestriccion: null,
        },
      });
    } else if (suspendidoHasta) {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: {
          estadoCuenta: "ACTIVA",
          suspendidoHasta,
          motivoRestriccion: motivo,
        },
      });
    }

    const historial = await tx.accionModeracion.create({
      data: {
        usuarioId,
        adminId: administrador.id,
        reporteId,
        accion,
        motivo,
        suspendidoHasta,
      },
      select: {
        id: true,
        accion: true,
        creadoEn: true,
      },
    });

    const mensajeNotificacion =
      accion === "REACTIVAR"
        ? `El acceso a tu cuenta fue restablecido. Motivo: ${motivo}`
        : `${descripcionAccion(accion)} Motivo: ${motivo}`;

    await tx.notificacion.create({
      data: {
        usuarioId,
        actorId: null,
        tipo: `MODERACION_${accion}`,
        titulo: tituloNotificacion(accion),
        mensaje: mensajeNotificacion.slice(0, 500),
        enlace: "/terminos",
        entidadTipo: "MODERACION",
        entidadId: historial.id,
      },
    });

    return historial;
  });

  return Response.json(
    {
      ok: true,
      historialId: resultado.id,
      mensaje: descripcionAccion(accion),
    },
    { status: 200 },
  );
}
