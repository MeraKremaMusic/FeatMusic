import Link from "next/link";

export default function ArtistasPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="max-w-xl text-center">
        <p className="text-sm font-semibold text-violet-400">FeatMusic</p>
        <h1 className="mt-3 text-4xl font-bold">Explorar artistas</h1>
        <p className="mt-4 text-zinc-400">
          Muy pronto podrás descubrir artistas y colaboradores por rol, género y ubicación.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-zinc-700 px-6 py-3 font-semibold hover:bg-zinc-900"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
