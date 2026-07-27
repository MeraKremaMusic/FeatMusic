"use client";

import { useEffect, useState } from "react";

import {
  CODIGO_SIN_DIVISION,
  type OpcionUbicacion,
} from "@/lib/ubicaciones-compartidas";

export type UbicacionIdeaSeleccionada = {
  paisCodigo: string;
  paisNombre: string;
  departamentoCodigo: string;
  departamentoNombre: string;
  ciudad: string;
};

type SelectorUbicacionIdeaProps = {
  valor: UbicacionIdeaSeleccionada;
  onChange: (valor: UbicacionIdeaSeleccionada) => void;
  requerida: boolean;
  disabled?: boolean;
};

type RespuestaUbicaciones = {
  ok: boolean;
  opciones?: OpcionUbicacion[];
  mensaje?: string;
};

const CLASE_SELECTOR =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-violet-400/40 disabled:cursor-not-allowed disabled:opacity-45";

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
  const response = await fetch(`/api/ubicaciones${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  const data = (await response.json()) as RespuestaUbicaciones;

  if (!response.ok || !data.ok || !data.opciones) {
    throw new Error(data.mensaje ?? "No se pudieron cargar las ubicaciones.");
  }

  return data.opciones;
}

export default function SelectorUbicacionIdea({
  valor,
  onChange,
  requerida,
  disabled = false,
}: SelectorUbicacionIdeaProps) {
  const [paises, setPaises] = useState<OpcionUbicacion[]>([]);
  const [departamentos, setDepartamentos] = useState<OpcionUbicacion[]>([]);
  const [ciudades, setCiudades] = useState<OpcionUbicacion[]>([]);
  const [cargandoPaises, setCargandoPaises] = useState(true);
  const [cargandoDepartamentos, setCargandoDepartamentos] = useState(false);
  const [cargandoCiudades, setCargandoCiudades] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarPaises() {
      try {
        setCargandoPaises(true);
        const opciones = await consultarUbicaciones();
        if (activo) setPaises(opciones);
      } catch (errorCarga) {
        if (!activo) return;
        setError(
          errorCarga instanceof Error
            ? errorCarga.message
            : "No se pudieron cargar los países.",
        );
      } finally {
        if (activo) setCargandoPaises(false);
      }
    }

    void cargarPaises();
    return () => {
      activo = false;
    };
  }, []);

  async function cambiarPais(codigo: string) {
    const pais = paises.find((opcion) => opcion.codigo === codigo);

    onChange({
      paisCodigo: codigo,
      paisNombre: pais?.nombre ?? "",
      departamentoCodigo: "",
      departamentoNombre: "",
      ciudad: "",
    });
    setDepartamentos([]);
    setCiudades([]);
    setError("");

    if (!codigo) return;

    try {
      setCargandoDepartamentos(true);
      const opciones = await consultarUbicaciones({ pais: codigo });
      setDepartamentos(opciones);

      if (opciones.length === 1 && opciones[0].codigo === CODIGO_SIN_DIVISION) {
        const unico = opciones[0];
        onChange({
          paisCodigo: codigo,
          paisNombre: pais?.nombre ?? "",
          departamentoCodigo: unico.codigo,
          departamentoNombre: unico.nombre,
          ciudad: "",
        });
        setCargandoCiudades(true);
        const ciudadesCargadas = await consultarUbicaciones({
          pais: codigo,
          departamento: unico.codigo,
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

  async function cambiarDepartamento(codigo: string) {
    const departamento = departamentos.find(
      (opcion) => opcion.codigo === codigo,
    );

    onChange({
      ...valor,
      departamentoCodigo: codigo,
      departamentoNombre: departamento?.nombre ?? "",
      ciudad: "",
    });
    setCiudades([]);
    setError("");

    if (!valor.paisCodigo || !codigo) return;

    try {
      setCargandoCiudades(true);
      const opciones = await consultarUbicaciones({
        pais: valor.paisCodigo,
        departamento: codigo,
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
    Boolean(valor.paisCodigo && valor.departamentoCodigo) &&
    !cargandoCiudades &&
    ciudades.length === 0;

  return (
    <div className="md:col-span-2 rounded-xl border border-white/[0.07] bg-black/15 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Ubicación preferida {requerida ? "· obligatoria" : "· opcional"}
          </p>
          <p className="mt-1 text-[9px] leading-4 text-zinc-600">
            {requerida
              ? "Para colaboraciones presenciales, selecciona país, departamento y ciudad."
              : "Puedes dejarla vacía si aceptas colaborar con personas de cualquier lugar."}
          </p>
        </div>

        {valor.paisCodigo ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange({
                paisCodigo: "",
                paisNombre: "",
                departamentoCodigo: "",
                departamentoNombre: "",
                ciudad: "",
              });
              setDepartamentos([]);
              setCiudades([]);
              setError("");
            }}
            className="shrink-0 text-[9px] font-bold text-zinc-500 transition hover:text-violet-200 disabled:opacity-40"
          >
            Limpiar
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label>
          <span className="text-[9px] font-semibold text-zinc-500">País</span>
          <select
            value={valor.paisCodigo}
            required={requerida}
            disabled={disabled || cargandoPaises}
            onChange={(event) => void cambiarPais(event.target.value)}
            className={CLASE_SELECTOR}
          >
            <option value="">
              {cargandoPaises ? "Cargando países..." : "Sin preferencia"}
            </option>
            {paises.map((pais) => (
              <option key={pais.codigo} value={pais.codigo}>
                {pais.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-[9px] font-semibold text-zinc-500">
            Departamento / estado
          </span>
          <select
            value={valor.departamentoCodigo}
            required={requerida}
            disabled={
              disabled || !valor.paisCodigo || cargandoDepartamentos
            }
            onChange={(event) =>
              void cambiarDepartamento(event.target.value)
            }
            className={CLASE_SELECTOR}
          >
            <option value="">
              {cargandoDepartamentos
                ? "Cargando..."
                : valor.paisCodigo
                  ? "Selecciona"
                  : "Primero el país"}
            </option>
            {departamentos.map((departamento) => (
              <option key={departamento.codigo} value={departamento.codigo}>
                {departamento.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-[9px] font-semibold text-zinc-500">Ciudad</span>
          {sinCiudadesRegistradas ? (
            <input
              value={valor.ciudad}
              required={requerida}
              maxLength={120}
              disabled={disabled}
              onChange={(event) =>
                onChange({ ...valor, ciudad: event.target.value })
              }
              placeholder="Escribe la ciudad"
              className={CLASE_SELECTOR}
            />
          ) : (
            <select
              value={valor.ciudad}
              required={requerida}
              disabled={
                disabled || !valor.departamentoCodigo || cargandoCiudades
              }
              onChange={(event) =>
                onChange({ ...valor, ciudad: event.target.value })
              }
              className={CLASE_SELECTOR}
            >
              <option value="">
                {cargandoCiudades
                  ? "Cargando..."
                  : valor.departamentoCodigo
                    ? "Selecciona"
                    : "Primero el departamento"}
              </option>
              {ciudades.map((ciudad) => (
                <option key={ciudad.codigo} value={ciudad.nombre}>
                  {ciudad.nombre}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[10px] text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
