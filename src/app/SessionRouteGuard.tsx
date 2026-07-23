"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const rutasSoloParaVisitantes = new Set([
  "/",
  "/iniciar-sesion",
  "/registro",
]);

type SessionRouteGuardProps = {
  children: React.ReactNode;
};

export default function SessionRouteGuard({
  children,
}: SessionRouteGuardProps) {
  const pathname = usePathname();
  const esRutaPublica = rutasSoloParaVisitantes.has(pathname);

  const [comprobando, setComprobando] = useState(esRutaPublica);

  const comprobarSesion = useCallback(async () => {
    if (!esRutaPublica) {
      setComprobando(false);
      return;
    }

    setComprobando(true);

    try {
      const respuesta = await fetch(
        `/api/estado-sesion?timestamp=${Date.now()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      );

      if (!respuesta.ok) {
        setComprobando(false);
        return;
      }

      const datos = (await respuesta.json()) as {
        sesionActiva: boolean;
      };

      if (datos.sesionActiva) {
        window.location.replace("/panel");
        return;
      }
    } catch (error) {
      console.error("No se pudo comprobar la sesión:", error);
    }

    setComprobando(false);
  }, [esRutaPublica]);

  useEffect(() => {
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
      document.removeEventListener(
        "visibilitychange",
        manejarVisibilidad,
      );
    };
  }, [comprobarSesion]);

  if (esRutaPublica && comprobando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm text-zinc-400">
          Comprobando sesión...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}