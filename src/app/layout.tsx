import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionRouteGuard from "./SessionRouteGuard";
import {
  FEATMUSIC_DESCRIPCION_GLOBAL,
  FEATMUSIC_IMAGEN_SOCIAL,
  FEATMUSIC_URL_PUBLICA,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// FEATMUSIC_SEO_TECNICO_V1
export const metadata: Metadata = {
  metadataBase: new URL(FEATMUSIC_URL_PUBLICA),
  title: "FeatMusic | Colaboraciones musicales entre artistas",
  description: FEATMUSIC_DESCRIPCION_GLOBAL,
  applicationName: "FeatMusic",
  creator: "FeatMusic",
  publisher: "FeatMusic",
  category: "music",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "FeatMusic",
    title: "FeatMusic | Colaboraciones musicales entre artistas",
    description: FEATMUSIC_DESCRIPCION_GLOBAL,
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
    title: "FeatMusic | Colaboraciones musicales entre artistas",
    description: FEATMUSIC_DESCRIPCION_GLOBAL,
    images: [FEATMUSIC_IMAGEN_SOCIAL],
  },
  // Las páginas internas quedan fuera de Google por defecto.
  // Solo las páginas públicas de SEO habilitan indexación explícitamente.
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

const scriptTemaInicial = `
  (function () {
    try {
      var tema = window.localStorage.getItem("featmusic-tema");
      var oscuro = tema === "oscuro";
      var raiz = document.documentElement;
      raiz.classList.toggle("dark", oscuro);
      raiz.dataset.tema = oscuro ? "oscuro" : "claro";
      raiz.style.colorScheme = oscuro ? "dark" : "light";
    } catch (error) {
      document.documentElement.dataset.tema = "claro";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTemaInicial }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SessionRouteGuard>{children}</SessionRouteGuard>
      </body>
    </html>
  );
}
