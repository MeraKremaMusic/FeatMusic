import bcrypt from "bcryptjs";
import { z } from "zod";

import { crearCodigoVerificacion, fechaExpiracionCodigo, segundosHastaReenvio } from "@/lib/codigos";
import { enviarCodigoPorCorreo } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { redirigir } from "@/lib/redirect";

const schema = z.object({ correo: z.string().trim().email().toLowerCase() });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = schema.safeParse({ correo: formData.get("correo") });
    if (!resultado.success) return redirigir("/recuperar-contrasena?error=datos-invalidos");

    const correo = resultado.data.correo;
    const usuario = await prisma.usuario.findUnique({ where: { correo }, select: { id: true } });
    if (!usuario) return redirigir(`/restablecer-contrasena?correo=${encodeURIComponent(correo)}&enviado=1`);

    const previo = await prisma.recuperacionPassword.findUnique({ where: { correo } });
    if (previo && segundosHastaReenvio(previo.ultimoEnvioEn) > 0) {
      return redirigir(`/restablecer-contrasena?correo=${encodeURIComponent(correo)}&error=espera-reenvio`);
    }

    const codigo = crearCodigoVerificacion();
    await prisma.recuperacionPassword.upsert({
      where: { correo },
      create: { correo, codigoHash: await bcrypt.hash(codigo, 10), codigoExpiraEn: fechaExpiracionCodigo() },
      update: { codigoHash: await bcrypt.hash(codigo, 10), codigoExpiraEn: fechaExpiracionCodigo(), intentosCodigo: 0, ultimoEnvioEn: new Date() },
    });
    await enviarCodigoPorCorreo({ correo, codigo, tipo: "recuperacion" });
    return redirigir(`/restablecer-contrasena?correo=${encodeURIComponent(correo)}&enviado=1`);
  } catch (error) {
    console.error("No se pudo solicitar la recuperación.", error);
    return redirigir("/recuperar-contrasena?error=servidor");
  }
}
