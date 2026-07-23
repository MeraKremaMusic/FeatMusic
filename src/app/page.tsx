"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  homeCopy,
  languageOptions,
  type Locale,
} from "./home-copy";

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
  | "globe"
  | "play"
  | "pause"
  | "download";

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
    play: <path d="m9 7 8 5-8 5V7Z" />,
    pause: (
      <>
        <path d="M9 7v10" />
        <path d="M15 7v10" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m0 0 5-5m-5 5-5-5" />
        <path d="M5 20h14" />
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

const processIcons: GraphicIconName[] = [
  "waveform",
  "pen",
  "users",
  "chat",
];
const connectionIcons: GraphicIconName[] = [
  "globe",
  "headphones",
  "users",
];
const communityIcons: GraphicIconName[] = ["microphone", "disc", "pen"];
const planIcons: GraphicIconName[] = ["gift", "crown", "spark"];
const planHighlights = ["$0", "$5", "$10"] as const;
const demoWaveform = [
  18, 32, 44, 24, 52, 68, 38, 74, 48, 30, 58, 82, 46, 66, 34, 24, 54, 72,
  40, 62, 86, 48, 32, 58, 76, 42, 68, 36, 22, 52, 70, 44, 60, 28, 46, 20,
];
const proposalWaveforms = [
  [12, 22, 15, 28, 18, 31, 20, 14, 26, 17, 23, 12],
  [18, 11, 25, 16, 30, 20, 14, 27, 19, 32, 16, 21],
  [10, 19, 27, 13, 24, 32, 18, 22, 15, 29, 20, 12],
];

function isLocale(value: string | null): value is Locale {
  return languageOptions.some((option) => option.code === value);
}

type FaqItem = {
  question: string;
  answer: string;
};

function FaqCarousel({
  items,
  labels,
}: {
  items: readonly FaqItem[];
  labels: {
    question: string;
    previous: string;
    next: string;
    showQuestion: string;
    navigation: string;
  };
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const showSlide = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const nextIndex = Math.max(
      0,
      Math.min(index, items.length - 1),
    );

    track.scrollTo({
      left: nextIndex * track.clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(nextIndex);
  };

  const syncActiveSlide = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    setActiveIndex(
      Math.min(
        items.length - 1,
        Math.round(track.scrollLeft / track.clientWidth),
      ),
    );
  };

  return (
    <div className="reveal-on-scroll mt-10 xl:mt-6" data-faq-carousel>
      <div
        ref={trackRef}
        onScroll={syncActiveSlide}
        className="faq-carousel-track flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {items.map((item, indice) => (
          <article
            key={item.question}
            className="faq-answer-card relative min-h-64 w-full shrink-0 snap-start overflow-hidden border p-7 sm:min-h-72 sm:p-10 xl:min-h-56 xl:p-7"
          >
            <div className="faq-answer-content relative">
              <div className="faq-answer-header flex items-center justify-between gap-4">
                <span className="faq-question-label">
                  {labels.question} {String(indice + 1).padStart(2, "0")}
                </span>
                <span className="faq-question-count">
                  {String(indice + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <div className="faq-answer-copy">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-2 sm:justify-start" aria-label={labels.navigation}>
          {items.map((item, indice) => (
            <button
              key={item.question}
              type="button"
              aria-label={`${labels.showQuestion} ${indice + 1}`}
              aria-current={activeIndex === indice ? "true" : undefined}
              onClick={() => showSlide(indice)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === indice
                  ? "w-8 bg-indigo-300"
                  : "w-2 bg-indigo-100/20 hover:bg-indigo-100/40"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 sm:justify-end">
          <button
            type="button"
            aria-label={labels.previous}
            disabled={activeIndex === 0}
            onClick={() => showSlide(activeIndex - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-indigo-100/15 bg-black/25 text-indigo-100 transition hover:border-indigo-300/40 hover:bg-indigo-400/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={labels.next}
            disabled={activeIndex === items.length - 1}
            onClick={() => showSlide(activeIndex + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-indigo-100/15 bg-black/25 text-indigo-100 transition hover:border-indigo-300/40 hover:bg-indigo-400/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("es");
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const languageMenuRef = useRef<HTMLDetailsElement>(null);
  const plansTrackRef = useRef<HTMLDivElement>(null);
  const copy = homeCopy[locale];
  const activeLanguage =
    languageOptions.find((option) => option.code === locale) ??
    languageOptions[0];

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("featmusic-language");
    let detectedLocale: Locale = "es";

    if (isLocale(savedLocale)) {
      detectedLocale = savedLocale;
    } else {
      const browserLanguage = window.navigator.language.toLowerCase();
      if (browserLanguage.startsWith("pt")) {
        detectedLocale = "pt-BR";
      } else if (browserLanguage.startsWith("en")) {
        detectedLocale = "en";
      }
    }

    if (detectedLocale === "es") return;

    const animationFrame = window.requestAnimationFrame(() => {
      setLocale(detectedLocale);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = copy.meta.title;

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", copy.meta.description);
  }, [copy.meta.description, copy.meta.title, locale]);

  const changeLanguage = (nextLocale: Locale) => {
    setLocale(nextLocale);
    window.localStorage.setItem("featmusic-language", nextLocale);
    languageMenuRef.current?.removeAttribute("open");
  };

  const syncActivePlan = () => {
    const track = plansTrackRef.current;
    if (!track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-plan-card]"),
    );
    if (cards.length === 0) return;

    const viewportCenter = track.scrollLeft + track.clientWidth / 2;
    const closestIndex = cards.reduce((closest, card, index) => {
      const closestCard = cards[closest];
      const closestDistance = Math.abs(
        closestCard.offsetLeft +
          closestCard.offsetWidth / 2 -
          viewportCenter,
      );
      const cardDistance = Math.abs(
        card.offsetLeft + card.offsetWidth / 2 - viewportCenter,
      );
      return cardDistance < closestDistance ? index : closest;
    }, 0);

    setActivePlanIndex(closestIndex);
  };

  const showPlan = (index: number) => {
    const track = plansTrackRef.current;
    const card = track?.querySelectorAll<HTMLElement>("[data-plan-card]")[index];
    if (!track || !card) return;

    track.scrollTo({
      left:
        card.offsetLeft -
        (track.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
    setActivePlanIndex(index);
  };

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

  useEffect(() => {
    const desktopPointer = window.matchMedia(
      "(min-width: 1280px) and (pointer: fine)",
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let wheelIntent = 0;
    let navigationLocked = false;
    let unlockTimer: number | undefined;

    const navigateByWheel = (event: WheelEvent) => {
      if (
        !desktopPointer.matches ||
        reducedMotion.matches ||
        event.ctrlKey ||
        Math.abs(event.deltaY) < 2
      ) {
        return;
      }

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-home-section]"),
      );
      if (sections.length === 0) return;

      const headerHeight =
        document.querySelector<HTMLElement>("header")?.offsetHeight ?? 0;
      const referenceY = window.scrollY + headerHeight;
      const currentIndex = sections.reduce(
        (closestIndex, section, index) => {
          const currentDistance = Math.abs(
            sections[closestIndex].offsetTop - referenceY,
          );
          const nextDistance = Math.abs(section.offsetTop - referenceY);
          return nextDistance < currentDistance ? index : closestIndex;
        },
        0,
      );

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0 || nextIndex >= sections.length) {
        return;
      }

      event.preventDefault();
      if (navigationLocked) return;

      wheelIntent += event.deltaY;
      if (Math.abs(wheelIntent) < 18) return;

      navigationLocked = true;
      wheelIntent = 0;

      window.scrollTo({
        top: Math.max(0, sections[nextIndex].offsetTop - headerHeight),
        behavior: "smooth",
      });

      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        navigationLocked = false;
      }, 900);
    };

    window.addEventListener("wheel", navigateByWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", navigateByWheel);
      window.clearTimeout(unlockTimer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4">
          <Link href="/" className="text-xl font-bold tracking-tight sm:text-[1.35rem]">
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <nav
            className="flex items-center gap-3 sm:gap-4"
            aria-label={copy.header.navigation}
          >
            <div className="hidden items-center gap-6 lg:flex">
              <a
                href="#como-funciona"
                className="text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                {copy.header.howItWorks}
              </a>
              <a
                href="#comunidad"
                className="text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                {copy.header.community}
              </a>
              <a
                href="#planes"
                className="text-sm font-medium text-zinc-400 transition hover:text-white"
              >
                {copy.header.plans}
              </a>
            </div>

            <details ref={languageMenuRef} className="group relative">
              <summary
                aria-label={`${copy.header.language}: ${activeLanguage.label}`}
                title={copy.header.language}
                className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold text-zinc-100 backdrop-blur-md transition hover:border-violet-300/40 hover:bg-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 [&::-webkit-details-marker]:hidden"
              >
                <GraphicIcon
                  name="globe"
                  className="h-4 w-4 text-violet-300"
                />
                <span>{activeLanguage.shortLabel}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5 fill-none stroke-current text-zinc-400 transition group-open:rotate-180"
                  strokeWidth="1.8"
                >
                  <path
                    d="m6 8 4 4 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>

              <div className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-48 overflow-hidden rounded-2xl border border-white/15 bg-[#0b0712]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <p className="px-3 pb-2 pt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  {copy.header.language}
                </p>
                {languageOptions.map((option) => {
                  const isActive = option.code === locale;

                  return (
                    <button
                      key={option.code}
                      type="button"
                      aria-label={`${copy.header.selectedLanguage}: ${option.label}`}
                      aria-pressed={isActive}
                      onClick={() => changeLanguage(option.code)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        isActive
                          ? "bg-violet-500/15 text-violet-200"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-10 text-xs font-bold text-zinc-500">
                          {option.shortLabel}
                        </span>
                        <span>{option.label}</span>
                      </span>
                      {isActive ? (
                        <GraphicIcon
                          name="check"
                          className="h-4 w-4 text-violet-300"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </details>

            <Link
              href="/iniciar-sesion"
              className="text-sm font-medium text-zinc-200 transition hover:text-white"
            >
              {copy.header.login}
            </Link>
          </nav>
        </div>
      </header>

      <section
        data-home-section
        className="home-scroll-section relative isolate min-h-[100svh] overflow-hidden border-b border-white/10"
      >
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

        <div className="mobile-hero-content mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center px-5 pb-16 pt-28 text-center sm:px-6 sm:pt-24 md:-translate-y-1">
          <p className="hero-badge-enter mb-4 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-200 shadow-2xl backdrop-blur-md sm:mb-6 sm:text-sm">
            {copy.hero.badge}
          </p>

          <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight drop-shadow-2xl sm:text-5xl md:text-7xl">
            <span className="hero-title-enter block">{copy.hero.titleOne}</span>
            <span className="hero-title-enter hero-title-enter-delay block">
              <span className="animated-gradient-text bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-300 bg-clip-text text-transparent">
                {copy.hero.titleTwo}
              </span>
            </span>
          </h1>

          <p className="hero-body-enter mt-5 max-w-2xl text-base leading-7 text-zinc-200 drop-shadow-lg sm:mt-7 sm:text-lg sm:leading-8">
            {copy.hero.body}
          </p>

          <div className="hero-actions-enter mt-6 flex w-full max-w-sm flex-col gap-3 sm:mt-10 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
            <Link
              href="/registro"
              className="rounded-full bg-violet-600 px-8 py-4 font-semibold shadow-[0_12px_40px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              {copy.hero.primaryAction}
            </Link>

            <Link
              href="/artistas"
              className="rounded-full border border-white/25 bg-black/35 px-8 py-4 font-semibold backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-black/55"
            >
              {copy.hero.secondaryAction}
            </Link>
          </div>
        </div>

      </section>

      <section
        aria-label={copy.genres.label}
        className="overflow-hidden border-b border-white/10 bg-black py-5"
      >
        <div className="marquee-track">
          {[0, 1].map((grupo) => (
            <div
              key={grupo}
              aria-hidden={grupo === 1}
              className="marquee-group"
            >
              {copy.genres.items.map((genero) => (
                <span key={`${grupo}-${genero}`} className="marquee-item">
                  <span className="text-violet-400">✦</span>
                  {genero}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section
        id="descubrir"
        data-home-section
        className="home-scroll-section relative isolate flex min-h-[calc(100svh-4.25rem)] scroll-mt-24 items-center overflow-hidden border-b border-violet-300/10 bg-[#140323]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_22%,rgba(168,85,247,0.36),transparent_32%),radial-gradient(circle_at_84%_74%,rgba(99,102,241,0.3),transparent_34%),linear-gradient(135deg,#1d0634_0%,#10021d_48%,#21063a_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
        />

        <div className="mobile-section-content mx-auto w-full max-w-7xl px-6 py-16 lg:py-6">
          <div className="mobile-demo-layout grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div className="mobile-demo-intro reveal-on-scroll max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                {copy.demo.eyebrow}
              </p>
              <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl xl:text-[2.65rem] xl:leading-[1.08]">
                {copy.demo.title}
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-violet-100/70 lg:text-base lg:leading-7">
                {copy.demo.body}
              </p>

              <div className="mobile-demo-extras mt-6 flex flex-wrap gap-2.5">
                {copy.demo.benefits.map((benefit, index) => (
                  <span
                    key={benefit}
                    className="inline-flex items-center gap-2 rounded-full border border-violet-200/15 bg-black/25 px-4 py-2 text-sm text-violet-100/80"
                  >
                    <GraphicIcon
                      name={index === 0 ? "check" : "chat"}
                      className="h-4 w-4 text-violet-300"
                    />
                    {benefit}
                  </span>
                ))}
              </div>

              <div className="mobile-demo-extras mt-6 flex flex-wrap gap-3">
                <Link
                  href="/registro"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-950 transition hover:-translate-y-0.5 hover:bg-violet-100"
                >
                  {copy.demo.primaryAction}
                </Link>
                <Link
                  href="/artistas"
                  className="rounded-full border border-violet-200/20 bg-black/20 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-violet-200/45"
                >
                  {copy.demo.secondaryAction}
                </Link>
              </div>
            </div>

            <div className="mobile-product-demo product-demo-shell reveal-on-scroll-right overflow-hidden rounded-[2rem] border border-violet-200/20 bg-[#09060f]/90 shadow-[0_32px_100px_rgba(76,29,149,0.45)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-5 py-4 sm:px-6 xl:py-3">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <span className="rounded-full border border-violet-200/15 bg-violet-500/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-violet-200">
                  {copy.demo.previewLabel}
                </span>
              </div>

              <div className="mobile-demo-pages grid xl:grid-cols-[1.08fr_0.92fr]">
                <div className="mobile-demo-page mobile-demo-idea p-5 sm:p-7 xl:p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-700 text-sm font-bold shadow-lg xl:h-10 xl:w-10">
                        LR
                      </span>
                      <div>
                        <p className="font-semibold text-white">{copy.demo.artistName}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400">
                          <GraphicIcon name="globe" className="h-3.5 w-3.5 text-violet-300" />
                          {copy.demo.location}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-emerald-300">
                      {copy.demo.openIdea}
                    </span>
                  </div>

                  <div className="mt-7 xl:mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300/75">
                      {copy.demo.ideaLabel}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold xl:text-xl">{copy.demo.ideaTitle}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {copy.demo.ideaBody}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 xl:mt-4">
                    {copy.demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`mt-7 rounded-2xl border border-white/10 bg-black/35 p-4 xl:mt-5 xl:p-3 ${
                      demoPlaying ? "demo-audio-playing" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        aria-label={demoPlaying ? copy.demo.pause : copy.demo.play}
                        aria-pressed={demoPlaying}
                        onClick={() => setDemoPlaying((playing) => !playing)}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-[0_8px_28px_rgba(124,58,237,0.45)] transition hover:scale-105 hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 xl:h-10 xl:w-10"
                      >
                        <GraphicIcon
                          name={demoPlaying ? "pause" : "play"}
                          className="h-5 w-5"
                        />
                      </button>
                      <div className="flex h-16 min-w-0 flex-1 items-center gap-[3px] xl:h-12" aria-hidden="true">
                        {demoWaveform.map((height, index) => (
                          <span
                            key={`${height}-${index}`}
                            className="demo-wave-bar min-w-[2px] flex-1 rounded-full bg-gradient-to-t from-violet-700 to-fuchsia-300"
                            style={{
                              height: `${height}%`,
                              animationDelay: `${index * 42}ms`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-zinc-500">{copy.demo.duration}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-violet-200/10 bg-violet-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between xl:mt-4 xl:p-3">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-violet-300/70">
                        {copy.demo.seekingLabel}
                      </p>
                      <p className="mt-1 font-semibold">{copy.demo.seekingValue}</p>
                    </div>
                    <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300">
                      <GraphicIcon name="download" className="h-4 w-4" />
                      {copy.demo.download}
                    </span>
                  </div>
                </div>

                <div className="mobile-demo-page mobile-demo-proposals border-t border-white/10 bg-black/25 p-5 sm:p-7 xl:border-l xl:border-t-0 xl:p-4">
                  <p className="font-semibold text-white">{copy.demo.proposalsTitle}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {copy.demo.proposalsCaption}
                  </p>

                  <div className="mt-5 space-y-3 xl:mt-4 xl:space-y-2">
                    {copy.demo.proposals.map((proposal, index) => (
                      <article
                        key={proposal.name}
                        className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-violet-300/25 hover:bg-violet-500/[0.06] xl:p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-200/15 bg-violet-500/15 text-xs font-bold text-violet-200">
                            {proposal.initial}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{proposal.name}</p>
                            <p className="truncate text-xs text-zinc-500">{proposal.location}</p>
                          </div>
                          <span
                            aria-hidden="true"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-violet-200"
                          >
                            <GraphicIcon name="play" className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="mobile-proposal-waveform mt-3 flex h-8 items-center gap-1 xl:hidden" aria-hidden="true">
                          {proposalWaveforms[index].map((height, barIndex) => (
                            <span
                              key={`${height}-${barIndex}`}
                              className="flex-1 rounded-full bg-violet-300/30 transition group-hover:bg-violet-300/55"
                              style={{ height: `${height}px` }}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-violet-300/55 xl:mt-1">
                          {proposal.style}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.06] p-4 xl:mt-4 xl:p-3">
                    <div className="flex gap-3">
                      <GraphicIcon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-100">{copy.demo.decisionTitle}</p>
                        <p className="mt-1 text-xs leading-5 text-emerald-100/55">{copy.demo.decisionBody}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        data-home-section
        className="home-scroll-section relative isolate flex min-h-[calc(100svh-4.25rem)] scroll-mt-24 items-center overflow-hidden border-b border-sky-300/10 bg-[#06111f]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_25%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_15%_80%,rgba(99,102,241,0.26),transparent_34%),linear-gradient(145deg,#07182a,#080c1d_60%,#111338)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(rgba(186,230,253,0.7)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="mobile-section-content mx-auto w-full max-w-7xl px-6 py-16 lg:py-10">
          <div className="mobile-section-heading reveal-on-scroll mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
              {copy.process.eyebrow}
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              {copy.process.title}
            </h2>
            <p className="mt-5 text-lg text-slate-300">
              {copy.process.body}
            </p>
          </div>

          <div className="mobile-card-carousel mobile-process-carousel steps-grid relative mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {copy.process.steps.map((step, index) => (
              <article
                key={step.title}
                className="process-step-card dynamic-card reveal-on-scroll group relative flex flex-col overflow-hidden border p-6 transition duration-500 hover:-translate-y-1"
              >
                <div className="process-step-header flex items-center gap-3">
                  <span className="visual-icon visual-icon-sky visual-icon-compact">
                    <GraphicIcon name={processIcons[index]} />
                  </span>
                  <h3>{step.title}</h3>
                  <span className="process-step-index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="process-step-copy">
                  <p>{step.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="global"
        data-home-section
        className="home-scroll-section relative isolate flex min-h-[calc(100svh-4.25rem)] scroll-mt-24 items-center overflow-hidden border-b border-rose-200/10 bg-[#190b16]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(244,63,94,0.2),transparent_30%),radial-gradient(circle_at_88%_75%,rgba(168,85,247,0.24),transparent_32%),linear-gradient(120deg,#210d1a,#120914_55%,#24102f)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(125deg,transparent_0%,transparent_48%,rgba(255,255,255,0.16)_49%,transparent_50%,transparent_100%)] [background-size:64px_64px]"
        />

        <div className="mobile-section-content mobile-global-layout mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-5">
          <div className="mobile-global-intro reveal-on-scroll-left">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
              {copy.global.eyebrow}
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl xl:text-[2.65rem] xl:leading-[1.08]">
              {copy.global.title}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-rose-100/70 lg:text-base lg:leading-7">
              {copy.global.body}
            </p>
            <div className="mobile-global-route mt-6 max-w-lg rounded-2xl border border-rose-100/15 bg-black/25 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-rose-200/15 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 sm:text-sm">
                  {copy.global.origin}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-rose-400 via-fuchsia-300 to-violet-400" />
                <GraphicIcon name="globe" className="h-5 w-5 shrink-0 text-fuchsia-300" />
                <span className="h-px flex-1 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-rose-400" />
                <span className="rounded-full border border-rose-200/15 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 sm:text-sm">
                  {copy.global.destination}
                </span>
              </div>
              <p className="mt-3 text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-rose-200/60">
                {copy.global.routeCaption}
              </p>
            </div>
            <div className="global-network-card mobile-global-network relative mt-3 flex max-w-lg items-center gap-3 overflow-hidden border p-3">
              <span className="visual-icon visual-icon-rose visual-icon-compact shrink-0 xl:h-10 xl:w-10">
                <GraphicIcon name="users" />
              </span>
              <div>
                <p className="font-semibold text-white">
                  {copy.global.networkTitle}
                </p>
                <p className="mt-1 text-sm leading-6 text-rose-100/60">
                  {copy.global.networkBody}
                </p>
              </div>
            </div>
          </div>

          <div className="mobile-card-carousel mobile-global-cards reveal-on-scroll-right grid gap-3">
            {copy.global.cards.map((card, index) => (
              <article
                key={card.title}
                className="global-feature-card dynamic-card group relative flex flex-col overflow-hidden border p-5 text-rose-50 transition duration-500 hover:-translate-y-1 sm:p-6 xl:p-4"
              >
                <div className="global-feature-header flex items-center gap-3">
                  <span className="visual-icon visual-icon-rose visual-icon-compact shrink-0">
                    <GraphicIcon name={connectionIcons[index]} />
                  </span>
                  <h3>{card.title}</h3>
                  <span className="global-feature-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <div className="global-feature-copy">
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="comunidad"
        data-home-section
        className="home-scroll-section relative isolate flex min-h-[calc(100svh-4.25rem)] scroll-mt-24 items-center overflow-hidden border-b border-emerald-200/10 bg-[#061916]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(6,182,212,0.2),transparent_30%),linear-gradient(145deg,#071d18,#061310_55%,#09201f)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:repeating-radial-gradient(circle_at_15%_110%,transparent_0,transparent_44px,rgba(167,243,208,0.18)_45px,transparent_46px)]"
        />

        <div className="mobile-section-content mx-auto w-full max-w-7xl px-6 py-16 lg:py-5">
          <div className="mobile-section-heading reveal-on-scroll max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {copy.community.eyebrow}
            </p>
            <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl xl:text-[2.65rem] xl:leading-[1.08]">
              {copy.community.title}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-emerald-50/65 lg:text-base lg:leading-7">
              {copy.community.body}
            </p>
          </div>

          <div className="mobile-card-carousel mobile-community-carousel mt-6 grid gap-5 md:grid-cols-3">
            {copy.community.cards.map((card, index) => (
              <article
                key={card.title}
                className="community-role-card dynamic-card reveal-on-scroll group relative flex flex-col overflow-hidden border p-5 transition duration-500 hover:-translate-y-1"
              >
                <div className="community-role-header flex items-center gap-3">
                  <span className="visual-icon visual-icon-emerald visual-icon-compact">
                    <GraphicIcon name={communityIcons[index]} />
                  </span>
                  <h3>{card.title}</h3>
                  <span className="community-role-index" aria-hidden="true">
                    0{index + 1}
                  </span>
                </div>
                <div className="community-role-copy">
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="planes"
        data-home-section
        className="home-scroll-section relative isolate flex min-h-[calc(100svh-4.25rem)] scroll-mt-24 items-center overflow-hidden border-b border-amber-200/10 bg-[#171006]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_88%_80%,rgba(202,138,4,0.16),transparent_32%),linear-gradient(145deg,#1d1307,#100c08_55%,#211807)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(30deg,rgba(253,230,138,0.15)_12%,transparent_12.5%,transparent_87%,rgba(253,230,138,0.15)_87.5%)] [background-size:72px_42px]"
        />

        <div className="mobile-plans-content mobile-section-content mx-auto w-full max-w-7xl px-6 py-16 lg:py-6">
          <div className="mobile-section-heading reveal-on-scroll mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              {copy.plans.eyebrow}
            </p>
            <h2 className="section-title-reveal mt-3 text-3xl font-bold tracking-tight sm:text-5xl xl:text-[2.65rem] xl:leading-[1.08]">
              {copy.plans.title}
            </h2>
          </div>

          <div
            ref={plansTrackRef}
            onScroll={syncActivePlan}
            className="mobile-card-carousel mobile-plans-carousel mt-8 grid gap-5 md:grid-cols-3"
          >
            {copy.plans.cards.map((card, index) => (
              <article
                key={card.title}
                data-plan-card
                className={`mobile-plan-card dynamic-card reveal-on-scroll group relative flex min-h-60 flex-col overflow-hidden rounded-3xl border p-6 backdrop-blur-sm transition duration-500 hover:-translate-y-2 ${
                  activePlanIndex === index ? "is-active" : ""
                } ${
                  index === 0
                    ? "border-amber-200/20 bg-[linear-gradient(145deg,rgba(36,24,5,0.9),rgba(10,8,5,0.82))] hover:border-amber-300/45"
                    : index === 1
                      ? "reveal-delay-1 border-amber-300/35 bg-[linear-gradient(145deg,rgba(52,31,5,0.94),rgba(17,10,8,0.88))] shadow-[0_22px_70px_rgba(245,158,11,0.13)] hover:border-amber-200/65"
                      : "reveal-delay-2 border-fuchsia-200/20 bg-[linear-gradient(145deg,rgba(22,12,20,0.9),rgba(30,15,40,0.84))] hover:border-fuchsia-300/45"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -right-10 -top-12 h-36 w-36 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${
                    index === 2 ? "bg-fuchsia-500/15" : "bg-amber-400/15"
                  }`}
                />
                <div className="relative flex items-center gap-4">
                  <span className="visual-icon visual-icon-amber visual-icon-compact shrink-0">
                    <GraphicIcon name={planIcons[index]} />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                    {card.label}
                  </p>
                </div>
                <div className="mobile-plan-main hidden">
                  <div className="mobile-plan-price">
                    <span className="mobile-plan-number">
                      {planHighlights[index]}
                    </span>
                    <span className="mobile-plan-period">
                      {copy.plans.billingPeriod}
                    </span>
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
                <ul className="mobile-plan-features hidden">
                  {card.features.map((feature) => (
                    <li key={feature}>
                      <span aria-hidden="true">
                        <GraphicIcon name="check" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mobile-plan-desktop-copy relative mt-auto pt-7">
                  <h3 className="text-2xl font-semibold">{card.title}</h3>
                  <p className="mt-3 leading-7 text-amber-50/65">
                    {card.body}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent ${
                    index === 2 ? "via-fuchsia-300/55" : "via-amber-300/55"
                  } to-transparent opacity-0 transition duration-500 group-hover:opacity-100`}
                />
              </article>
            ))}
          </div>
          <div
            className="mobile-plan-pagination hidden"
            aria-label={copy.plans.eyebrow}
          >
            {copy.plans.cards.map((card, index) => (
              <button
                key={card.label}
                type="button"
                aria-label={card.label}
                aria-current={activePlanIndex === index ? "true" : undefined}
                onClick={() => showPlan(index)}
                className={activePlanIndex === index ? "is-active" : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        id="preguntas"
        data-home-section
        className="home-scroll-section relative isolate flex min-h-[calc(100svh-4.25rem)] scroll-mt-24 items-center overflow-hidden border-b border-indigo-200/10 bg-[#0b0b20]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_25%,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(139,92,246,0.2),transparent_30%),linear-gradient(150deg,#0e0e2d,#090916_58%,#151034)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-15 [background-image:linear-gradient(rgba(199,210,254,0.15)_1px,transparent_1px)] [background-size:100%_36px]"
        />

        <div className="mobile-section-content mx-auto w-full max-w-7xl px-6 py-14 lg:py-5">
          <div className="mobile-faq-heading flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="reveal-on-scroll-left max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
                {copy.faq.eyebrow}
              </p>
              <h2 className="section-title-reveal mt-4 text-3xl font-bold tracking-tight sm:text-5xl xl:text-[2.65rem] xl:leading-[1.08]">
                {copy.faq.title}
              </h2>
            </div>
            <div className="faq-clarity-card mobile-faq-decoration reveal-on-scroll-right relative w-full max-w-sm overflow-hidden border p-5 xl:p-4">
              <div className="faq-clarity-header flex items-center gap-3 text-indigo-200">
                <span className="visual-icon visual-icon-indigo visual-icon-compact">
                  <GraphicIcon name="chat" />
                </span>
                <div>
                  <p className="font-semibold text-white">
                    {copy.faq.clarityTitle}
                  </p>
                  <p className="text-sm text-indigo-100/55">
                    {copy.faq.clarityBody}
                  </p>
                </div>
              </div>
              <div
                className="faq-clarity-bars mt-4 flex items-end gap-1.5 xl:mt-3"
                aria-hidden="true"
              >
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

          <FaqCarousel
            key={locale}
            items={copy.faq.items}
            labels={{
              question: copy.faq.questionLabel,
              previous: copy.faq.previous,
              next: copy.faq.next,
              showQuestion: copy.faq.showQuestion,
              navigation: copy.faq.navigation,
            }}
          />
        </div>
      </section>

      <section
        id="empezar"
        data-home-section
        className="home-scroll-section relative isolate flex min-h-[calc(100svh-4.25rem)] scroll-mt-24 items-center overflow-hidden bg-[#23053d] px-6 py-20 text-center"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_120%,rgba(236,72,153,0.38),transparent_40%),radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.4),transparent_38%),linear-gradient(135deg,#260746,#160229_55%,#310953)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:34px_34px]"
        />

        <div className="mobile-cta-content reveal-on-scroll mx-auto w-full max-w-3xl">
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
            {copy.cta.eyebrow}
          </p>
          <h2 className="section-title-reveal mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="animated-gradient-text block bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
              {copy.cta.title}
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-violet-100/75">
            {copy.cta.body}
          </p>
          <Link
            href="/registro"
            className="mt-10 inline-flex rounded-full bg-white px-8 py-4 font-semibold text-violet-950 shadow-2xl transition hover:-translate-y-0.5 hover:bg-violet-100"
          >
            {copy.cta.action}
          </Link>
        </div>
      </section>

      <footer className="home-footer border-t border-white/10 bg-black px-6 py-10 text-zinc-400">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Feat<span className="text-violet-400">Music</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-6">{copy.footer.tagline}</p>
          </div>

          <nav
            aria-label={copy.footer.navigation}
            className="flex flex-wrap gap-x-5 gap-y-3 text-sm"
          >
            <a href="#como-funciona" className="transition hover:text-white">{copy.footer.howItWorks}</a>
            <a href="#comunidad" className="transition hover:text-white">{copy.footer.community}</a>
            <a href="#planes" className="transition hover:text-white">{copy.footer.plans}</a>
            <a href="#preguntas" className="transition hover:text-white">{copy.footer.faq}</a>
            <Link href="/artistas" className="transition hover:text-white">{copy.footer.explore}</Link>
          </nav>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FeatMusic</p>
          <p>{copy.footer.rights}</p>
        </div>
      </footer>
    </main>
  );
}
