import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,

  // Evita que Next.js empaquete esta librería dentro de los chunks
  // del servidor. La librería necesita acceder a sus archivos JSON.
  serverExternalPackages: ["@countrystatecity/countries"],

  // Garantiza que los datos de países, departamentos y ciudades
  // sean incluidos durante el despliegue.
  outputFileTracingIncludes: {
    "/api/ubicaciones": [
      "./node_modules/@countrystatecity/countries/dist/data/**/*",
    ],
  },
};

export default nextConfig;