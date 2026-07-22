import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { redirigir } from "@/lib/redirect";
import { crearSesion } from "@/lib/session";

const loginSchema = z.object({
  correo: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128),
});

function redirigirConError(error: string) {
  return redirigir(`/iniciar-sesion?error=${encodeURIComponent(error)}`);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = loginSchema.safeParse({
      correo: formData.get("correo"),
      password: formData.get("password"),
    });

    if (!resultado.success) {
      return redirigirConError("datos-invalidos");
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo: resultado.data.correo },
      select: { id: true, correo: true, passwordHash: true },
    });

    if (
      !usuario ||
      !(await bcrypt.compare(resultado.data.password, usuario.passwordHash))
    ) {
      return redirigirConError("credenciales-invalidas");
    }

    await crearSesion({ usuarioId: usuario.id, correo: usuario.correo });
    return redirigir("/panel");
  } catch (error) {
    console.error("No se pudo iniciar sesión.", error);
    return redirigirConError("servidor");
  }
}
