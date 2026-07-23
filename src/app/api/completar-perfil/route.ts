import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { redirigir } from "@/lib/redirect";
import { obtenerSesion } from "@/lib/session";

const perfilSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  nombreArtistico: z.string().trim().min(2).max(80),
  pais: z.string().trim().min(2).max(80),
  ciudad: z.string().trim().min(2).max(80),
  idiomaPrincipal: z.enum(["Español", "English", "Português"]),
  rolPrincipal: z.enum(["CANTANTE", "COMPOSITOR", "BEATMAKER"]),
  tipoColaboracion: z.enum(["BUSCO_COLABORAR", "BUSCO_PROPUESTAS", "AMBAS"]),
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
      pais: formData.get("pais"),
      ciudad: formData.get("ciudad"),
      idiomaPrincipal: formData.get("idiomaPrincipal"),
      rolPrincipal: formData.get("rolPrincipal"),
      tipoColaboracion: formData.get("tipoColaboracion"),
      generos: formData.getAll("generos"),
    });

    if (!resultado.success) return redirigir("/completar-perfil?error=datos-invalidos");

    await prisma.usuario.update({
      where: { id: sesion.usuarioId },
      data: { ...resultado.data, perfilCompleto: true },
    });

    return redirigir("/panel");
  } catch (error) {
    console.error("No se pudo completar el perfil.", error);
    return redirigir("/completar-perfil?error=servidor");
  }
}
