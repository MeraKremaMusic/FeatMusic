import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error("Falta SESSION_SECRET en el archivo .env");
}

const key = new TextEncoder().encode(secret);

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

    return {
      usuarioId: Number(payload.usuarioId),
      correo: String(payload.correo),
    };
  } catch {
    return null;
  }
}

export async function eliminarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete("featmusic_session");
}