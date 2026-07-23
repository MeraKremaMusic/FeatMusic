"use client";

import { useEffect } from "react";

export default function ProteccionHistorial() {
  useEffect(() => {
    function verificarRestauracion(event: PageTransitionEvent) {
      // Si el navegador recuperó esta página desde su memoria,
      // se fuerza una recarga para que el servidor revise la sesión.
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener("pageshow", verificarRestauracion);

    return () => {
      window.removeEventListener("pageshow", verificarRestauracion);
    };
  }, []);

  return null;
}