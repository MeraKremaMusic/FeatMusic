import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  eliminarAudioIdea,
  subirAudioPropuesta,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_DURATION = 240;
const MAX_PROPUESTAS_POR_IDEA = 3;

const AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/aiff",
  "audio/x-aiff",
  "audio/opus",
]);

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

const propuestaSchema = z.object({
  mensaje: z
    .string()
    .trim()
    .max(500, "El mensaje no puede superar 500 caracteres."),
});

type ContextoRuta = {
  params: Promise<{ id: string }>;
};

class ErrorPropuesta extends Error {
  constructor(
    mensaje: string,
    public status: number,
  ) {
    super(mensaje);
  }
}

function respuestaError(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, mensaje }, { status });
}

function convertirId(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function obtenerExtension(nombreArchivo: string) {
  return nombreArchivo.split(".").pop()?.toLowerCase() ?? "";
}

function tipoAudioPermitido(archivo: File) {
  const extensionValida = AUDIO_EXTENSIONS.has(
    obtenerExtension(archivo.name),
  );
  const mime = archivo.type.toLowerCase();
  const mimeValido = AUDIO_TYPES.has(mime) || MIME_TYPES_GENERICOS.has(mime);

  return extensionValida && mimeValido;
}

function codigoErrorPrisma(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return null;
}

async function crearPropuestaConCupo(
  ideaId: number,
  remitenteId: number,
  datosAudio: {
    mensaje: string | null;
    audioUrl: string;
    audioPublicId: string;
    duracionSegundos: number;
    formato: string;
    tamanoBytes: number;
  },
) {
  for (let intento = 0; intento < 3; intento += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const idea = await tx.idea.findFirst({
            where: {
              id: ideaId,
              estado: "ACTIVA",
              expiraEn: { gt: new Date() },
            },
            select: {
              usuarioId: true,
            },
          });

          if (!idea) {
            throw new ErrorPropuesta(
              "Esta idea ya no está disponible para recibir propuestas.",
              409,
            );
          }

          if (idea.usuarioId === remitenteId) {
            throw new ErrorPropuesta(
              "No puedes enviar una propuesta a tu propia idea.",
              403,
            );
          }

          const propuestaExistente = await tx.propuesta.findUnique({
            where: {
              ideaId_remitenteId: {
                ideaId,
                remitenteId,
              },
            },
            select: {
              id: true,
            },
          });

          if (propuestaExistente) {
            throw new ErrorPropuesta(
              "Ya enviaste una propuesta a esta idea.",
              409,
            );
          }

          const totalPropuestas = await tx.propuesta.count({
            where: {
              ideaId,
            },
          });

          if (totalPropuestas >= MAX_PROPUESTAS_POR_IDEA) {
            throw new ErrorPropuesta(
              "Esta idea ya completó sus 3 propuestas.",
              409,
            );
          }

          return tx.propuesta.create({
            data: {
              ideaId,
              remitenteId,
              mensaje: datosAudio.mensaje,
              audioUrl: datosAudio.audioUrl,
              audioPublicId: datosAudio.audioPublicId,
              duracionSegundos: datosAudio.duracionSegundos,
              formato: datosAudio.formato,
              tamanoBytes: datosAudio.tamanoBytes,
            },
            select: {
              id: true,
              estado: true,
              creadoEn: true,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (codigoErrorPrisma(error) === "P2034" && intento < 2) {
        continue;
      }

      throw error;
    }
  }

  throw new ErrorPropuesta(
    "No se pudo reservar el cupo. Intenta nuevamente.",
    409,
  );
}

export async function POST(request: Request, contexto: ContextoRuta) {
  const sesion = await obtenerSesion();

  if (!sesion) {
    return respuestaError("Tu sesión expiró. Inicia sesión nuevamente.", 401);
  }

  const { id: idTexto } = await contexto.params;
  const ideaId = convertirId(idTexto);

  if (!ideaId) {
    return respuestaError("El identificador de la idea no es válido.", 400);
  }

  let audioPublicId: string | null = null;

  try {
    const formData = await request.formData();
    const resultado = propuestaSchema.safeParse({
      mensaje:
        typeof formData.get("mensaje") === "string"
          ? formData.get("mensaje")
          : "",
    });

    if (!resultado.success) {
      return respuestaError(
        resultado.error.issues[0]?.message ??
          "Los datos enviados no son válidos.",
        400,
      );
    }

    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return respuestaError("Selecciona un archivo de audio.", 400);
    }

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

    const ahora = new Date();
    const idea = await prisma.idea.findFirst({
      where: {
        id: ideaId,
        estado: "ACTIVA",
        expiraEn: { gt: ahora },
      },
      select: {
        usuarioId: true,
        _count: {
          select: {
            propuestas: true,
          },
        },
        propuestas: {
          where: {
            remitenteId: sesion.usuarioId,
          },
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!idea) {
      return respuestaError(
        "Esta idea ya no está disponible para recibir propuestas.",
        404,
      );
    }

    if (idea.usuarioId === sesion.usuarioId) {
      return respuestaError(
        "No puedes enviar una propuesta a tu propia idea.",
        403,
      );
    }

    if (idea.propuestas.length > 0) {
      return respuestaError(
        "Ya enviaste una propuesta a esta idea.",
        409,
      );
    }

    if (idea._count.propuestas >= MAX_PROPUESTAS_POR_IDEA) {
      return respuestaError(
        "Esta idea ya completó sus 3 propuestas.",
        409,
      );
    }

    const audioSubido = await subirAudioPropuesta(
      audio,
      sesion.usuarioId,
      ideaId,
    );
    audioPublicId = audioSubido.publicId;

    if (
      audioSubido.resourceType !== "video" ||
      audioSubido.formato?.toLowerCase() !== "mp3"
    ) {
      throw new ErrorPropuesta(
        "No se pudo convertir el archivo a MP3. Prueba con otro audio.",
        422,
      );
    }

    if (
      audioSubido.duracionSegundos <= 0 ||
      audioSubido.duracionSegundos > MAX_AUDIO_DURATION
    ) {
      throw new ErrorPropuesta(
        `El audio no puede durar más de ${MAX_AUDIO_DURATION / 60} minutos.`,
        400,
      );
    }

    if (!audioSubido.bytes || audioSubido.bytes <= 0) {
      throw new ErrorPropuesta(
        "Cloudinary no devolvió un archivo de audio válido.",
        422,
      );
    }

    const propuesta = await crearPropuestaConCupo(
      ideaId,
      sesion.usuarioId,
      {
        mensaje: resultado.data.mensaje || null,
        audioUrl: audioSubido.url,
        audioPublicId: audioSubido.publicId,
        duracionSegundos: audioSubido.duracionSegundos,
        formato: "mp3",
        tamanoBytes: audioSubido.bytes,
      },
    );

    audioPublicId = null;

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Tu propuesta fue enviada correctamente.",
        propuesta: {
          ...propuesta,
          creadoEn: propuesta.creadoEn.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (audioPublicId) {
      await eliminarAudioIdea(audioPublicId).catch((errorEliminacion) => {
        console.error(
          "No se pudo eliminar el audio de una propuesta fallida.",
          errorEliminacion,
        );
      });
    }

    console.error("No se pudo enviar la propuesta.", error);

    if (error instanceof ErrorPropuesta) {
      return respuestaError(error.message, error.status);
    }

    const codigo = codigoErrorPrisma(error);

    if (codigo === "P2002") {
      return respuestaError(
        "Ya enviaste una propuesta a esta idea.",
        409,
      );
    }

    if (codigo === "P2034") {
      return respuestaError(
        "Otro artista ocupó el último cupo. Actualiza la página.",
        409,
      );
    }

    return respuestaError(
      error instanceof Error
        ? error.message
        : "No se pudo enviar la propuesta.",
      500,
    );
  }
}
