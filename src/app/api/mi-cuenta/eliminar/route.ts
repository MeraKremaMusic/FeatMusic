import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  eliminarAudioIdea,
  eliminarImagenPerfil,
  eliminarImagenPortada,
  eliminarImagenPortadaIdea,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import {
  claveLimiteCompuesta,
  consultarLimiteSeguridad,
  limpiarLimiteSeguridad,
  registrarFalloSeguridad,
} from "@/lib/rate-limit";
import { eliminarSesion, obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  password: z.string().min(1).max(128),
  confirmacion: z.string().trim(),
});

const ESTADOS_QUE_BLOQUEAN_ELIMINACION = new Set(["authorized", "pending"]);

const MINUTO = 60 * 1000;
const REGLA_PASSWORD_ELIMINAR = {
  alcance: "MI_CUENTA_ELIMINAR_PASSWORD",
  maxIntentos: 5,
  ventanaMs: 15 * MINUTO,
  bloqueoMs: 15 * MINUTO,
};

function respuestaPasswordBloqueada(segundos: number) {
  return Response.json(
    {
      ok: false,
      mensaje:
        "Demasiados intentos con la contraseña. Espera unos minutos antes de intentarlo nuevamente.",
    },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, segundos)) },
    },
  );
}

async function limpiarCloudinary({
  usuarioId,
  ideas,
  propuestas,
}: {
  usuarioId: number;
  ideas: Array<{ id: number; audioPublicId: string; portadaPublicId: string | null }>;
  propuestas: Array<{ audioPublicId: string | null }>;
}) {
  // Perfil y portada usan public_id estable por usuario. "not found" también
  // se considera éxito, así que esta limpieza es reintentable.
  await eliminarImagenPerfil(usuarioId);
  await eliminarImagenPortada(usuarioId);

  const audios = new Set<string>();
  for (const idea of ideas) audios.add(idea.audioPublicId);
  for (const propuesta of propuestas) {
    if (propuesta.audioPublicId) audios.add(propuesta.audioPublicId);
  }

  for (const publicId of audios) {
    await eliminarAudioIdea(publicId);
  }

  for (const idea of ideas) {
    if (idea.portadaPublicId) {
      await eliminarImagenPortadaIdea(idea.portadaPublicId);
    }
  }
}

export async function DELETE(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return Response.json({ ok: false, mensaje: "Tu sesión expiró. Inicia sesión nuevamente." }, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return Response.json({ ok: false, mensaje: "Los datos enviados no son válidos." }, { status: 400 });
  }

  const resultado = schema.safeParse(cuerpo);
  if (!resultado.success || resultado.data.confirmacion.toUpperCase() !== "ELIMINAR") {
    return Response.json({ ok: false, mensaje: 'Confirma la eliminación escribiendo "ELIMINAR".' }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
    select: {
      id: true,
      correo: true,
      passwordHash: true,
      rolSistema: true,
      ideas: {
        select: { id: true, audioPublicId: true, portadaPublicId: true },
      },
      propuestasEnviadas: {
        select: { id: true, audioPublicId: true },
      },
      suscripcionesMercadoPago: {
        where: { mercadoPagoId: { not: null } },
        select: { id: true, estado: true },
      },
    },
  });

  if (!usuario) {
    return Response.json({ ok: false, mensaje: "No encontramos tu cuenta." }, { status: 404 });
  }

  if (usuario.rolSistema === "ADMIN") {
    return Response.json({ ok: false, mensaje: "Una cuenta ADMIN no puede eliminarse desde esta pantalla." }, { status: 403 });
  }

  // FEATMUSIC_RATE_LIMIT_PASSWORDS_V1
  const clavePasswordEliminar = claveLimiteCompuesta(request, usuario.id);
  const limitePassword = await consultarLimiteSeguridad({
    alcance: REGLA_PASSWORD_ELIMINAR.alcance,
    claveHash: clavePasswordEliminar,
    ventanaMs: REGLA_PASSWORD_ELIMINAR.ventanaMs,
  });

  if (limitePassword.bloqueado) {
    return respuestaPasswordBloqueada(limitePassword.reintentarEnSegundos);
  }

  const passwordCorrecta = await bcrypt.compare(
    resultado.data.password,
    usuario.passwordHash,
  );
  if (!passwordCorrecta) {
    const fallo = await registrarFalloSeguridad({
      ...REGLA_PASSWORD_ELIMINAR,
      claveHash: clavePasswordEliminar,
    });

    if (fallo.bloqueado) {
      return respuestaPasswordBloqueada(fallo.reintentarEnSegundos);
    }

    return Response.json(
      { ok: false, mensaje: "La contraseña actual es incorrecta." },
      { status: 400 },
    );
  }

  await limpiarLimiteSeguridad(
    REGLA_PASSWORD_ELIMINAR.alcance,
    clavePasswordEliminar,
  );

  const suscripcionPendiente = usuario.suscripcionesMercadoPago.find((suscripcion) =>
    ESTADOS_QUE_BLOQUEAN_ELIMINACION.has(suscripcion.estado.trim().toLowerCase()),
  );

  if (suscripcionPendiente) {
    return Response.json(
      {
        ok: false,
        mensaje: "Antes de eliminar tu cuenta debes cancelar la renovación o resolver la suscripción pendiente desde Planes. Esto evita cobros futuros.",
      },
      { status: 409 },
    );
  }

  // Primero quitamos del almacenamiento todos los archivos que pertenecen a
  // esta cuenta. Si Cloudinary falla, NO anonimizamos la BD: el usuario puede
  // reintentar y las eliminaciones ya realizadas responden como "not found".
  try {
    await limpiarCloudinary({
      usuarioId: usuario.id,
      ideas: usuario.ideas,
      propuestas: usuario.propuestasEnviadas,
    });
  } catch (error) {
    console.error("No se pudieron limpiar todos los archivos antes de eliminar la cuenta.", error);
    return Response.json(
      {
        ok: false,
        mensaje: "No pudimos eliminar todos tus archivos en este momento. La cuenta sigue activa; inténtalo nuevamente.",
      },
      { status: 503 },
    );
  }

  const ahora = new Date();
  const correoAnterior = usuario.correo;
  const correoAnonimo = `eliminado-${usuario.id}-${randomUUID()}@anon.featmusic.invalid`;
  const passwordAnonima = await bcrypt.hash(randomUUID(), 12);

  await prisma.$transaction(async (tx) => {
    // Retiramos las ideas del usuario y anulamos las referencias a sus archivos.
    for (const idea of usuario.ideas) {
      await tx.idea.update({
        where: { id: idea.id },
        data: {
          estado: "ELIMINADA",
          audioUrl: "",
          audioPublicId: `eliminado/usuario-${usuario.id}/idea-${idea.id}`,
          portadaUrl: null,
          portadaPublicId: null,
        },
      });
    }

    // Las propuestas compartidas se conservan estructuralmente para no romper
    // historiales de otros artistas, pero se elimina el contenido personal.
    await tx.propuesta.updateMany({
      where: { remitenteId: usuario.id },
      data: {
        mensaje: null,
        audioUrl: null,
        audioPublicId: null,
      },
    });

    // Los chats siguen existiendo para el otro participante, pero el texto
    // escrito por la cuenta eliminada deja de conservarse.
    await tx.mensaje.updateMany({
      where: { remitenteId: usuario.id },
      data: { contenido: "Mensaje eliminado por el usuario." },
    });

    // Quitamos relaciones sociales y datos privados que ya no tienen utilidad.
    await tx.seguimiento.deleteMany({
      where: { OR: [{ seguidorId: usuario.id }, { seguidoId: usuario.id }] },
    });
    await tx.vistaIdea.deleteMany({ where: { usuarioId: usuario.id } });
    await tx.ideaGuardada.deleteMany({ where: { usuarioId: usuario.id } });
    await tx.notificacion.deleteMany({ where: { usuarioId: usuario.id } });
    await tx.notificacion.updateMany({
      where: { actorId: usuario.id },
      data: { actorId: null },
    });

    await tx.recuperacionPassword.deleteMany({ where: { correo: correoAnterior } });
    await tx.registroPendiente.deleteMany({ where: { correo: correoAnterior } });

    // Conservamos los registros contables mínimos, pero quitamos correo y URL
    // de checkout. Las renovaciones activas/pending ya fueron bloqueadas arriba.
    await tx.suscripcionMercadoPago.updateMany({
      where: { usuarioId: usuario.id },
      data: {
        payerEmail: null,
        checkoutUrl: null,
        planProgramado: null,
        montoProgramado: null,
        cambioPlanEn: null,
      },
    });

    await tx.usuario.update({
      where: { id: usuario.id },
      data: {
        nombre: null,
        nombreArtistico: null,
        nombreUsuario: null,
        fotoPerfil: null,
        portadaPerfil: null,
        biografia: null,
        spotifyUrl: null,
        youtubeUrl: null,
        instagramUrl: null,
        distribuidoraPreferida: null,
        softwarePreferido: null,
        correo: correoAnonimo,
        passwordHash: passwordAnonima,
        pais: null,
        departamento: null,
        ciudad: null,
        idiomaPrincipal: null,
        rolPrincipal: "ELIMINADO",
        generos: Prisma.DbNull,
        tipoColaboracion: null,
        correoVerificado: false,
        perfilCompleto: false,
        plan: "GRATUITO",
        estadoCuenta: "ELIMINADA",
        suspendidoHasta: null,
        motivoRestriccion: null,
        sesionVersion: { increment: 1 },
        eliminadoEn: ahora,
        aceptoTerminosEn: null,
      },
    });
  });

  await eliminarSesion();

  return Response.json({
    ok: true,
    mensaje: "Tu cuenta fue eliminada y tus datos personales fueron anonimizados.",
  });
}
