// FEATMUSIC_SEO_TECNICO_V1
import type { MetadataRoute } from "next";

import { FEATMUSIC_URL_PUBLICA } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/inicio/",
          "/mensajes/",
          "/mi-cuenta/",
          "/panel/",
          "/completar-perfil/",
          "/suscripcion/",
          "/reportar-usuario/",
          "/artistas/mi-perfil",
        ],
      },
    ],
    sitemap: `${FEATMUSIC_URL_PUBLICA}/sitemap.xml`,
    host: FEATMUSIC_URL_PUBLICA,
  };
}
