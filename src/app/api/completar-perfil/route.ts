import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  nombreUsuarioEsValido,
  normalizarNombreUsuario,
} from "@/lib/nombreUsuario";
import { prisma } from "@/lib/prisma";
import { redirigir } from "@/lib/redirect";
import { obtenerSesion } from "@/lib/session";
import { validarUbicacion } from "@/lib/ubicaciones";

export const runtime = "nodejs";

const perfilSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  nombreArtistico: z.string().trim().min(2).max(80),
  paisCodigo: z.string().trim().length(2),
  departamentoCodigo: z.string().trim().min(1).max(30),
  ciudad: z.string().trim().min(2).max(120),
  idiomaPrincipal: z.enum(["Español", "English", "Português"]),
  rolPrincipal: z.enum(["CANTANTE", "COMPOSITOR", "BEATMAKER"]),
  tipoColaboracion: z.enum([
    "BUSCO_COLABORAR",
    "BUSCO_PROPUESTAS",
    "AMBAS",
  ]),
  generos: z.array(z.string().trim().min(1).max(40)).min(1).max(5),
});

export async function POST(request: Request) {
  const sesion = await obtenerSesion();
  if (!sesion) return redirigir("/iniciar-sesion");

  try {
    const formData = await request.formData();
    const resultado = perfilSchema.safeParse({
      nombre: formData.get("nombre"),
      nombreArtistico: formData.get("nombreArtistico"),
      paisCodigo: String(formData.get("paisCodigo") ?? "").toUpperCase(),
      departamentoCodigo: String(
        formData.get("departamentoCodigo") ?? "",
      ).toUpperCase(),
      ciudad: formData.get("ciudad"),
      idiomaPrincipal: formData.get("idiomaPrincipal"),
      rolPrincipal: formData.get("rolPrincipal"),
      tipoColaboracion: formData.get("tipoColaboracion"),
      generos: formData.getAll("generos"),
    });

    if (!resultado.success) {
      return redirigir("/completar-perfil?error=datos-invalidos");
    }

    const ubicacion = await validarUbicacion({
      paisCodigo: resultado.data.paisCodigo,
      departamentoCodigo: resultado.data.departamentoCodigo,
      ciudad: resultado.data.ciudad,
    });

    if (!ubicacion) {
      return redirigir("/completar-perfil?error=ubicacion-invalida");
    }

    const usuarioActual = await prisma.usuario.findUnique({
      where: { id: sesion.usuarioId },
      select: { nombreUsuario: true },
    });

    if (!usuarioActual) {
      return redirigir("/iniciar-sesion");
    }

    const solicitado = normalizarNombreUsuario(formData.get("nombreUsuario"));
    const actualNormalizado = normalizarNombreUsuario(
      usuarioActual.nombreUsuario,
    );

    const datosPerfil = {
      nombre: resultado.data.nombre,
      nombreArtistico: resultado.data.nombreArtistico,
      pais: ubicacion.pais,
      departamento: ubicacion.departamento,
      ciudad: ubicacion.ciudad,
      idiomaPrincipal: resultado.data.idiomaPrincipal,
      rolPrincipal: resultado.data.rolPrincipal,
      tipoColaboracion: resultado.data.tipoColaboracion,
      generos: resultado.data.generos,
      perfilCompleto: true,
    };

    if (usuarioActual.nombreUsuario) {
      if (solicitado && solicitado !== actualNormalizado) {
        return redirigir("/completar-perfil?error=usuario-permanente");
      }

      await prisma.usuario.update({
        where: { id: sesion.usuarioId },
        data: datosPerfil,
      });
    } else {
      if (!nombreUsuarioEsValido(solicitado)) {
        return redirigir("/completar-perfil?error=usuario-invalido");
      }

      const ocupado = await prisma.usuario.findFirst({
        where: {
          nombreUsuario: solicitado,
          NOT: { id: sesion.usuarioId },
        },
        select: { id: true },
      });

      if (ocupado) {
        return redirigir("/completar-perfil?error=usuario-ocupado");
      }

      const asignacion = await prisma.usuario.updateMany({
        where: {
          id: sesion.usuarioId,
          nombreUsuario: null,
        },
        data: {
          ...datosPerfil,
          nombreUsuario: solicitado,
        },
      });

      if (asignacion.count === 0) {
        const usuarioDespues = await prisma.usuario.findUnique({
          where: { id: sesion.usuarioId },
          select: { nombreUsuario: true },
        });

        if (
          normalizarNombreUsuario(usuarioDespues?.nombreUsuario) !== solicitado
        ) {
          return redirigir("/completar-perfil?error=usuario-permanente");
        }
      }
    }

    return redirigir("/artistas/mi-perfil");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return redirigir("/completar-perfil?error=usuario-ocupado");
    }

    console.error("No se pudo completar el perfil.", error);
    return redirigir("/completar-perfil?error=servidor");
  }
}
