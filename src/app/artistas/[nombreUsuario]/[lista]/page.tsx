import Link from "next/link";
import { notFound } from "next/navigation";

import NavegacionEscritorio from "@/app/components/NavegacionEscritorio";
import MenuMovilPanel from "@/app/panel/components/MenuMovilPanel";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

import ListaSeguimientos from "../components/ListaSeguimientos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PaginaListaProps = {
  params: Promise<{
    nombreUsuario: string;
    lista: string;
  }>;
};

function decodificar(valor: string) {
  try {
    return decodeURIComponent(valor);
  } catch {
    return valor;
  }
}

function formatearRol(rol: string) {
  const roles: Record<string, string> = {
    CANTANTE: "Cantante",
    COMPOSITOR: "Compositor",
    PRODUCTOR: "Productor",
    BEATMAKER: "Beatmaker",
  };

  return roles[rol] ?? rol;
}

function datosArtista(usuario: {
  id: number;
  nombre: string | null;
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  fotoPerfil: string | null;
  rolPrincipal: string;
  ciudad: string | null;
  pais: string | null;
}) {
  return {
    id: usuario.id,
    nombreArtistico:
      usuario.nombreArtistico?.trim() || usuario.nombre?.trim() || "Artista",
    nombreUsuario:
      usuario.nombreUsuario?.trim() || `artista-${usuario.id}`,
    fotoPerfil: usuario.fotoPerfil,
    rol: formatearRol(usuario.rolPrincipal),
    ubicacion:
      [usuario.ciudad, usuario.pais].filter(Boolean).join(", ") ||
      "Ubicación sin completar",
  };
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

export default async function PaginaListaSeguimientos({
  params,
}: PaginaListaProps) {
  const sesion = await obtenerSesion();
  const parametros = await params;
  const tipo = parametros.lista;

  if (tipo !== "seguidores" && tipo !== "siguiendo") {
    notFound();
  }

  const nombreUsuario = decodificar(parametros.nombreUsuario);
  const idAlternativo = nombreUsuario.startsWith("artista-")
    ? Number(nombreUsuario.replace("artista-", ""))
    : Number.NaN;

  const perfil = await prisma.usuario.findFirst({
    where: {
      perfilCompleto: true,
      OR: [
        { nombreUsuario },
        ...(Number.isInteger(idAlternativo) && idAlternativo > 0
          ? [{ id: idAlternativo }]
          : []),
      ],
    },
    select: {
      id: true,
      nombre: true,
      nombreArtistico: true,
      nombreUsuario: true,
      _count: {
        select: {
          seguidores: true,
          siguiendo: true,
        },
      },
    },
  });

  if (!perfil) {
    notFound();
  }

  const seleccionUsuario = {
    id: true,
    nombre: true,
    nombreArtistico: true,
    nombreUsuario: true,
    fotoPerfil: true,
    rolPrincipal: true,
    ciudad: true,
    pais: true,
  } as const;

  const usuarios =
    tipo === "seguidores"
      ? (
          await prisma.seguimiento.findMany({
            where: {
              seguidoId: perfil.id,
              seguidor: { perfilCompleto: true },
            },
            orderBy: { creadoEn: "desc" },
            take: 100,
            select: {
              seguidor: { select: seleccionUsuario },
            },
          })
        ).map((relacion) => relacion.seguidor)
      : (
          await prisma.seguimiento.findMany({
            where: {
              seguidorId: perfil.id,
              seguido: { perfilCompleto: true },
            },
            orderBy: { creadoEn: "desc" },
            take: 100,
            select: {
              seguido: { select: seleccionUsuario },
            },
          })
        ).map((relacion) => relacion.seguido);

  const ids = usuarios.map((usuario) => usuario.id);
  const relacionesUsuario = sesion && ids.length > 0
    ? await prisma.seguimiento.findMany({
        where: {
          seguidorId: sesion.usuarioId,
          seguidoId: { in: ids },
        },
        select: { seguidoId: true },
      })
    : [];
  const idsSiguiendo = new Set(
    relacionesUsuario.map((relacion) => relacion.seguidoId),
  );

  const perfilVisible = {
    nombreArtistico:
      perfil.nombreArtistico?.trim() || perfil.nombre?.trim() || "Artista",
    nombreUsuario:
      perfil.nombreUsuario?.trim() || `artista-${perfil.id}`,
    seguidores: perfil._count.seguidores,
    siguiendo: perfil._count.siguiendo,
  };

  const artistas = usuarios.map((usuario) => ({
    ...datosArtista(usuario),
    siguiendo: idsSiguiendo.has(usuario.id),
    esPerfilPropio: sesion?.usuarioId === usuario.id,
  }));

  return (
    <main className="featmusic-app-light min-h-screen bg-[#09070d] pb-20 text-white lg:pb-0">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="relative mx-auto flex h-12 max-w-[1460px] items-center justify-between px-4">
          <Link
            href={sesion ? "/panel" : "/"}
            className="text-lg font-black tracking-tight"
          >
            Feat<span className="text-violet-400">Music</span>
          </Link>

          <NavegacionEscritorio />

          {sesion ? (
            <form action="/api/cerrar-sesion" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-red-400/50 px-3 py-1.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/10"
              >
                <IconoSalir />
                Cerrar sesión
              </button>
            </form>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="rounded-lg border border-violet-400/50 px-3 py-1.5 text-[10px] font-bold text-violet-200 transition hover:bg-violet-500/10"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </header>

      <div className="px-3 py-4 sm:px-4 sm:py-7">
        <ListaSeguimientos
          perfil={perfilVisible}
          tipo={tipo}
          artistasIniciales={artistas}
          sesionActiva={Boolean(sesion)}
          eliminarAlDejarDeSeguir={
            tipo === "siguiendo" && sesion?.usuarioId === perfil.id
          }
        />
      </div>

      {sesion && <MenuMovilPanel />}
    </main>
  );
}
