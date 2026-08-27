import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionRouteGuard from "./SessionRouteGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FeatMusic | Publica ideas y crea colaboraciones",
  description:
    "Publica ideas musicales, descubre cantantes, beatmakers y compositores de cualquier ciudad y crea una red de colaboradores alrededor del mundo.",
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
