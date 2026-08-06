import type { Metadata } from "next";
import Link from "next/link";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";

export const metadata: Metadata = {
  title: "Planes Premium | FeatMusic",
  description:
    "Conoce las funciones Premium que FeatMusic está preparando para artistas y colaboradores musicales.",
};

const beneficiosPrevistos = [
  {
    titulo: "Más visibilidad",
    texto:
      "Herramientas para destacar tu perfil y tus ideas frente a artistas compatibles.",
  },
  {
    titulo: "Más capacidad",
    texto:
      "Opciones ampliadas para publicar, organizar y administrar colaboraciones.",
  },
  {
    titulo: "Mejor gestión",
    texto:
      "Funciones pensadas para equipos, catálogos y seguimiento de proyectos musicales.",
  },
];

export default function PlanesPage() {
  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#d8dee7] text-slate-900">
      <EncabezadoSecundario />

      <section className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,.18)] sm:p-9">
          <span className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
            Próximamente
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            FeatMusic Premium está en preparación
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            Estamos diseñando herramientas para que los artistas puedan
            descubrir mejores oportunidades, organizar más colaboraciones y
            darle mayor alcance a su trabajo.
          </p>
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-xs leading-5 text-amber-100">
            Todavía no hay precios, cobros ni suscripciones activas desde esta
            página. Los beneficios y condiciones finales podrán cambiar antes
            del lanzamiento.
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {beneficiosPrevistos.map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,.07)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
                ✦
              </span>
              <h2 className="mt-4 text-base font-black text-slate-950">
                {beneficio.titulo}
              </h2>
              <p className="mt-2 text-xs leading-6 text-slate-600">
                {beneficio.texto}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-black text-slate-950">
              ¿Tienes una idea para Premium?
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Revisa la sección de ayuda para conocer el estado de las
              funciones y las formas de contacto disponibles.
            </p>
          </div>
          <Link
            href="/ayuda"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700"
          >
            Ir a Ayuda
          </Link>
        </div>
      </section>
    </main>
  );
}
