import { createHash, randomUUID } from "node:crypto";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1";

type ParametroFirma = [nombre: string, valor: string];

export type AudioIdeaSubido = {
  url: string;
  publicId: string;
  duracionSegundos: number;
  formato: string | null;
  bytes: number | null;
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

function crearFirma(
  parametros: ParametroFirma[],
  apiSecret: string,
) {
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
    ["overwrite", "true"],
    ["public_id", publicId],
    ["timestamp", String(timestamp)],
  ];

  const formData = new FormData();
  formData.set("file", archivo);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("overwrite", "true");
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

  return data.secure_url;
}

export async function subirAudioIdea(
  archivo: File,
  usuarioId: number,
): Promise<AudioIdeaSubido> {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `featmusic/ideas/usuario-${usuarioId}`;
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
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url || !data.public_id) {
    throw new Error(
      data.error?.message ?? "Cloudinary no pudo guardar el audio.",
    );
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    duracionSegundos: Math.max(0, Math.ceil(data.duration ?? 0)),
    formato: data.format ?? null,
    bytes: data.bytes ?? null,
  };
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
