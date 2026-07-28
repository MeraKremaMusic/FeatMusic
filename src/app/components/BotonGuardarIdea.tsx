"use client";

import { useEffect, useState } from "react";

export const EVENTO_CAMBIO_IDEA_GUARDADA = "featmusic:idea-guardada";

export type DetalleCambioIdeaGuardada = {
  ideaId: number;
  guardada: boolean;
};

type BotonGuardarIdeaProps = {
  ideaId: number;
  guardadaInicial: boolean;
  sesionActiva: boolean;
  esPropietario: boolean;
  disponible?: boolean;
  variante?: "icono" | "compacta";
  className?: string;
};

function IconoMarcador({ guardada }: { guardada: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={guardada ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21L12 17.5 6.5 21V4.5Z" />
    </svg>
  );
}

function emitirCambio(detalle: DetalleCambioIdeaGuardada) {
  window.dispatchEvent(
    new CustomEvent<DetalleCambioIdeaGuardada>(EVENTO_CAMBIO_IDEA_GUARDADA, {
      detail: detalle,
    }),
  );
}

export default function BotonGuardarIdea({
  ideaId,
  guardadaInicial,
  sesionActiva,
  esPropietario,
  disponible = true,
  variante = "compacta",
  className = "",
}: BotonGuardarIdeaProps) {
  const [guardada, setGuardada] = useState(guardadaInicial);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    setGuardada(guardadaInicial);
  }, [guardadaInicial]);

  useEffect(() => {
    function sincronizar(evento: Event) {
      const detalle = (evento as CustomEvent<DetalleCambioIdeaGuardada>).detail;
      if (!detalle || detalle.ideaId !== ideaId) return;
      setGuardada(detalle.guardada);
    }

    window.addEventListener(EVENTO_CAMBIO_IDEA_GUARDADA, sincronizar);
    return () =>
      window.removeEventListener(EVENTO_CAMBIO_IDEA_GUARDADA, sincronizar);
  }, [ideaId]);

  if (esPropietario) return null;

  const deshabilitado = procesando || (!disponible && !guardada);
  const etiqueta = guardada ? "Quitar de guardadas" : "Guardar oportunidad";

  async function alternarGuardada() {
    if (procesando) return;

    if (!sesionActiva) {
      const regreso = `${window.location.pathname}${window.location.search}`;
      window.location.assign(
        `/iniciar-sesion?redirect=${encodeURIComponent(regreso)}`,
      );
      return;
    }

    if (!disponible && !guardada) return;

    const estadoAnterior = guardada;
    const estadoOptimista = !estadoAnterior;

    setProcesando(true);
    setGuardada(estadoOptimista);
    emitirCambio({ ideaId, guardada: estadoOptimista });

    try {
      const respuesta = await fetch(`/api/ideas/${ideaId}/guardar`, {
        method: estadoOptimista ? "POST" : "DELETE",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const datos = (await respuesta.json().catch(() => null)) as
        | { ok?: boolean; guardada?: boolean; mensaje?: string }
        | null;

      if (!respuesta.ok || !datos?.ok) {
        throw new Error(datos?.mensaje || "No se pudo actualizar la oportunidad.");
      }

      const estadoConfirmado =
        typeof datos.guardada === "boolean" ? datos.guardada : estadoOptimista;
      setGuardada(estadoConfirmado);
      emitirCambio({ ideaId, guardada: estadoConfirmado });
    } catch (error) {
      setGuardada(estadoAnterior);
      emitirCambio({ ideaId, guardada: estadoAnterior });
      window.alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la oportunidad.",
      );
    } finally {
      setProcesando(false);
    }
  }

  if (variante === "icono") {
    return (
      <button
        type="button"
        aria-label={etiqueta}
        aria-pressed={guardada}
        title={
          !disponible && !guardada
            ? "Esta oportunidad ya no tiene cupos"
            : etiqueta
        }
        disabled={deshabilitado}
        onClick={alternarGuardada}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-45 ${
          guardada
            ? "border-emerald-300/35 bg-emerald-500/20 text-emerald-100"
            : "border-white/10 bg-black/20 text-zinc-400 hover:border-emerald-300/25 hover:bg-emerald-500/10 hover:text-emerald-200"
        } ${className}`}
      >
        <IconoMarcador guardada={guardada} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={guardada}
      title={
        !disponible && !guardada
          ? "Esta oportunidad ya no tiene cupos"
          : etiqueta
      }
      disabled={deshabilitado}
      onClick={alternarGuardada}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
        guardada
          ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-100"
          : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-emerald-300/25 hover:bg-emerald-500/10 hover:text-emerald-200"
      } ${className}`}
    >
      <IconoMarcador guardada={guardada} />
      {guardada ? "Guardada" : "Guardar"}
    </button>
  );
}
