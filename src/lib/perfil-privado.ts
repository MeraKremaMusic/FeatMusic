import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "v1";

function obtenerSecreto() {
  const secreto = process.env.SESSION_SECRET?.trim();

  if (!secreto) {
    throw new Error("Falta SESSION_SECRET en el archivo .env");
  }

  return secreto;
}

function firmaAcceso(usuarioId: number, version: number) {
  return createHmac("sha256", obtenerSecreto())
    .update(`featmusic:perfil-privado:${TOKEN_VERSION}:${usuarioId}:${version}`)
    .digest("base64url");
}

export function crearTokenAccesoPerfilPrivado({
  usuarioId,
  version,
}: {
  usuarioId: number;
  version: number;
}) {
  return `${TOKEN_VERSION}.${firmaAcceso(usuarioId, version)}`;
}

export function verificarAccesoPerfilPrivado({
  usuarioId,
  version,
  token,
}: {
  usuarioId: number;
  version: number;
  token: string | null | undefined;
}) {
  if (!token || typeof token !== "string") return false;

  const esperado = crearTokenAccesoPerfilPrivado({ usuarioId, version });
  const recibidoBuffer = Buffer.from(token, "utf8");
  const esperadoBuffer = Buffer.from(esperado, "utf8");

  if (recibidoBuffer.length !== esperadoBuffer.length) return false;

  return timingSafeEqual(recibidoBuffer, esperadoBuffer);
}

export function crearEnlaceAccesoPerfilPrivado({
  origen,
  nombreUsuario,
  usuarioId,
  version,
}: {
  origen: string;
  nombreUsuario: string;
  usuarioId: number;
  version: number;
}) {
  const base = origen.replace(/\/+$/, "");
  const token = crearTokenAccesoPerfilPrivado({ usuarioId, version });

  return `${base}/artistas/${encodeURIComponent(nombreUsuario)}?acceso=${encodeURIComponent(token)}`;
}
