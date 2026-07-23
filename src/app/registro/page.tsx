import Link from "next/link";
import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/session";

const mensajesDeError: Record<string, string> = {
  "datos-invalidos": "Revisa los datos y usa una contraseña de al menos 8 caracteres.",
  "contrasenas-no-coinciden": "Las contraseñas no coinciden.",
  "correo-existente": "Ya existe una cuenta registrada con ese correo. Inicia sesión o recupera tu contraseña.",
  "correo-no-enviado": "El correo de verificación no está disponible todavía. Inténtalo de nuevo más tarde.",
  servidor: "No pudimos iniciar tu registro en este momento. Inténtalo nuevamente.",
};

function mensajeDeError(error?: string) {
  if (!error) return undefined;
  if (error.startsWith("espera-reenvio-")) {
    const segundos = error.replace("espera-reenvio-", "");
    return `Ya enviamos un código. Espera ${segundos} segundos antes de pedir otro.`;
  }
  return mensajesDeError[error] ?? "No pudimos continuar con el registro.";
}

const roles = [
  { valor: "CANTANTE", etiqueta: "Cantante", descripcion: "Publica voces, coros, versos y maquetas." },
  { valor: "COMPOSITOR", etiqueta: "Compositor", descripcion: "Comparte letras, melodías e ideas." },
  { valor: "BEATMAKER", etiqueta: "Beatmaker", descripcion: "Sube instrumentales y busca artistas." },
] as const;

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (sesion) redirect("/panel");

  const { error } = await searchParams;
  const mensaje = mensajeDeError(error);

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-xl">
        <Link href="/" className="text-sm text-zinc-400 transition hover:text-white">
          ← Volver a FeatMusic
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-7 sm:p-10">
          <p className="text-sm font-semibold text-violet-400">Crea tu cuenta</p>
          <h1 className="mt-3 text-4xl font-bold">Empieza a colaborar</h1>
          <p className="mt-3 text-zinc-400">
            Regístrate en menos de un minuto. Completarás tu perfil después de verificar tu correo.
          </p>

          {mensaje ? (
            <p role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/50 p-4 text-sm text-red-200">
              {mensaje}
            </p>
          ) : null}

          <form action="/api/registro" method="post" className="mt-8 space-y-6">
            <Campo label="Correo electrónico" name="correo" type="email" placeholder="artista@correo.com" />
            <Campo label="Contraseña" name="password" type="password" placeholder="Mínimo 8 caracteres" />
            <Campo label="Repite tu contraseña" name="repetirPassword" type="password" placeholder="Escribe la misma contraseña" />

            <fieldset>
              <legend className="text-sm font-medium">¿Cómo quieres participar?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {roles.map((rol) => (
                  <label key={rol.valor} className="group cursor-pointer">
                    <input className="peer sr-only" type="radio" name="rolPrincipal" value={rol.valor} required />
                    <span className="block h-full rounded-2xl border border-zinc-800 bg-black p-4 transition peer-checked:border-violet-400 peer-checked:bg-violet-500/10 group-hover:border-zinc-600">
                      <span className="block font-semibold">{rol.etiqueta}</span>
                      <span className="mt-2 block text-xs leading-5 text-zinc-500">{rol.descripcion}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-start gap-3 text-sm text-zinc-400">
              <input required type="checkbox" name="aceptaTerminos" className="mt-1 accent-violet-600" />
              <span>Acepto los términos de uso y la política de privacidad de FeatMusic.</span>
            </label>

            <button type="submit" className="w-full rounded-full bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500">
              Crear cuenta y verificar correo
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/iniciar-sesion" className="font-medium text-violet-300 hover:text-violet-200">
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Campo({
  label,
  name,
  placeholder,
  type,
}: {
  label: string;
  name: string;
  placeholder: string;
  type: "email" | "password";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        required
        type={type}
        name={name}
        autoComplete={type === "email" ? "email" : "new-password"}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
      />
    </label>
  );
}
