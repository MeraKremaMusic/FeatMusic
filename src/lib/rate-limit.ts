import { createHmac } from "node:crypto";

import { prisma } from "@/lib/prisma";

// FEATMUSIC_RATE_LIMIT_PASSWORDS_V1
// Los identificadores (IP, correo, usuario) nunca se guardan en claro. Solo se
// persiste una huella HMAC no reversible para aplicar límites entre reinicios.
const SECRETO_RATE_LIMIT =
  process.env.RATE_LIMIT_SECRET || process.env.SESSION_SECRET || "";

const DOS_DIAS_MS = 2 * 24 * 60 * 60 * 1000;

type ReglaLimite = {
  alcance: string;
  claveHash: string;
  maxIntentos: number;
  ventanaMs: number;
  bloqueoMs: number;
};

export type EstadoLimite = {
  bloqueado: boolean;
  reintentarEnSegundos: number;
};

function exigirSecreto() {
  if (!SECRETO_RATE_LIMIT) {
    throw new Error(
      "Falta RATE_LIMIT_SECRET o SESSION_SECRET para aplicar rate limiting.",
    );
  }
}

function normalizarParte(valor: unknown) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 512);
}

function huella(valor: string) {
  exigirSecreto();
  return createHmac("sha256", SECRETO_RATE_LIMIT).update(valor).digest("hex");
}

function ipCliente(request: Request) {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 128);

  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 128);

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const primera = forwarded.split(",")[0]?.trim();
    if (primera) return primera.slice(0, 128);
  }

  // Si el proxy no entrega IP, añadimos user-agent para no agrupar a todos los
  // clientes sin IP bajo una sola clave global.
  const ua = request.headers.get("user-agent")?.trim().slice(0, 200) || "sin-ua";
  return `sin-ip:${ua}`;
}

export function claveLimitePorIp(request: Request) {
  return huella(`ip|${normalizarParte(ipCliente(request))}`);
}

export function claveLimiteCompuesta(request: Request, ...partes: unknown[]) {
  return huella(
    ["ip", normalizarParte(ipCliente(request)), ...partes.map(normalizarParte)].join(
      "|",
    ),
  );
}

function segundosRestantes(fecha: Date, ahora = new Date()) {
  return Math.max(1, Math.ceil((fecha.getTime() - ahora.getTime()) / 1000));
}

async function limpiarFilasAntiguasOcasionalmente() {
  // Evita crecimiento indefinido sin añadir un cron obligatorio. No se espera
  // ni se considera crítico para la solicitud principal.
  if (Math.random() > 0.02) return;

  const limite = new Date(Date.now() - DOS_DIAS_MS);
  void prisma.limiteSeguridad
    .deleteMany({
      where: {
        actualizadoEn: { lt: limite },
        OR: [{ bloqueadoHasta: null }, { bloqueadoHasta: { lt: new Date() } }],
      },
    })
    .catch(() => undefined);
}

export async function consultarLimiteSeguridad({
  alcance,
  claveHash,
  ventanaMs,
}: Pick<ReglaLimite, "alcance" | "claveHash" | "ventanaMs">): Promise<EstadoLimite> {
  await limpiarFilasAntiguasOcasionalmente();

  const ahora = new Date();
  const registro = await prisma.limiteSeguridad.findUnique({
    where: { alcance_claveHash: { alcance, claveHash } },
    select: {
      bloqueadoHasta: true,
      ventanaIniciaEn: true,
    },
  });

  if (!registro) return { bloqueado: false, reintentarEnSegundos: 0 };

  if (registro.bloqueadoHasta && registro.bloqueadoHasta > ahora) {
    return {
      bloqueado: true,
      reintentarEnSegundos: segundosRestantes(registro.bloqueadoHasta, ahora),
    };
  }

  // Una ventana vieja no bloquea. Se reiniciará al registrar el próximo fallo.
  if (registro.ventanaIniciaEn.getTime() + ventanaMs <= ahora.getTime()) {
    return { bloqueado: false, reintentarEnSegundos: 0 };
  }

  return { bloqueado: false, reintentarEnSegundos: 0 };
}

export async function registrarFalloSeguridad({
  alcance,
  claveHash,
  maxIntentos,
  ventanaMs,
  bloqueoMs,
}: ReglaLimite): Promise<EstadoLimite> {
  const ahora = new Date();

  return prisma.$transaction(async (tx) => {
    const actual = await tx.limiteSeguridad.findUnique({
      where: { alcance_claveHash: { alcance, claveHash } },
    });

    if (actual?.bloqueadoHasta && actual.bloqueadoHasta > ahora) {
      return {
        bloqueado: true,
        reintentarEnSegundos: segundosRestantes(actual.bloqueadoHasta, ahora),
      };
    }

    const ventanaVencio =
      !actual || actual.ventanaIniciaEn.getTime() + ventanaMs <= ahora.getTime();
    const siguiente = ventanaVencio ? 1 : actual.intentos + 1;
    const bloqueadoHasta =
      siguiente >= maxIntentos ? new Date(ahora.getTime() + bloqueoMs) : null;

    await tx.limiteSeguridad.upsert({
      where: { alcance_claveHash: { alcance, claveHash } },
      create: {
        alcance,
        claveHash,
        intentos: siguiente,
        ventanaIniciaEn: ahora,
        bloqueadoHasta,
      },
      update: {
        intentos: siguiente,
        ventanaIniciaEn: ventanaVencio ? ahora : actual!.ventanaIniciaEn,
        bloqueadoHasta,
      },
    });

    return bloqueadoHasta
      ? {
          bloqueado: true,
          reintentarEnSegundos: segundosRestantes(bloqueadoHasta, ahora),
        }
      : { bloqueado: false, reintentarEnSegundos: 0 };
  });
}

export async function consumirLimiteSeguridad({
  alcance,
  claveHash,
  maxIntentos,
  ventanaMs,
  bloqueoMs,
}: ReglaLimite): Promise<EstadoLimite> {
  const ahora = new Date();

  return prisma.$transaction(async (tx) => {
    const actual = await tx.limiteSeguridad.findUnique({
      where: { alcance_claveHash: { alcance, claveHash } },
    });

    if (actual?.bloqueadoHasta && actual.bloqueadoHasta > ahora) {
      return {
        bloqueado: true,
        reintentarEnSegundos: segundosRestantes(actual.bloqueadoHasta, ahora),
      };
    }

    const ventanaVencio =
      !actual || actual.ventanaIniciaEn.getTime() + ventanaMs <= ahora.getTime();
    const siguiente = ventanaVencio ? 1 : actual.intentos + 1;
    // En límites de volumen permitimos exactamente maxIntentos y bloqueamos la
    // solicitud siguiente. En contraseñas (registrarFalloSeguridad) el bloqueo
    // comienza al alcanzar el máximo de fallos.
    const bloqueadoHasta =
      siguiente > maxIntentos ? new Date(ahora.getTime() + bloqueoMs) : null;

    await tx.limiteSeguridad.upsert({
      where: { alcance_claveHash: { alcance, claveHash } },
      create: {
        alcance,
        claveHash,
        intentos: siguiente,
        ventanaIniciaEn: ahora,
        bloqueadoHasta,
      },
      update: {
        intentos: siguiente,
        ventanaIniciaEn: ventanaVencio ? ahora : actual!.ventanaIniciaEn,
        bloqueadoHasta,
      },
    });

    return bloqueadoHasta
      ? {
          bloqueado: true,
          reintentarEnSegundos: segundosRestantes(bloqueadoHasta, ahora),
        }
      : { bloqueado: false, reintentarEnSegundos: 0 };
  });
}

export async function limpiarLimiteSeguridad(alcance: string, claveHash: string) {
  await prisma.limiteSeguridad.deleteMany({ where: { alcance, claveHash } });
}
