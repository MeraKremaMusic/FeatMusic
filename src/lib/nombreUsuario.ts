export const NOMBRE_USUARIO_MIN = 3;
export const NOMBRE_USUARIO_MAX = 24;
export const NOMBRE_USUARIO_REGEX = /^[a-z0-9._]{3,24}$/;

export const MENSAJE_NOMBRE_USUARIO_INVALIDO =
  "El nombre de usuario debe tener entre 3 y 24 caracteres y usar solo letras, números, punto o guion bajo.";

export function normalizarNombreUsuario(valor: unknown) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "");
}

export function sanitizarEntradaNombreUsuario(valor: string) {
  return normalizarNombreUsuario(valor).replace(/[^a-z0-9._]/g, "");
}

export function nombreUsuarioEsValido(valor: unknown) {
  return NOMBRE_USUARIO_REGEX.test(normalizarNombreUsuario(valor));
}
