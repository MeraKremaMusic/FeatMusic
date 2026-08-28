import type { NextConfig } from "next";

// FEATMUSIC_SECURITY_HEADERS_V1
// Primera capa conservadora: no incluye una CSP estricta para evitar bloquear
// scripts de Next.js o recursos externos como Cloudinary / Mercado Pago.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const productionOnlyHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];
// FEATMUSIC_SEO_TECNICO_V1
const seoNoIndexHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

const seoNoIndexSources = [
  "/api/:path*",
  "/admin/:path*",
  "/inicio/:path*",
  "/mensajes/:path*",
  "/mi-cuenta/:path*",
  "/panel/:path*",
  "/completar-perfil/:path*",
  "/suscripcion/:path*",
  "/reportar-usuario/:path*",
  "/restablecer-contrasena/:path*",
  "/verificar-correo/:path*",
  "/registro/:path*",
  "/iniciar-sesion",
  "/artistas/mi-perfil",
];

const nextConfig: NextConfig = {
  // FEATMUSIC_SECURITY_HEADERS_V1
  // Oculta el encabezado X-Powered-By de Next.js.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          ...(process.env.NODE_ENV === "production"
            ? productionOnlyHeaders
            : []),
        ],
      },
      ...seoNoIndexSources.map((source) => ({
        source,
        headers: seoNoIndexHeaders,
      })),
    ];
  },

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