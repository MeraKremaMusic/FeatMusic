import Link from "next/link";

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
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-400 ${className}`}
      aria-label={`${seguidores} seguidores y ${siguiendo} siguiendo`}
    >
      <Link
        href={`/artistas/${usuarioCodificado}/seguidores`}
        className="group rounded-md outline-none transition hover:text-violet-200 focus-visible:ring-2 focus-visible:ring-violet-500/40"
      >
        <span className="font-black text-zinc-100 transition group-hover:text-violet-200">
          {formatearCantidad(seguidores)}
        </span>{" "}
        {seguidores === 1 ? "seguidor" : "seguidores"}
      </Link>

      <span aria-hidden="true" className="text-zinc-700">
        ·
      </span>

      <Link
        href={`/artistas/${usuarioCodificado}/siguiendo`}
        className="group rounded-md outline-none transition hover:text-violet-200 focus-visible:ring-2 focus-visible:ring-violet-500/40"
      >
        <span className="font-black text-zinc-100 transition group-hover:text-violet-200">
          {formatearCantidad(siguiendo)}
        </span>{" "}
        siguiendo
      </Link>
    </div>
  );
}
