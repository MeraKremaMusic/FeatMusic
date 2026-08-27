import { redirect } from "next/navigation";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import MiCuentaClient from "./MiCuentaClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fechaCuenta(fecha: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(fecha);
}

export default async function MiCuentaPage() {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/iniciar-sesion");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
    select: {
      nombre: true,
      nombreArtistico: true,
      correo: true,
      creadoEn: true,
      rolSistema: true,
    },
  });

  if (!usuario) {
    redirect("/iniciar-sesion");
  }

  const nombre =
    usuario.nombre?.trim() ||
    usuario.nombreArtistico?.trim() ||
    "Sin nombre registrado";

  return (
    <main className="min-h-[100dvh] bg-[#ededed] text-slate-950 dark:bg-[#0d0d0d] dark:text-white">
      <EncabezadoSecundario volverHref="/artistas/mi-perfil" volverTexto="Mi perfil" />

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-600 dark:text-[#FFD400]">
            Configuración personal
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Mi cuenta
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
            Consulta tus datos de acceso y administra la seguridad de tu cuenta.
          </p>
        </div>

        <div className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#171717] sm:p-6">
            <h2 className="text-base font-black">Información de la cuenta</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Dato etiqueta="Mi nombre" valor={nombre} />
              <Dato etiqueta="Correo" valor={usuario.correo} />
              <Dato etiqueta="Cuenta creada" valor={fechaCuenta(usuario.creadoEn)} />
            </div>
          </article>

          <MiCuentaClient esAdministrador={usuario.rolSistema === "ADMIN"} />
        </div>
      </section>
    </main>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-white/10 dark:bg-black/25">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-zinc-500">
        {etiqueta}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800 dark:text-zinc-100">
        {valor}
      </p>
    </div>
  );
}
