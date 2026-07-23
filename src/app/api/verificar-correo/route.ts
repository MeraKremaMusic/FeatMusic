import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { MAXIMO_INTENTOS_CODIGO } from "@/lib/codigos";
import { prisma } from "@/lib/prisma";
import { redirigir } from "@/lib/redirect";
import { crearSesion } from "@/lib/session";

const verificacionSchema = z.object({
  correo: z.string().trim().email().toLowerCase(),
  codigo: z.string().trim().regex(/^\d{6}$/),
});

function rutaVerificacion(correo: string, error?: string) {
  const parametros = new URLSearchParams({ correo });
  if (error) parametros.set("error", error);
  return `/verificar-correo?${parametros.toString()}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = verificacionSchema.safeParse({
      correo: formData.get("correo"),
      codigo: formData.get("codigo"),
    });

    if (!resultado.success) {
      const correo = String(formData.get("correo") ?? "");
      return redirigir(rutaVerificacion(correo, "codigo-invalido"));
    }

    const pendiente = await prisma.registroPendiente.findUnique({
      where: { correo: resultado.data.correo },
    });

    if (!pendiente) {
      return redirigir(rutaVerificacion(resultado.data.correo, "solicitud-no-encontrada"));
    }

    if (pendiente.codigoExpiraEn < new Date()) {
      return redirigir(rutaVerificacion(resultado.data.correo, "codigo-vencido"));
    }

    if (pendiente.intentosCodigo >= MAXIMO_INTENTOS_CODIGO) {
      return redirigir(rutaVerificacion(resultado.data.correo, "demasiados-intentos"));
    }

    const codigoCorrecto = await bcrypt.compare(
      resultado.data.codigo,
      pendiente.codigoHash,
    );

    if (!codigoCorrecto) {
      await prisma.registroPendiente.update({
        where: { id: pendiente.id },
        data: { intentosCodigo: { increment: 1 } },
      });
      return redirigir(rutaVerificacion(resultado.data.correo, "codigo-incorrecto"));
    }

    const usuario = await prisma.$transaction(async (tx) => {
      const existente = await tx.usuario.findUnique({
        where: { correo: pendiente.correo },
        select: { id: true },
      });

      if (existente) {
        throw new Error("CORREO_EXISTENTE");
      }

      const nuevoUsuario = await tx.usuario.create({
        data: {
          correo: pendiente.correo,
          passwordHash: pendiente.passwordHash,
          rolPrincipal: pendiente.rolPrincipal,
          correoVerificado: true,
          perfilCompleto: false,
          aceptoTerminosEn: pendiente.aceptoTerminosEn,
        },
        select: { id: true, correo: true },
      });

      await tx.registroPendiente.delete({ where: { id: pendiente.id } });
      return nuevoUsuario;
    });

    await crearSesion({ usuarioId: usuario.id, correo: usuario.correo });
    return redirigir("/completar-perfil");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return redirigir("/registro?error=correo-existente");
    }

    if (error instanceof Error && error.message === "CORREO_EXISTENTE") {
      return redirigir("/registro?error=correo-existente");
    }

    console.error("No se pudo verificar el correo.", error);
    return redirigir("/registro?error=servidor");
  }
}
