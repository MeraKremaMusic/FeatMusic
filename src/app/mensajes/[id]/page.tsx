import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  MenuMasEscritorio,
  MenuMasMovil,
} from "@/app/components/MenuMasNavegacion";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import CentroNotificaciones from "@/app/panel/components/CentroNotificaciones";
import ChatClient from "./ChatClient";

// FEATMUSIC_MENU_MAS_PAGINAS_NUEVAS_V1
// FEATMUSIC_CHAT_USUARIO_ELIMINADO_CERRADO_V1
export const dynamic = "force-dynamic";
export const revalidate = 0;

type ContextoPagina = {
  params: Promise<{ id: string }>;
};

function convertirId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function nombreArtista(artista: {
  nombre: string | null;
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  estadoCuenta?: string;
}) {
  if (artista.estadoCuenta === "ELIMINADA") {
    return "Usuario eliminado";
  }

  return (
    artista.nombreArtistico?.trim() ||
    artista.nombre?.trim() ||
    artista.nombreUsuario?.trim() ||
    "Artista"
  );
}

export default async function ConversacionPage({ params }: ContextoPagina) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  const { id: idTexto } = await params;
  const conversacionId = convertirId(idTexto);

  if (!conversacionId) {
    notFound();
  }

  const conversacion = await prisma.conversacion.findUnique({
    where: {
      id: conversacionId,
    },
    select: {
      id: true,
      usuarioAId: true,
      usuarioBId: true,
      usuarioA: {
        select: {
          id: true,
          nombre: true,
          nombreArtistico: true,
          nombreUsuario: true,
          fotoPerfil: true,
          estadoCuenta: true,
        },
      },
      usuarioB: {
        select: {
          id: true,
          nombre: true,
          nombreArtistico: true,
          nombreUsuario: true,
          fotoPerfil: true,
          estadoCuenta: true,
        },
      },
      propuestas: {
        where: {
          estado: "ACEPTADA",
        },
        orderBy: {
          actualizadoEn: "desc",
        },
        select: {
          id: true,
          mensaje: true,
          audioUrl: true,
          duracionSegundos: true,
          actualizadoEn: true,
          idea: {
            select: {
              titulo: true,
              bpm: true,
              tonalidad: true,
            },
          },
        },
      },
      mensajes: {
        orderBy: {
          id: "desc",
        },
        take: 100,
        select: {
          id: true,
          remitenteId: true,
          contenido: true,
          creadoEn: true,
          leidoEn: true,
        },
      },
    },
  });

  if (!conversacion || conversacion.propuestas.length === 0) {
    notFound();
  }

  const participa =
    conversacion.usuarioAId === sesion.usuarioId ||
    conversacion.usuarioBId === sesion.usuarioId;

  if (!participa) {
    notFound();
  }

  const ahora = new Date();

  await prisma.mensaje.updateMany({
    where: {
      conversacionId: conversacion.id,
      remitenteId: {
        not: sesion.usuarioId,
      },
      leidoEn: null,
    },
    data: {
      leidoEn: ahora,
    },
  });

  await prisma.notificacion
    .updateMany({
      where: {
        usuarioId: sesion.usuarioId,
        tipo: "MENSAJE_NUEVO",
        conversacionId: conversacion.id,
        leidaEn: null,
      },
      data: {
        leidaEn: ahora,
      },
    })
    .catch((error) => {
      console.error(
        "No se pudieron marcar como leídas las notificaciones del chat.",
        error,
      );
    });

  const otroArtista =
    conversacion.usuarioAId === sesion.usuarioId
      ? conversacion.usuarioB
      : conversacion.usuarioA;

  const mensajesIniciales = conversacion.mensajes
    .slice()
    .reverse()
    .map((mensaje) => ({
      id: mensaje.id,
      remitenteId: mensaje.remitenteId,
      contenido: mensaje.contenido,
      creadoEn: mensaje.creadoEn.toISOString(),
      leidoEn: mensaje.leidoEn?.toISOString() ?? null,
    }));

  const colaboraciones = conversacion.propuestas.map((propuesta) => ({
    propuestaId: propuesta.id,
    ideaTitulo: propuesta.idea.titulo,
    bpm: propuesta.idea.bpm,
    tonalidad: propuesta.idea.tonalidad,
    mensaje: propuesta.mensaje,
    audioUrl: propuesta.audioUrl,
    duracionSegundos: propuesta.duracionSegundos,
    aceptadaEn: propuesta.actualizadoEn.toISOString(),
  }));

  return (
    <main className="featmusic-app-light featmusic-page-contrast min-h-[100dvh] bg-[#06100c] text-white">
      <header className="featmusic-solid-black-chrome sticky top-0 z-30">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/mensajes"
            className="order-2 inline-flex items-center px-0 py-2 text-xs font-bold !text-white transition hover:opacity-80 md:order-1"
          >
            ← Mensajes
          </Link>

          <div className="order-1 flex min-w-0 items-center gap-0.5 md:order-2">
            <MenuMasMovil sesionActiva />
            <Link href="/artistas/mi-perfil" className="text-lg font-black tracking-tight">
              Feat<span className="!text-[#FFD400]">Music</span>
            </Link>
          </div>

          <div className="order-3 flex items-center gap-1.5">
            <CentroNotificaciones variante="cabecera" />
            <div className="hidden md:block">
              <MenuMasEscritorio />
            </div>
          </div>
        </div>
      </header>

      <ChatClient
        conversacionId={conversacion.id}
        usuarioActualId={sesion.usuarioId}
        cuentaEliminada={otroArtista.estadoCuenta === "ELIMINADA"}
        otroArtista={{
          ...otroArtista,
          nombreVisible: nombreArtista(otroArtista),
        }}
        colaboraciones={colaboraciones}
        mensajesIniciales={mensajesIniciales}
      />
    </main>
  );
}
