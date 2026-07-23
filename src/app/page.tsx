import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative isolate min-h-[760px] overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-[url('/images/featmusic-hero-studio.webp')] bg-cover bg-[position:62%_center] sm:bg-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.56)_38%,rgba(0,0,0,0.16)_78%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.32)_55%,#000_100%)]"
        />

        <header className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Feat<span className="text-violet-400">Music</span>
            </Link>

            <nav className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/iniciar-sesion"
                className="text-sm font-medium text-zinc-200 transition hover:text-white"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/registro"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 sm:px-5"
              >
                Crear cuenta
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto flex min-h-[670px] max-w-7xl flex-col items-center justify-center px-5 pb-28 pt-16 text-center sm:px-6">
          <p className="mb-6 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-200 shadow-2xl backdrop-blur-md sm:text-sm">
            La comunidad donde nacen nuevas colaboraciones
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight drop-shadow-2xl sm:text-5xl md:text-7xl">
            Conecta con artistas.
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
              Crea música sin límites.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-200 drop-shadow-lg sm:text-lg sm:leading-8">
            Encuentra cantantes, productores, compositores, músicos e ingenieros
            de sonido para llevar tus proyectos al siguiente nivel.
          </p>

          <div className="mt-10 flex w-full max-w-sm flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row">
            <Link
              href="/registro"
              className="rounded-full bg-violet-600 px-8 py-4 font-semibold shadow-[0_12px_40px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              Crear mi perfil
            </Link>

            <Link
              href="/artistas"
              className="rounded-full border border-white/25 bg-black/35 px-8 py-4 font-semibold backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-black/55"
            >
              Explorar artistas
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-20 md:grid-cols-3">
        <article className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-7 transition hover:-translate-y-1 hover:border-violet-500/40">
          <h2 className="text-xl font-semibold">Encuentra talento</h2>

          <p className="mt-3 text-zinc-400">
            Descubre artistas según género musical, país, experiencia y
            habilidades.
          </p>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-7 transition hover:-translate-y-1 hover:border-violet-500/40">
          <h2 className="text-xl font-semibold">Publica oportunidades</h2>

          <p className="mt-3 text-zinc-400">
            Busca voces, productores, músicos o colaboradores para tus
            próximos lanzamientos.
          </p>
        </article>

        <article className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-7 transition hover:-translate-y-1 hover:border-violet-500/40">
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
