import type { Metadata } from "next";
import Link from "next/link";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import { obtenerSesion } from "@/lib/session";

import FormularioReporteUsuario from "./FormularioReporteUsuario";

export const metadata: Metadata = {
  title: "Reportar un usuario | FeatMusic",
  description:
    "Reporta spam, suplantación, acoso o contenido inapropiado en FeatMusic.",
};

export const dynamic = "force-dynamic";

type ReportarUsuarioPageProps = {
  searchParams: Promise<{ usuario?: string | string[] }>;
};

export default async function ReportarUsuarioPage({
  searchParams,
}: ReportarUsuarioPageProps) {
  const sesion = await obtenerSesion();
  const parametros = await searchParams;
  const usuarioInicial =
    typeof parametros.usuario === "string" ? parametros.usuario : "";

  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#dddddd] text-slate-900">
      <EncabezadoSecundario />

      <section className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-700">
            Seguridad de la comunidad
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Reportar un usuario
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Usa este formulario para informar spam, suplantación, acoso,
            contenido robado o comportamientos que puedan poner en riesgo a
            otros artistas.
          </p>
        </div>

        {sesion ? (
          <FormularioReporteUsuario usuarioInicial={usuarioInicial} />
        ) : (
          <div className="rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-[0_20px_55px_rgba(15,23,42,.09)]">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-xl text-yellow-700">
              !
            </span>
            <h2 className="mt-4 text-lg font-black text-slate-950">
              Inicia sesión para enviar un reporte
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-600">
              Necesitamos asociar el reporte a una cuenta para evitar abuso y
              permitir una revisión responsable.
            </p>
            <Link
              href="/iniciar-sesion"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-yellow-600 px-5 py-2.5 text-xs font-black text-white transition hover:bg-yellow-700"
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
