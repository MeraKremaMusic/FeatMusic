import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import ChatClient from "./ChatClient";

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
}) {
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
        },
      },
      usuarioB: {
        select: {
          id: true,
          nombre: true,
          nombreArtistico: true,
          nombreUsuario: true,
          fotoPerfil: true,
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
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Mensajes
          </Link>

          <Link href="/panel" className="text-lg font-black tracking-tight">
            Feat<span className="text-emerald-400">Music</span>
          </Link>

          <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600 sm:block">
            Chat privado
          </span>
        </div>
      </header>

      <ChatClient
        conversacionId={conversacion.id}
        usuarioActualId={sesion.usuarioId}
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
