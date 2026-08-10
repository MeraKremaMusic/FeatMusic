import Link from "next/link";
import { obtenerSesion } from "@/lib/session";

import {
  MenuMasEscritorio,
  MenuMasMovil,
} from "@/app/components/MenuMasNavegacion";

// FEATMUSIC_ENCABEZADO_PAGINAS_SECUNDARIAS_V1
// FEATMUSIC_BANNER_NEGRO_PAGINAS_SECUNDARIAS_V2

export default async function EncabezadoSecundario({
  volverHref = "/artistas",
  volverTexto = "Volver",
}: {
  volverHref?: string;
  volverTexto?: string;
}) {
  const sesion = await obtenerSesion();

  return (
    <header className="featmusic-solid-black-chrome featmusic-dark-chrome sticky top-0 z-50 border-b border-transparent bg-black">
      <div className="relative mx-auto flex h-12 max-w-[1280px] items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-0.5">
          <MenuMasMovil sesionActiva={Boolean(sesion)} />
          <Link
            href="/inicio"
            className="truncate text-lg font-black tracking-tight text-white"
          >
            Feat<span className="text-yellow-400">Music</span>
          </Link>
        </div>

        <div className="hidden md:block">
          <MenuMasEscritorio />
        </div>

        <Link
          href={volverHref}
          className="featmusic-secondary-back-link featmusic-logout-plain inline-flex shrink-0 touch-manipulation items-center gap-1 px-1 py-2 text-[10px] font-bold text-white transition focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label={volverTexto}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>{volverTexto}</span>
        </Link>
      </div>
    </header>
  );
}
