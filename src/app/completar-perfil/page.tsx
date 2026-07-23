import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

const roles = [
  ["CANTANTE", "Cantante"],
  ["COMPOSITOR", "Compositor"],
  ["BEATMAKER", "Beatmaker"],
] as const;

const generos = ["Urbano", "Pop", "Reggaetón", "Trap", "R&B", "Afrobeat", "Rock", "Electrónica"];

const mensajes: Record<string, string> = {
  "datos-invalidos": "Completa los campos obligatorios y elige al menos un género.",
  servidor: "No pudimos guardar tu perfil. Inténtalo de nuevo.",
};

export default async function CompletarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/iniciar-sesion");

  const usuario = await prisma.usuario.findUnique({ where: { id: sesion.usuarioId } });
  if (!usuario) redirect("/iniciar-sesion");
  if (usuario.perfilCompleto) redirect("/panel");

  const { error } = await searchParams;
  const generosSeleccionados = Array.isArray(usuario.generos) ? usuario.generos.filter((genero): genero is string => typeof genero === "string") : [];

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <section className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-10">
        <p className="text-sm font-semibold text-violet-400">Último paso</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Personaliza tu perfil</h1>
        <p className="mt-3 text-zinc-400">Así podremos ayudarte a conectar con las personas y proyectos adecuados.</p>

        {error ? <p role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">{mensajes[error] ?? mensajes.servidor}</p> : null}

        <form action="/api/completar-perfil" method="post" className="mt-8 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo etiqueta="Tu nombre" nombre="nombre" valor={usuario.nombre ?? ""} />
            <Campo etiqueta="Nombre artístico" nombre="nombreArtistico" valor={usuario.nombreArtistico ?? ""} />
            <Campo etiqueta="País" nombre="pais" valor={usuario.pais ?? ""} />
            <Campo etiqueta="Ciudad" nombre="ciudad" valor={usuario.ciudad ?? ""} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Selector etiqueta="Idioma principal" nombre="idiomaPrincipal" valor={usuario.idiomaPrincipal ?? "Español"} opciones={[["Español", "Español"], ["English", "English"], ["Português", "Português"]]} />
            <Selector etiqueta="Quiero usar FeatMusic para" nombre="tipoColaboracion" valor={usuario.tipoColaboracion ?? "AMBAS"} opciones={[["AMBAS", "Colaborar y recibir propuestas"], ["BUSCO_COLABORAR", "Encontrar colaboraciones"], ["BUSCO_PROPUESTAS", "Recibir propuestas"]]} />
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-medium">Tu rol principal</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {roles.map(([valor, etiqueta]) => <label key={valor} className="cursor-pointer rounded-xl border border-zinc-800 bg-black p-4 transition hover:border-violet-500"><input className="mr-2 accent-violet-500" type="radio" name="rolPrincipal" value={valor} defaultChecked={(usuario.rolPrincipal ?? "CANTANTE") === valor} />{etiqueta}</label>)}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-medium">Géneros que te representan <span className="text-zinc-500">(elige hasta 5)</span></legend>
            <div className="flex flex-wrap gap-2">
              {generos.map((genero) => <label key={genero} className="cursor-pointer rounded-full border border-zinc-800 px-3 py-2 text-sm transition hover:border-violet-500"><input className="mr-2 accent-violet-500" type="checkbox" name="generos" value={genero} defaultChecked={generosSeleccionados.includes(genero)} />{genero}</label>)}
            </div>
          </fieldset>

          <button type="submit" className="w-full rounded-full bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500">Guardar y entrar a FeatMusic</button>
        </form>
      </section>
    </main>
  );
}

function Campo({ etiqueta, nombre, valor }: { etiqueta: string; nombre: string; valor: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium">{etiqueta}</span><input required name={nombre} defaultValue={valor} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-violet-500" /></label>;
}

function Selector({ etiqueta, nombre, valor, opciones }: { etiqueta: string; nombre: string; valor: string; opciones: string[][] }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium">{etiqueta}</span><select name={nombre} defaultValue={valor} className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-violet-500">{opciones.map(([opcion, texto]) => <option key={opcion} value={opcion}>{texto}</option>)}</select></label>;
}
