"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

const rutasSoloParaVisitantes = new Set([
  "/",
  "/iniciar-sesion",
  "/registro",
]);

const TIEMPO_MAXIMO_COMPROBACION_MS = 4_000;

type SessionRouteGuardProps = {
  children: ReactNode;
};

export default function SessionRouteGuard({
  children,
}: SessionRouteGuardProps) {
  const pathname = usePathname();
  const esRutaPublica = rutasSoloParaVisitantes.has(pathname);
  const comprobacionEnCurso = useRef<AbortController | null>(null);
  const redirigiendo = useRef(false);

  const comprobarSesion = useCallback(async () => {
    if (
      !esRutaPublica ||
      redirigiendo.current ||
      comprobacionEnCurso.current
    ) {
      return;
    }

    const controlador = new AbortController();
    comprobacionEnCurso.current = controlador;

    const temporizador = window.setTimeout(() => {
      controlador.abort();
    }, TIEMPO_MAXIMO_COMPROBACION_MS);

    try {
      const respuesta = await fetch(
        `/api/estado-sesion?timestamp=${Date.now()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controlador.signal,
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      );

      if (!respuesta.ok) {
        return;
      }

      const datos = (await respuesta.json()) as {
        sesionActiva: boolean;
      };

      if (datos.sesionActiva) {
        redirigiendo.current = true;
        window.location.replace("/panel");
      }
    } catch (error) {
      const fueCancelada =
        error instanceof DOMException && error.name === "AbortError";

      if (!fueCancelada) {
        console.error("No se pudo comprobar la sesión:", error);
      }
    } finally {
      window.clearTimeout(temporizador);

      if (comprobacionEnCurso.current === controlador) {
        comprobacionEnCurso.current = null;
      }
    }
  }, [esRutaPublica]);

  useEffect(() => {
    if (!esRutaPublica) {
      comprobacionEnCurso.current?.abort();
      comprobacionEnCurso.current = null;
      return;
    }

    void comprobarSesion();

    const manejarPageShow = () => {
      void comprobarSesion();
    };

    const manejarVisibilidad = () => {
      if (document.visibilityState === "visible") {
        void comprobarSesion();
      }
    };

    window.addEventListener("pageshow", manejarPageShow);
    window.addEventListener("focus", manejarPageShow);
    document.addEventListener("visibilitychange", manejarVisibilidad);

    return () => {
      window.removeEventListener("pageshow", manejarPageShow);
      window.removeEventListener("focus", manejarPageShow);
      document.removeEventListener("visibilitychange", manejarVisibilidad);
      comprobacionEnCurso.current?.abort();
      comprobacionEnCurso.current = null;
    };
  }, [comprobarSesion, esRutaPublica]);

  // Nunca bloqueamos la página mientras se comprueba la sesión.
  // El servidor ya redirige las sesiones válidas y esta comprobación
  // solo cubre restauraciones del historial o caché del navegador.
  return <>{children}</>;
}
