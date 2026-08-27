import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import {
  evaluarRestriccionCuenta,
  suspensionYaVencio,
} from "@/lib/moderacion";
import { prisma } from "@/lib/prisma";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("Falta SESSION_SECRET en el archivo .env");
}

const key = new TextEncoder().encode(secret);

// FEATMUSIC_SESION_RECUPERABLE_V1

type SessionPayload = {
  usuarioId: number;
  correo: string;
  sesionVersion?: number;
};

export async function crearSesion(payload: SessionPayload) {
  // FEATMUSIC_MI_CUENTA_V1
  // La versión permite invalidar todas las sesiones anteriores cuando el
  // usuario cambia o restablece su contraseña. Los JWT antiguos equivalen a
  // versión 0, por lo que el despliegue no cierra sesiones existentes.
  let sesionVersion = payload.sesionVersion;

  if (!Number.isSafeInteger(sesionVersion) || Number(sesionVersion) < 0) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.usuarioId },
      select: { sesionVersion: true },
    });

    if (!usuario) {
      throw new Error("No se pudo crear la sesión porque el usuario no existe.");
    }

    sesionVersion = usuario.sesionVersion;
  }

  const token = await new SignJWT({
    usuarioId: payload.usuarioId,
    correo: payload.correo,
    sesionVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  const cookieStore = await cookies();

  cookieStore.set("featmusic_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function obtenerSesion() {
  const cookieStore = await cookies();
  const token = cookieStore.get("featmusic_session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, key);
    const usuarioId = Number(payload.usuarioId);
    const correo =
      typeof payload.correo === "string" ? payload.correo.trim() : "";
    const sesionVersion = Number(payload.sesionVersion ?? 0);

    // Un JWT correctamente firmado también puede contener datos antiguos o
    // incompletos. No se considera sesión si su identidad no es utilizable.
    if (
      !Number.isSafeInteger(usuarioId) ||
      usuarioId <= 0 ||
      !correo ||
      !Number.isSafeInteger(sesionVersion) ||
      sesionVersion < 0
    ) {
      return null;
    }

    // FEATMUSIC_ADMIN_FASE2_MODERACION_V1
    // La sesión se valida contra la BD en cada solicitud. Así una suspensión
    // o un bloqueo también afecta sesiones que ya estaban abiertas.
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        correo: true,
        estadoCuenta: true,
        suspendidoHasta: true,
        sesionVersion: true,
      },
    });

    if (
      !usuario ||
      usuario.correo.toLowerCase() !== correo.toLowerCase() ||
      usuario.sesionVersion !== sesionVersion
    ) {
      return null;
    }

    const ahora = new Date();
    const restriccion = evaluarRestriccionCuenta(usuario, ahora);

    if (restriccion) {
      return null;
    }

    // Al primer acceso posterior al vencimiento limpiamos la restricción
    // temporal. El historial administrativo permanece intacto.
    if (suspensionYaVencio(usuario, ahora)) {
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          suspendidoHasta: null,
          motivoRestriccion: null,
        },
      });
    }

    return { usuarioId, correo };
  } catch {
    return null;
  }
}

export async function eliminarSesion() {
  const cookieStore = await cookies();
  cookieStore.set("featmusic_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
