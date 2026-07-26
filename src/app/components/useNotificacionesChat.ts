"use client";

import { useEffect, useState } from "react";

export type EstadoNotificacionesChat = {
  total: number;
  porConversacion: Record<number, number>;
};

type RespuestaNotificacionesChat = {
  ok: boolean;
  total?: number;
  conversaciones?: Array<{
    conversacionId: number;
    cantidad: number;
  }>;
};

const ESTADO_INICIAL: EstadoNotificacionesChat = {
  total: 0,
  porConversacion: {},
};

let estadoCompartido: EstadoNotificacionesChat = ESTADO_INICIAL;
let consultaEnCurso: Promise<void> | null = null;
let intervalo: ReturnType<typeof setInterval> | null = null;
let suscriptores = 0;
let escuchandoVentana = false;

const oyentes = new Set<(estado: EstadoNotificacionesChat) => void>();

function publicar(estado: EstadoNotificacionesChat) {
  estadoCompartido = estado;
  oyentes.forEach((oyente) => oyente(estado));
}

function normalizarRespuesta(
  respuesta: RespuestaNotificacionesChat,
): EstadoNotificacionesChat {
  const porConversacion: Record<number, number> = {};

  for (const item of respuesta.conversaciones ?? []) {
    const conversacionId = Number(item.conversacionId);
    const cantidad = Math.max(0, Number(item.cantidad) || 0);

    if (Number.isInteger(conversacionId) && conversacionId > 0 && cantidad > 0) {
      porConversacion[conversacionId] = cantidad;
    }
  }

  const totalCalculado = Object.values(porConversacion).reduce(
    (acumulado, cantidad) => acumulado + cantidad,
    0,
  );

  return {
    total: Math.max(0, Number(respuesta.total) || totalCalculado),
    porConversacion,
  };
}

async function ejecutarConsulta() {
  try {
    const response = await fetch(
      `/api/notificaciones/chat?actualizacion=${Date.now()}`,
      {
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as RespuestaNotificacionesChat;

    if (!data.ok) {
      return;
    }

    publicar(normalizarRespuesta(data));
  } catch {
    // Una falla temporal de red no debe borrar las notificaciones ya visibles.
  }
}

export function actualizarNotificacionesChat() {
  if (consultaEnCurso) {
    return consultaEnCurso;
  }

  consultaEnCurso = ejecutarConsulta().finally(() => {
    consultaEnCurso = null;
  });

  return consultaEnCurso;
}

function consultarAlVolver() {
  if (document.visibilityState === "visible") {
    void actualizarNotificacionesChat();
  }
}

function iniciarObservacion() {
  if (!intervalo) {
    intervalo = setInterval(() => {
      if (document.visibilityState === "visible") {
        void actualizarNotificacionesChat();
      }
    }, 4000);
  }

  if (!escuchandoVentana) {
    window.addEventListener("focus", consultarAlVolver);
    document.addEventListener("visibilitychange", consultarAlVolver);
    escuchandoVentana = true;
  }

  void actualizarNotificacionesChat();
}

function detenerObservacion() {
  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }

  if (escuchandoVentana) {
    window.removeEventListener("focus", consultarAlVolver);
    document.removeEventListener("visibilitychange", consultarAlVolver);
    escuchandoVentana = false;
  }
}

export function useNotificacionesChat() {
  const [estado, setEstado] = useState<EstadoNotificacionesChat>(estadoCompartido);

  useEffect(() => {
    suscriptores += 1;
    oyentes.add(setEstado);
    setEstado(estadoCompartido);

    if (suscriptores === 1) {
      iniciarObservacion();
    }

    return () => {
      oyentes.delete(setEstado);
      suscriptores = Math.max(0, suscriptores - 1);

      if (suscriptores === 0) {
        detenerObservacion();
      }
    };
  }, []);

  return estado;
}
