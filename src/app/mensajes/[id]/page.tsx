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
      propuesta: {
        select: {
          id: true,
          estado: true,
          audioUrl: true,
          duracionSegundos: true,
          idea: {
            select: {
              titulo: true,
              usuario: {
                select: {
                  id: true,
                  nombre: true,
                  nombreArtistico: true,
                  nombreUsuario: true,
                  fotoPerfil: true,
                },
              },
            },
          },
          remitente: {
            select: {
              id: true,
              nombre: true,
              nombreArtistico: true,
              nombreUsuario: true,
              fotoPerfil: true,
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

  if (!conversacion || conversacion.propuesta.estado !== "ACEPTADA") {
    notFound();
  }

  const propietario = conversacion.propuesta.idea.usuario;
  const remitente = conversacion.propuesta.remitente;
  const participa =
    propietario.id === sesion.usuarioId || remitente.id === sesion.usuarioId;

  if (!participa) {
    notFound();
  }

  await prisma.mensaje.updateMany({
    where: {
      conversacionId: conversacion.id,
      remitenteId: {
        not: sesion.usuarioId,
      },
      leidoEn: null,
    },
    data: {
      leidoEn: new Date(),
    },
  });

  const otroArtista =
    propietario.id === sesion.usuarioId ? remitente : propietario;

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

  return (
    <main className="min-h-[100dvh] bg-[#09070d] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/panel#panel-card-3"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Propuestas
          </Link>

          <Link href="/panel" className="text-lg font-black tracking-tight">
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600 sm:block">
            Chat privado
          </span>
        </div>
      </header>

      <ChatClient
        conversacionId={conversacion.id}
        propuestaId={conversacion.propuesta.id}
        usuarioActualId={sesion.usuarioId}
        ideaTitulo={conversacion.propuesta.idea.titulo}
        audioUrl={conversacion.propuesta.audioUrl}
        duracionSegundos={conversacion.propuesta.duracionSegundos}
        otroArtista={{
          ...otroArtista,
          nombreVisible: nombreArtista(otroArtista),
        }}
        mensajesIniciales={mensajesIniciales}
      />
    </main>
  );
}
