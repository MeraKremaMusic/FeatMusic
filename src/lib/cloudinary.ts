import { createHash } from "node:crypto";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1";

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

export async function subirImagenPerfil(
  archivo: File,
  usuarioId: number,
): Promise<string> {
  const { cloudName, apiKey, apiSecret } = obtenerConfiguracion();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "featmusic/perfiles";
  const publicId = `usuario-${usuarioId}`;

  const parametrosFirma = [
    `folder=${folder}`,
    `overwrite=true`,
    `public_id=${publicId}`,
    `timestamp=${timestamp}`,
  ].join("&");

  const signature = createHash("sha1")
    .update(`${parametrosFirma}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.set("file", archivo);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("folder", folder);
  formData.set("public_id", publicId);
  formData.set("overwrite", "true");
  formData.set("signature", signature);

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
