import Link from "next/link";

import { iniciarSesion } from "./actions";

export default function IniciarSesionPage() {
  return (
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

        <form action={iniciarSesion} className="mt-8 space-y-5">
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

        <p className="mt-6 text-center text-sm text-zinc-400">
          ¿Todavía no tienes cuenta?{" "}
          <Link href="/registro" className="text-violet-400 hover:text-violet-300">
            Regístrate
          </Link>
        </p>
      </section>
    </main>
  );
}