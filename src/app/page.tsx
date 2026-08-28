// FEATMUSIC_ENTRADA_PERFIL_NUEVO_V2
import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/session";
import {
  crearMetadataPagina,
  FEATMUSIC_DESCRIPCION_GLOBAL,
  FEATMUSIC_URL_PUBLICA,
} from "@/lib/seo";
import HomeClient from "./HomeClient";

// FEATMUSIC_SEO_TECNICO_V1
export const metadata = crearMetadataPagina({
  title: "FeatMusic | Encuentra artistas y crea colaboraciones musicales",
  description: FEATMUSIC_DESCRIPCION_GLOBAL,
  path: "/",
});

const datosEstructuradosInicio = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${FEATMUSIC_URL_PUBLICA}/#website`,
      url: FEATMUSIC_URL_PUBLICA,
      name: "FeatMusic",
      description: FEATMUSIC_DESCRIPCION_GLOBAL,
      inLanguage: ["es", "en", "pt-BR"],
      publisher: {
        "@id": `${FEATMUSIC_URL_PUBLICA}/#organization`,
      },
    },
    {
      "@type": "Organization",
      "@id": `${FEATMUSIC_URL_PUBLICA}/#organization`,
      name: "FeatMusic",
      url: FEATMUSIC_URL_PUBLICA,
      logo: `${FEATMUSIC_URL_PUBLICA}/logonav.png`,
      description: FEATMUSIC_DESCRIPCION_GLOBAL,
    },
  ],
};

export default async function HomePage() {
  const sesion = await obtenerSesion();

  if (sesion) {
    redirect("/artistas/mi-perfil");
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datosEstructuradosInicio).replace(/</g, "\\u003c"),
        }}
      />
      <HomeClient />
    </>
  );
}