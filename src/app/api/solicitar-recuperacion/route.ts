import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  crearCodigoVerificacion,
  fechaExpiracionCodigo,
  segundosHastaReenvio,
} from "@/lib/codigos";
import { enviarCodigoPorCorreo } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  claveLimiteCompuesta,
  claveLimitePorIp,
  consumirLimiteSeguridad,
} from "@/lib/rate-limit";
import { redirigir } from "@/lib/redirect";

const schema = z.object({ correo: z.string().trim().email().toLowerCase() });

const MINUTO = 60 * 1000;
const REGLA_RECUPERACION_CORREO_IP = {
  alcance: "RECUPERACION_CORREO_IP",
  maxIntentos: 3,
  ventanaMs: 15 * MINUTO,
  bloqueoMs: 15 * MINUTO,
};
const REGLA_RECUPERACION_IP = {
  alcance: "RECUPERACION_IP",
  maxIntentos: 10,
  ventanaMs: 30 * MINUTO,
  bloqueoMs: 30 * MINUTO,
};

function rutaRestablecer(correo: string, parametros: Record<string, string>) {
  return `/restablecer-contrasena?${new URLSearchParams({ correo, ...parametros }).toString()}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = schema.safeParse({ correo: formData.get("correo") });
    if (!resultado.success) {
      return redirigir("/recuperar-contrasena?error=datos-invalidos");
    }

    const correo = resultado.data.correo;

    // FEATMUSIC_RATE_LIMIT_PASSWORDS_V1
    // Se consume antes de consultar si la cuenta existe, evitando que el
    // límite revele qué correos están registrados.
    const [limiteCorreo, limiteIp] = await Promise.all([
      consumirLimiteSeguridad({
        ...REGLA_RECUPERACION_CORREO_IP,
        claveHash: claveLimiteCompuesta(request, correo),
      }),
      consumirLimiteSeguridad({
        ...REGLA_RECUPERACION_IP,
        claveHash: claveLimitePorIp(request),
      }),
    ]);

    if (limiteCorreo.bloqueado || limiteIp.bloqueado) {
      return redirigir(
        rutaRestablecer(correo, { error: "demasiadas-solicitudes" }),
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: { id: true },
    });

    if (!usuario) {
      return redirigir(rutaRestablecer(correo, { enviado: "1" }));
    }

    const previo = await prisma.recuperacionPassword.findUnique({ where: { correo } });
    if (previo && segundosHastaReenvio(previo.ultimoEnvioEn) > 0) {
      return redirigir(rutaRestablecer(correo, { error: "espera-reenvio" }));
    }

    const codigo = crearCodigoVerificacion();
    await prisma.recuperacionPassword.upsert({
      where: { correo },
      create: {
        correo,
        codigoHash: await bcrypt.hash(codigo, 10),
        codigoExpiraEn: fechaExpiracionCodigo(),
      },
      update: {
        codigoHash: await bcrypt.hash(codigo, 10),
        codigoExpiraEn: fechaExpiracionCodigo(),
        intentosCodigo: 0,
        ultimoEnvioEn: new Date(),
      },
    });

    await enviarCodigoPorCorreo({ correo, codigo, tipo: "recuperacion" });
    return redirigir(rutaRestablecer(correo, { enviado: "1" }));
  } catch (error) {
    console.error("No se pudo solicitar la recuperación.", error);
    return redirigir("/recuperar-contrasena?error=servidor");
  }
}
