import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Feat<span className="text-violet-500">Music</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/iniciar-sesion"
            className="text-sm text-zinc-300 transition hover:text-white"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/registro"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[75vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-5 rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-300">
          La comunidad donde nacen nuevas colaboraciones
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          Conecta con artistas.
          <br />
          <span className="text-violet-500">
            Crea música sin límites.
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
          Encuentra cantantes, productores, compositores, músicos e ingenieros
          de sonido para llevar tus proyectos al siguiente nivel.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/registro"
            className="rounded-full bg-violet-600 px-8 py-4 font-semibold transition hover:bg-violet-500"
          >
            Crear mi perfil
          </Link>

          <Link
            href="/artistas"
            className="rounded-full border border-zinc-700 px-8 py-4 font-semibold transition hover:border-zinc-500 hover:bg-zinc-900"
          >
            Explorar artistas
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-3">
        <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
          <h2 className="text-xl font-semibold">Encuentra talento</h2>

          <p className="mt-3 text-zinc-400">
            Descubre artistas según género musical, país, experiencia y
            habilidades.
          </p>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
          <h2 className="text-xl font-semibold">Publica oportunidades</h2>

          <p className="mt-3 text-zinc-400">
            Busca voces, productores, músicos o colaboradores para tus
            próximos lanzamientos.
          </p>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-950 p-7">
          <h2 className="text-xl font-semibold">Crea conexiones reales</h2>

          <p className="mt-3 text-zinc-400">
            Construye relaciones profesionales y desarrolla proyectos con
            artistas de todo el mundo.
          </p>
        </article>
      </section>
    </main>
  );
}