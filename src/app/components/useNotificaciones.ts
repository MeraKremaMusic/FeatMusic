"use client";

import { useEffect, useState } from "react";

export type ActorNotificacion = {
  id: number;
  nombreVisible: string;
  nombreUsuario: string | null;
  fotoPerfil: string | null;
};

export type NotificacionCentro = {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  entidadTipo: string | null;
  entidadId: number | null;
  conversacionId: number | null;
  leidaEn: string | null;
  creadoEn: string;
  actor: ActorNotificacion | null;
};

type RespuestaNotificaciones = {
  ok: boolean;
  mensaje?: string;
  totalNoLeidas?: number;
  notificaciones?: NotificacionCentro[];
};

export type EstadoNotificaciones = {
  cargando: boolean;
  error: string;
  totalNoLeidas: number;
  notificaciones: NotificacionCentro[];
};

const ESTADO_INICIAL: EstadoNotificaciones = {
  cargando: true,
  error: "",
  totalNoLeidas: 0,
  notificaciones: [],
};

let estadoCompartido: EstadoNotificaciones = ESTADO_INICIAL;
let consultaEnCurso: Promise<void> | null = null;
let intervalo: ReturnType<typeof setInterval> | null = null;
let suscriptores = 0;
let escuchandoVentana = false;

const oyentes = new Set<(estado: EstadoNotificaciones) => void>();

function publicar(estado: EstadoNotificaciones) {
  estadoCompartido = estado;
  oyentes.forEach((oyente) => oyente(estado));
}

function publicarCambios(cambios: Partial<EstadoNotificaciones>) {
  publicar({
    ...estadoCompartido,
    ...cambios,
  });
}

async function ejecutarConsulta() {
  try {
    const respuesta = await fetch(
      `/api/notificaciones?actualizacion=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const datos = (await respuesta.json()) as RespuestaNotificaciones;

    if (!respuesta.ok || !datos.ok) {
      throw new Error(
        datos.mensaje ?? "No se pudieron cargar las notificaciones.",
      );
    }

    publicar({
      cargando: false,
      error: "",
      totalNoLeidas: Math.max(0, Number(datos.totalNoLeidas) || 0),
      notificaciones: datos.notificaciones ?? [],
    });
  } catch (errorCarga) {
    publicarCambios({
      cargando: false,
      error:
        errorCarga instanceof Error
          ? errorCarga.message
          : "No se pudieron cargar las notificaciones.",
    });
  }
}

export function actualizarNotificaciones() {
  if (consultaEnCurso) {
    return consultaEnCurso;
  }

  consultaEnCurso = ejecutarConsulta().finally(() => {
    consultaEnCurso = null;
  });

  return consultaEnCurso;
}

export async function marcarNotificacionLeida(id: number) {
  const notificacion = estadoCompartido.notificaciones.find(
    (item) => item.id === id,
  );

  if (!notificacion || notificacion.leidaEn) {
    return;
  }

  const ahora = new Date().toISOString();

  publicar({
    ...estadoCompartido,
    totalNoLeidas: Math.max(0, estadoCompartido.totalNoLeidas - 1),
    notificaciones: estadoCompartido.notificaciones.map((item) =>
      item.id === id ? { ...item, leidaEn: ahora } : item,
    ),
  });

  try {
    const respuesta = await fetch("/api/notificaciones", {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accion: "MARCAR_LEIDA",
        id,
      }),
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo marcar la notificación.");
    }
  } catch {
    await actualizarNotificaciones();
  }
}

export async function marcarTodasNotificacionesLeidas() {
  if (estadoCompartido.totalNoLeidas === 0) {
    return;
  }

  const ahora = new Date().toISOString();

  publicar({
    ...estadoCompartido,
    totalNoLeidas: 0,
    notificaciones: estadoCompartido.notificaciones.map((item) => ({
      ...item,
      leidaEn: item.leidaEn ?? ahora,
    })),
  });

  try {
    const respuesta = await fetch("/api/notificaciones", {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accion: "MARCAR_TODAS",
      }),
    });

    if (!respuesta.ok) {
      throw new Error("No se pudieron marcar las notificaciones.");
    }
  } catch {
    await actualizarNotificaciones();
  }
}

function consultarAlVolver() {
  if (document.visibilityState === "visible") {
    void actualizarNotificaciones();
  }
}

function iniciarObservacion() {
  if (!intervalo) {
    intervalo = setInterval(() => {
      if (document.visibilityState === "visible") {
        void actualizarNotificaciones();
      }
    }, 15000);
  }

  if (!escuchandoVentana) {
    window.addEventListener("focus", consultarAlVolver);
    document.addEventListener("visibilitychange", consultarAlVolver);
    escuchandoVentana = true;
  }

  void actualizarNotificaciones();
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

export function useNotificaciones() {
  const [estado, setEstado] = useState<EstadoNotificaciones>(estadoCompartido);

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
