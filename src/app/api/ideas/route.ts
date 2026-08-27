import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  eliminarAudioIdea,
  eliminarImagenPortadaIdea,
  esPublicIdAudioIdeaUsuario,
  esPublicIdPortadaIdeaUsuario,
  obtenerAudioIdeaSubidoDirecto,
  obtenerImagenPortadaIdeaSubidaDirecta,
  subirAudioIdea,
  subirImagenPortadaIdea,
} from "@/lib/cloudinary";
import { limpiarIdeasExpiradasUsuario } from "@/lib/ideas";
import { obtenerLimitesPlan } from "@/lib/planes";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import { sincronizarPlanUsuario } from "@/lib/suscripciones";
import { notificarSeguidoresNuevaIdea } from "@/lib/seguimientos";
import { validarUbicacion } from "@/lib/ubicaciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_DURATION = 240;
const MAX_PORTADA_SIZE = 5 * 1024 * 1024;

const PORTADA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const PORTADA_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MIME_TYPES_GENERICOS = new Set(["", "application/octet-stream"]);

const AUDIO_EXTENSIONS = new Set([
  "mp3",
  "wav",
  "flac",
  "m4a",
  "aac",
  "ogg",
  "aiff",
  "aif",
  "opus",
]);

const ideaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres.")
    .max(80, "El título no puede superar 80 caracteres."),
  descripcion: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres.")
    .max(300, "La descripción no puede superar 300 caracteres."),
  bpm: z.coerce
    .number()
    .int("El BPM debe ser un número entero.")
    .min(40, "El BPM mínimo es 40.")
    .max(250, "El BPM máximo es 250."),
  tonalidad: z
    .string()
    .trim()
    .min(1, "Selecciona la tonalidad de la canción.")
    .max(30, "La tonalidad no puede superar 30 caracteres."),
  rolBuscado: z.enum(["CANTANTE", "COMPOSITOR", "PRODUCTOR", "BEATMAKER"]),
  generoMusical: z
    .string()
    .trim()
    .min(2, "Selecciona el género musical.")
    .max(60, "El género musical no puede superar 60 caracteres."),
  idiomaBuscado: z.enum(["ESPANOL", "INGLES", "PORTUGUES", "CUALQUIERA"]),
  modalidadColaboracion: z.enum(["REMOTA", "PRESENCIAL"]),
  tipoAcuerdo: z.enum(["GRATUITA", "REGALIAS", "PAGADO"]),
  paisCodigoPreferido: z.string().trim().max(2).optional().default(""),
  departamentoCodigoPreferido: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default(""),
  ciudadPreferida: z.string().trim().max(120).optional().default(""),
});

const SELECCION_IDEA_RESPUESTA = {
  id: true,
  titulo: true,
  descripcion: true,
  bpm: true,
  tonalidad: true,
  rolBuscado: true,
  generoMusical: true,
  idiomaBuscado: true,
  modalidadColaboracion: true,
  paisPreferido: true,
  departamentoPreferido: true,
  ciudadPreferida: true,
  tipoAcuerdo: true,
  portadaUrl: true,
  audioUrl: true,
  duracionSegundos: true,
  formato: true,
  tamanoBytes: true,
  estado: true,
  expiraEn: true,
  creadoEn: true,
} as const;

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function obtenerExtension(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toLowerCase() ?? "";
}

function tipoAudioPermitido(archivo: File) {
  // Compatibilidad para el flujo antiguo: el MIME reportado por el navegador
  // no es fiable entre dispositivos. El resultado convertido se valida
  // después en Cloudinary antes de guardar la idea.
  return AUDIO_EXTENSIONS.has(obtenerExtension(archivo.name));
}

function tipoPortadaPermitido(archivo: File) {
  const extensionValida = PORTADA_EXTENSIONS.has(
    obtenerExtension(archivo.name),
  );
  const mime = archivo.type.toLowerCase();
  const mimeValido =
    PORTADA_TYPES.has(mime) || MIME_TYPES_GENERICOS.has(mime);

  return extensionValida && mimeValido;
}

export async function GET(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const audioPublicId = new URL(request.url).searchParams
    .get("audioPublicId")
    ?.trim();

  if (
    !audioPublicId ||
    !esPublicIdAudioIdeaUsuario(audioPublicId, sesion.usuarioId)
  ) {
    return respuestaError("El identificador del audio no es válido.", 400);
  }

  const idea = await prisma.idea.findFirst({
    where: {
      usuarioId: sesion.usuarioId,
      audioPublicId,
    },
    select: SELECCION_IDEA_RESPUESTA,
  });

  return NextResponse.json(
    {
      ok: true,
      publicada: Boolean(idea),
      idea: idea ?? undefined,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  let audioPublicId: string | null = null;
  let portadaPublicId: string | null = null;

  try {
    const formData = await request.formData();
    const resultado = ideaSchema.safeParse({
      titulo: formData.get("titulo"),
      descripcion: formData.get("descripcion"),
      bpm: formData.get("bpm"),
      tonalidad: formData.get("tonalidad"),
      rolBuscado: formData.get("rolBuscado"),
      generoMusical: formData.get("generoMusical"),
      idiomaBuscado: formData.get("idiomaBuscado"),
      modalidadColaboracion: formData.get("modalidadColaboracion"),
      tipoAcuerdo: formData.get("tipoAcuerdo"),
      paisCodigoPreferido: String(
        formData.get("paisCodigoPreferido") ?? "",
      ).toUpperCase(),
      departamentoCodigoPreferido: String(
        formData.get("departamentoCodigoPreferido") ?? "",
      ).toUpperCase(),
      ciudadPreferida: formData.get("ciudadPreferida") ?? "",
    });

    if (!resultado.success) {
      return respuestaError(
        resultado.error.issues[0]?.message ??
          "Los datos enviados no son válidos.",
        400,
      );
    }

    const datosUbicacion = {
      paisCodigo: resultado.data.paisCodigoPreferido,
      departamentoCodigo: resultado.data.departamentoCodigoPreferido,
      ciudad: resultado.data.ciudadPreferida,
    };
    const valoresUbicacion = Object.values(datosUbicacion).map((valor) =>
      valor.trim(),
    );
    const tieneAlgunDatoUbicacion = valoresUbicacion.some(Boolean);
    const tieneUbicacionCompleta = valoresUbicacion.every(Boolean);

    if (
      resultado.data.modalidadColaboracion === "PRESENCIAL" &&
      !tieneUbicacionCompleta
    ) {
      return respuestaError(
        "Para una colaboración presencial, selecciona país, departamento y ciudad.",
        400,
      );
    }

    if (tieneAlgunDatoUbicacion && !tieneUbicacionCompleta) {
      return respuestaError(
        "Completa toda la ubicación preferida o déjala vacía.",
        400,
      );
    }

    const ubicacionPreferida = tieneUbicacionCompleta
      ? await validarUbicacion(datosUbicacion)
      : null;

    if (tieneUbicacionCompleta && !ubicacionPreferida) {
      return respuestaError(
        "La ubicación preferida no es válida. Selecciónala nuevamente.",
        400,
      );
    }

    // FEATMUSIC_AUDIO_DIRECT_CLOUDINARY_V1
    const audioPublicIdDirecto = String(
      formData.get("audioPublicId") ?? "",
    ).trim();
    const audio = formData.get("audio");

    if (
      !audioPublicIdDirecto &&
      (!(audio instanceof File) || audio.size === 0)
    ) {
      return respuestaError("Selecciona un archivo de audio.", 400);
    }

    if (audioPublicIdDirecto) {
      if (!esPublicIdAudioIdeaUsuario(audioPublicIdDirecto, sesion.usuarioId)) {
        return respuestaError(
          "El audio subido no pertenece a tu cuenta.",
          403,
        );
      }

      const ideaYaPublicada = await prisma.idea.findFirst({
        where: {
          usuarioId: sesion.usuarioId,
          audioPublicId: audioPublicIdDirecto,
        },
        select: SELECCION_IDEA_RESPUESTA,
      });

      if (ideaYaPublicada) {
        // Idempotencia: si el navegador perdió la respuesta después de que
        // MySQL guardó la idea, repetir/consultar el mismo audio debe devolver
        // éxito en vez de inducir al usuario a publicarla dos veces.
        return NextResponse.json(
          {
            ok: true,
            mensaje: "La idea ya había sido publicada correctamente.",
            idea: ideaYaPublicada,
          },
          {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }
    } else if (audio instanceof File) {
      if (!tipoAudioPermitido(audio)) {
        return respuestaError(
          "El audio debe ser MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u OPUS.",
          400,
        );
      }

      if (audio.size > MAX_AUDIO_SIZE) {
        return respuestaError(
          "El archivo original no puede pesar más de 50 MB.",
          400,
        );
      }
    }

    // FEATMUSIC_PORTADA_DIRECT_CLOUDINARY_V1
    const portadaPublicIdDirecto = String(
      formData.get("portadaPublicId") ?? "",
    ).trim();

    if (
      portadaPublicIdDirecto &&
      !esPublicIdPortadaIdeaUsuario(portadaPublicIdDirecto, sesion.usuarioId)
    ) {
      return respuestaError("La portada subida no pertenece a tu cuenta.", 403);
    }

    const portadaFormulario = formData.get("portada");
    const portada =
      !portadaPublicIdDirecto &&
      portadaFormulario instanceof File &&
      portadaFormulario.size > 0
        ? portadaFormulario
        : null;

    if (portada && !tipoPortadaPermitido(portada)) {
      return respuestaError(
        "La portada debe ser una imagen JPG, PNG o WebP.",
        400,
      );
    }

    if (portada && portada.size > MAX_PORTADA_SIZE) {
      return respuestaError(
        "La portada no puede pesar más de 5 MB.",
        400,
      );
    }

    await limpiarIdeasExpiradasUsuario(sesion.usuarioId).catch((error) => {
      console.error("No se pudieron limpiar las ideas expiradas.", error);
    });

    await sincronizarPlanUsuario(sesion.usuarioId);

    const ahora = new Date();
    const [usuarioPublicador, ideasActivas] = await prisma.$transaction([
      prisma.usuario.findUnique({
        where: { id: sesion.usuarioId },
        select: { plan: true },
      }),
      prisma.idea.count({
        where: {
          usuarioId: sesion.usuarioId,
          estado: "ACTIVA",
          expiraEn: { gt: ahora },
        },
      }),
    ]);

    const limiteIdeas = obtenerLimitesPlan(usuarioPublicador?.plan).ideasActivas;

    if (ideasActivas >= limiteIdeas) {
      return respuestaError(
        `Ya alcanzaste el límite de ${limiteIdeas} ideas activas de tu plan.`,
        409,
      );
    }

    const audioSubido = audioPublicIdDirecto
      ? await obtenerAudioIdeaSubidoDirecto(
          audioPublicIdDirecto,
          sesion.usuarioId,
        )
      : await subirAudioIdea(audio as File, sesion.usuarioId);
    audioPublicId = audioSubido.publicId;

    if (
      audioSubido.resourceType !== "video" ||
      audioSubido.formato?.toLowerCase() !== "mp3"
    ) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error("No se pudo eliminar el audio con formato inválido.", error);
      });
      audioPublicId = null;

      return respuestaError(
        "No se pudo convertir el archivo a MP3. Prueba con otro audio.",
        422,
      );
    }

    if (audioSubido.duracionSegundos <= 0) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error(
          "No se pudo eliminar el audio cuya duración no pudo verificarse.",
          error,
        );
      });
      audioPublicId = null;

      return respuestaError(
        "No se pudo verificar la duración del audio. Intenta subirlo nuevamente.",
        422,
      );
    }

    if (audioSubido.duracionSegundos > MAX_AUDIO_DURATION) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error("No se pudo eliminar el audio rechazado.", error);
      });
      audioPublicId = null;

      return respuestaError(
        `El audio no puede durar más de ${MAX_AUDIO_DURATION / 60} minutos.`,
        400,
      );
    }

    if (!audioSubido.bytes || audioSubido.bytes <= 0) {
      await eliminarAudioIdea(audioSubido.publicId).catch((error) => {
        console.error("No se pudo eliminar el audio incompleto.", error);
      });
      audioPublicId = null;

      return respuestaError(
        "Cloudinary no devolvió un archivo de audio válido.",
        422,
      );
    }

    let portadaSubida: { url: string; publicId: string } | null = null;

    if (portadaPublicIdDirecto) {
      const portadaDirecta = await obtenerImagenPortadaIdeaSubidaDirecta(
        portadaPublicIdDirecto,
        sesion.usuarioId,
      );
      portadaPublicId = portadaDirecta.publicId;

      const formatoPortada = portadaDirecta.formato?.toLowerCase() ?? "";
      const formatoValido = new Set(["jpg", "jpeg", "png", "webp"]).has(
        formatoPortada,
      );

      if (
        portadaDirecta.resourceType !== "image" ||
        !formatoValido ||
        !portadaDirecta.bytes ||
        portadaDirecta.bytes <= 0 ||
        portadaDirecta.bytes > MAX_PORTADA_SIZE
      ) {
        await eliminarImagenPortadaIdea(portadaDirecta.publicId).catch(
          (errorEliminacion) => {
            console.error(
              "No se pudo eliminar la portada directa inválida.",
              errorEliminacion,
            );
          },
        );
        portadaPublicId = null;

        return respuestaError(
          "La portada subida no es una imagen JPG, PNG o WebP válida de hasta 5 MB.",
          422,
        );
      }

      portadaSubida = {
        url: portadaDirecta.url,
        publicId: portadaDirecta.publicId,
      };
    } else if (portada) {
      portadaSubida = await subirImagenPortadaIdea(portada, sesion.usuarioId);
      portadaPublicId = portadaSubida.publicId;
    }

    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 60);

    let resultadoCreacion;

    try {
      resultadoCreacion = await prisma.$transaction(
        async (tx) => {
          // FEATMUSIC_PUBLICACION_CONCURRENCIA_V1
          // Serializa solo las publicaciones del mismo usuario. Usuarios
          // diferentes pueden publicar simultáneamente sin bloquearse entre sí.
          const usuariosBloqueados = await tx.$queryRaw<Array<{ plan: string }>>(
            Prisma.sql`SELECT plan FROM usuarios WHERE id = ${sesion.usuarioId} FOR UPDATE`,
          );
          const limiteIdeasBloqueado = obtenerLimitesPlan(
            usuariosBloqueados[0]?.plan,
          ).ideasActivas;

          const ideaExistente = await tx.idea.findFirst({
            where: {
              usuarioId: sesion.usuarioId,
              audioPublicId: audioSubido.publicId,
            },
            select: SELECCION_IDEA_RESPUESTA,
          });

          if (ideaExistente) {
            return {
              tipo: "EXISTENTE" as const,
              idea: ideaExistente,
            };
          }

          const ahoraBloqueado = new Date();
          const ideasActivasBloqueadas = await tx.idea.count({
            where: {
              usuarioId: sesion.usuarioId,
              estado: "ACTIVA",
              expiraEn: { gt: ahoraBloqueado },
            },
          });

          if (ideasActivasBloqueadas >= limiteIdeasBloqueado) {
            return {
              tipo: "LIMITE" as const,
              idea: null,
              limiteIdeas: limiteIdeasBloqueado,
            };
          }

          const ideaCreada = await tx.idea.create({
            data: {
              usuarioId: sesion.usuarioId,
              titulo: resultado.data.titulo,
              descripcion: resultado.data.descripcion,
              bpm: resultado.data.bpm,
              tonalidad: resultado.data.tonalidad,
              rolBuscado: resultado.data.rolBuscado,
              generoMusical: resultado.data.generoMusical,
              idiomaBuscado: resultado.data.idiomaBuscado,
              modalidadColaboracion: resultado.data.modalidadColaboracion,
              paisPreferido: ubicacionPreferida?.pais ?? null,
              departamentoPreferido:
                ubicacionPreferida?.departamento ?? null,
              ciudadPreferida: ubicacionPreferida?.ciudad ?? null,
              tipoAcuerdo: resultado.data.tipoAcuerdo,
              portadaUrl: portadaSubida?.url ?? null,
              portadaPublicId: portadaSubida?.publicId ?? null,
              audioUrl: audioSubido.url,
              audioPublicId: audioSubido.publicId,
              duracionSegundos: audioSubido.duracionSegundos,
              formato: "mp3",
              tamanoBytes: audioSubido.bytes,
              expiraEn,
            },
            select: SELECCION_IDEA_RESPUESTA,
          });

          return {
            tipo: "CREADA" as const,
            idea: ideaCreada,
          };
        },
        {
          maxWait: 5_000,
          timeout: 10_000,
        },
      );
    } catch (errorTransaccion) {
      if (
        errorTransaccion instanceof Prisma.PrismaClientKnownRequestError &&
        errorTransaccion.code === "P2002"
      ) {
        const ideaExistente = await prisma.idea.findFirst({
          where: {
            usuarioId: sesion.usuarioId,
            audioPublicId: audioSubido.publicId,
          },
          select: SELECCION_IDEA_RESPUESTA,
        });

        if (ideaExistente) {
          // El audio pertenece a la idea que ganó la carrera. No se elimina.
          audioPublicId = null;

          // En un reintento idempotente, la misma portada directa puede ser
          // justamente la que ya usa la idea ganadora. No la eliminamos aquí.
          portadaPublicId = null;

          return NextResponse.json(
            {
              ok: true,
              mensaje: "La idea ya había sido publicada correctamente.",
              idea: ideaExistente,
            },
            {
              status: 200,
              headers: { "Cache-Control": "no-store" },
            },
          );
        }
      }

      throw errorTransaccion;
    }

    if (resultadoCreacion.tipo === "LIMITE") {
      await eliminarAudioIdea(audioSubido.publicId).catch((errorEliminacion) => {
        console.error(
          "No se pudo limpiar el audio rechazado por límite de ideas.",
          errorEliminacion,
        );
      });
      audioPublicId = null;

      if (portadaPublicId) {
        await eliminarImagenPortadaIdea(portadaPublicId).catch(
          (errorEliminacion) => {
            console.error(
              "No se pudo limpiar la portada rechazada por límite de ideas.",
              errorEliminacion,
            );
          },
        );
        portadaPublicId = null;
      }

      return respuestaError(
        `Ya alcanzaste el límite de ${resultadoCreacion.limiteIdeas} ideas activas de tu plan.`,
        409,
      );
    }

    if (resultadoCreacion.tipo === "EXISTENTE") {
      // El audio ya está ligado a la idea existente; nunca se elimina.
      audioPublicId = null;

      // En un reintento, la portada directa puede ser la misma que ya usa
      // la idea existente. No la eliminamos aquí.
      portadaPublicId = null;

      return NextResponse.json(
        {
          ok: true,
          mensaje: "La idea ya había sido publicada correctamente.",
          idea: resultadoCreacion.idea,
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const idea = resultadoCreacion.idea;

    audioPublicId = null;
    portadaPublicId = null;

    // La respuesta de publicación no debe esperar al fan-out de notificaciones.
    // notificarSeguidoresNuevaIdea ya captura y registra sus propios errores.
    void notificarSeguidoresNuevaIdea({
      artistaId: sesion.usuarioId,
      ideaId: idea.id,
      tituloIdea: idea.titulo,
    });

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Idea publicada y optimizada correctamente.",
        idea,
      },
      { status: 201 },
    );
  } catch (error) {
    if (audioPublicId) {
      await eliminarAudioIdea(audioPublicId).catch((errorEliminacion) => {
        console.error(
          "No se pudo limpiar el audio después del error.",
          errorEliminacion,
        );
      });
    }

    if (portadaPublicId) {
      await eliminarImagenPortadaIdea(portadaPublicId).catch(
        (errorEliminacion) => {
          console.error(
            "No se pudo limpiar la portada después del error.",
            errorEliminacion,
          );
        },
      );
    }

    console.error("No se pudo publicar la idea.", error);
    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo publicar la idea. Inténtalo nuevamente.",
      500,
    );
  }
}
