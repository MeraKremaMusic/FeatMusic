import type { Metadata } from "next";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";

// FEATMUSIC_PAGINA_PLANES_PREMIUM_COMPLETA_V1

export const metadata: Metadata = {
  title: "Planes Premium | FeatMusic",
  description:
    "Compara los planes Gratuito, Creator y Pro de FeatMusic para publicar más ideas y recibir más propuestas.",
};

type Plan = {
  id: "gratuito" | "creator" | "pro";
  nombre: string;
  precio: string;
  espacios: string;
  descripcion: string;
  beneficios: string[];
  destacado?: boolean;
};

const planes: Plan[] = [
  {
    id: "gratuito",
    nombre: "Plan gratuito",
    precio: "0",
    espacios: "3 espacios",
    descripcion:
      "Mantén hasta 3 ideas activas y recibe un máximo de 3 propuestas en cada una.",
    beneficios: [
      "Hasta 3 ideas activas",
      "3 propuestas por cada idea",
      "Sin comisión por colaborar",
    ],
  },
  {
    id: "creator",
    nombre: "Plan Creator",
    precio: "5",
    espacios: "10 espacios",
    descripcion:
      "Publica hasta 10 ideas y recibe un máximo de 10 propuestas diferentes en cada una.",
    beneficios: [
      "Hasta 10 ideas activas",
      "Hasta 10 propuestas por idea",
      "Sin comisión por colaborar",
    ],
    destacado: true,
  },
  {
    id: "pro",
    nombre: "Plan Pro",
    precio: "10",
    espacios: "20 espacios",
    descripcion:
      "Amplía tu catálogo, destaca tu perfil y participa incluso cuando una idea ya alcanzó su límite normal.",
    beneficios: [
      "Hasta 20 ideas activas",
      "Perfil destacado como artista",
      "Propuestas extra aunque se alcance el límite",
    ],
  },
];

function IconoPlan({ tipo }: { tipo: Plan["id"] }) {
  if (tipo === "gratuito") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="9" width="18" height="12" rx="2" />
        <path d="M12 9v12M3 13h18M7.5 9C5 9 4 7.8 4 6.5S5 4 6.5 4C9 4 12 9 12 9s3-5 5.5-5C19 4 20 5.1 20 6.5S19 9 16.5 9" />
      </svg>
    );
  }

  if (tipo === "creator") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Z" />
        <path d="M5 21h14" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 2 2.1 6.1L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-1.9L12 2Z" />
      <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function PlanesPage() {
  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#171006] text-white">
      <EncabezadoSecundario />

      <section className="relative isolate min-h-[calc(100dvh-4rem)] overflow-hidden border-b border-amber-200/10 bg-[#171006]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_12%,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_88%_82%,rgba(202,138,4,0.16),transparent_32%),linear-gradient(145deg,#1d1307,#100c08_55%,#211807)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(30deg,rgba(253,230,138,0.15)_12%,transparent_12.5%,transparent_87%,rgba(253,230,138,0.15)_87.5%)] [background-size:72px_42px]"
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          <header className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              Planes FeatMusic
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Elige el espacio que necesita tu música.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-amber-50/65 sm:text-base">
              Publica tus ideas, recibe propuestas y amplía tu capacidad a
              medida que crece tu catálogo musical.
            </p>
          </header>

          <div className="mt-9 grid gap-5 md:grid-cols-3 lg:mt-12">
            {planes.map((plan) => (
              <article
                key={plan.id}
                className={`group relative flex min-h-[470px] flex-col overflow-hidden rounded-3xl border p-6 backdrop-blur-sm transition duration-500 hover:-translate-y-2 sm:p-7 ${
                  plan.id === "gratuito"
                    ? "border-amber-200/20 bg-[linear-gradient(145deg,rgba(36,24,5,0.94),rgba(10,8,5,0.9))] hover:border-amber-300/45"
                    : plan.id === "creator"
                      ? "border-amber-300/50 bg-[linear-gradient(145deg,rgba(52,31,5,0.98),rgba(17,10,8,0.94))] shadow-[0_24px_75px_rgba(245,158,11,0.18)] hover:border-amber-200/75"
                      : "border-emerald-200/25 bg-[linear-gradient(145deg,rgba(22,12,20,0.96),rgba(30,15,40,0.92))] hover:border-emerald-300/50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -right-10 -top-12 h-40 w-40 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${
                    plan.id === "pro"
                      ? "bg-emerald-500/18"
                      : "bg-amber-400/18"
                  }`}
                />

                {plan.destacado && (
                  <span className="absolute right-5 top-5 rounded-full border border-amber-200/30 bg-amber-300/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-amber-200">
                    Más popular
                  </span>
                )}

                <div className="relative flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                      plan.id === "pro"
                        ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-300"
                        : "border-amber-300/25 bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    <IconoPlan tipo={plan.id} />
                  </span>

                  <div>
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.18em] ${
                        plan.id === "pro"
                          ? "text-emerald-300"
                          : "text-amber-300"
                      }`}
                    >
                      {plan.nombre}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-white/55">
                      {plan.espacios}
                    </p>
                  </div>
                </div>

                <div className="relative mt-7 flex items-end gap-2">
                  <span className="pb-2 text-xl font-black text-white/70">$</span>
                  <span className="text-6xl font-black tracking-[-0.05em] text-white">
                    {plan.precio}
                  </span>
                  <span className="pb-2 text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-white/50">
                    USD
                    <br />
                    al mes
                  </span>
                </div>

                <div className="relative mt-5">
                  <h2 className="text-xl font-black text-white">
                    {plan.espacios}
                  </h2>
                  <p className="mt-3 min-h-[84px] text-sm leading-6 text-amber-50/65">
                    {plan.descripcion}
                  </p>
                </div>

                <div className="relative mt-6 border-t border-white/10 pt-5">
                  <ul className="space-y-3">
                    {plan.beneficios.map((beneficio) => (
                      <li
                        key={beneficio}
                        className="flex items-start gap-3 text-sm font-semibold text-white/85"
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.id === "pro"
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-amber-400/15 text-amber-300"
                          }`}
                        >
                          <IconoCheck />
                        </span>
                        <span>{beneficio}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <span
                  aria-hidden="true"
                  className={`absolute inset-x-7 bottom-0 h-px bg-gradient-to-r from-transparent ${
                    plan.id === "pro"
                      ? "via-emerald-300/65"
                      : "via-amber-300/65"
                  } to-transparent opacity-50 transition duration-500 group-hover:opacity-100`}
                />
              </article>
            ))}
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-center text-[10px] leading-5 text-amber-50/45">
            Esta sección presenta la estructura de los planes. La activación de
            pagos y suscripciones se conectará cuando el sistema de cobros esté
            disponible.
          </p>
        </div>
      </section>
    </main>
  );
}
