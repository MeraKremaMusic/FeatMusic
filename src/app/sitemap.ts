// FEATMUSIC_SEO_TECNICO_V1
import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { FEATMUSIC_URL_PUBLICA } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rutasEstaticas: MetadataRoute.Sitemap = [
    {
      url: `${FEATMUSIC_URL_PUBLICA}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${FEATMUSIC_URL_PUBLICA}/artistas`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${FEATMUSIC_URL_PUBLICA}/planes`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${FEATMUSIC_URL_PUBLICA}/ayuda`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${FEATMUSIC_URL_PUBLICA}/terminos`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${FEATMUSIC_URL_PUBLICA}/privacidad`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const perfiles = await prisma.usuario.findMany({
    where: {
      perfilCompleto: true,
      perfilPrivado: false,
      nombreUsuario: { not: null },
    },
    select: {
      nombreUsuario: true,
      actualizadoEn: true,
    },
    orderBy: { actualizadoEn: "desc" },
  });

  const rutasPerfiles: MetadataRoute.Sitemap = perfiles
    .filter(
      (perfil): perfil is { nombreUsuario: string; actualizadoEn: Date } =>
        typeof perfil.nombreUsuario === "string" &&
        perfil.nombreUsuario.trim().length > 0 &&
        perfil.nombreUsuario !== "mi-perfil",
    )
    .map((perfil) => ({
      url: `${FEATMUSIC_URL_PUBLICA}/artistas/${encodeURIComponent(
        perfil.nombreUsuario.trim(),
      )}`,
      lastModified: perfil.actualizadoEn,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...rutasEstaticas, ...rutasPerfiles];
}
