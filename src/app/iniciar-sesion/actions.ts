"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/session";

const loginSchema = z.object({
  correo: z.string().trim().email("Correo no válido").toLowerCase(),
  password: z.string().min(1, "Escribe tu contraseña"),
});

export async function iniciarSesion(formData: FormData) {
  const resultado = loginSchema.safeParse({
    correo: formData.get("correo"),
    password: formData.get("password"),
  });

  if (!resultado.success) {
    throw new Error(
      resultado.error.issues[0]?.message ?? "Datos no válidos"
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      correo: resultado.data.correo,
    },
  });

  if (!usuario) {
    throw new Error("Correo o contraseña incorrectos");
  }

  const passwordCorrecta = await bcrypt.compare(
    resultado.data.password,
    usuario.passwordHash
  );

  if (!passwordCorrecta) {
    throw new Error("Correo o contraseña incorrectos");
  }

  await crearSesion({
    usuarioId: usuario.id,
    correo: usuario.correo,
  });

  redirect("/panel");
}