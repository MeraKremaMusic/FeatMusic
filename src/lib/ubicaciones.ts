import "server-only";

import {
  getAllCitiesOfCountry,
  getCitiesOfState,
  getCountries,
  getStatesOfCountry,
  type ICity,
  type ICountry,
  type IState,
} from "@countrystatecity/countries";

import {
  CODIGO_SIN_DIVISION,
  type OpcionUbicacion,
} from "@/lib/ubicaciones-compartidas";

export { CODIGO_SIN_DIVISION, type OpcionUbicacion };

export type UbicacionValidada = {
  pais: string;
  departamento: string;
  ciudad: string;
};

const nombresPaises = new Intl.DisplayNames(["es"], { type: "region" });

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

function ordenarOpciones(opciones: OpcionUbicacion[]) {
  return opciones.sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }),
  );
}

function eliminarDuplicados(opciones: OpcionUbicacion[]) {
  const nombresVistos = new Set<string>();

  return opciones.filter((opcion) => {
    const clave = normalizarTexto(opcion.nombre);
    if (nombresVistos.has(clave)) return false;
    nombresVistos.add(clave);
    return true;
  });
}

function obtenerNombrePais(pais: ICountry) {
  return nombresPaises.of(pais.iso2) ?? pais.name;
}

function mapearPais(pais: ICountry): OpcionUbicacion {
  return {
    codigo: pais.iso2.toUpperCase(),
    nombre: obtenerNombrePais(pais),
  };
}

function mapearDepartamento(departamento: IState): OpcionUbicacion {
  return {
    codigo: departamento.iso2.toUpperCase(),
    nombre: departamento.name,
  };
}

function mapearCiudad(ciudad: ICity): OpcionUbicacion {
  return {
    codigo: String(ciudad.id),
    nombre: ciudad.name,
  };
}

export async function obtenerPaises(): Promise<OpcionUbicacion[]> {
  const paises = await getCountries();
  return ordenarOpciones(paises.map(mapearPais));
}

export async function obtenerDepartamentos(
  paisCodigo: string,
): Promise<OpcionUbicacion[]> {
  const codigo = paisCodigo.trim().toUpperCase();
  const departamentos = await getStatesOfCountry(codigo);

  if (departamentos.length === 0) {
    return [{ codigo: CODIGO_SIN_DIVISION, nombre: "No aplica" }];
  }

  return ordenarOpciones(departamentos.map(mapearDepartamento));
}

export async function obtenerCiudades(
  paisCodigo: string,
  departamentoCodigo: string,
): Promise<OpcionUbicacion[]> {
  const pais = paisCodigo.trim().toUpperCase();
  const departamento = departamentoCodigo.trim().toUpperCase();

  const ciudades =
    departamento === CODIGO_SIN_DIVISION
      ? await getAllCitiesOfCountry(pais)
      : await getCitiesOfState(pais, departamento);

  return ordenarOpciones(eliminarDuplicados(ciudades.map(mapearCiudad)));
}

export async function validarUbicacion({
  paisCodigo,
  departamentoCodigo,
  ciudad,
}: {
  paisCodigo: string;
  departamentoCodigo: string;
  ciudad: string;
}): Promise<UbicacionValidada | null> {
  const codigoPais = paisCodigo.trim().toUpperCase();
  const codigoDepartamento = departamentoCodigo.trim().toUpperCase();
  const ciudadNormalizada = normalizarTexto(ciudad);

  const paises = await obtenerPaises();
  const pais = paises.find((opcion) => opcion.codigo === codigoPais);
  if (!pais) return null;

  const departamentos = await obtenerDepartamentos(codigoPais);
  const departamento = departamentos.find(
    (opcion) => opcion.codigo === codigoDepartamento,
  );
  if (!departamento) return null;

  const ciudades = await obtenerCiudades(codigoPais, codigoDepartamento);
  const ciudadEncontrada = ciudades.find(
    (opcion) => normalizarTexto(opcion.nombre) === ciudadNormalizada,
  );

  // Algunos territorios pequeños no tienen ciudades registradas en el catálogo.
  // En ese único caso se permite el valor manual enviado por el usuario.
  if (!ciudadEncontrada && ciudades.length > 0) return null;

  const ciudadLimpia = ciudadEncontrada?.nombre ?? ciudad.trim();
  if (ciudadLimpia.length < 2 || ciudadLimpia.length > 120) return null;

  return {
    pais: pais.nombre,
    departamento: departamento.nombre,
    ciudad: ciudadLimpia,
  };
}
