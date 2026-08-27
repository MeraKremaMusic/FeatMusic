"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function MiCuentaClient({
  esAdministrador,
}: {
  esAdministrador: boolean;
}) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [cambiando, setCambiando] = useState(false);
  const [mensajePassword, setMensajePassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [passwordEliminar, setPasswordEliminar] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

  async function cambiarPassword(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (cambiando) return;

    setCambiando(true);
    setMensajePassword("");
    setErrorPassword("");

    try {
      const respuesta = await fetch("/api/mi-cuenta/cambiar-password", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          passwordActual: actual,
          passwordNueva: nueva,
          repetirPassword: repetir,
        }),
      });

      const datos = (await respuesta.json()) as { ok?: boolean; mensaje?: string };
      if (!respuesta.ok || !datos.ok) {
        throw new Error(datos.mensaje || "No se pudo cambiar la contraseña.");
      }

      setActual("");
      setNueva("");
      setRepetir("");
      setMensajePassword(
        datos.mensaje || "Contraseña actualizada. Las otras sesiones fueron cerradas.",
      );
    } catch (error) {
      setErrorPassword(
        error instanceof Error ? error.message : "No se pudo cambiar la contraseña.",
      );
    } finally {
      setCambiando(false);
    }
  }

  async function eliminarCuenta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (eliminando || esAdministrador) return;

    if (confirmacion.trim().toUpperCase() !== "ELIMINAR") {
      setErrorEliminar('Escribe la palabra "ELIMINAR" para confirmar.');
      return;
    }

    setEliminando(true);
    setErrorEliminar("");

    try {
      const respuesta = await fetch("/api/mi-cuenta/eliminar", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          password: passwordEliminar,
          confirmacion: confirmacion.trim(),
        }),
      });

      const datos = (await respuesta.json()) as { ok?: boolean; mensaje?: string };
      if (!respuesta.ok || !datos.ok) {
        throw new Error(datos.mensaje || "No se pudo eliminar la cuenta.");
      }

      window.location.assign("/");
    } catch (error) {
      setErrorEliminar(
        error instanceof Error ? error.message : "No se pudo eliminar la cuenta.",
      );
      setEliminando(false);
    }
  }

  return (
    <>
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-600 dark:text-[#FFD400]">
            Seguridad
          </p>
          <h2 className="mt-1 text-base font-black">Cambiar contraseña</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">
            Al cambiarla, las sesiones abiertas en otros dispositivos dejarán de ser válidas.
          </p>
        </div>

        <form onSubmit={cambiarPassword} className="mt-5 space-y-3">
          <CampoPassword etiqueta="Contraseña actual" valor={actual} cambiar={setActual} autoComplete="current-password" />
          <CampoPassword etiqueta="Nueva contraseña" valor={nueva} cambiar={setNueva} autoComplete="new-password" />
          <CampoPassword etiqueta="Repetir nueva contraseña" valor={repetir} cambiar={setRepetir} autoComplete="new-password" />

          <p className="text-[10px] leading-5 text-slate-400 dark:text-zinc-500">
            La nueva contraseña debe tener entre 8 y 128 caracteres.
          </p>

          {errorPassword ? <Alerta tipo="error">{errorPassword}</Alerta> : null}
          {mensajePassword ? <Alerta>{mensajePassword}</Alerta> : null}

          <button
            type="submit"
            disabled={cambiando || !actual || nueva.length < 8 || repetir.length < 8}
            className="min-h-11 w-full rounded-xl bg-[#FFD400] px-4 py-3 text-xs font-black text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {cambiando ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </form>
      </article>

      <article className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-500/20 dark:bg-[#171717] sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-600 dark:text-red-400">
          Zona de peligro
        </p>
        <h2 className="mt-1 text-base font-black">Eliminar mi cuenta</h2>
        <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-zinc-400">
          Tu perfil dejará de existir, se eliminarán tus archivos propios y tus datos personales serán anonimizados. Las conversaciones y registros compartidos conservarán únicamente una referencia como “Usuario eliminado”.
        </p>

        {esAdministrador ? (
          <div className="mt-4 rounded-2xl border border-yellow-300/30 bg-yellow-50 p-4 text-xs leading-6 text-yellow-900 dark:bg-yellow-300/10 dark:text-yellow-100">
            La cuenta ADMIN está protegida y no puede eliminarse desde esta pantalla. Para evitar perder el panel administrativo, primero debe retirarse su rol ADMIN desde la base de datos.
          </div>
        ) : (
          <form onSubmit={eliminarCuenta} className="mt-5 space-y-3">
            <CampoPassword etiqueta="Contraseña actual" valor={passwordEliminar} cambiar={setPasswordEliminar} autoComplete="current-password" />
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-400">
                Escribe ELIMINAR
              </span>
              <input
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value.slice(0, 20))}
                placeholder="ELIMINAR"
                autoComplete="off"
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none transition focus:border-red-400 dark:border-white/10 dark:bg-black/30 dark:text-white"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[10px] leading-5 text-slate-500 dark:border-white/10 dark:bg-black/25 dark:text-zinc-400">
              Si tienes una renovación Creator/Pro activa o una compra pendiente, primero debes resolverla en <Link href="/planes" className="font-black text-yellow-700 underline dark:text-[#FFD400]">Planes</Link>. Así evitamos cualquier cobro futuro después de eliminar la cuenta.
            </div>

            {errorEliminar ? <Alerta tipo="error">{errorEliminar}</Alerta> : null}

            <button
              type="submit"
              disabled={eliminando || !passwordEliminar || confirmacion.trim().toUpperCase() !== "ELIMINAR"}
              className="min-h-11 w-full rounded-xl border border-red-500/30 bg-red-600 px-4 py-3 text-xs font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {eliminando ? "Eliminando cuenta..." : "Eliminar mi cuenta definitivamente"}
            </button>
          </form>
        )}
      </article>
    </>
  );
}

function CampoPassword({ etiqueta, valor, cambiar, autoComplete }: { etiqueta: string; valor: string; cambiar: (valor: string) => void; autoComplete: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-400">{etiqueta}</span>
      <div className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-slate-50 pr-2 transition focus-within:border-yellow-500 dark:border-white/10 dark:bg-black/30">
        <input
          type={visible ? "text" : "password"}
          value={valor}
          onChange={(e) => cambiar(e.target.value.slice(0, 128))}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none dark:text-white"
        />
        <button type="button" onClick={() => setVisible((v) => !v)} className="rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-500 transition hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5">
          {visible ? "Ocultar" : "Ver"}
        </button>
      </div>
    </label>
  );
}

function Alerta({ children, tipo = "ok" }: { children: React.ReactNode; tipo?: "ok" | "error" }) {
  return (
    <p className={`rounded-xl border px-3 py-2.5 text-xs leading-5 ${tipo === "error" ? "border-red-300 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200" : "border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-300/20 dark:bg-yellow-300/10 dark:text-yellow-100"}`}>
      {children}
    </p>
  );
}
