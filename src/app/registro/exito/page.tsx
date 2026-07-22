import Link from "next/link";

export default function RegistroExitosoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
        <div className="text-5xl">✓</div>

        <h1 className="mt-5 text-3xl font-bold">Cuenta creada</h1>

        <p className="mt-3 text-zinc-400">
          Tu perfil de FeatMusic fue registrado correctamente.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-violet-600 px-7 py-3 font-semibold hover:bg-violet-500"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}