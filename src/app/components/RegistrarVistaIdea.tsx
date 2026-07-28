"use client";

import { useCallback, useEffect, useRef } from "react";

export const EVENTO_VISTA_IDEA_ACTUALIZADA =
  "featmusic:vista-idea-actualizada";

type DetalleVistaIdea = {
  ideaId: number;
  total: number;
};

type RespuestaVista = {
  ok: boolean;
  total?: number;
  mensaje?: string;
};

export default function RegistrarVistaIdea({
  ideaId,
  sesionActiva,
  esPropietario,
  activa,
  demoraMs = 2000,
}: {
  ideaId: number;
  sesionActiva: boolean;
  esPropietario: boolean;
  activa?: boolean;
  demoraMs?: number;
}) {
  const marcadorRef = useRef<HTMLSpanElement>(null);
  const temporizadorRef = useRef<number | null>(null);
  const enviadaRef = useRef(false);
  const visibleRef = useRef(false);

  const cancelarTemporizador = useCallback(() => {
    if (temporizadorRef.current !== null) {
      window.clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
  }, []);

  const registrar = useCallback(async () => {
    if (
      enviadaRef.current ||
      !sesionActiva ||
      esPropietario ||
      document.visibilityState !== "visible"
    ) {
      return;
    }

    enviadaRef.current = true;

    try {
      const respuesta = await fetch(`/api/ideas/${ideaId}/vista`, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        keepalive: true,
      });
      const datos = (await respuesta.json()) as RespuestaVista;

      if (!respuesta.ok || !datos.ok) {
        if (respuesta.status >= 500) {
          enviadaRef.current = false;
        }
        return;
      }

      if (typeof datos.total === "number" && Number.isFinite(datos.total)) {
        window.dispatchEvent(
          new CustomEvent<DetalleVistaIdea>(EVENTO_VISTA_IDEA_ACTUALIZADA, {
            detail: {
              ideaId,
              total: Math.max(0, datos.total),
            },
          }),
        );
      }
    } catch {
      enviadaRef.current = false;
    }
  }, [esPropietario, ideaId, sesionActiva]);

  useEffect(() => {
    enviadaRef.current = false;
    visibleRef.current = false;
    cancelarTemporizador();
  }, [cancelarTemporizador, ideaId]);

  const programar = useCallback(() => {
    if (
      temporizadorRef.current !== null ||
      enviadaRef.current ||
      !visibleRef.current ||
      document.visibilityState !== "visible"
    ) {
      return;
    }

    temporizadorRef.current = window.setTimeout(() => {
      temporizadorRef.current = null;
      void registrar();
    }, demoraMs);
  }, [demoraMs, registrar]);

  useEffect(() => {
    if (!sesionActiva || esPropietario) return;

    const manejarVisibilidadDocumento = () => {
      if (document.visibilityState !== "visible") {
        cancelarTemporizador();
        return;
      }

      programar();
    };

    document.addEventListener("visibilitychange", manejarVisibilidadDocumento);

    if (typeof activa === "boolean") {
      visibleRef.current = activa;
      if (activa) programar();
      else cancelarTemporizador();

      return () => {
        document.removeEventListener(
          "visibilitychange",
          manejarVisibilidadDocumento,
        );
        cancelarTemporizador();
      };
    }

    const marcador = marcadorRef.current;
    const publicacion = marcador?.closest<HTMLElement>("[data-vista-idea]");

    if (!publicacion) {
      document.removeEventListener(
        "visibilitychange",
        manejarVisibilidadDocumento,
      );
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        const entrada = entradas[0];
        visibleRef.current = Boolean(
          entrada?.isIntersecting && entrada.intersectionRatio >= 0.6,
        );

        if (visibleRef.current) programar();
        else cancelarTemporizador();
      },
      {
        threshold: [0, 0.6, 0.75, 1],
      },
    );

    observador.observe(publicacion);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        manejarVisibilidadDocumento,
      );
      observador.disconnect();
      cancelarTemporizador();
    };
  }, [
    activa,
    cancelarTemporizador,
    esPropietario,
    programar,
    sesionActiva,
  ]);

  return <span ref={marcadorRef} aria-hidden="true" className="hidden" />;
}
