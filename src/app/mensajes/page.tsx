import Link from "next/link";
import { redirect } from "next/navigation";

import NavegacionEscritorio from "@/app/components/NavegacionEscritorio";
import MenuMovilPanel from "@/app/panel/components/MenuMovilPanel";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function iniciales(nombre: string) {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join("") || "FM"
  );
}

function formatearActividad(fecha: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

function IconoMensajes() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

function IconoSalir() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M13 4h7v16h-7" />
    </svg>
  );
}

export default async function MensajesPage() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  const conversaciones = await prisma.conversacion.findMany({
    where: {
      OR: [
        {
          usuarioAId: sesion.usuarioId,
        },
        {
          usuarioBId: sesion.usuarioId,
        },
      ],
      propuestas: {
        some: {
          estado: "ACEPTADA",
        },
      },
    },
    orderBy: [
      {
        ultimaActividadEn: "desc",
      },
      {
        id: "desc",
      },
    ],
    select: {
      id: true,
      usuarioAId: true,
      ultimaActividadEn: true,
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
        take: 3,
        select: {
          idea: {
            select: {
              titulo: true,
            },
          },
        },
      },
      mensajes: {
        orderBy: {
          id: "desc",
        },
        take: 1,
        select: {
          contenido: true,
          remitenteId: true,
          creadoEn: true,
        },
      },
      _count: {
        select: {
          propuestas: {
            where: {
              estado: "ACEPTADA",
            },
          },
          mensajes: {
            where: {
              remitenteId: {
                not: sesion.usuarioId,
              },
              leidoEn: null,
            },
          },
        },
      },
    },
  });

  return (
    <main className="min-h-[100dvh] bg-[#09070d] pb-20 text-white lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4">
          <Link href="/panel" className="text-lg font-black tracking-tight">
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <NavegacionEscritorio />

          <form action="/api/cerrar-sesion" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-red-400/50 px-3 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10"
            >
              <IconoSalir />
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <IconoMensajes />
            </span>
            <div>
              <h1 className="text-lg font-black text-white">Mensajes</h1>
              <p className="text-[10px] text-zinc-500">
                Un chat por artista, con todas sus colaboraciones.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-black text-violet-200">
            {conversaciones.length}
          </span>
        </div>

        {conversaciones.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/35 px-5 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <IconoMensajes />
            </span>
            <p className="mt-4 text-sm font-black text-zinc-200">
              Aún no tienes conversaciones
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[10px] leading-4 text-zinc-500">
              Cuando una propuesta sea aceptada aparecerá aquí el chat privado
              con ese artista.
            </p>
            <Link
              href="/panel#panel-card-3"
              className="mt-4 inline-flex rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-200 transition hover:bg-violet-500/20"
            >
              Ver propuestas
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversaciones.map((conversacion) => {
              const otroArtista =
                conversacion.usuarioAId === sesion.usuarioId
                  ? conversacion.usuarioB
                  : conversacion.usuarioA;
              const nombre = nombreArtista(otroArtista);
              const ultimoMensaje = conversacion.mensajes[0];
              const noLeidos = conversacion._count.mensajes;
              const titulos = conversacion.propuestas.map(
                (propuesta) => propuesta.idea.titulo,
              );
              const faltantes =
                conversacion._count.propuestas - conversacion.propuestas.length;

              return (
                <Link
                  key={conversacion.id}
                  href={`/mensajes/${conversacion.id}`}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                    noLeidos > 0
                      ? "border-violet-400/35 bg-violet-500/[0.07] shadow-[0_0_25px_rgba(139,92,246,0.08)]"
                      : "border-white/10 bg-black/35 hover:border-white/20 hover:bg-white/[0.035]"
                  }`}
                >
                  {otroArtista.fotoPerfil ? (
                    <img
                      src={otroArtista.fotoPerfil}
                      alt={`Foto de ${nombre}`}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-[11px] font-black text-violet-200">
                      {iniciales(nombre)}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-black text-white">
                        {nombre}
                      </p>
                      <span className="shrink-0 text-[8px] font-semibold text-zinc-600">
                        {formatearActividad(conversacion.ultimaActividadEn)}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[10px] text-zinc-400">
                      {ultimoMensaje
                        ? `${ultimoMensaje.remitenteId === sesion.usuarioId ? "Tú: " : ""}${ultimoMensaje.contenido}`
                        : "Chat listo para comenzar"}
                    </p>

                    <p className="mt-1 truncate text-[8px] font-semibold text-zinc-600">
                      {titulos.join(" · ")}
                      {faltantes > 0 ? ` · +${faltantes} más` : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-bold text-zinc-400">
                      {conversacion._count.propuestas} colab
                      {conversacion._count.propuestas === 1 ? "" : "s"}
                    </span>
                    {noLeidos > 0 && (
                      <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[8px] font-black text-white">
                        {noLeidos > 99 ? "99+" : noLeidos}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <MenuMovilPanel />
    </main>
  );
}
