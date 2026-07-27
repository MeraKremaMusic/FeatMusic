export type DatosColaboracionIdea = {
  rolBuscado: string | null;
  generoMusical: string | null;
  idiomaBuscado: string | null;
  modalidadColaboracion: string | null;
  paisPreferido: string | null;
  departamentoPreferido: string | null;
  ciudadPreferida: string | null;
  tipoAcuerdo: string | null;
};

export const OPCIONES_ROL_BUSCADO = [
  ["CANTANTE", "Cantante"],
  ["COMPOSITOR", "Compositor"],
  ["PRODUCTOR", "Productor"],
  ["BEATMAKER", "Beatmaker"],
] as const;

export const OPCIONES_GENERO_MUSICAL = [
  "Urbano",
  "Pop",
  "Reggaetón",
  "Trap",
  "R&B",
  "Afrobeat",
  "Rock",
  "Electrónica",
  "Otro",
] as const;

export const OPCIONES_IDIOMA_BUSCADO = [
  ["ESPANOL", "Español"],
  ["INGLES", "Inglés"],
  ["PORTUGUES", "Portugués"],
  ["CUALQUIERA", "Cualquier idioma"],
] as const;

export const OPCIONES_MODALIDAD_COLABORACION = [
  ["REMOTA", "Remota"],
  ["PRESENCIAL", "Presencial"],
] as const;

export const OPCIONES_TIPO_ACUERDO = [
  ["GRATUITA", "Colaboración gratuita"],
  ["REGALIAS", "Reparto de regalías"],
  ["PAGADO", "Trabajo pagado"],
] as const;

const ETIQUETAS_ROL = Object.fromEntries(OPCIONES_ROL_BUSCADO) as Record<
  string,
  string
>;
const ETIQUETAS_IDIOMA = Object.fromEntries(
  OPCIONES_IDIOMA_BUSCADO,
) as Record<string, string>;
const ETIQUETAS_MODALIDAD = Object.fromEntries(
  OPCIONES_MODALIDAD_COLABORACION,
) as Record<string, string>;
const ETIQUETAS_ACUERDO = Object.fromEntries(
  OPCIONES_TIPO_ACUERDO,
) as Record<string, string>;

export function formatearRolBuscado(valor: string | null | undefined) {
  if (!valor) return null;
  return ETIQUETAS_ROL[valor] ?? valor;
}

export function formatearIdiomaBuscado(valor: string | null | undefined) {
  if (!valor) return null;
  return ETIQUETAS_IDIOMA[valor] ?? valor;
}

export function formatearModalidadColaboracion(
  valor: string | null | undefined,
) {
  if (!valor) return null;
  return ETIQUETAS_MODALIDAD[valor] ?? valor;
}

export function formatearTipoAcuerdo(valor: string | null | undefined) {
  if (!valor) return null;
  return ETIQUETAS_ACUERDO[valor] ?? valor;
}

export function formatearUbicacionPreferida({
  ciudadPreferida,
  departamentoPreferido,
  paisPreferido,
}: Pick<
  DatosColaboracionIdea,
  "ciudadPreferida" | "departamentoPreferido" | "paisPreferido"
>) {
  const partes = [ciudadPreferida, departamentoPreferido, paisPreferido]
    .map((valor) => valor?.trim())
    .filter((valor): valor is string => Boolean(valor));

  if (partes.length === 0) return null;

  return partes.filter((parte, indice) => partes.indexOf(parte) === indice).join(", ");
}
