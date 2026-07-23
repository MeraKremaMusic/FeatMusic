import Link from "next/link";

const mensajes: Record<string, string> = { "datos-invalidos": "Escribe un correo válido.", servidor: "No pudimos procesar la solicitud. Inténtalo de nuevo." };

export default async function RecuperarContrasenaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white"><section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8"><Link href="/iniciar-sesion" className="text-sm text-zinc-400 hover:text-white">← Volver al inicio de sesión</Link><p className="mt-8 text-sm font-semibold text-violet-400">Recuperar acceso</p><h1 className="mt-2 text-3xl font-bold">Restablece tu contraseña</h1><p className="mt-3 text-zinc-400">Te enviaremos un código de 6 números a tu correo.</p>{error ? <p role="alert" className="mt-5 rounded-xl border border-red-900 bg-red-950/50 p-3 text-sm text-red-200">{mensajes[error] ?? mensajes.servidor}</p> : null}<form action="/api/solicitar-recuperacion" method="post" className="mt-7 space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium">Correo electrónico</span><input required type="email" name="correo" autoComplete="email" className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-violet-500" /></label><button className="w-full rounded-full bg-violet-600 px-6 py-4 font-semibold hover:bg-violet-500">Enviar código</button></form></section></main>;
}
