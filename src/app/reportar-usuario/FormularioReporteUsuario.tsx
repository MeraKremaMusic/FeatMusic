"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

// FEATMUSIC_FORMULARIO_REPORTAR_USUARIO_V1

const MOTIVOS = [
  { valor: "SPAM", etiqueta: "Spam o publicidad engañosa" },
  { valor: "SUPLANTACION", etiqueta: "Suplantación de identidad" },
  { valor: "ACOSO", etiqueta: "Acoso, amenazas o discriminación" },
  { valor: "CONTENIDO_ROBADO", etiqueta: "Música o contenido presuntamente robado" },
  { valor: "CONTENIDO_INAPROPIADO", etiqueta: "Contenido inapropiado o ilegal" },
  { valor: "OTRO", etiqueta: "Otro motivo" },
];

type EstadoEnvio = "reposo" | "enviando" | "exito" | "error";

export default function FormularioReporteUsuario({
  usuarioInicial = "",
}: {
  usuarioInicial?: string;
}) {
  const [nombreUsuario, setNombreUsuario] = useState(
    usuarioInicial.replace(/^@+/, "").trim(),
  );
  const [motivo, setMotivo] = useState(MOTIVOS[0].valor);
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState<EstadoEnvio>("reposo");
  const [mensaje, setMensaje] = useState("");

  const caracteresRestantes = 1000 - descripcion.length;
  const formularioValido = useMemo(
    () =>
      nombreUsuario.trim().length >= 2 &&
      descripcion.trim().length >= 20 &&
      descripcion.length <= 1000,
    [descripcion, nombreUsuario],
  );

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!formularioValido || estado === "enviando") {
      return;
    }

    setEstado("enviando");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/reportes", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nombreUsuario: nombreUsuario.trim(),
          motivo,
          descripcion: descripcion.trim(),
        }),
      });

      const datos = (await respuesta.json()) as {
        ok?: boolean;
        mensaje?: string;
      };

      if (!respuesta.ok || !datos.ok) {
        throw new Error(datos.mensaje || "No se pudo enviar el reporte.");
      }

      setEstado("exito");
      setMensaje(
        datos.mensaje ||
          "Reporte enviado. Gracias por ayudar a cuidar la comunidad.",
      );
      setDescripcion("");
    } catch (error) {
      setEstado("error");
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el reporte.",
      );
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,.09)] sm:p-7"
    >
      <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-xs leading-6 text-yellow-900">
        Los reportes falsos o enviados para hostigar también pueden afectar la
        seguridad de la comunidad. Describe hechos concretos y evita compartir
        contraseñas o información sensible.
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-black text-slate-800">
          Usuario que deseas reportar
        </span>
        <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-100">
          <span className="text-sm font-black text-slate-400">@</span>
          <input
            value={nombreUsuario}
            onChange={(evento) =>
              setNombreUsuario(
                evento.target.value.replace(/^@+/, "").slice(0, 80),
              )
            }
            autoComplete="off"
            placeholder="nombredeusuario"
            className="min-h-12 min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            required
          />
        </div>
      </label>

      <label className="mt-5 block">
        <span className="text-xs font-black text-slate-800">Motivo</span>
        <select
          value={motivo}
          onChange={(evento) => setMotivo(evento.target.value)}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
        >
          {MOTIVOS.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block">
        <span className="text-xs font-black text-slate-800">
          Explica qué ocurrió
        </span>
        <textarea
          value={descripcion}
          onChange={(evento) => setDescripcion(evento.target.value.slice(0, 1000))}
          rows={6}
          minLength={20}
          maxLength={1000}
          placeholder="Incluye detalles claros: qué ocurrió, dónde lo viste y por qué consideras que incumple las reglas."
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
          required
        />
        <span
          className={`mt-1 block text-right text-[10px] font-semibold ${
            caracteresRestantes < 100 ? "text-yellow-700" : "text-slate-400"
          }`}
        >
          {caracteresRestantes} caracteres disponibles
        </span>
      </label>

      {mensaje && (
        <div
          role="status"
          className={`mt-5 rounded-xl border px-4 py-3 text-xs font-semibold leading-5 ${
            estado === "exito"
              ? "border-yellow-200 bg-yellow-50 text-yellow-800"
              : "border-yellow-200 bg-yellow-50 text-yellow-800"
          }`}
        >
          {mensaje}
        </div>
      )}

      <button
        type="submit"
        disabled={!formularioValido || estado === "enviando"}
        className="mt-5 flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-yellow-600 px-4 py-3 text-sm font-black text-white transition hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {estado === "enviando" ? "Enviando reporte…" : "Enviar reporte"}
      </button>

      <p className="mt-3 text-center text-[10px] leading-5 text-slate-500">
        El envío no garantiza una sanción automática. El reporte debe revisarse
        antes de tomar una decisión.
      </p>
    </form>
  );
}
