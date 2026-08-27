import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import AccionesModeracionUsuario from "@/app/admin/components/AccionesModeracionUsuario";
import CambiarEstadoReporte from "@/app/admin/components/CambiarEstadoReporte";
import { obtenerAdministradorActual } from "@/lib/admin";
import { evaluarRestriccionCuenta } from "@/lib/moderacion";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Revisar reporte | FeatMusic Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ETIQUETAS_MOTIVO: Record<string, string> = {
  SPAM: "Spam o publicidad engañosa",
  SUPLANTACION: "Suplantación de identidad",
  ACOSO: "Acoso, amenazas o discriminación",
  CONTENIDO_ROBADO: "Música o contenido presuntamente robado",
  CONTENIDO_INAPROPIADO: "Contenido inapropiado o ilegal",
  OTRO: "Otro motivo",
};

function fechaColombia(fecha: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(fecha);
}

type PaginaReporteProps = {
  params: Promise<{ id: string }>;
};

export default async function PaginaReporteAdmin({
  params,
}: PaginaReporteProps) {
  const administrador = await obtenerAdministradorActual();

  if (!administrador) {
    notFound();
  }

  const { id: idTexto } = await params;
  const id = Number(idTexto);

  if (!Number.isSafeInteger(id) || id <= 0) {
    notFound();
  }

  const reporte = await prisma.reporteUsuario.findUnique({
    where: { id },
    select: {
      id: true,
      motivo: true,
      descripcion: true,
      estado: true,
      creadoEn: true,
      actualizadoEn: true,
      reportante: {
        select: {
          id: true,
          correo: true,
          nombreUsuario: true,
          nombreArtistico: true,
          fotoPerfil: true,
        },
      },
      reportado: {
        select: {
          id: true,
          correo: true,
          nombreUsuario: true,
          nombreArtistico: true,
          fotoPerfil: true,
          plan: true,
          rolSistema: true,
          estadoCuenta: true,
          suspendidoHasta: true,
          motivoRestriccion: true,
          reportesRecibidos: {
            orderBy: { creadoEn: "desc" },
            take: 10,
            select: {
              id: true,
              motivo: true,
              estado: true,
              creadoEn: true,
            },
          },
          moderacionRecibida: {
            orderBy: { creadoEn: "desc" },
            take: 20,
            select: {
              id: true,
              accion: true,
              motivo: true,
              suspendidoHasta: true,
              creadoEn: true,
              reporteId: true,
              admin: {
                select: {
                  nombreUsuario: true,
                  nombreArtistico: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!reporte) {
    notFound();
  }

  const perfilReportado = reporte.reportado.nombreUsuario
    ? `/artistas/${encodeURIComponent(reporte.reportado.nombreUsuario)}`
    : null;

  // FEATMUSIC_ADMIN_FASE2_MODERACION_V1
  const restriccionActual = evaluarRestriccionCuenta(reporte.reportado);
  const estadoCuentaVisible =
    restriccionActual?.tipo === "BLOQUEADA"
      ? "BLOQUEADA"
      : restriccionActual?.tipo === "SUSPENDIDA"
        ? "SUSPENDIDA"
        : "ACTIVA";

  const etiquetasAccion: Record<string, string> = {
    ADVERTIR: "Advertencia",
    SUSPENDER_24H: "Suspensión de 24 horas",
    SUSPENDER_7D: "Suspensión de 7 días",
    SUSPENDER_30D: "Suspensión de 30 días",
    BLOQUEAR: "Bloqueo",
    REACTIVAR: "Reactivación",
  };

  return (
    <main className="min-h-[100dvh] bg-[#0d0d0d] text-white">
      <EncabezadoSecundario volverHref="/admin" volverTexto="Panel admin" />

      <section className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="rounded-[28px] border border-white/10 bg-[#151515] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                Reporte #{reporte.id}
              </span>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                {ETIQUETAS_MOTIVO[reporte.motivo] ?? reporte.motivo}
              </h1>
              <p className="mt-2 text-xs text-zinc-500">
                Recibido {fechaColombia(reporte.creadoEn)}
              </p>
            </div>

            <span className="rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1.5 text-[10px] font-black text-yellow-200">
              {reporte.estado.replaceAll("_", " ")}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                Reportante
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {reporte.reportante.nombreArtistico || "Sin nombre artístico"}
              </p>
              <p className="mt-1 text-xs font-semibold text-yellow-200">
                @{reporte.reportante.nombreUsuario ?? "sin-usuario"}
              </p>
              <p className="mt-2 break-all text-[10px] text-zinc-500">
                {reporte.reportante.correo}
              </p>
            </article>

            <article className="rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.05] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                Usuario reportado
              </p>
              <p className="mt-2 text-sm font-black text-white">
                {reporte.reportado.nombreArtistico || "Sin nombre artístico"}
              </p>
              <p className="mt-1 text-xs font-semibold text-yellow-200">
                @{reporte.reportado.nombreUsuario ?? "sin-usuario"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-zinc-500">
                <span>Plan: {reporte.reportado.plan}</span>
                <span>·</span>
                <span>ID: {reporte.reportado.id}</span>
                <span>·</span>
                <span
                  className={
                    estadoCuentaVisible === "ACTIVA"
                      ? "text-zinc-400"
                      : "font-black text-yellow-200"
                  }
                >
                  Cuenta: {estadoCuentaVisible}
                </span>
              </div>
              {restriccionActual?.tipo === "SUSPENDIDA" ? (
                <p className="mt-2 text-[10px] leading-5 text-yellow-200">
                  Suspendida hasta {fechaColombia(restriccionActual.suspendidoHasta)}
                </p>
              ) : null}
              {perfilReportado && (
                <Link
                  href={perfilReportado}
                  className="mt-3 inline-flex min-h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-black text-white transition hover:border-yellow-300/30"
                >
                  Ver perfil público
                </Link>
              )}
            </article>
          </div>

          <article className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
              Descripción enviada
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
              {reporte.descripcion}
            </p>
          </article>

          <div className="mt-4">
            <CambiarEstadoReporte
              reporteId={reporte.id}
              estadoInicial={reporte.estado}
            />
          </div>

          <div className="mt-4">
            <AccionesModeracionUsuario
              usuarioId={reporte.reportado.id}
              reporteId={reporte.id}
              estadoActual={estadoCuentaVisible}
              esAdministradorObjetivo={reporte.reportado.rolSistema === "ADMIN"}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                    Historial de reportes
                  </p>
                  <h3 className="mt-1 text-sm font-black text-white">
                    Reportes recibidos por esta cuenta
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-black text-zinc-400">
                  Últimos 10
                </span>
              </div>

              {reporte.reportado.reportesRecibidos.length === 0 ? (
                <p className="mt-4 text-xs text-zinc-500">
                  Esta cuenta no tiene otros reportes.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {reporte.reportado.reportesRecibidos.map((anterior) => (
                    <Link
                      key={anterior.id}
                      href={`/admin/reportes/${anterior.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-yellow-300/25"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-yellow-200">
                          Reporte #{anterior.id}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-zinc-500">
                          {ETIQUETAS_MOTIVO[anterior.motivo] ?? anterior.motivo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-400">
                          {anterior.estado.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-[9px] text-zinc-600">
                          {fechaColombia(anterior.creadoEn)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                    Historial de moderación
                  </p>
                  <h3 className="mt-1 text-sm font-black text-white">
                    Acciones administrativas
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-black text-zinc-400">
                  Últimas 20
                </span>
              </div>

              {reporte.reportado.moderacionRecibida.length === 0 ? (
                <p className="mt-4 text-xs text-zinc-500">
                  Esta cuenta todavía no tiene sanciones ni advertencias.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {reporte.reportado.moderacionRecibida.map((accion) => (
                    <div
                      key={accion.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[10px] font-black text-yellow-200">
                          {etiquetasAccion[accion.accion] ?? accion.accion}
                        </p>
                        <span className="text-[9px] text-zinc-600">
                          {fechaColombia(accion.creadoEn)}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] leading-5 text-zinc-400">
                        {accion.motivo}
                      </p>
                      <p className="mt-2 text-[9px] text-zinc-600">
                        Admin: @
                        {accion.admin.nombreUsuario ??
                          accion.admin.nombreArtistico ??
                          "administrador"}
                        {accion.reporteId ? ` · Reporte #${accion.reporteId}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>

          <p className="mt-4 text-[10px] leading-5 text-zinc-600">
            Última actualización del reporte: {fechaColombia(reporte.actualizadoEn)}.
            Las sanciones y reactivaciones se registran por separado en el historial
            administrativo.
          </p>
        </div>
      </section>
    </main>
  );
}
