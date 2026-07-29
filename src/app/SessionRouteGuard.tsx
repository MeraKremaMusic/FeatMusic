"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const rutasSoloParaVisitantes = new Set([
  "/",
  "/iniciar-sesion",
  "/registro",
]);

const TIEMPO_MAXIMO_COMPROBACION_MS = 7000;
const INTERVALO_MINIMO_COMPROBACION_MS = 750;

type SessionRouteGuardProps = {
  children: React.ReactNode;
};

type OpcionesComprobacion = {
  forzar?: boolean;
};

export default function SessionRouteGuard({
  children,
}: SessionRouteGuardProps) {
  const pathname = usePathname();
  const esRutaPublica = rutasSoloParaVisitantes.has(pathname);

  const [comprobando, setComprobando] = useState(esRutaPublica);
  const controladorRef = useRef<AbortController | null>(null);
  const solicitudIdRef = useRef(0);
  const ultimaComprobacionRef = useRef(0);

  const comprobarSesion = useCallback(
    async ({ forzar = false }: OpcionesComprobacion = {}) => {
      if (!esRutaPublica) {
        controladorRef.current?.abort();
        controladorRef.current = null;
        setComprobando(false);
        return;
      }

      const ahora = Date.now();

      if (
        !forzar &&
        ahora - ultimaComprobacionRef.current <
          INTERVALO_MINIMO_COMPROBACION_MS
      ) {
        return;
      }

      ultimaComprobacionRef.current = ahora;

      controladorRef.current?.abort();

      const controlador = new AbortController();
      const solicitudId = ++solicitudIdRef.current;
      let redirigiendo = false;

      controladorRef.current = controlador;
      setComprobando(true);

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
          redirigiendo = true;
          window.location.replace("/panel");
        }
      } catch (error) {
        if (!controlador.signal.aborted) {
          console.error("No se pudo comprobar la sesión:", error);
        }
      } finally {
        window.clearTimeout(temporizador);

        if (controladorRef.current === controlador) {
          controladorRef.current = null;
        }

        if (
          solicitudIdRef.current === solicitudId &&
          !redirigiendo
        ) {
          setComprobando(false);
        }
      }
    },
    [esRutaPublica],
  );

  useEffect(() => {
    void comprobarSesion({ forzar: true });

    const manejarPageShow = () => {
      void comprobarSesion();
    };

    const manejarFocus = () => {
      if (document.visibilityState === "visible") {
        void comprobarSesion();
      }
    };

    const manejarVisibilidad = () => {
      if (document.visibilityState === "visible") {
        void comprobarSesion();
      }
    };

    window.addEventListener("pageshow", manejarPageShow);
    window.addEventListener("focus", manejarFocus);
    document.addEventListener("visibilitychange", manejarVisibilidad);

    return () => {
      solicitudIdRef.current += 1;
      controladorRef.current?.abort();
      controladorRef.current = null;

      window.removeEventListener("pageshow", manejarPageShow);
      window.removeEventListener("focus", manejarFocus);
      document.removeEventListener(
        "visibilitychange",
        manejarVisibilidad,
      );
    };
  }, [comprobarSesion]);

  if (esRutaPublica && comprobando) {
    return (
      <main className="featmusic-app-light flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-zinc-400">
          Comprobando sesión...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
