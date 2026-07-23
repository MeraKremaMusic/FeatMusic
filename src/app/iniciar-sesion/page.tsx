import Link from "next/link";
import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/session";
import ProteccionHistorial from "./ProteccionHistorial";

const mensajesDeError: Record<string, string> = {
  "datos-invalidos": "Revisa el correo y la contraseña e inténtalo de nuevo.",
  "credenciales-invalidas": "El correo o la contraseña son incorrectos.",
  servidor: "No pudimos iniciar sesión en este momento. Inténtalo nuevamente.",
};

export default async function IniciarSesionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; exito?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (sesion) redirect("/panel");

  const { error, exito } = await searchParams;
  const mensaje = error ? mensajesDeError[error] : undefined;

  return (
  <>
    <ProteccionHistorial />

    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Volver a FeatMusic
        </Link>

        <p className="mt-8 text-sm font-semibold text-violet-400">
          Bienvenido de nuevo
        </p>

        <h1 className="mt-2 text-4xl font-bold">Iniciar sesión</h1>

        <p className="mt-3 text-zinc-400">
          Accede a tu perfil y continúa creando conexiones.
        </p>

        {mensaje && (
          <p role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
            {mensaje}
          </p>
        )}

        {exito === "password-restablecida" ? (
          <p className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Tu contraseña fue actualizada. Ya puedes iniciar sesión.
          </p>
        ) : null}

        <form action="/api/iniciar-sesion" method="post" className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Correo electrónico
            </span>

            <input
              required
              type="email"
              name="correo"
              placeholder="artista@correo.com"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-violet-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Contraseña
            </span>

            <input
              required
              type="password"
              name="password"
              placeholder="Tu contraseña"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-violet-500"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-violet-600 px-6 py-4 font-semibold hover:bg-violet-500"
          >
            Entrar
          </button>
        </form>

        <p className="mt-5 text-right text-sm">
          <Link href="/recuperar-contrasena" className="text-violet-400 hover:text-violet-300">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-zinc-400">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/registro" className="text-violet-400 hover:text-violet-300">
            Regístrate
          </Link>
        </p>
            </section>
    </main>
  </>
);
}
