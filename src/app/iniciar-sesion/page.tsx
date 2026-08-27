import Link from "next/link";
import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/session";
import IniciarSesionPorPasos from "./IniciarSesionPorPasos";
import ProteccionHistorial from "./ProteccionHistorial";

const mensajesDeError: Record<string, string> = {
  "datos-invalidos": "Revisa el correo y la contraseña e inténtalo de nuevo.",
  "credenciales-invalidas": "El correo o la contraseña son incorrectos.",
  "demasiados-intentos":
    "Demasiados intentos de inicio de sesión. Espera unos minutos antes de intentarlo nuevamente.",
  "cuenta-suspendida":
    "Tu cuenta está suspendida temporalmente por moderación. Inténtalo nuevamente cuando finalice la suspensión.",
  "cuenta-bloqueada":
    "Tu cuenta está bloqueada por moderación. Si consideras que se trata de un error, contacta al soporte de FeatMusic.",
  servidor: "No pudimos iniciar sesión en este momento. Inténtalo nuevamente.",
};

export default async function IniciarSesionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; exito?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (sesion) redirect("/artistas/mi-perfil");

  const { error, exito } = await searchParams;
  const mensaje = error ? mensajesDeError[error] : undefined;

  return (
    <>
      <ProteccionHistorial />

      <main className="featmusic-registro-ambiental relative isolate min-h-[100dvh] overflow-hidden bg-[#080808] text-white">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-4 sm:px-6 sm:py-6">
          <header className="shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition hover:text-white sm:text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver a FeatMusic
            </Link>
          </header>

          <section className="flex min-h-0 flex-1 flex-col justify-center py-3 sm:py-5">
            <div className="mb-4 sm:mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#FFD400] sm:text-sm sm:tracking-[0.18em]">
                Bienvenido de nuevo
              </p>
              <h1 className="mt-1.5 text-3xl font-bold leading-tight sm:mt-2 sm:text-4xl">
                Iniciar sesión
              </h1>
              <p className="mt-1.5 text-sm leading-snug text-zinc-400 sm:mt-2">
                Accede a tu perfil y continúa creando conexiones.
              </p>
            </div>

            {mensaje ? (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-3 py-2.5 text-xs text-yellow-100 sm:px-4 sm:py-3 sm:text-sm"
              >
                {mensaje}
              </p>
            ) : null}

            {exito === "password-restablecida" ? (
              <p className="mb-4 rounded-xl border border-yellow-500/25 bg-yellow-500/10 px-3 py-2.5 text-xs text-yellow-100 sm:px-4 sm:py-3 sm:text-sm">
                Tu contraseña fue actualizada. Ya puedes iniciar sesión.
              </p>
            ) : null}

            <IniciarSesionPorPasos />

            <p className="mt-4 text-center text-xs text-zinc-500 sm:mt-5 sm:text-sm">
              ¿Todavía no tienes cuenta?{" "}
              <Link
                href="/registro"
                className="font-semibold text-[#FFD400] transition hover:brightness-110"
              >
                Regístrate
              </Link>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
