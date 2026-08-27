"use client";

import { useEffect, useRef, useState } from "react";

import {
  NOMBRE_USUARIO_MAX,
  NOMBRE_USUARIO_MIN,
  normalizarNombreUsuario,
} from "@/lib/nombreUsuario";

type EstadoDisponibilidad =
  | "inicial"
  | "comprobando"
  | "disponible"
  | "ocupado"
  | "invalido"
  | "error"
  | "fijado";

type RespuestaDisponibilidad = {
  disponible?: boolean;
  estado?: "disponible" | "ocupado" | "invalido";
  mensaje?: string;
};

const SOLO_CARACTERES_PERMITIDOS = /^[a-z0-9._]+$/;

export default function CampoNombreUsuario({
  valorInicial,
  bloqueado,
}: {
  valorInicial: string;
  bloqueado: boolean;
}) {
  const [valor, setValor] = useState(() =>
    normalizarNombreUsuario(valorInicial),
  );
  const [estado, setEstado] = useState<EstadoDisponibilidad>(
    bloqueado ? "fijado" : "inicial",
  );
  const [mensaje, setMensaje] = useState(
    bloqueado
      ? "Tu @usuario es único y permanente."
      : "Elige bien: será tu identificador público único y quedará permanente.",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bloqueado) return;

    const normalizado = normalizarNombreUsuario(valor);

    if (!normalizado) {
      setEstado("inicial");
      setMensaje(
        "Elige bien: será tu identificador público único y quedará permanente.",
      );
      return;
    }

    if (normalizado.length < NOMBRE_USUARIO_MIN) {
      setEstado("invalido");
      setMensaje(`Debe tener al menos ${NOMBRE_USUARIO_MIN} caracteres.`);
      return;
    }

    if (normalizado.length > NOMBRE_USUARIO_MAX) {
      setEstado("invalido");
      setMensaje(`No puede superar ${NOMBRE_USUARIO_MAX} caracteres.`);
      return;
    }

    if (!SOLO_CARACTERES_PERMITIDOS.test(normalizado)) {
      setEstado("invalido");
      setMensaje("Solo puedes usar letras, números, punto y guion bajo.");
      return;
    }

    setEstado("comprobando");
    setMensaje("Comprobando disponibilidad...");

    const controlador = new AbortController();
    const temporizador = window.setTimeout(async () => {
      try {
        const respuesta = await fetch(
          `/api/nombre-usuario/disponibilidad?nombreUsuario=${encodeURIComponent(normalizado)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controlador.signal,
          },
        );

        if (!respuesta.ok) {
          throw new Error(`HTTP ${respuesta.status}`);
        }

        const datos = (await respuesta.json()) as RespuestaDisponibilidad;

        if (datos.estado === "disponible" && datos.disponible === true) {
          setEstado("disponible");
          setMensaje(datos.mensaje ?? "Nombre de usuario disponible.");
          return;
        }

        if (datos.estado === "ocupado") {
          setEstado("ocupado");
          setMensaje(datos.mensaje ?? "Ese nombre de usuario ya está en uso.");
          return;
        }

        setEstado("invalido");
        setMensaje(
          datos.mensaje ??
            "El nombre de usuario no cumple las condiciones requeridas.",
        );
      } catch (error) {
        if (controlador.signal.aborted) return;

        console.error("No se pudo comprobar el nombre de usuario.", error);
        setEstado("error");
        setMensaje(
          "No pudimos comprobarlo ahora. Se volverá a validar al guardar.",
        );
      }
    }, 400);

    return () => {
      window.clearTimeout(temporizador);
      controlador.abort();
    };
  }, [bloqueado, valor]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || bloqueado) return;

    if (estado === "ocupado" || estado === "invalido") {
      input.setCustomValidity(mensaje);
    } else if (estado === "comprobando") {
      input.setCustomValidity(
        "Espera un momento mientras comprobamos si el nombre está disponible.",
      );
    } else {
      input.setCustomValidity("");
    }
  }, [bloqueado, estado, mensaje]);

  const borde =
    estado === "ocupado" || estado === "invalido"
      ? "border-red-500 focus-within:border-red-500"
      : estado === "disponible"
        ? "border-[#FFD400] focus-within:border-[#FFD400]"
        : "border-zinc-800 focus-within:border-yellow-500";

  const colorMensaje =
    estado === "ocupado" || estado === "invalido"
      ? "text-red-400"
      : estado === "disponible"
        ? "text-[#FFD400]"
        : estado === "comprobando"
          ? "text-zinc-300"
          : "text-zinc-500";

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium sm:mb-1.5 sm:text-sm">Nombre de usuario</span>
      <div
        className={`flex overflow-hidden rounded-xl border bg-black transition ${borde}`}
      >
        <span className="flex items-center border-r border-zinc-800 px-3 text-sm text-zinc-500">
          @
        </span>
        <input
          ref={inputRef}
          required
          name="nombreUsuario"
          value={valor}
          onChange={(event) => {
            const siguiente = event.target.value
              .toLowerCase()
              .replace(/^@+/, "");
            setValor(siguiente);
          }}
          readOnly={bloqueado}
          minLength={NOMBRE_USUARIO_MIN}
          maxLength={NOMBRE_USUARIO_MAX}
          pattern="[a-z0-9._]{3,24}"
          autoComplete="username"
          aria-describedby="estado-nombre-usuario"
          aria-busy={estado === "comprobando"}
          data-estado-nombre-usuario={estado}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm lowercase outline-none read-only:cursor-not-allowed read-only:text-zinc-400 sm:px-4 sm:text-base"
        />
      </div>
      <p
        id="estado-nombre-usuario"
        aria-live="polite"
        className={`mt-1 text-[11px] leading-snug sm:mt-1.5 sm:text-xs ${colorMensaje}`}
      >
        {estado === "disponible" ? "✓ " : null}
        {estado === "ocupado" || estado === "invalido" ? "✕ " : null}
        {mensaje}
      </p>
    </label>
  );
}
