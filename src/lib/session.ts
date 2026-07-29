import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("Falta SESSION_SECRET en el archivo .env");
}

const key = new TextEncoder().encode(secret);

// FEATMUSIC_SESION_RECUPERABLE_V1

type SessionPayload = {
  usuarioId: number;
  correo: string;
};

export async function crearSesion(payload: SessionPayload) {
  const token = await new SignJWT({
    usuarioId: payload.usuarioId,
    correo: payload.correo,
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

    // Un JWT correctamente firmado también puede contener datos antiguos o
    // incompletos. No se considera sesión si su identidad no es utilizable.
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0 || !correo) {
      return null;
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
