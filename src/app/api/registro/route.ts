import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registroSchema = z.object({
  nombre: z.string().trim().min(2),
  nombreArtistico: z.string().trim().min(2),
  correo: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  pais: z.string().trim().min(2),
  ciudad: z.string().trim().min(2),
  idiomaPrincipal: z.string().trim().min(2),
  rolPrincipal: z.string().trim().min(2),
  tipoColaboracion: z.string().trim().min(2),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

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
      return NextResponse.redirect(
        new URL("/registro?error=datos-invalidos", request.url),
        303
      );
    }

    const generos = formData
      .getAll("generos")
      .map(String)
      .filter(Boolean);

    if (generos.length === 0) {
      return NextResponse.redirect(
        new URL("/registro?error=selecciona-genero", request.url),
        303
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        correo: resultado.data.correo,
      },
    });

    if (usuarioExistente) {
      return NextResponse.redirect(
        new URL("/registro?error=correo-existente", request.url),
        303
      );
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

    return NextResponse.redirect(
      new URL("/registro/exito", request.url),
      303
    );
  } catch (error) {
    console.error("Error registrando usuario:", error);

    return NextResponse.redirect(
      new URL("/registro?error=servidor", request.url),
      303
    );
  }
}