import { NextResponse } from "next/server";

import { obtenerLimitesPlan, normalizarPlan } from "@/lib/planes";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import { sincronizarPlanUsuario } from "@/lib/suscripciones";

export const dynamic = "force-dynamic";

export async function GET() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return NextResponse.json(
      { ok: false, mensaje: "Tu sesión expiró. Inicia sesión nuevamente." },
      { status: 401 },
    );
  }

  const estadoSuscripcion = await sincronizarPlanUsuario(sesion.usuarioId);

  const [usuario, ideasActivas] = await prisma.$transaction([
    prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: { plan: true },
    }),
    prisma.idea.count({
      where: {
        usuarioId: sesion.usuarioId,
        estado: "ACTIVA",
        expiraEn: { gt: new Date() },
      },
    }),
  ]);

  if (!usuario) {
    return NextResponse.json(
      { ok: false, mensaje: "No se encontró tu cuenta." },
      { status: 404 },
    );
  }

  const plan = normalizarPlan(usuario.plan);
  const limites = obtenerLimitesPlan(plan);

  return NextResponse.json(
    {
      ok: true,
      plan,
      ideasActivas,
      limiteIdeasActivas: limites.ideasActivas,
      propuestasPorIdea: limites.propuestasPorIdea,
      planProgramado: estadoSuscripcion?.suscripcion?.planProgramado ?? null,
      cambioPlanEn:
        estadoSuscripcion?.suscripcion?.cambioPlanEn?.toISOString() ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
