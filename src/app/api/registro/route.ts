import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  crearCodigoVerificacion,
  fechaExpiracionCodigo,
  segundosHastaReenvio,
} from "@/lib/codigos";
import { enviarCodigoPorCorreo } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { redirigir } from "@/lib/redirect";

const registroSchema = z
  .object({
    correo: z.string().trim().email().toLowerCase(),
    password: z.string().min(8).max(128),
    repetirPassword: z.string().min(8).max(128),
    rolPrincipal: z.enum(["CANTANTE", "COMPOSITOR", "BEATMAKER"]),
    aceptaTerminos: z.literal("on"),
  })
  .refine((datos) => datos.password === datos.repetirPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["repetirPassword"],
  });

function redirigirConError(error: string) {
  return redirigir(`/registro?error=${encodeURIComponent(error)}`);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const resultado = registroSchema.safeParse({
      correo: formData.get("correo"),
      password: formData.get("password"),
      repetirPassword: formData.get("repetirPassword"),
      rolPrincipal: formData.get("rolPrincipal"),
      aceptaTerminos: formData.get("aceptaTerminos"),
    });

    if (!resultado.success) {
      const contrasenasDistintas = resultado.error.issues.some(
        (issue) => issue.path[0] === "repetirPassword",
      );

      return redirigirConError(
        contrasenasDistintas
          ? "contrasenas-no-coinciden"
          : "datos-invalidos",
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        correo: resultado.data.correo,
      },
      select: {
        id: true,
      },
    });

    if (usuarioExistente) {
      return redirigirConError("correo-existente");
    }

    const pendienteActual = await prisma.registroPendiente.findUnique({
      where: {
        correo: resultado.data.correo,
      },
    });

    if (pendienteActual) {
      const espera = segundosHastaReenvio(
        pendienteActual.ultimoEnvioEn,
      );

      if (espera > 0) {
        return redirigirConError(`espera-reenvio-${espera}`);
      }
    }

    const codigo = crearCodigoVerificacion();

    const [passwordHash, codigoHash] = await Promise.all([
      bcrypt.hash(resultado.data.password, 12),
      bcrypt.hash(codigo, 10),
    ]);

    await prisma.registroPendiente.upsert({
      where: {
        correo: resultado.data.correo,
      },
      create: {
        correo: resultado.data.correo,
        passwordHash,
        rolPrincipal: resultado.data.rolPrincipal,
        codigoHash,
        codigoExpiraEn: fechaExpiracionCodigo(),
        aceptoTerminosEn: new Date(),
      },
      update: {
        passwordHash,
        rolPrincipal: resultado.data.rolPrincipal,
        codigoHash,
        codigoExpiraEn: fechaExpiracionCodigo(),
        intentosCodigo: 0,
        ultimoEnvioEn: new Date(),
        aceptoTerminosEn: new Date(),
      },
    });

    await enviarCodigoPorCorreo({
      correo: resultado.data.correo,
      codigo,
      tipo: "verificacion",
    });

    return redirigir(
      `/verificar-correo?correo=${encodeURIComponent(
        resultado.data.correo,
      )}&enviado=1`,
    );
  } catch (error) {
    console.error("No se pudo iniciar el registro.", error);

    const mensaje =
      error instanceof Error
        ? error.message
        : "ERROR_DESCONOCIDO";

    if (mensaje.startsWith("SMTP_NO_CONFIGURADO")) {
      return redirigirConError("correo-no-enviado");
    }

    return redirigirConError("servidor");
  }
}