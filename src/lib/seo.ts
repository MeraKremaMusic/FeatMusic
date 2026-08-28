// FEATMUSIC_SEO_TECNICO_V1
import type { Metadata } from "next";

export const FEATMUSIC_NOMBRE = "FeatMusic";
export const FEATMUSIC_DESCRIPCION_GLOBAL =
  "Encuentra cantantes, beatmakers, compositores y productores, publica ideas musicales y conecta con artistas para crear canciones en colaboración.";

function normalizarOrigen(valor: string | undefined) {
  const candidato = valor?.trim();

  if (candidato) {
    try {
      const url = new URL(candidato);
      return url.origin;
    } catch {
      // Si la variable de entorno está mal formada usamos el dominio oficial.
    }
  }

  return "https://featmusic.pro";
}

export const FEATMUSIC_URL_PUBLICA = normalizarOrigen(
  process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL,
);

export const FEATMUSIC_IMAGEN_SOCIAL = "/logobanner.png";

export function crearMetadataPagina({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: FEATMUSIC_NOMBRE,
      title,
      description,
      url: canonical,
      images: [
        {
          url: FEATMUSIC_IMAGEN_SOCIAL,
          width: 1200,
          height: 300,
          alt: "FeatMusic — colaboraciones musicales entre artistas",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [FEATMUSIC_IMAGEN_SOCIAL],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
