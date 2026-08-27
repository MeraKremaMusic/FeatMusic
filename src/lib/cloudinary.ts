import { createHash, randomUUID } from "node:crypto";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1";
const AUDIO_FINAL_FORMAT = "mp3";
const AUDIO_INCOMING_TRANSFORMATION = "ac_mp3,af_44100,br_64k";

// FEATMUSIC_OPTIMIZACION_IMAGENES_PERFIL_V1
// Las transformaciones entrantes se aplican ANTES de guardar el recurso.
// c_lfill reduce y recorta solo cuando la imagen supera estos límites;
// no agranda imágenes pequeñas. q_auto:good reduce el peso conservando calidad.
const PROFILE_IMAGE_FORMAT = "webp";
const PROFILE_IMAGE_TRANSFORMATION =
  "c_lfill,g_auto,h_512,w_512/q_auto:good";
const COVER_IMAGE_FORMAT = "webp";
const COVER_IMAGE_TRANSFORMATION =
  "c_lfill,g_auto,h_600,w_1600/q_auto:good";

type ParametroFirma = [nombre: string, valor: string];

export type AudioIdeaSubido = {
  url: string;
  publicId: string;
  duracionSegundos: number;
  formato: string | null;
  bytes: number | null;
  resourceType: string | null;
};

export type PortadaIdeaSubida = {
  url: string;
  publicId: string;
};

// FEATMUSIC_AUDIO_DIRECT_CLOUDINARY_V1
export type FirmaSubidaDirectaAudioIdea = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  publicId: string;
  format: string;
  transformation: string;
  signature: string;
};

// FEATMUSIC_PORTADA_DIRECT_CLOUDINARY_V1
export type FirmaSubidaDirectaPortadaIdea = {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  publicId: string;
  signature: string;
};

function obtenerConfiguracion() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET.",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function crearFirma(parametros: ParametroFirma[], apiSecret: string) {
  const textoFirma = parametros
    .slice()
    .sort(([nombreA], [nombreB]) => nombreA.localeCompare(nombreB))
    .map(([nombre, valor]) => `${nombre}=${valor}`)
    .join("&");

  return createHash("sha1")
    .update(`${textoFirma}${apiSecret}`)
    .digest("hex");
}

export async function subirImagenPerfil(
  archivo: File,
  usuarioId: number,
): Promise<string> {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "featmusic/perfiles";
  const publicId = `usuario-${usuarioId}`;
  const parametros: ParametroFirma[] = [
    ["folder", folder],
    ["format", PROFILE_IMAGE_FORMAT],
    ["invalidate", "true"],
    ["overwrite", "true"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
    ["transformation", PROFILE_IMAGE_TRANSFORMATION],
  ];

  const formData = new FormData();
  formData.set("file", archivo);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("format", PROFILE_IMAGE_FORMAT);
  formData.set("transformation", PROFILE_IMAGE_TRANSFORMATION);
  formData.set("overwrite", "true");
  formData.set("invalidate", "true");
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url) {
    throw new Error(
      data.error?.message ?? "Cloudinary no pudo guardar la imagen.",
    );
  }

  // FEATMUSIC_PERFIL_CACHE_BUST_V1
  // El public_id se reutiliza para no acumular archivos. Este parámetro
  // obliga al navegador a mostrar inmediatamente la nueva versión.
  const separador = data.secure_url.includes("?") ? "&" : "?";
  return `${data.secure_url}${separador}fm_perfil=${timestamp}`;
}

export async function subirImagenPortada(
  archivo: File,
  usuarioId: number,
): Promise<string> {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "featmusic/portadas";
  const publicId = `usuario-${usuarioId}`;
  const parametros: ParametroFirma[] = [
    ["folder", folder],
    ["format", COVER_IMAGE_FORMAT],
    ["invalidate", "true"],
    ["overwrite", "true"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
    ["transformation", COVER_IMAGE_TRANSFORMATION],
  ];

  const formData = new FormData();
  formData.set("file", archivo);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("format", COVER_IMAGE_FORMAT);
  formData.set("transformation", COVER_IMAGE_TRANSFORMATION);
  formData.set("overwrite", "true");
  formData.set("invalidate", "true");
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url) {
    throw new Error(
      data.error?.message ?? "Cloudinary no pudo guardar la portada.",
    );
  }

  // FEATMUSIC_PORTADA_CACHE_BUST_V2
  // Añade una versión propia para impedir que el navegador conserve una
  // portada anterior cuando Cloudinary reutiliza el mismo public_id.
  const separador = data.secure_url.includes("?") ? "&" : "?";
  return `${data.secure_url}${separador}fm_portada=${timestamp}`;
}

// FEATMUSIC_ELIMINAR_IMAGEN_PERFIL_V1
export async function eliminarImagenPerfil(usuarioId: number) {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `featmusic/perfiles/usuario-${usuarioId}`;
  const parametros: ParametroFirma[] = [
    ["invalidate", "true"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
  ];

  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("invalidate", "true");
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    result?: string;
    error?: { message?: string };
  };

  if (!response.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(
      data.error?.message ?? "Cloudinary no pudo eliminar la imagen de perfil.",
    );
  }
}

export async function eliminarImagenPortada(usuarioId: number) {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `featmusic/portadas/usuario-${usuarioId}`;
  const parametros: ParametroFirma[] = [
    ["invalidate", "true"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
  ];

  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("invalidate", "true");
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    result?: string;
    error?: { message?: string };
  };

  if (!response.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(
      data.error?.message ?? "Cloudinary no pudo eliminar la portada.",
    );
  }
}


// FEATMUSIC_PORTADAS_IDEAS_CLOUDINARY_V1
export async function subirImagenPortadaIdea(
  archivo: File,
  usuarioId: number,
): Promise<PortadaIdeaSubida> {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `featmusic/portadas-ideas/usuario-${usuarioId}`;
  const publicId = `idea-${randomUUID()}`;
  const parametros: ParametroFirma[] = [
    ["folder", folder],
    ["overwrite", "false"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
  ];

  const formData = new FormData();
  formData.set("file", archivo);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("overwrite", "false");
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url || !data.public_id) {
    throw new Error(
      data.error?.message ??
        "Cloudinary no pudo guardar la portada de la idea.",
    );
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

export async function eliminarImagenPortadaIdea(publicId: string) {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const parametros: ParametroFirma[] = [
    ["invalidate", "true"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
  ];

  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("invalidate", "true");
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    result?: string;
    error?: { message?: string };
  };

  if (!response.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(
      data.error?.message ??
        "Cloudinary no pudo eliminar la portada de la idea.",
    );
  }
}

async function subirAudioConvertido(
  archivo: File,
  folder: string,
  prefijoPublicId: string,
): Promise<AudioIdeaSubido> {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${prefijoPublicId}-${randomUUID()}`;
  const parametros: ParametroFirma[] = [
    ["folder", folder],
    ["format", AUDIO_FINAL_FORMAT],
    ["overwrite", "false"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
    ["transformation", AUDIO_INCOMING_TRANSFORMATION],
  ];

  const formData = new FormData();
  formData.set("file", archivo);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("overwrite", "false");
  formData.set("format", AUDIO_FINAL_FORMAT);
  formData.set("transformation", AUDIO_INCOMING_TRANSFORMATION);
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/video/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
    duration?: number;
    format?: string;
    bytes?: number;
    resource_type?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url || !data.public_id) {
    throw new Error(
      data.error?.message ??
        "Cloudinary no pudo convertir y guardar el audio.",
    );
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    duracionSegundos: Math.max(0, Math.ceil(data.duration ?? 0)),
    formato: data.format ?? null,
    bytes: data.bytes ?? null,
    resourceType: data.resource_type ?? null,
  };
}

export function esPublicIdAudioIdeaUsuario(
  publicId: string,
  usuarioId: number,
) {
  return publicId.startsWith(
    `featmusic/ideas/usuario-${usuarioId}/idea-`,
  );
}

export function crearFirmaSubidaDirectaAudioIdea(
  usuarioId: number,
): FirmaSubidaDirectaAudioIdea {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `featmusic/ideas/usuario-${usuarioId}`;
  const publicId = `idea-${randomUUID()}`;
  const parametros: ParametroFirma[] = [
    ["folder", folder],
    ["format", AUDIO_FINAL_FORMAT],
    ["overwrite", "false"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
    ["transformation", AUDIO_INCOMING_TRANSFORMATION],
  ];

  return {
    uploadUrl: `${CLOUDINARY_UPLOAD_URL}/${cloudName}/video/upload`,
    apiKey,
    timestamp,
    folder,
    publicId,
    format: AUDIO_FINAL_FORMAT,
    transformation: AUDIO_INCOMING_TRANSFORMATION,
    signature: crearFirma(parametros, apiSecret),
  };
}


export function esPublicIdPortadaIdeaUsuario(
  publicId: string,
  usuarioId: number,
) {
  return publicId.startsWith(
    `featmusic/portadas-ideas/usuario-${usuarioId}/idea-`,
  );
}

export function crearFirmaSubidaDirectaPortadaIdea(
  usuarioId: number,
): FirmaSubidaDirectaPortadaIdea {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `featmusic/portadas-ideas/usuario-${usuarioId}`;
  const publicId = `idea-${randomUUID()}`;
  const parametros: ParametroFirma[] = [
    ["folder", folder],
    ["overwrite", "false"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
  ];

  return {
    uploadUrl: `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`,
    apiKey,
    timestamp,
    folder,
    publicId,
    signature: crearFirma(parametros, apiSecret),
  };
}

export async function obtenerImagenPortadaIdeaSubidaDirecta(
  publicId: string,
  usuarioId: number,
): Promise<PortadaIdeaSubida & {
  formato: string | null;
  bytes: number | null;
  resourceType: string | null;
}> {
  if (!esPublicIdPortadaIdeaUsuario(publicId, usuarioId)) {
    throw new Error("La portada subida no pertenece a este usuario.");
  }

  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const autorizacion = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const url = `${CLOUDINARY_UPLOAD_URL}/${cloudName}/resources/image/upload/${encodeURIComponent(publicId)}`;

  let ultimoError = "Cloudinary no encontró la portada subida.";

  for (let intento = 0; intento < 5; intento += 1) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${autorizacion}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | {
          secure_url?: string;
          public_id?: string;
          format?: string;
          bytes?: number;
          resource_type?: string;
          error?: { message?: string };
        }
      | null;

    if (response.ok && data?.secure_url && data.public_id === publicId) {
      return {
        url: data.secure_url,
        publicId: data.public_id,
        formato: data.format ?? null,
        bytes: data.bytes ?? null,
        resourceType: data.resource_type ?? null,
      };
    }

    ultimoError =
      data?.error?.message ?? "Cloudinary no encontró la portada subida.";

    if (response.status !== 404 || intento === 4) {
      break;
    }

    await esperar(250 * (intento + 1));
  }

  throw new Error(ultimoError);
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// FEATMUSIC_AUDIO_DURATION_METADATA_V2
function extraerDuracionCloudinary(data: {
  duration?: number | string;
  media_metadata?: Record<string, unknown>;
}) {
  const metadata = data.media_metadata ?? {};
  const candidatos = [
    data.duration,
    metadata.duration,
    metadata.format_duration,
    metadata.audio_duration,
    metadata.video_duration,
  ];

  for (const valor of candidatos) {
    const numero =
      typeof valor === "number"
        ? valor
        : typeof valor === "string"
          ? Number.parseFloat(valor)
          : Number.NaN;

    if (Number.isFinite(numero) && numero > 0) {
      return Math.ceil(numero);
    }
  }

  return 0;
}

export async function obtenerAudioIdeaSubidoDirecto(
  publicId: string,
  usuarioId: number,
): Promise<AudioIdeaSubido> {
  if (!esPublicIdAudioIdeaUsuario(publicId, usuarioId)) {
    throw new Error("El audio subido no pertenece a este usuario.");
  }

  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const autorizacion = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const url = `${CLOUDINARY_UPLOAD_URL}/${cloudName}/resources/video/upload/${encodeURIComponent(publicId)}?media_metadata=true`;

  let ultimoError = "Cloudinary no encontró el audio subido.";

  for (let intento = 0; intento < 8; intento += 1) {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${autorizacion}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | {
          secure_url?: string;
          public_id?: string;
          duration?: number | string;
          media_metadata?: Record<string, unknown>;
          format?: string;
          bytes?: number;
          resource_type?: string;
          error?: { message?: string };
        }
      | null;

    if (
      response.ok &&
      data?.secure_url &&
      data.public_id === publicId
    ) {
      const duracionSegundos = extraerDuracionCloudinary(data);

      if (duracionSegundos > 0 || intento === 7) {
        return {
          url: data.secure_url,
          publicId: data.public_id,
          duracionSegundos,
          formato: data.format ?? null,
          bytes: data.bytes ?? null,
          resourceType: data.resource_type ?? null,
        };
      }

      ultimoError =
        "Cloudinary todavía está procesando la duración del audio.";
      await esperar(400 * (intento + 1));
      continue;
    }

    ultimoError =
      data?.error?.message ?? "Cloudinary no encontró el audio subido.";

    if (response.status !== 404 || intento === 7) {
      break;
    }

    await esperar(400 * (intento + 1));
  }

  throw new Error(ultimoError);
}

export async function subirAudioIdea(
  archivo: File,
  usuarioId: number,
): Promise<AudioIdeaSubido> {
  return subirAudioConvertido(
    archivo,
    `featmusic/ideas/usuario-${usuarioId}`,
    "idea",
  );
}

export async function subirAudioPropuesta(
  archivo: File,
  usuarioId: number,
  ideaId: number,
): Promise<AudioIdeaSubido> {
  return subirAudioConvertido(
    archivo,
    `featmusic/propuestas/idea-${ideaId}/usuario-${usuarioId}`,
    "propuesta",
  );
}

export async function eliminarAudioIdea(publicId: string) {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const parametros: ParametroFirma[] = [
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
  ];

  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("signature", crearFirma(parametros, apiSecret));

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/video/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as {
    result?: string;
    error?: { message?: string };
  };

  if (!response.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(
      data.error?.message ?? "Cloudinary no pudo eliminar el audio.",
    );
  }
}
