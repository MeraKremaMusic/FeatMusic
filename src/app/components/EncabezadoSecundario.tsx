import Link from "next/link";

import {
  MenuMasEscritorio,
  MenuMasMovil,
} from "@/app/components/MenuMasNavegacion";

// FEATMUSIC_ENCABEZADO_PAGINAS_SECUNDARIAS_V1

export default function EncabezadoSecundario({
  volverHref = "/artistas",
  volverTexto = "Volver",
}: {
  volverHref?: string;
  volverTexto?: string;
}) {
  return (
    <header className="featmusic-solid-black-chrome sticky top-0 z-50">
      <div className="relative mx-auto flex h-12 max-w-[1280px] items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-0.5">
          <MenuMasMovil />
          <Link
            href="/inicio"
            className="truncate text-lg font-black tracking-tight text-white"
          >
            Feat<span className="text-emerald-400">Music</span>
          </Link>
        </div>

        <div className="hidden md:block">
          <MenuMasEscritorio />
        </div>

        <Link
          href={volverHref}
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          {volverTexto}
        </Link>
      </div>
    </header>
  );
}
