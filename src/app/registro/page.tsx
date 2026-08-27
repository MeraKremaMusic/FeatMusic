import Link from "next/link";
import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/session";
import RegistroInicialPorPasos from "./RegistroInicialPorPasos";

const mensajesDeError: Record<string, string> = {
  "datos-invalidos":
    "Revisa los datos y usa una contraseña de al menos 8 caracteres.",
  "contrasenas-no-coinciden": "Las contraseñas no coinciden.",
  "correo-existente":
    "Ya existe una cuenta registrada con ese correo. Inicia sesión o recupera tu contraseña.",
  "correo-no-enviado":
    "El correo de verificación no está disponible todavía. Inténtalo de nuevo más tarde.",
  servidor:
    "No pudimos iniciar tu registro en este momento. Inténtalo nuevamente.",
};

function mensajeDeError(error?: string) {
  if (!error) return undefined;

  if (error.startsWith("espera-reenvio-")) {
    const segundos = error.replace("espera-reenvio-", "");
    return `Ya enviamos un código. Espera ${segundos} segundos antes de pedir otro.`;
  }

  return mensajesDeError[error] ?? "No pudimos continuar con el registro.";
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (sesion) redirect("/artistas/mi-perfil");

  const { error } = await searchParams;
  const mensaje = mensajeDeError(error);

  return (
    <main className="featmusic-registro-ambiental relative isolate flex min-h-[100dvh] overflow-hidden bg-[#080808] px-4 py-5 text-white sm:px-6 sm:py-8">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center">
        <Link
          href="/"
          className="w-fit text-xs text-zinc-400 transition hover:text-white sm:text-sm"
        >
          ← Volver a FeatMusic
        </Link>

        <div className="mt-5 sm:mt-7">
          <p className="text-xs font-semibold text-[#FFD400] sm:text-sm">
            Crea tu cuenta
          </p>
          <h1 className="mt-1.5 text-3xl font-bold leading-tight sm:mt-2 sm:text-4xl">
            Empieza a colaborar
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400 sm:mt-3 sm:text-sm">
            Primero crearemos y verificaremos tu cuenta. Después completarás tu
            perfil artístico, incluido tu rol principal.
          </p>
        </div>

        {mensaje ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-3 text-xs text-yellow-100 sm:mt-5 sm:p-4 sm:text-sm"
          >
            {mensaje}
          </p>
        ) : null}

        <div className="mt-5 sm:mt-6">
          <RegistroInicialPorPasos />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400 sm:mt-5 sm:text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/iniciar-sesion"
            className="font-medium text-[#FFD400] transition hover:brightness-110"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
