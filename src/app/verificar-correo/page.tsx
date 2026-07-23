import Link from "next/link";

const mensajes: Record<string, string> = {
  "codigo-invalido": "Escribe el código de 6 números que recibiste por correo.",
  "codigo-incorrecto": "El código no es correcto. Revisa el correo e inténtalo otra vez.",
  "codigo-vencido": "El código venció. Solicita uno nuevo para continuar.",
  "demasiados-intentos": "Se alcanzó el límite de intentos. Solicita un código nuevo.",
  "solicitud-no-encontrada": "No encontramos un registro pendiente para ese correo.",
};

function mensajeDeError(error?: string) {
  if (!error) return undefined;
  if (error.startsWith("espera-reenvio-")) {
    const segundos = error.replace("espera-reenvio-", "");
    return `Espera ${segundos} segundos antes de solicitar otro código.`;
  }
  return mensajes[error] ?? "No pudimos verificar el correo. Inténtalo nuevamente.";
}

export default async function VerificarCorreoPage({
  searchParams,
}: {
  searchParams: Promise<{
    correo?: string;
    enviado?: string;
    reenviado?: string;
    error?: string;
  }>;
}) {
  const parametros = await searchParams;
  const correo = parametros.correo ?? "";
  const error = mensajeDeError(parametros.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12 text-white">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8 sm:p-10">
        <Link href="/registro" className="text-sm text-zinc-400 hover:text-white">
          ← Corregir mi correo
        </Link>

        <p className="mt-8 text-sm font-semibold text-violet-400">Paso 2 de 2</p>
        <h1 className="mt-2 text-3xl font-bold">Verifica tu correo</h1>
        <p className="mt-3 text-zinc-400">
          Enviamos un código de 6 números a <strong className="text-zinc-200">{correo || "tu correo"}</strong>.
        </p>

        {(parametros.enviado || parametros.reenviado) && !error ? (
          <p className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {parametros.reenviado ? "Enviamos un código nuevo." : "Revisa tu bandeja de entrada y la carpeta de spam."}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mt-5 rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <form action="/api/verificar-correo" method="post" className="mt-7 space-y-5">
          <input type="hidden" name="correo" value={correo} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Código de verificación</span>
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              name="codigo"
              pattern="[0-9]{6}"
              placeholder="000000"
              className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-4 text-center text-2xl font-semibold tracking-[0.45em] outline-none transition placeholder:tracking-[0.25em] placeholder:text-zinc-700 focus:border-violet-500"
            />
          </label>
          <button type="submit" className="w-full rounded-full bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500">
            Verificar y continuar
          </button>
        </form>

        <form action="/api/reenviar-codigo" method="post" className="mt-5 text-center">
          <input type="hidden" name="correo" value={correo} />
          <button type="submit" className="text-sm font-medium text-violet-300 transition hover:text-violet-200">
            Reenviar código
          </button>
          <p className="mt-2 text-xs text-zinc-500">Puedes solicitar un nuevo código después de 60 segundos.</p>
        </form>
      </section>
    </main>
  );
}
