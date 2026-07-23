"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import type { ReactNode } from "react";

type GraphicIconName =
  | "search"
  | "check"
  | "chat"
  | "profile"
  | "users"
  | "spark"
  | "briefcase"
  | "layers"
  | "gift"
  | "crown"
  | "percent"
  | "microphone"
  | "waveform"
  | "sliders"
  | "pen"
  | "note"
  | "headphones"
  | "disc"
  | "globe";

function GraphicIcon({
  name,
  className = "h-6 w-6",
}: {
  name: GraphicIconName;
  className?: string;
}) {
  const drawings: Record<GraphicIconName, ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    chat: (
      <>
        <path d="M5 18 3.5 21.5 8 19h9a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v7a4 4 0 0 0 2 3Z" />
        <path d="M8 10h8M8 14h5" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-5 3.5-7.5 8-7.5S19.2 16 20 21" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="9" r="3.5" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M2.5 20c.6-4.3 2.8-6.5 6.5-6.5s6 2.2 6.5 6.5M15 14.5c3.5 0 5.6 1.8 6.2 5.5" />
      </>
    ),
    spark: <path d="m12 2 2.1 6.1L20 10l-5.9 2.1L12 18l-2.1-5.9L4 10l5.9-1.9L12 2Zm7 14 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />,
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="3" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="9" width="18" height="12" rx="2" />
        <path d="M12 9v12M3 13h18M7.5 9C5 9 4 7.8 4 6.5S5 4 6.5 4C9 4 12 9 12 9s3-5 5.5-5C19 4 20 5.1 20 6.5S19 9 16.5 9" />
      </>
    ),
    crown: (
      <>
        <path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Z" />
        <path d="M5 21h14" />
      </>
    ),
    percent: (
      <>
        <circle cx="7" cy="7" r="2.5" />
        <circle cx="17" cy="17" r="2.5" />
        <path d="m19 5-14 14" />
      </>
    ),
    microphone: (
      <>
        <rect x="8" y="3" width="8" height="13" rx="4" />
        <path d="M5 12a7 7 0 0 0 14 0M12 19v3M8 22h8" />
      </>
    ),
    waveform: <path d="M2 12h3l2-6 3 12 4-15 3 12 2-3h3" />,
    sliders: (
      <>
        <path d="M4 4v6M4 14v6M12 4v10M12 18v2M20 4v3M20 11v9" />
        <rect x="2" y="10" width="4" height="4" rx="1" />
        <rect x="10" y="14" width="4" height="4" rx="1" />
        <rect x="18" y="7" width="4" height="4" rx="1" />
      </>
    ),
    pen: (
      <>
        <path d="m4 20 4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" />
        <path d="m14.5 7.5 3 3" />
      </>
    ),
    note: (
      <>
        <path d="M9 18V5l11-2v13" />
        <ellipse cx="5.5" cy="18" rx="3.5" ry="2.5" />
        <ellipse cx="16.5" cy="16" rx="3.5" ry="2.5" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <rect x="3" y="13" width="4" height="7" rx="2" />
        <rect x="17" y="13" width="4" height="7" rx="2" />
      </>
    ),
    disc: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v6M21 12h-6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {drawings[name]}
    </svg>
  );
}

const profesionales = [
  { nombre: "Cantantes", icono: "microphone" },
  { nombre: "Raperos", icono: "waveform" },
  { nombre: "Productores", icono: "sliders" },
  { nombre: "Beatmakers", icono: "disc" },
  { nombre: "Compositores", icono: "pen" },
  { nombre: "Músicos", icono: "note" },
  { nombre: "Ingenieros de mezcla", icono: "headphones" },
  { nombre: "Ingenieros de mastering", icono: "waveform" },
  { nombre: "DJs", icono: "disc" },
] satisfies { nombre: string; icono: GraphicIconName }[];

const pasosColaboracion = [
  {
    numero: "01",
    titulo: "Crea tu perfil",
    descripcion: "Cuenta quién eres, qué haces y con qué géneros te identificas.",
    icono: "profile",
  },
  {
    numero: "02",
    titulo: "Encuentra compatibilidad",
    descripcion: "Descubre personas por rol, ubicación, idioma y estilo musical.",
    icono: "search",
  },
  {
    numero: "03",
    titulo: "Confirma el proyecto",
    descripcion: "Ambas personas aceptan la colaboración antes de avanzar.",
    icono: "check",
  },
  {
    numero: "04",
    titulo: "Abre el chat privado",
    descripcion: "Coordinen la idea, el proceso y los siguientes pasos en un espacio propio.",
    icono: "chat",
  },
] satisfies {
  numero: string;
  titulo: string;
  descripcion: string;
  icono: GraphicIconName;
}[];

const generosEnMovimiento = [
  "Reguetón",
  "Trap",
  "Rap",
  "Pop",
  "R&B",
  "Afrobeats",
  "Electrónica",
  "Rock",
  "Salsa",
  "Bachata",
  "Regional mexicano",
];

const tiposDeColaboracion = [
  {
    titulo: "Intercambio creativo",
    descripcion:
      "Une habilidades con otros artistas y construyan una canción o proyecto en conjunto.",
    icono: "spark",
  },
  {
    titulo: "Trabajos pagos",
    descripcion:
      "Encuentra profesionales para producción, voces, instrumentos, mezcla o mastering.",
    icono: "briefcase",
  },
  {
    titulo: "Ambas opciones",
    descripcion:
      "Mantén tu perfil abierto a oportunidades creativas y propuestas profesionales.",
    icono: "layers",
  },
] satisfies {
  titulo: string;
  descripcion: string;
  icono: GraphicIconName;
}[];

const preguntasFrecuentes = [
  {
    pregunta: "¿FeatMusic será gratis?",
    respuesta:
      "Sí. Podrás crear tu perfil y comenzar a buscar colaboradores gratis. También habrá una suscripción con funciones adicionales.",
  },
  {
    pregunta: "¿FeatMusic cobrará comisión por las colaboraciones?",
    respuesta:
      "No. FeatMusic no cobrará comisión por las colaboraciones que se completen dentro de la comunidad.",
  },
  {
    pregunta: "¿Cómo podré hablar con mi colaborador?",
    respuesta:
      "Cuando ambas personas confirmen la colaboración, se abrirá un chat privado para organizar el proyecto.",
  },
  {
    pregunta: "¿En qué idiomas estará disponible?",
    respuesta:
      "FeatMusic estará pensada para comunidades que hablan español, inglés y portugués de Brasil.",
  },
];

export default function Home() {
  useEffect(() => {
    const root = document.documentElement;
    const titles = document.querySelectorAll<HTMLElement>(
      ".section-title-reveal",
    );

    root.classList.add("scroll-animations-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.3,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    titles.forEach((title) => observer.observe(title));

    return () => {
      observer.disconnect();
      root.classList.remove("scroll-animations-ready");
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative isolate min-h-[760px] overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-[url('/images/featmusic-hero-studio.webp')] bg-cover bg-[position:62%_center] sm:bg-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.56)_38%,rgba(0,0,0,0.16)_78%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.32)_55%,#000_100%)]"
        />

        <header className="border-b border-white/10 bg-black/10 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              Feat<span className="text-violet-400">Music</span>
            </Link>

            <nav className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/iniciar-sesion"
                className="text-sm font-medium text-zinc-200 transition hover:text-white"
              >
                Iniciar sesión
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto flex min-h-[670px] max-w-7xl flex-col items-center justify-center px-5 pb-28 pt-16 text-center sm:px-6 md:-translate-y-10 xl:-translate-y-12">
          <p className="hero-badge-enter mb-6 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-200 shadow-2xl backdrop-blur-md sm:text-sm">
            La comunidad donde nacen nuevas colaboraciones
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight drop-shadow-2xl sm:text-5xl md:text-7xl">
            <span className="hero-title-enter block">Conecta con artistas.</span>
            <span className="hero-title-enter hero-title-enter-delay block">
              <span className="animated-gradient-text bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
                Crea música sin límites.
              </span>
            </span>
          </h1>

          <p className="hero-body-enter mt-7 max-w-2xl text-base leading-7 text-zinc-200 drop-shadow-lg sm:text-lg sm:leading-8">
            Encuentra colaboradores que compartan tu visión: cantantes,
            productores, compositores, músicos e ingenieros de sonido.
          </p>

          <div className="hero-actions-enter mt-10 flex w-full max-w-sm flex-col gap-4 sm:w-auto sm:max-w-none sm:flex-row">
            <Link
              href="/registro"
              className="rounded-full bg-violet-600 px-8 py-4 font-semibold shadow-[0_12px_40px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              Crear mi perfil gratis
            </Link>

            <Link
              href="/artistas"
              className="rounded-full border border-white/25 bg-black/35 px-8 py-4 font-semibold backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-black/55"
            >
              Explorar artistas
            </Link>
          </div>
        </div>

      </section>

      <section
        aria-label="Géneros musicales de la comunidad"
        className="overflow-hidden border-b border-white/10 bg-black py-5"
      >
        <div className="marquee-track">
          {[0, 1].map((grupo) => (
            <div
              key={grupo}
              aria-hidden={grupo === 1}
              className="marquee-group"
            >
              {generosEnMovimiento.map((genero) => (
                <span key={`${grupo}-${genero}`} className="marquee-item">
                  <span className="text-violet-400">✦</span>
                  {genero}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="descubrir" className="relative isolate flex min-h-[65vh] scroll-mt-6 items-center overflow-hidden border-b border-violet-300/10 bg-[#140323]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_22%,rgba(168,85,247,0.36),transparent_32%),radial-gradient(circle_at_84%_74%,rgba(99,102,241,0.3),transparent_34%),linear-gradient(135deg,#1d0634_0%,#10021d_48%,#21063a_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
        />

        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="reveal-on-scroll max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                Colaboraciones que sí encajan
              </p>
              <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                Un espacio creado para encontrar a las personas correctas.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-violet-100/70">
                Tu próxima canción puede comenzar con una voz, una idea o una
                conversación entre personas que todavía no se conocen.
              </p>
            </div>

            <figure className="studio-visual reveal-on-scroll-right relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-violet-200/20 bg-black/40 shadow-[0_30px_90px_rgba(76,29,149,0.38)]">
              <Image
                src="/images/featmusic-collaboration-studio.webp"
                alt="Cantante, productor y músico colaborando en un estudio de grabación"
                fill
                priority={false}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,2,18,0.9),transparent_58%)]" />
              <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 p-5 sm:p-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200/75">
                    Una sesión, distintas fortalezas
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Ideas que crecen cuando se comparten
                  </p>
                </div>
                <div className="flex -space-x-2" aria-label="Roles en la sesión">
                  {[
                    ["V", "Vocalista"],
                    ["P", "Productor"],
                    ["M", "Músico"],
                  ].map(([inicial, rol]) => (
                    <span
                      key={rol}
                      title={rol}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1b0b2c] bg-gradient-to-br from-violet-400 to-fuchsia-600 text-xs font-bold shadow-lg"
                    >
                      {inicial}
                    </span>
                  ))}
                </div>
              </figcaption>
            </figure>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="dynamic-card reveal-on-scroll rounded-3xl border border-white/15 bg-black/25 p-7 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-black/35">
              <span className="visual-icon visual-icon-violet">
                <GraphicIcon name="search" />
              </span>
              <h3 className="text-xl font-semibold">Encuentra colaboradores</h3>

              <p className="mt-3 text-violet-100/70">
                Descubre perfiles compatibles según rol, género musical,
                ubicación e idioma.
              </p>
            </article>

            <article className="dynamic-card reveal-on-scroll rounded-3xl border border-white/15 bg-black/25 p-7 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-black/35">
              <span className="visual-icon visual-icon-violet">
                <GraphicIcon name="check" />
              </span>
              <h3 className="text-xl font-semibold">Confirma la colaboración</h3>

              <p className="mt-3 text-violet-100/70">
                Cuando exista interés de ambas partes, confirmen que quieren
                trabajar en el proyecto.
              </p>
            </article>

            <article className="dynamic-card reveal-on-scroll rounded-3xl border border-white/15 bg-black/25 p-7 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-black/35">
              <span className="visual-icon visual-icon-violet">
                <GraphicIcon name="chat" />
              </span>
              <h3 className="text-xl font-semibold">Conversa en privado</h3>

              <p className="mt-3 text-violet-100/70">
                Al confirmar la colaboración se abrirá un chat privado para
                organizar todos los detalles.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[72vh] items-center overflow-hidden border-b border-sky-300/10 bg-[#06111f]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_25%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_15%_80%,rgba(99,102,241,0.26),transparent_34%),linear-gradient(145deg,#07182a,#080c1d_60%,#111338)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(186,230,253,0.7)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="reveal-on-scroll mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
              Cómo funciona
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              De tu perfil a una nueva colaboración.
            </h2>
            <p className="mt-5 text-lg text-slate-300">
              Presenta tu talento, define lo que buscas y descubre personas que
              compartan tu dirección musical.
            </p>
          </div>

          <div className="steps-grid relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pasosColaboracion.map(({ numero, titulo, descripcion, icono }) => (
              <article
                key={numero}
                className="dynamic-card reveal-on-scroll group rounded-3xl border border-sky-200/15 bg-slate-950/55 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-sky-300/35"
              >
                <div className="flex items-center justify-between">
                  <span className="visual-icon visual-icon-sky visual-icon-compact">
                    <GraphicIcon name={icono} />
                  </span>
                  <span className="text-sm font-bold tracking-[0.2em] text-sky-300/70">
                    {numero}
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-semibold">{titulo}</h3>
                <p className="mt-3 leading-7 text-slate-300">{descripcion}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[72vh] items-center overflow-hidden border-b border-rose-200/10 bg-[#190b16]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(244,63,94,0.2),transparent_30%),radial-gradient(circle_at_88%_75%,rgba(168,85,247,0.24),transparent_32%),linear-gradient(120deg,#210d1a,#120914_55%,#24102f)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(125deg,transparent_0%,transparent_48%,rgba(255,255,255,0.16)_49%,transparent_50%,transparent_100%)] [background-size:64px_64px]"
        />

        <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="reveal-on-scroll-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
              Una comunidad, muchos talentos
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Encuentra a la persona que tu proyecto necesita.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-rose-100/70">
              Desde una primera idea hasta la versión final, cada etapa puede
              mejorar cuando trabajas con alguien que entiende tu sonido.
            </p>
            <div className="mt-9 flex max-w-md items-center gap-4 rounded-2xl border border-rose-100/15 bg-black/25 p-4 backdrop-blur-sm">
              <span className="visual-icon visual-icon-rose visual-icon-compact shrink-0">
                <GraphicIcon name="waveform" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex h-8 items-center gap-1" aria-hidden="true">
                  {[10, 20, 14, 27, 18, 32, 12, 24, 16, 29, 19, 11].map(
                    (altura, indice) => (
                      <span
                        key={`${altura}-${indice}`}
                        className="waveform-bar flex-1 rounded-full bg-gradient-to-t from-rose-500 to-fuchsia-300"
                        style={{ height: `${altura}px` }}
                      />
                    ),
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-200/65">
                  Cada talento suma una nueva capa
                </p>
              </div>
            </div>
          </div>

          <div className="reveal-on-scroll-right grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profesionales.map((profesional) => (
              <div
                key={profesional.nombre}
                className="dynamic-card group flex min-h-28 flex-col justify-between rounded-2xl border border-rose-100/15 bg-black/25 p-5 font-semibold text-rose-50 backdrop-blur-sm transition hover:-translate-y-1 hover:border-rose-300/45 hover:bg-black/35"
              >
                <GraphicIcon
                  name={profesional.icono}
                  className="h-6 w-6 text-rose-300 transition group-hover:scale-110 group-hover:text-fuchsia-200"
                />
                <span className="mt-5">{profesional.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden border-b border-emerald-200/10 bg-[#061916]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(6,182,212,0.2),transparent_30%),linear-gradient(145deg,#071d18,#061310_55%,#09201f)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:repeating-radial-gradient(circle_at_15%_110%,transparent_0,transparent_44px,rgba(167,243,208,0.18)_45px,transparent_46px)]"
        />

        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="reveal-on-scroll max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Tú eliges la dinámica
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Colabora de la manera que mejor funcione para ti.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {tiposDeColaboracion.map((tipo) => (
              <article
                key={tipo.titulo}
                className="dynamic-card reveal-on-scroll group rounded-3xl border border-emerald-100/15 bg-black/25 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-emerald-300/45"
              >
                <div className="flex items-start justify-between">
                  <span className="visual-icon visual-icon-emerald visual-icon-compact">
                    <GraphicIcon name={tipo.icono} />
                  </span>
                  <span className="h-12 w-12 rounded-full border border-emerald-300/15 bg-[radial-gradient(circle,rgba(52,211,153,0.28),transparent_68%)] transition duration-500 group-hover:scale-125" />
                </div>
                <h3 className="mt-8 text-2xl font-semibold">{tipo.titulo}</h3>
                <p className="mt-3 leading-7 text-emerald-50/65">
                  {tipo.descripcion}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden border-b border-amber-200/10 bg-[#171006]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_88%_80%,rgba(168,85,247,0.2),transparent_32%),linear-gradient(145deg,#1d1307,#100c08_55%,#24152d)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(30deg,rgba(253,230,138,0.15)_12%,transparent_12.5%,transparent_87%,rgba(253,230,138,0.15)_87.5%)] [background-size:72px_42px]"
        />

        <div className="mx-auto w-full max-w-7xl px-6 py-24">
          <div className="reveal-on-scroll mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              Un modelo claro
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Gratis para comenzar. Sin comisiones por crear juntos.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="dynamic-card reveal-on-scroll rounded-3xl border border-amber-100/15 bg-black/30 p-8 backdrop-blur-sm">
              <span className="visual-icon visual-icon-amber">
                <GraphicIcon name="gift" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">
                Acceso gratuito
              </p>
              <h3 className="mt-5 text-2xl font-semibold">
                Empieza sin pagar
              </h3>
              <p className="mt-3 leading-7 text-amber-50/65">
                Crea tu perfil y comienza a buscar personas con quienes hacer
                música.
              </p>
            </article>

            <article className="dynamic-card reveal-on-scroll reveal-delay-1 rounded-3xl border border-amber-100/15 bg-black/30 p-8 backdrop-blur-sm">
              <span className="visual-icon visual-icon-amber">
                <GraphicIcon name="crown" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">
                Suscripción opcional
              </p>
              <h3 className="mt-5 text-2xl font-semibold">
                Más posibilidades
              </h3>
              <p className="mt-3 leading-7 text-amber-50/65">
                Quienes quieran ampliar su experiencia podrán acceder a
                funciones adicionales.
              </p>
            </article>

            <article className="dynamic-card reveal-on-scroll reveal-delay-2 rounded-3xl border border-amber-100/15 bg-black/30 p-8 backdrop-blur-sm">
              <span className="visual-icon visual-icon-amber">
                <GraphicIcon name="percent" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">
                0 % de comisión
              </p>
              <h3 className="mt-5 text-2xl font-semibold">
                Tu colaboración es tuya
              </h3>
              <p className="mt-3 leading-7 text-amber-50/65">
                FeatMusic no cobrará comisión por las colaboraciones que
                completes.
              </p>
            </article>
          </div>

          <div className="mx-auto mt-10 flex w-fit items-center gap-3 rounded-full border border-amber-100/15 bg-black/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-amber-100/65 backdrop-blur-sm">
            <GraphicIcon name="globe" className="h-5 w-5 text-amber-300" />
            <span>Español · English · Português do Brasil</span>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-b border-indigo-200/10 bg-[#0b0b20]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_25%,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(139,92,246,0.2),transparent_30%),linear-gradient(150deg,#0e0e2d,#090916_58%,#151034)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-15 [background-image:linear-gradient(rgba(199,210,254,0.15)_1px,transparent_1px)] [background-size:100%_36px]"
        />

        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal-on-scroll-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Preguntas frecuentes
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Lo esencial antes de comenzar.
            </h2>
            <div className="mt-10 rounded-3xl border border-indigo-100/15 bg-black/20 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-indigo-200">
                <span className="visual-icon visual-icon-indigo visual-icon-compact">
                  <GraphicIcon name="chat" />
                </span>
                <div>
                  <p className="font-semibold text-white">Respuestas claras</p>
                  <p className="text-sm text-indigo-100/55">Sin letra pequeña</p>
                </div>
              </div>
              <div className="mt-6 flex items-end gap-1.5" aria-hidden="true">
                {[12, 22, 16, 30, 19, 38, 26, 15, 33, 21, 27, 13].map(
                  (altura, indice) => (
                    <span
                      key={`${altura}-${indice}`}
                      className="faq-wave-bar flex-1 rounded-t-full bg-gradient-to-t from-indigo-600/40 to-indigo-300"
                      style={{ height: `${altura}px` }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {preguntasFrecuentes.map((item) => (
              <details
                key={item.pregunta}
                className="dynamic-card reveal-on-scroll group rounded-2xl border border-indigo-100/15 bg-black/25 p-6 backdrop-blur-sm open:border-indigo-300/35"
              >
                <summary className="cursor-pointer list-none pr-8 text-lg font-semibold marker:hidden">
                  {item.pregunta}
                </summary>
                <p className="mt-4 max-w-2xl leading-7 text-indigo-100/65">
                  {item.respuesta}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#23053d] px-6 py-28 text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_120%,rgba(236,72,153,0.38),transparent_40%),radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.4),transparent_38%),linear-gradient(135deg,#260746,#160229_55%,#310953)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:34px_34px]"
        />

        <div className="reveal-on-scroll mx-auto max-w-3xl">
          <div className="mb-8 flex items-center justify-center -space-x-3" aria-hidden="true">
            {[
              ["microphone", "from-violet-400 to-fuchsia-600"],
              ["sliders", "from-fuchsia-400 to-rose-600"],
              ["note", "from-indigo-400 to-violet-600"],
            ].map(([icono, color], indice) => (
              <span
                key={icono}
                className={`cta-icon-float flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#260746] bg-gradient-to-br ${color} shadow-xl`}
                style={{ animationDelay: `${indice * 180}ms` }}
              >
                <GraphicIcon name={icono as GraphicIconName} className="h-6 w-6" />
              </span>
            ))}
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
            Tu próxima colaboración
          </p>
          <h2 className="section-title-reveal mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="animated-gradient-text block bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
              Puede empezar con un perfil.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-violet-100/75">
            Muestra lo que haces, define lo que buscas y abre la puerta a nuevas
            ideas, sonidos y oportunidades.
          </p>
          <Link
            href="/registro"
            className="mt-10 inline-flex rounded-full bg-white px-8 py-4 font-semibold text-violet-950 shadow-2xl transition hover:-translate-y-0.5 hover:bg-violet-100"
          >
            Crear mi perfil gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-8 text-zinc-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            Feat<span className="text-violet-400">Music</span>
          </Link>
          <p className="text-sm">
            Una comunidad para crear música en colaboración.
          </p>
        </div>
      </footer>
    </main>
  );
}
