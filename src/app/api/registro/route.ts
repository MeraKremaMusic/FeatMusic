import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registroSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  nombreArtistico: z.string().trim().min(2).max(100),
  correo: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(128),
  pais: z.string().trim().min(2).max(100),
  ciudad: z.string().trim().min(2).max(100),
  idiomaPrincipal: z.string().trim().min(2).max(50),
  rolPrincipal: z.string().trim().min(2).max(80),
  generos: z.array(z.string().trim().min(1).max(50)).min(1).max(20),
  tipoColaboracion: z.string().trim().min(2).max(100),
  aceptaTerminos: z.literal("on"),
});

function redirigirConError(request: Request, error: string) {
  return NextResponse.redirect(
    new URL(`/registro?error=${encodeURIComponent(error)}`, request.url),
    303
  );
}

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
      generos: formData.getAll("generos"),
      tipoColaboracion: formData.get("tipoColaboracion"),
      aceptaTerminos: formData.get("aceptaTerminos"),
    });

    if (!resultado.success) {
      const faltaGenero = resultado.error.issues.some(
        (issue) => issue.path[0] === "generos"
      );
      return redirigirConError(
        request,
        faltaGenero ? "selecciona-genero" : "datos-invalidos"
      );
    }

    const usuarioExistente = await prisma.usuario.findUnique({
      where: {
        correo: resultado.data.correo,
      },
    });

    if (usuarioExistente) {
      return redirigirConError(request, "correo-existente");
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
        generos: resultado.data.generos,
        tipoColaboracion: resultado.data.tipoColaboracion,
      },
    });

    return NextResponse.redirect(
      new URL("/registro/exito", request.url),
      303
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return redirigirConError(request, "correo-existente");
    }

    console.error("No se pudo registrar el usuario.", error);
    return redirigirConError(request, "servidor");
  }
}
