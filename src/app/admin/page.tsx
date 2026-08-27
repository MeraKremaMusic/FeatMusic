import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import { obtenerAdministradorActual } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Administración | FeatMusic",
  description: "Centro privado de moderación de FeatMusic.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ETIQUETAS_ESTADO: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_REVISION: "En revisión",
  RESUELTO: "Resuelto",
  DESCARTADO: "Descartado",
};

const ETIQUETAS_MOTIVO: Record<string, string> = {
  SPAM: "Spam",
  SUPLANTACION: "Suplantación",
  ACOSO: "Acoso",
  CONTENIDO_ROBADO: "Contenido robado",
  CONTENIDO_INAPROPIADO: "Contenido inapropiado",
  OTRO: "Otro",
};

function fechaColombia(fecha: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(fecha);
}

function claseEstado(estado: string) {
  if (estado === "PENDIENTE") {
    return "border-yellow-300/30 bg-yellow-300/10 text-yellow-200";
  }

  if (estado === "EN_REVISION") {
    return "border-white/20 bg-white/10 text-white";
  }

  if (estado === "RESUELTO") {
    return "border-white/10 bg-white/[0.05] text-zinc-300";
  }

  return "border-zinc-700 bg-zinc-900 text-zinc-500";
}

export default async function AdminPage() {
  const administrador = await obtenerAdministradorActual();

  if (!administrador) {
    notFound();
  }

  const [
    pendientes,
    enRevision,
    resueltos,
    descartados,
    total,
    reportes,
  ] = await prisma.$transaction([
    prisma.reporteUsuario.count({ where: { estado: "PENDIENTE" } }),
    prisma.reporteUsuario.count({ where: { estado: "EN_REVISION" } }),
    prisma.reporteUsuario.count({ where: { estado: "RESUELTO" } }),
    prisma.reporteUsuario.count({ where: { estado: "DESCARTADO" } }),
    prisma.reporteUsuario.count(),
    prisma.reporteUsuario.findMany({
      orderBy: { creadoEn: "desc" },
      take: 100,
      select: {
        id: true,
        motivo: true,
        descripcion: true,
        estado: true,
        creadoEn: true,
        actualizadoEn: true,
        reportante: {
          select: {
            nombreUsuario: true,
            nombreArtistico: true,
          },
        },
        reportado: {
          select: {
            nombreUsuario: true,
            nombreArtistico: true,
          },
        },
      },
    }),
  ]);

  const estadisticas = [
    { etiqueta: "Pendientes", valor: pendientes },
    { etiqueta: "En revisión", valor: enRevision },
    { etiqueta: "Resueltos", valor: resueltos },
    { etiqueta: "Descartados", valor: descartados },
  ];

  return (
    <main className="min-h-[100dvh] bg-[#0d0d0d] text-white">
      <EncabezadoSecundario
        volverHref="/artistas/mi-perfil"
        volverTexto="Salir de admin"
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#151515]">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,212,0,.18),transparent_35%),#111] p-6 sm:p-8">
            <span className="inline-flex rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
              Área privada
            </span>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  FeatMusic Admin
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  Centro de moderación para revisar reportes enviados por la comunidad.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-zinc-400">
                <span className="font-black text-white">Administrador:</span>{" "}
                @{administrador.nombreUsuario ?? administrador.correo}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-white/10 sm:grid-cols-4">
            {estadisticas.map((item) => (
              <div
                key={item.etiqueta}
                className="border-b border-r border-white/10 p-4 last:border-r-0 sm:border-b-0 sm:p-5"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  {item.etiqueta}
                </p>
                <p className="mt-2 text-3xl font-black text-yellow-300">
                  {item.valor}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Reportes recientes</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {total} reporte{total === 1 ? "" : "s"} en total
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold text-zinc-400">
                Últimos 100
              </span>
            </div>

            {reportes.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 px-5 py-10 text-center">
                <p className="text-sm font-black text-white">No hay reportes todavía.</p>
                <p className="mt-2 text-xs text-zinc-500">
                  Los nuevos reportes aparecerán aquí automáticamente.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {reportes.map((reporte) => (
                  <article
                    key={reporte.id}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-yellow-300/25 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-yellow-300">
                            #{reporte.id}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${claseEstado(
                              reporte.estado,
                            )}`}
                          >
                            {ETIQUETAS_ESTADO[reporte.estado] ?? reporte.estado}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {fechaColombia(reporte.creadoEn)}
                          </span>
                        </div>

                        <h3 className="mt-3 text-sm font-black text-white">
                          {ETIQUETAS_MOTIVO[reporte.motivo] ?? reporte.motivo}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-zinc-400">
                          <span className="font-bold text-zinc-200">
                            @{reporte.reportante.nombreUsuario ?? "usuario"}
                          </span>{" "}
                          reportó a{" "}
                          <span className="font-bold text-yellow-200">
                            @{reporte.reportado.nombreUsuario ?? "usuario"}
                          </span>
                        </p>

                        <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-zinc-500">
                          {reporte.descripcion}
                        </p>
                      </div>

                      <Link
                        href={`/admin/reportes/${reporte.id}`}
                        className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD400] px-4 py-2 text-xs font-black text-black transition hover:brightness-95"
                      >
                        Revisar
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
