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

const correoSchema = z.object({
  correo: z.string().trim().email().toLowerCase(),
});

function rutaVerificacion(correo: string, estado: string) {
  return `/verificar-correo?${new URLSearchParams({ correo, [estado]: "1" }).toString()}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = correoSchema.safeParse({ correo: formData.get("correo") });
    if (!resultado.success) return redirigir("/registro?error=datos-invalidos");

    const pendiente = await prisma.registroPendiente.findUnique({
      where: { correo: resultado.data.correo },
    });

    if (!pendiente) {
      return redirigir(
        `/verificar-correo?${new URLSearchParams({
          correo: resultado.data.correo,
          error: "solicitud-no-encontrada",
        }).toString()}`,
      );
    }

    const espera = segundosHastaReenvio(pendiente.ultimoEnvioEn);
    if (espera > 0) {
      return redirigir(
        `/verificar-correo?${new URLSearchParams({
          correo: resultado.data.correo,
          error: `espera-reenvio-${espera}`,
        }).toString()}`,
      );
    }

    const codigo = crearCodigoVerificacion();
    await prisma.registroPendiente.update({
      where: { id: pendiente.id },
      data: {
        codigoHash: await bcrypt.hash(codigo, 10),
        codigoExpiraEn: fechaExpiracionCodigo(),
        intentosCodigo: 0,
        ultimoEnvioEn: new Date(),
      },
    });

    await enviarCodigoPorCorreo({
      correo: resultado.data.correo,
      codigo,
      tipo: "verificacion",
    });

    return redirigir(rutaVerificacion(resultado.data.correo, "reenviado"));
  } catch (error) {
    console.error("No se pudo reenviar el código.", error);
    return redirigir("/registro?error=servidor");
  }
}
