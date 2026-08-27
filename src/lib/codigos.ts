import { randomInt } from "crypto";

export const DURACION_CODIGO_MINUTOS = 10;
export const ESPERA_REENVIO_SEGUNDOS = 60;
export const MAXIMO_INTENTOS_CODIGO = 5;

export function crearCodigoVerificacion() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function fechaExpiracionCodigo() {
  return new Date(Date.now() + DURACION_CODIGO_MINUTOS * 60 * 1000);
}

export function segundosHastaReenvio(ultimoEnvioEn: Date) {
  const segundosTranscurridos = Math.floor(
    (Date.now() - ultimoEnvioEn.getTime()) / 1000,
  );

  return Math.max(0, ESPERA_REENVIO_SEGUNDOS - segundosTranscurridos);
}
