import bcrypt from "bcryptjs";
import { z } from "zod";

import {
  evaluarRestriccionCuenta,
  suspensionYaVencio,
} from "@/lib/moderacion";
import { prisma } from "@/lib/prisma";
import {
  claveLimiteCompuesta,
  claveLimitePorIp,
  consultarLimiteSeguridad,
  limpiarLimiteSeguridad,
  registrarFalloSeguridad,
} from "@/lib/rate-limit";
import { redirigir } from "@/lib/redirect";
import { crearSesion } from "@/lib/session";

const loginSchema = z.object({
  correo: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128),
});

const MINUTO = 60 * 1000;
const REGLA_LOGIN_CUENTA_IP = {
  alcance: "LOGIN_CUENTA_IP",
  maxIntentos: 5,
  ventanaMs: 15 * MINUTO,
  bloqueoMs: 15 * MINUTO,
};
const REGLA_LOGIN_IP = {
  alcance: "LOGIN_IP",
  maxIntentos: 20,
  ventanaMs: 15 * MINUTO,
  bloqueoMs: 30 * MINUTO,
};

function redirigirConError(error: string) {
  return redirigir(`/iniciar-sesion?error=${encodeURIComponent(error)}`);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = loginSchema.safeParse({
      correo: formData.get("correo"),
      password: formData.get("password"),
    });

    if (!resultado.success) {
      return redirigirConError("datos-invalidos");
    }

    // FEATMUSIC_RATE_LIMIT_PASSWORDS_V1
    const claveCuentaIp = claveLimiteCompuesta(request, resultado.data.correo);
    const claveIp = claveLimitePorIp(request);
    const [limiteCuenta, limiteIp] = await Promise.all([
      consultarLimiteSeguridad({
        alcance: REGLA_LOGIN_CUENTA_IP.alcance,
        claveHash: claveCuentaIp,
        ventanaMs: REGLA_LOGIN_CUENTA_IP.ventanaMs,
      }),
      consultarLimiteSeguridad({
        alcance: REGLA_LOGIN_IP.alcance,
        claveHash: claveIp,
        ventanaMs: REGLA_LOGIN_IP.ventanaMs,
      }),
    ]);

    if (limiteCuenta.bloqueado || limiteIp.bloqueado) {
      return redirigirConError("demasiados-intentos");
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo: resultado.data.correo },
      select: {
        id: true,
        correo: true,
        passwordHash: true,
        estadoCuenta: true,
        suspendidoHasta: true,
      },
    });

    if (
      !usuario ||
      !(await bcrypt.compare(resultado.data.password, usuario.passwordHash))
    ) {
      const [falloCuenta, falloIp] = await Promise.all([
        registrarFalloSeguridad({
          ...REGLA_LOGIN_CUENTA_IP,
          claveHash: claveCuentaIp,
        }),
        registrarFalloSeguridad({ ...REGLA_LOGIN_IP, claveHash: claveIp }),
      ]);

      return redirigirConError(
        falloCuenta.bloqueado || falloIp.bloqueado
          ? "demasiados-intentos"
          : "credenciales-invalidas",
      );
    }

    // Una autenticación correcta limpia solo el contador de esa cuenta+IP. El
    // contador global de IP se conserva para impedir credential stuffing.
    await limpiarLimiteSeguridad(REGLA_LOGIN_CUENTA_IP.alcance, claveCuentaIp);

    // FEATMUSIC_ADMIN_FASE2_MODERACION_V1
    const ahora = new Date();
    const restriccion = evaluarRestriccionCuenta(usuario, ahora);

    if (restriccion?.tipo === "BLOQUEADA") {
      return redirigirConError("cuenta-bloqueada");
    }

    if (restriccion?.tipo === "SUSPENDIDA") {
      return redirigirConError("cuenta-suspendida");
    }

    if (suspensionYaVencio(usuario, ahora)) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          suspendidoHasta: null,
          motivoRestriccion: null,
        },
      });
    }

    await crearSesion({ usuarioId: usuario.id, correo: usuario.correo });
    return redirigir("/artistas/mi-perfil");
  } catch (error) {
    console.error("No se pudo iniciar sesión.", error);
    return redirigirConError("servidor");
  }
}
