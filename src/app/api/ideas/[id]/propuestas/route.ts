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
const MAX_INTENTOS_POR_IDEA = 2;
const ESTADOS_QUE_OCUPAN_CUPO = [
  "PENDIENTE",
  "CAMBIOS_SOLICITADOS",
  "ACEPTADA",
  "RECHAZANDO",
];

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

type ModoEnvio = "NUEVA" | "CORRECCION" | "REINTENTO";

type PropuestaExistente = {
  id: number;
  estado: string;
  permiteReintento: boolean;
  numeroIntento: number;
  audioPublicId: string | null;
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

function resolverModoEnvio(
  propuesta: PropuestaExistente | null,
): ModoEnvio {
  if (!propuesta) {
    return "NUEVA";
  }

  if (
    propuesta.estado === "CAMBIOS_SOLICITADOS" &&
    propuesta.numeroIntento < MAX_INTENTOS_POR_IDEA
  ) {
    return "CORRECCION";
  }

  if (
    propuesta.estado === "RECHAZADA" &&
    propuesta.permiteReintento &&
    propuesta.numeroIntento < MAX_INTENTOS_POR_IDEA
  ) {
    return "REINTENTO";
  }

  if (propuesta.estado === "PENDIENTE") {
    throw new ErrorPropuesta(
      "Ya tienes una propuesta pendiente para esta idea.",
      409,
    );
  }

  if (propuesta.estado === "ACEPTADA") {
    throw new ErrorPropuesta(
      "Tu propuesta para esta idea ya fue aceptada.",
      409,
    );
  }

  if (propuesta.estado === "CAMBIOS_SOLICITADOS") {
    throw new ErrorPropuesta(
      "Ya utilizaste el máximo de 2 intentos para esta idea.",
      409,
    );
  }

  if (propuesta.estado === "RECHAZADA" && propuesta.permiteReintento) {
    throw new ErrorPropuesta(
      "Ya utilizaste el máximo de 2 intentos para esta idea.",
      409,
    );
  }

  if (propuesta.estado === "RECHAZADA") {
    throw new ErrorPropuesta(
      "Esta propuesta fue rechazada definitivamente.",
      409,
    );
  }

  if (propuesta.estado === "EXPIRADA") {
    throw new ErrorPropuesta(
      "La propuesta anterior expiró y esta idea ya no admite otro envío.",
      409,
    );
  }

  throw new ErrorPropuesta(
    "Tu propuesta está siendo procesada. Actualiza la página.",
    409,
  );
}

async function guardarPropuestaConCupo(
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
  for (let intentoTransaccion = 0; intentoTransaccion < 3; intentoTransaccion += 1) {
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
              estado: true,
              permiteReintento: true,
              numeroIntento: true,
              audioPublicId: true,
            },
          });

          const modo = resolverModoEnvio(propuestaExistente);

          if (modo === "NUEVA" || modo === "REINTENTO") {
            const cuposOcupados = await tx.propuesta.count({
              where: {
                ideaId,
                estado: {
                  in: ESTADOS_QUE_OCUPAN_CUPO,
                },
              },
            });

            if (cuposOcupados >= MAX_PROPUESTAS_POR_IDEA) {
              throw new ErrorPropuesta(
                "Esta idea ya tiene sus 3 cupos ocupados.",
                409,
              );
            }
          }

          if (modo === "NUEVA") {
            const propuesta = await tx.propuesta.create({
              data: {
                ideaId,
                remitenteId,
                mensaje: datosAudio.mensaje,
                audioUrl: datosAudio.audioUrl,
                audioPublicId: datosAudio.audioPublicId,
                duracionSegundos: datosAudio.duracionSegundos,
                formato: datosAudio.formato,
                tamanoBytes: datosAudio.tamanoBytes,
                estado: "PENDIENTE",
                numeroIntento: 1,
                permiteReintento: false,
              },
              select: {
                id: true,
                estado: true,
                permiteReintento: true,
                numeroIntento: true,
                motivoDecision: true,
                creadoEn: true,
              },
            });

            return {
              propuesta,
              modo,
              audioPublicIdAnterior: null,
            };
          }

          if (!propuestaExistente) {
            throw new ErrorPropuesta(
              "No se encontró la propuesta que deseas actualizar.",
              409,
            );
          }

          const ahora = new Date();
          const actualizacion = await tx.propuesta.updateMany({
            where: {
              id: propuestaExistente.id,
              estado:
                modo === "CORRECCION"
                  ? "CAMBIOS_SOLICITADOS"
                  : "RECHAZADA",
              numeroIntento: propuestaExistente.numeroIntento,
              ...(modo === "REINTENTO"
                ? { permiteReintento: true }
                : {}),
            },
            data: {
              mensaje: datosAudio.mensaje,
              audioUrl: datosAudio.audioUrl,
              audioPublicId: datosAudio.audioPublicId,
              duracionSegundos: datosAudio.duracionSegundos,
              formato: datosAudio.formato,
              tamanoBytes: datosAudio.tamanoBytes,
              estado: "PENDIENTE",
              permiteReintento: false,
              numeroIntento: {
                increment: 1,
              },
              motivoDecision: null,
              decisionEn: null,
              ...(modo === "REINTENTO" ? { creadoEn: ahora } : {}),
            },
          });

          if (actualizacion.count === 0) {
            throw new ErrorPropuesta(
              "La propuesta cambió desde otra sesión. Actualiza la página.",
              409,
            );
          }

          const propuesta = await tx.propuesta.findUniqueOrThrow({
            where: {
              id: propuestaExistente.id,
            },
            select: {
              id: true,
              estado: true,
              permiteReintento: true,
              numeroIntento: true,
              motivoDecision: true,
              creadoEn: true,
            },
          });

          return {
            propuesta,
            modo,
            audioPublicIdAnterior: propuestaExistente.audioPublicId,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (codigoErrorPrisma(error) === "P2034" && intentoTransaccion < 2) {
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

  let audioPublicIdNuevo: string | null = null;

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
            propuestas: {
              where: {
                estado: {
                  in: ESTADOS_QUE_OCUPAN_CUPO,
                },
              },
            },
          },
        },
        propuestas: {
          where: {
            remitenteId: sesion.usuarioId,
          },
          select: {
            id: true,
            estado: true,
            permiteReintento: true,
            numeroIntento: true,
            audioPublicId: true,
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

    const modoPrevio = resolverModoEnvio(idea.propuestas[0] ?? null);

    if (
      (modoPrevio === "NUEVA" || modoPrevio === "REINTENTO") &&
      idea._count.propuestas >= MAX_PROPUESTAS_POR_IDEA
    ) {
      return respuestaError(
        "Esta idea ya tiene sus 3 cupos ocupados.",
        409,
      );
    }

    const audioSubido = await subirAudioPropuesta(
      audio,
      sesion.usuarioId,
      ideaId,
    );
    audioPublicIdNuevo = audioSubido.publicId;

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

    const resultadoGuardado = await guardarPropuestaConCupo(
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

    audioPublicIdNuevo = null;

    if (
      resultadoGuardado.audioPublicIdAnterior &&
      resultadoGuardado.audioPublicIdAnterior !== audioSubido.publicId
    ) {
      await eliminarAudioIdea(resultadoGuardado.audioPublicIdAnterior).catch(
        (errorEliminacion) => {
          console.error(
            "La nueva versión se guardó, pero no se pudo eliminar el audio anterior.",
            errorEliminacion,
          );
        },
      );
    }

    const mensajes: Record<ModoEnvio, string> = {
      NUEVA: "Tu propuesta fue enviada correctamente.",
      CORRECCION:
        "La corrección fue enviada. El artista volverá a revisar tu propuesta.",
      REINTENTO:
        "Tu nuevo intento fue enviado y volvió a ocupar un cupo disponible.",
    };

    return NextResponse.json(
      {
        ok: true,
        mensaje: mensajes[resultadoGuardado.modo],
        modo: resultadoGuardado.modo,
        propuesta: {
          ...resultadoGuardado.propuesta,
          creadoEn: resultadoGuardado.propuesta.creadoEn.toISOString(),
        },
      },
      { status: resultadoGuardado.modo === "NUEVA" ? 201 : 200 },
    );
  } catch (error) {
    if (audioPublicIdNuevo) {
      await eliminarAudioIdea(audioPublicIdNuevo).catch((errorEliminacion) => {
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
        "Ya existe una propuesta tuya para esta idea.",
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
