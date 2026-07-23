import Link from "next/link";

const profesionales = [
  "Cantantes",
  "Raperos",
  "Productores",
  "Beatmakers",
  "Compositores",
  "Músicos",
  "Ingenieros de mezcla",
  "Ingenieros de mastering",
  "DJs",
];

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
  },
  {
    titulo: "Trabajos pagos",
    descripcion:
      "Encuentra profesionales para producción, voces, instrumentos, mezcla o mastering.",
  },
  {
    titulo: "Ambas opciones",
    descripcion:
      "Mantén tu perfil abierto a oportunidades creativas y propuestas profesionales.",
  },
];

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

        <a
          href="#descubrir"
          aria-label="Descubrir más sobre FeatMusic"
          className="scroll-cue absolute bottom-6 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl text-white/80 backdrop-blur-md transition hover:border-white/50 hover:bg-black/50"
        >
          ↓
        </a>
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
          <div className="reveal-on-scroll max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
              Colaboraciones que sí encajan
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Un espacio creado para encontrar a las personas correctas.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="dynamic-card reveal-on-scroll rounded-3xl border border-white/15 bg-black/25 p-7 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-black/35">
              <h3 className="text-xl font-semibold">Encuentra colaboradores</h3>

              <p className="mt-3 text-violet-100/70">
                Descubre perfiles compatibles según rol, género musical,
                ubicación e idioma.
              </p>
            </article>

            <article className="dynamic-card reveal-on-scroll reveal-delay-1 rounded-3xl border border-white/15 bg-black/25 p-7 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-black/35">
              <h3 className="text-xl font-semibold">Confirma la colaboración</h3>

              <p className="mt-3 text-violet-100/70">
                Cuando exista interés de ambas partes, confirmen que quieren
                trabajar en el proyecto.
              </p>
            </article>

            <article className="dynamic-card reveal-on-scroll reveal-delay-2 rounded-3xl border border-white/15 bg-black/25 p-7 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-violet-300/50 hover:bg-black/35">
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
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              De tu perfil a una nueva colaboración.
            </h2>
            <p className="mt-5 text-lg text-slate-300">
              Presenta tu talento, define lo que buscas y descubre personas que
              compartan tu dirección musical.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Crea tu perfil", "Cuenta quién eres, qué haces y con qué géneros te identificas."],
              ["02", "Encuentra compatibilidad", "Descubre personas por rol, ubicación, idioma y estilo musical."],
              ["03", "Confirma el proyecto", "Ambas personas aceptan la colaboración antes de avanzar."],
              ["04", "Abre el chat privado", "Coordinen la idea, el proceso y los siguientes pasos en un espacio propio."],
            ].map(([numero, titulo, descripcion]) => (
              <article
                key={numero}
                className="dynamic-card reveal-on-scroll rounded-3xl border border-sky-200/15 bg-slate-950/45 p-8 backdrop-blur-sm"
              >
                <span className="text-sm font-bold tracking-[0.2em] text-sky-300">
                  {numero}
                </span>
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
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Encuentra a la persona que tu proyecto necesita.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-rose-100/70">
              Desde una primera idea hasta la versión final, cada etapa puede
              mejorar cuando trabajas con alguien que entiende tu sonido.
            </p>
          </div>

          <div className="reveal-on-scroll-right grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profesionales.map((profesional) => (
              <div
                key={profesional}
                className="dynamic-card flex min-h-24 items-center rounded-2xl border border-rose-100/15 bg-black/25 p-5 font-semibold text-rose-50 backdrop-blur-sm transition hover:-translate-y-1 hover:border-rose-300/45 hover:bg-black/35"
              >
                {profesional}
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
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Colabora de la manera que mejor funcione para ti.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {tiposDeColaboracion.map((tipo) => (
              <article
                key={tipo.titulo}
                className="dynamic-card reveal-on-scroll rounded-3xl border border-emerald-100/15 bg-black/25 p-8 backdrop-blur-sm transition hover:-translate-y-1 hover:border-emerald-300/45"
              >
                <div className="h-1 w-12 rounded-full bg-emerald-400" />
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
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Gratis para comenzar. Sin comisiones por crear juntos.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="dynamic-card reveal-on-scroll rounded-3xl border border-amber-100/15 bg-black/30 p-8 backdrop-blur-sm">
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

          <p className="mt-10 text-center text-sm font-semibold uppercase tracking-[0.18em] text-amber-100/65">
            Español · English · Português do Brasil
          </p>
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
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Lo esencial antes de comenzar.
            </h2>
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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">
            Tu próxima colaboración
          </p>
          <h2 className="animated-gradient-text mt-5 bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
            Puede empezar con un perfil.
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
