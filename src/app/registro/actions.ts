"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registroSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre"),
  nombreArtistico: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre artístico"),
  correo: z
    .string()
    .trim()
    .email("Correo no válido")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  pais: z.string().trim().min(2, "Selecciona tu país"),
  ciudad: z.string().trim().min(2, "Escribe tu ciudad"),
  idiomaPrincipal: z.string().trim().min(2, "Selecciona un idioma"),
  rolPrincipal: z.string().trim().min(2, "Selecciona un rol"),
  tipoColaboracion: z
    .string()
    .trim()
    .min(2, "Selecciona un tipo de colaboración"),
});

export async function registrarUsuario(formData: FormData) {
  const resultado = registroSchema.safeParse({
    nombre: formData.get("nombre"),
    nombreArtistico: formData.get("nombreArtistico"),
    correo: formData.get("correo"),
    password: formData.get("password"),
    pais: formData.get("pais"),
    ciudad: formData.get("ciudad"),
    idiomaPrincipal: formData.get("idiomaPrincipal"),
    rolPrincipal: formData.get("rolPrincipal"),
    tipoColaboracion: formData.get("tipoColaboracion"),
  });

  if (!resultado.success) {
    throw new Error(
      resultado.error.issues[0]?.message ?? "Datos no válidos"
    );
  }

  const generos = formData
    .getAll("generos")
    .map(String)
    .filter(Boolean);

  if (generos.length === 0) {
    throw new Error("Selecciona al menos un género musical");
  }

  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      correo: resultado.data.correo,
    },
  });

  if (usuarioExistente) {
    throw new Error("Ya existe una cuenta con ese correo");
  }

  const passwordHash = await bcrypt.hash(
    resultado.data.password,
    12
  );

  await prisma.usuario.create({
    data: {
      nombre: resultado.data.nombre,
      nombreArtistico: resultado.data.nombreArtistico,
      correo: resultado.data.correo,
      passwordHash,
      pais: resultado.data.pais,
      ciudad: resultado.data.ciudad,
      idiomaPrincipal: resultado.data.idiomaPrincipal,
      rolPrincipal: resultado.data.rolPrincipal,
      generos,
      tipoColaboracion: resultado.data.tipoColaboracion,
    },
  });

  redirect("/registro/exito");
}