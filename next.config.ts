import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,

  // Este paquete carga los catálogos desde archivos JSON dentro de node_modules.
  // Debe ejecutarse como paquete externo del servidor para que Next/Turbopack
  // no lo empaquete y pierda acceso a sus carpetas de países, estados y ciudades.
  serverExternalPackages: ["@countrystatecity/countries"],
};

export default nextConfig;