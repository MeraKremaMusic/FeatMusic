"use client";

import { useEffect, useState } from "react";

import {
  CODIGO_SIN_DIVISION,
  type OpcionUbicacion,
} from "@/lib/ubicaciones-compartidas";

type SelectorUbicacionProps = {
  paisInicial?: string | null;
  departamentoInicial?: string | null;
  ciudadInicial?: string | null;
};

type RespuestaUbicaciones = {
  ok: boolean;
  opciones?: OpcionUbicacion[];
  mensaje?: string;
};

const claseSelector =
  "w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-50";

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

function buscarPorNombre(opciones: OpcionUbicacion[], nombre?: string | null) {
  if (!nombre?.trim()) return undefined;
  const buscado = normalizar(nombre);
  return opciones.find((opcion) => normalizar(opcion.nombre) === buscado);
}

async function consultarUbicaciones(params?: {
  pais?: string;
  departamento?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.pais) searchParams.set("pais", params.pais);
  if (params?.departamento) {
    searchParams.set("departamento", params.departamento);
  }

  const query = searchParams.toString();
  const respuesta = await fetch(`/api/ubicaciones${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  const datos = (await respuesta.json()) as RespuestaUbicaciones;

  if (!respuesta.ok || !datos.ok || !datos.opciones) {
    throw new Error(datos.mensaje ?? "No se pudieron cargar las ubicaciones.");
  }

  return datos.opciones;
}

export default function SelectorUbicacion({
  paisInicial,
  departamentoInicial,
  ciudadInicial,
}: SelectorUbicacionProps) {
  const [paises, setPaises] = useState<OpcionUbicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<OpcionUbicacion[]>([]);
  const [ciudades, setCiudades] = useState<OpcionUbicacion[]>([]);
  const [paisCodigo, setPaisCodigo] = useState("");
  const [departamentoCodigo, setDepartamentoCodigo] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [cargandoPaises, setCargandoPaises] = useState(true);
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(false);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      try {
        setCargandoPaises(true);
        setError("");
        const paisesCargados = await consultarUbicaciones();
        if (!activo) return;
        setPaises(paisesCargados);

        const paisGuardado = buscarPorNombre(paisesCargados, paisInicial);
        if (!paisGuardado) return;

        setPaisCodigo(paisGuardado.codigo);
        setCargandoDepartamentos(true);
        const departamentosCargados = await consultarUbicaciones({
          pais: paisGuardado.codigo,
        });
        if (!activo) return;
        setDepartamentos(departamentosCargados);

        const departamentoGuardado =
          buscarPorNombre(departamentosCargados, departamentoInicial) ??
          (departamentosCargados.length === 1
            ? departamentosCargados[0]
            : undefined);
        if (!departamentoGuardado) return;

        setDepartamentoCodigo(departamentoGuardado.codigo);
        setCargandoCiudades(true);
        const ciudadesCargadas = await consultarUbicaciones({
          pais: paisGuardado.codigo,
          departamento: departamentoGuardado.codigo,
        });
        if (!activo) return;
        setCiudades(ciudadesCargadas);

        const ciudadGuardada = buscarPorNombre(ciudadesCargadas, ciudadInicial);
        if (ciudadGuardada) {
          setCiudad(ciudadGuardada.nombre);
        } else if (ciudadesCargadas.length === 0 && ciudadInicial?.trim()) {
          setCiudad(ciudadInicial.trim());
        }
      } catch (errorInicializacion) {
        if (!activo) return;
        setError(
          errorInicializacion instanceof Error
            ? errorInicializacion.message
            : "No se pudieron cargar las ubicaciones.",
        );
      } finally {
        if (activo) {
          setCargandoPaises(false);
          setCargandoDepartamentos(false);
          setCargandoCiudades(false);
        }
      }
    }

    void inicializar();
    return () => {
      activo = false;
    };
  }, [paisInicial, departamentoInicial, ciudadInicial]);

  async function cambiarPais(nuevoPaisCodigo: string) {
    setPaisCodigo(nuevoPaisCodigo);
    setDepartamentoCodigo("");
    setCiudad("");
    setDepartamentos([]);
    setCiudades([]);
    setError("");

    if (!nuevoPaisCodigo) return;

    try {
      setCargandoDepartamentos(true);
      const opciones = await consultarUbicaciones({ pais: nuevoPaisCodigo });
      setDepartamentos(opciones);

      if (opciones.length === 1 && opciones[0].codigo === CODIGO_SIN_DIVISION) {
        const unicoDepartamento = opciones[0].codigo;
        setDepartamentoCodigo(unicoDepartamento);
        setCargandoCiudades(true);
        const ciudadesCargadas = await consultarUbicaciones({
          pais: nuevoPaisCodigo,
          departamento: unicoDepartamento,
        });
        setCiudades(ciudadesCargadas);
      }
    } catch (errorPais) {
      setError(
        errorPais instanceof Error
          ? errorPais.message
          : "No se pudieron cargar los departamentos.",
      );
    } finally {
      setCargandoDepartamentos(false);
      setCargandoCiudades(false);
    }
  }

  async function cambiarDepartamento(nuevoDepartamentoCodigo: string) {
    setDepartamentoCodigo(nuevoDepartamentoCodigo);
    setCiudad("");
    setCiudades([]);
    setError("");

    if (!paisCodigo || !nuevoDepartamentoCodigo) return;

    try {
      setCargandoCiudades(true);
      const opciones = await consultarUbicaciones({
        pais: paisCodigo,
        departamento: nuevoDepartamentoCodigo,
      });
      setCiudades(opciones);
    } catch (errorDepartamento) {
      setError(
        errorDepartamento instanceof Error
          ? errorDepartamento.message
          : "No se pudieron cargar las ciudades.",
      );
    } finally {
      setCargandoCiudades(false);
    }
  }

  const sinCiudadesRegistradas =
    Boolean(paisCodigo && departamentoCodigo) &&
    !cargandoCiudades &&
    ciudades.length === 0;

  return (
    <div className="space-y-3">
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">País</span>
          <select
            required
            name="paisCodigo"
            value={paisCodigo}
            disabled={cargandoPaises}
            onChange={(event) => void cambiarPais(event.target.value)}
            className={claseSelector}
          >
            <option value="">
              {cargandoPaises ? "Cargando países..." : "Selecciona un país"}
            </option>
            {paises.map((pais) => (
              <option key={pais.codigo} value={pais.codigo}>
                {pais.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Departamento / estado
          </span>
          <select
            required
            name="departamentoCodigo"
            value={departamentoCodigo}
            disabled={!paisCodigo || cargandoDepartamentos}
            onChange={(event) => void cambiarDepartamento(event.target.value)}
            className={claseSelector}
          >
            <option value="">
              {cargandoDepartamentos
                ? "Cargando departamentos..."
                : paisCodigo
                  ? "Selecciona un departamento"
                  : "Primero selecciona un país"}
            </option>
            {departamentos.map((departamento) => (
              <option key={departamento.codigo} value={departamento.codigo}>
                {departamento.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Ciudad</span>
          {sinCiudadesRegistradas ? (
            <input
              required
              name="ciudad"
              value={ciudad}
              maxLength={120}
              onChange={(event) => setCiudad(event.target.value)}
              placeholder="Escribe tu ciudad"
              className={claseSelector}
            />
          ) : (
            <select
              required
              name="ciudad"
              value={ciudad}
              disabled={!departamentoCodigo || cargandoCiudades}
              onChange={(event) => setCiudad(event.target.value)}
              className={claseSelector}
            >
              <option value="">
                {cargandoCiudades
                  ? "Cargando ciudades..."
                  : departamentoCodigo
                    ? "Selecciona una ciudad"
                    : "Primero selecciona un departamento"}
              </option>
              {ciudades.map((opcionCiudad) => (
                <option key={opcionCiudad.codigo} value={opcionCiudad.nombre}>
                  {opcionCiudad.nombre}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      {sinCiudadesRegistradas ? (
        <p className="text-xs text-yellow-300">
          El catálogo no tiene ciudades para este territorio; por eso se habilitó
          la escritura manual.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-yellow-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
