"use client";

import { useCallback, useEffect, useState } from "react";

import ListaArtistasVieronIdea from "./ListaArtistasVieronIdea";
import { EVENTO_VISTA_IDEA_ACTUALIZADA } from "./RegistrarVistaIdea";

type DetalleVistaIdea = {
  ideaId: number;
  total: number;
};

type Variante = "publica" | "panel" | "compacta";

function IconoOjo({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function textoContador(total: number, variante: Variante) {
  if (variante === "compacta") {
    return `${total.toLocaleString("es-CO")} ${total === 1 ? "artista" : "artistas"}`;
  }

  if (variante === "panel") {
    return total === 1
      ? "1 artista único vio tu idea"
      : `${total.toLocaleString("es-CO")} artistas únicos vieron tu idea`;
  }

  return total === 1
    ? "1 artista vio esta publicación"
    : `${total.toLocaleString("es-CO")} artistas vieron esta publicación`;
}

export default function ContadorVistasIdea({
  ideaId,
  totalInicial,
  esPropietario,
  variante = "publica",
  className = "",
}: {
  ideaId: number;
  totalInicial: number;
  esPropietario: boolean;
  variante?: Variante;
  className?: string;
}) {
  const [total, setTotal] = useState(Math.max(0, totalInicial));
  const [modalAbierto, setModalAbierto] = useState(false);
  const cerrarModal = useCallback(() => setModalAbierto(false), []);

  useEffect(() => {
    function actualizar(evento: Event) {
      const detalle = (evento as CustomEvent<DetalleVistaIdea>).detail;
      if (detalle?.ideaId !== ideaId || !Number.isFinite(detalle.total)) return;
      setTotal(Math.max(0, detalle.total));
    }

    window.addEventListener(EVENTO_VISTA_IDEA_ACTUALIZADA, actualizar);
    return () =>
      window.removeEventListener(EVENTO_VISTA_IDEA_ACTUALIZADA, actualizar);
  }, [ideaId]);

  const contenido = (
    <>
      <IconoOjo />
      <span>{textoContador(total, variante)}</span>
    </>
  );

  const clase = `inline-flex items-center gap-1.5 text-[9px] font-semibold text-zinc-500 ${
    esPropietario
      ? "cursor-pointer rounded-lg transition hover:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400/35"
      : ""
  } ${className}`;

  return (
    <>
      {esPropietario ? (
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          title="Ver los artistas que vieron esta publicación"
          className={clase}
        >
          {contenido}
        </button>
      ) : (
        <span className={clase}>{contenido}</span>
      )}

      {esPropietario && (
        <ListaArtistasVieronIdea
          ideaId={ideaId}
          abierto={modalAbierto}
          onCerrar={cerrarModal}
        />
      )}
    </>
  );
}
