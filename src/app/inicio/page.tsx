import Link from "next/link";
import { redirect } from "next/navigation";

import NavegacionEscritorio from "@/app/components/NavegacionEscritorio";
import MenuMovilPanel from "@/app/panel/components/MenuMovilPanel";
import {
  calcularCompatibilidad,
  obtenerGenerosPerfil,
  type OportunidadFeed,
} from "@/lib/feed-inicio";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

import FeedInicio from "./FeedInicio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ESTADOS_QUE_OCUPAN_CUPO = [
  "PENDIENTE",
  "CAMBIOS_SOLICITADOS",
  "ACEPTADA",
  "RECHAZANDO",
];

function tieneTexto(valor: string | null | undefined): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

function perfilEsPublicable(usuario: {
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  ciudad: string | null;
  pais: string | null;
  rolPrincipal: string;
  generos: unknown;
}) {
  return (
    tieneTexto(usuario.nombreArtistico) &&
    tieneTexto(usuario.nombreUsuario) &&
    tieneTexto(usuario.ciudad) &&
    tieneTexto(usuario.pais) &&
    tieneTexto(usuario.rolPrincipal) &&
    obtenerGenerosPerfil(usuario.generos).length > 0
  );
}

function IconoSalir({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 5H5v14h5" />
      <path d="M13 8l4 4-4 4" />
      <path d="M17 12H9" />
    </svg>
  );
}

export default async function InicioPage() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  const ahora = new Date();

  const [usuario, ideasActivas] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: {
        id: true,
        perfilCompleto: true,
        rolPrincipal: true,
        generos: true,
        idiomaPrincipal: true,
        tipoColaboracion: true,
        pais: true,
        ciudad: true,
        siguiendo: {
          select: { seguidoId: true },
        },
      },
    }),
    prisma.idea.findMany({
      where: {
        estado: "ACTIVA",
        expiraEn: { gt: ahora },
        usuarioId: { not: sesion.usuarioId },
        usuario: { perfilCompleto: true },
      },
      orderBy: { creadoEn: "desc" },
      take: 80,
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        audioUrl: true,
        duracionSegundos: true,
        bpm: true,
        tonalidad: true,
        rolBuscado: true,
        generoMusical: true,
        idiomaBuscado: true,
        modalidadColaboracion: true,
        paisPreferido: true,
        departamentoPreferido: true,
        ciudadPreferida: true,
        tipoAcuerdo: true,
        creadoEn: true,
        expiraEn: true,
        usuario: {
          select: {
            id: true,
            nombreArtistico: true,
            nombreUsuario: true,
            fotoPerfil: true,
            ciudad: true,
            pais: true,
            rolPrincipal: true,
            generos: true,
          },
        },
        _count: {
          select: {
            propuestas: {
              where: {
                estado: { in: ESTADOS_QUE_OCUPAN_CUPO },
              },
            },
            vistas: true,
          },
        },
        propuestas: {
          where: { remitenteId: sesion.usuarioId },
          select: {
            estado: true,
            motivoDecision: true,
            permiteReintento: true,
            numeroIntento: true,
          },
          take: 1,
        },
        guardadas: {
          where: { usuarioId: sesion.usuarioId },
          select: { id: true },
          take: 1,
        },
      },
    }),
  ]);

  if (!usuario) {
    redirect("/iniciar-sesion");
  }

  if (!usuario.perfilCompleto) {
    redirect("/completar-perfil");
  }

  const idsSeguidos = new Set(
    usuario.siguiendo.map((seguimiento) => seguimiento.seguidoId),
  );
  const perfilCompatibilidad = {
    rolPrincipal: usuario.rolPrincipal,
    generos: obtenerGenerosPerfil(usuario.generos),
    idiomaPrincipal: usuario.idiomaPrincipal,
    tipoColaboracion: usuario.tipoColaboracion,
    pais: usuario.pais,
    ciudad: usuario.ciudad,
  };

  const oportunidades: OportunidadFeed[] = ideasActivas
    .filter((idea) => perfilEsPublicable(idea.usuario))
    .map((idea) => ({
      id: idea.id,
      titulo: idea.titulo,
      descripcion: idea.descripcion,
      audioUrl: idea.audioUrl,
      duracionSegundos: idea.duracionSegundos,
      bpm: idea.bpm,
      tonalidad: idea.tonalidad,
      rolBuscado: idea.rolBuscado,
      generoMusical: idea.generoMusical,
      idiomaBuscado: idea.idiomaBuscado,
      modalidadColaboracion: idea.modalidadColaboracion,
      paisPreferido: idea.paisPreferido,
      departamentoPreferido: idea.departamentoPreferido,
      ciudadPreferida: idea.ciudadPreferida,
      tipoAcuerdo: idea.tipoAcuerdo,
      creadoEn: idea.creadoEn.toISOString(),
      expiraEn: idea.expiraEn.toISOString(),
      propuestasActuales: idea._count.propuestas,
      vistasUnicas: idea._count.vistas,
      guardada: idea.guardadas.length > 0,
      propuestaUsuario: idea.propuestas[0] ?? null,
      esSeguido: idsSeguidos.has(idea.usuario.id),
      compatibilidad: calcularCompatibilidad(perfilCompatibilidad, idea),
      artista: {
        id: idea.usuario.id,
        nombreArtistico: idea.usuario.nombreArtistico!.trim(),
        nombreUsuario: idea.usuario.nombreUsuario!.trim(),
        fotoPerfil: idea.usuario.fotoPerfil,
        ciudad: idea.usuario.ciudad!.trim(),
        pais: idea.usuario.pais!.trim(),
        rol: idea.usuario.rolPrincipal,
        generos: obtenerGenerosPerfil(idea.usuario.generos),
      },
    }));

  return (
    <main className="featmusic-app-light h-[100dvh] overflow-hidden bg-[#06100c] text-white lg:h-screen">
      <header className="relative z-50 bg-black">
        <div className="relative mx-auto flex h-12 max-w-[1280px] items-center justify-between px-4">
          <Link href="/inicio" className="text-lg font-black tracking-tight">
            Feat<span className="text-emerald-400">Music</span>
          </Link>

          <NavegacionEscritorio />

          <form action="/api/cerrar-sesion" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-white transition hover:text-zinc-300"
            >
              <IconoSalir />
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <FeedInicio
        oportunidadesIniciales={oportunidades}
        usuarioActualId={usuario.id}
      />

      <MenuMovilPanel />
    </main>
  );
}
