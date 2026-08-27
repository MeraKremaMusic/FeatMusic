import Link from "next/link";

// FEATMUSIC_PERFIL_PUBLICO_CLARO_V1

function formatearCantidad(cantidad: number) {
  const segura = Math.max(0, Math.trunc(cantidad));

  if (segura < 1000) {
    return new Intl.NumberFormat("es-CO").format(segura);
  }

  return new Intl.NumberFormat("es-CO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(segura);
}

export default function ContadoresSeguimiento({
  nombreUsuario,
  seguidores,
  siguiendo,
  className = "",
}: {
  nombreUsuario: string;
  seguidores: number;
  siguiendo: number;
  className?: string;
}) {
  const usuarioCodificado = encodeURIComponent(nombreUsuario);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 ${className}`}
      aria-label={`${seguidores} seguidores y ${siguiendo} siguiendo`}
    >
      <Link
        href={`/artistas/${usuarioCodificado}/seguidores`}
        className="group rounded-md outline-none transition hover:text-yellow-700 focus-visible:ring-2 focus-visible:ring-yellow-500/30"
      >
        <span className="font-black text-slate-900 transition group-hover:text-yellow-700">
          {formatearCantidad(seguidores)}
        </span>{" "}
        {seguidores === 1 ? "seguidor" : "seguidores"}
      </Link>

      <span aria-hidden="true" className="text-slate-300">
        ·
      </span>

      <Link
        href={`/artistas/${usuarioCodificado}/siguiendo`}
        className="group rounded-md outline-none transition hover:text-yellow-700 focus-visible:ring-2 focus-visible:ring-yellow-500/30"
      >
        <span className="font-black text-slate-900 transition group-hover:text-yellow-700">
          {formatearCantidad(siguiendo)}
        </span>{" "}
        siguiendo
      </Link>
    </div>
  );
}
