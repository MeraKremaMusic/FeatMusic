import bcrypt from "bcryptjs";
import { z } from "zod";

import { MAXIMO_INTENTOS_CODIGO } from "@/lib/codigos";
import { prisma } from "@/lib/prisma";
import {
  claveLimiteCompuesta,
  claveLimitePorIp,
  consultarLimiteSeguridad,
  limpiarLimiteSeguridad,
  registrarFalloSeguridad,
} from "@/lib/rate-limit";
import { redirigir } from "@/lib/redirect";

const schema = z
  .object({
    correo: z.string().trim().email().toLowerCase(),
    codigo: z.string().trim().regex(/^\d{6}$/),
    password: z.string().min(8).max(128),
    repetirPassword: z.string().min(8).max(128),
  })
  .refine((datos) => datos.password === datos.repetirPassword, {
    path: ["repetirPassword"],
  });

const MINUTO = 60 * 1000;
const REGLA_CODIGO_CORREO_IP = {
  alcance: "RESET_CODIGO_CORREO_IP",
  maxIntentos: 5,
  ventanaMs: 15 * MINUTO,
  bloqueoMs: 15 * MINUTO,
};
const REGLA_CODIGO_IP = {
  alcance: "RESET_CODIGO_IP",
  maxIntentos: 20,
  ventanaMs: 15 * MINUTO,
  bloqueoMs: 30 * MINUTO,
};

const ruta = (correo: string, error: string) =>
  `/restablecer-contrasena?${new URLSearchParams({ correo, error }).toString()}`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = schema.safeParse({
      correo: formData.get("correo"),
      codigo: formData.get("codigo"),
      password: formData.get("password"),
      repetirPassword: formData.get("repetirPassword"),
    });

    if (!resultado.success) {
      return redirigir(
        ruta(String(formData.get("correo") ?? ""), "datos-invalidos"),
      );
    }

    const datos = resultado.data;
    const claveCorreoIp = claveLimiteCompuesta(request, datos.correo);
    const claveIp = claveLimitePorIp(request);

    // FEATMUSIC_RATE_LIMIT_PASSWORDS_V1
    const [limiteCorreo, limiteIp] = await Promise.all([
      consultarLimiteSeguridad({
        alcance: REGLA_CODIGO_CORREO_IP.alcance,
        claveHash: claveCorreoIp,
        ventanaMs: REGLA_CODIGO_CORREO_IP.ventanaMs,
      }),
      consultarLimiteSeguridad({
        alcance: REGLA_CODIGO_IP.alcance,
        claveHash: claveIp,
        ventanaMs: REGLA_CODIGO_IP.ventanaMs,
      }),
    ]);

    if (limiteCorreo.bloqueado || limiteIp.bloqueado) {
      return redirigir(ruta(datos.correo, "demasiados-intentos"));
    }

    const registrarFallo = async () => {
      const [falloCorreo, falloIp] = await Promise.all([
        registrarFalloSeguridad({
          ...REGLA_CODIGO_CORREO_IP,
          claveHash: claveCorreoIp,
        }),
        registrarFalloSeguridad({ ...REGLA_CODIGO_IP, claveHash: claveIp }),
      ]);
      return falloCorreo.bloqueado || falloIp.bloqueado;
    };

    const recuperacion = await prisma.recuperacionPassword.findUnique({
      where: { correo: datos.correo },
    });

    if (!recuperacion || recuperacion.codigoExpiraEn < new Date()) {
      const bloqueado = await registrarFallo();
      return redirigir(
        ruta(datos.correo, bloqueado ? "demasiados-intentos" : "codigo-vencido"),
      );
    }

    if (recuperacion.intentosCodigo >= MAXIMO_INTENTOS_CODIGO) {
      return redirigir(ruta(datos.correo, "demasiados-intentos"));
    }

    if (!(await bcrypt.compare(datos.codigo, recuperacion.codigoHash))) {
      const [, bloqueado] = await Promise.all([
        prisma.recuperacionPassword.update({
          where: { id: recuperacion.id },
          data: { intentosCodigo: { increment: 1 } },
        }),
        registrarFallo(),
      ]);

      return redirigir(
        ruta(
          datos.correo,
          bloqueado ? "demasiados-intentos" : "codigo-incorrecto",
        ),
      );
    }

    await limpiarLimiteSeguridad(
      REGLA_CODIGO_CORREO_IP.alcance,
      claveCorreoIp,
    );

    await prisma.$transaction([
      prisma.usuario.update({
        where: { correo: datos.correo },
        data: {
          passwordHash: await bcrypt.hash(datos.password, 12),
          // FEATMUSIC_MI_CUENTA_V1
          sesionVersion: { increment: 1 },
        },
      }),
      prisma.recuperacionPassword.delete({ where: { id: recuperacion.id } }),
    ]);

    return redirigir("/iniciar-sesion?exito=password-restablecida");
  } catch (error) {
    console.error("No se pudo restablecer la contraseña.", error);
    return redirigir("/recuperar-contrasena?error=servidor");
  }
}
