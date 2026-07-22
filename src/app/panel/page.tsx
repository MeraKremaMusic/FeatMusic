import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export default async function PanelPage() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: sesion.usuarioId,
    },
  });

  if (!usuario) {
    redirect("/iniciar-sesion");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold text-violet-400">
          Panel de artista
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Hola, {usuario.nombreArtistico}
        </h1>

        <p className="mt-3 text-zinc-400">
          Tu cuenta está activa. Desde aquí construiremos tu perfil profesional.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">Rol principal</p>
            <p className="mt-2 text-xl font-semibold">
              {usuario.rolPrincipal}
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">Ubicación</p>
            <p className="mt-2 text-xl font-semibold">
              {usuario.ciudad}, {usuario.pais}
            </p>
          </article>

          <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-500">Colaboración</p>
            <p className="mt-2 text-xl font-semibold">
              {usuario.tipoColaboracion}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}