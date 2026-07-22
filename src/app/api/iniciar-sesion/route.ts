import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/session";

const loginSchema = z.object({
  correo: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128),
});

function redirigirConError(request: Request, error: string) {
  return NextResponse.redirect(
    new URL(`/iniciar-sesion?error=${encodeURIComponent(error)}`, request.url),
    303
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = loginSchema.safeParse({
      correo: formData.get("correo"),
      password: formData.get("password"),
    });

    if (!resultado.success) {
      return redirigirConError(request, "datos-invalidos");
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo: resultado.data.correo },
      select: { id: true, correo: true, passwordHash: true },
    });

    if (
      !usuario ||
      !(await bcrypt.compare(resultado.data.password, usuario.passwordHash))
    ) {
      return redirigirConError(request, "credenciales-invalidas");
    }

    await crearSesion({ usuarioId: usuario.id, correo: usuario.correo });
    return NextResponse.redirect(new URL("/panel", request.url), 303);
  } catch (error) {
    console.error("No se pudo iniciar sesión.", error);
    return redirigirConError(request, "servidor");
  }
}
