import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import {
  claveLimiteCompuesta,
  consultarLimiteSeguridad,
  limpiarLimiteSeguridad,
  registrarFalloSeguridad,
} from "@/lib/rate-limit";
import { crearSesion, obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    passwordActual: z.string().min(1).max(128),
    passwordNueva: z.string().min(8).max(128),
    repetirPassword: z.string().min(8).max(128),
  })
  .refine((datos) => datos.passwordNueva === datos.repetirPassword, {
    path: ["repetirPassword"],
  });

const MINUTO = 60 * 1000;
const REGLA_PASSWORD_ACTUAL = {
  alcance: "MI_CUENTA_PASSWORD_ACTUAL",
  maxIntentos: 5,
  ventanaMs: 15 * MINUTO,
  bloqueoMs: 15 * MINUTO,
};

function respuestaBloqueada(segundos: number) {
  return Response.json(
    {
      ok: false,
      mensaje:
        "Demasiados intentos con la contraseña actual. Espera unos minutos antes de intentarlo nuevamente.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, segundos)) },
    },
  );
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return Response.json({ ok: false, mensaje: "Tu sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ ok: false, mensaje: "Los datos enviados no son válidos." }, { status: 400 });
  }

  const resultado = schema.safeParse(cuerpo);
  if (!resultado.success) {
    return Response.json({ ok: false, mensaje: "La nueva contraseña debe tener entre 8 y 128 caracteres y ambas copias deben coincidir." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
    select: { id: true, correo: true, passwordHash: true },
  });

  if (!usuario) {
    return Response.json({ ok: false, mensaje: "No encontramos tu cuenta." }, { status: 404 });
  }

  // FEATMUSIC_RATE_LIMIT_PASSWORDS_V1
  const clavePasswordActual = claveLimiteCompuesta(request, usuario.id);
  const limite = await consultarLimiteSeguridad({
    alcance: REGLA_PASSWORD_ACTUAL.alcance,
    claveHash: clavePasswordActual,
    ventanaMs: REGLA_PASSWORD_ACTUAL.ventanaMs,
  });

  if (limite.bloqueado) {
    return respuestaBloqueada(limite.reintentarEnSegundos);
  }

  const actualCorrecta = await bcrypt.compare(
    resultado.data.passwordActual,
    usuario.passwordHash,
  );
  if (!actualCorrecta) {
    const fallo = await registrarFalloSeguridad({
      ...REGLA_PASSWORD_ACTUAL,
      claveHash: clavePasswordActual,
    });

    if (fallo.bloqueado) {
      return respuestaBloqueada(fallo.reintentarEnSegundos);
    }

    return Response.json(
      { ok: false, mensaje: "La contraseña actual es incorrecta." },
      { status: 400 },
    );
  }

  await limpiarLimiteSeguridad(
    REGLA_PASSWORD_ACTUAL.alcance,
    clavePasswordActual,
  );

  if (await bcrypt.compare(resultado.data.passwordNueva, usuario.passwordHash)) {
    return Response.json({ ok: false, mensaje: "La nueva contraseña debe ser diferente de la actual." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(resultado.data.passwordNueva, 12);
  const actualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      passwordHash,
      // FEATMUSIC_MI_CUENTA_V1
      sesionVersion: { increment: 1 },
    },
    select: { id: true, correo: true, sesionVersion: true },
  });

  // El cambio invalida los JWT anteriores. Este dispositivo recibe una sesión
  // nueva con la versión recién incrementada.
  await crearSesion({
    usuarioId: actualizado.id,
    correo: actualizado.correo,
    sesionVersion: actualizado.sesionVersion,
  });

  return Response.json({ ok: true, mensaje: "Contraseña actualizada. Las sesiones abiertas en otros dispositivos fueron cerradas." });
}
