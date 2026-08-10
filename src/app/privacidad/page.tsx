import type { Metadata } from "next";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";

export const metadata: Metadata = {
  title: "Política de privacidad | FeatMusic",
  description:
    "Borrador de la política de privacidad y tratamiento de datos personales de FeatMusic.",
};

const secciones = [
  {
    titulo: "1. Datos que puede tratar FeatMusic",
    puntos: [
      "Datos de cuenta: correo, nombre de usuario y credenciales protegidas.",
      "Datos del perfil: nombre artístico, foto, portada, biografía, ubicación, géneros, rol, software y redes.",
      "Contenido e interacciones: ideas, audios, propuestas, mensajes, seguidores, vistas, guardados y reportes.",
      "Datos técnicos necesarios para seguridad, funcionamiento y diagnóstico del servicio.",
    ],
  },
  {
    titulo: "2. Finalidades",
    puntos: [
      "Crear y administrar cuentas.",
      "Mostrar perfiles, ideas y oportunidades de colaboración.",
      "Procesar propuestas, mensajes, notificaciones y seguimiento.",
      "Prevenir fraude, abuso, spam y vulneraciones de seguridad.",
      "Atender solicitudes, reportes y soporte.",
      "Mejorar el funcionamiento y la experiencia de la plataforma.",
    ],
  },
  {
    titulo: "3. Proveedores y tratamiento técnico",
    puntos: [
      "FeatMusic puede utilizar proveedores de hosting, base de datos, almacenamiento de imágenes o audio, correo y seguridad.",
      "Estos proveedores deben tratar la información únicamente para prestar los servicios contratados y bajo medidas de protección apropiadas.",
      "Algunos proveedores pueden operar desde otros países, por lo que deben revisarse las reglas aplicables a transmisión o transferencia internacional de datos.",
    ],
  },
  {
    titulo: "4. Conservación",
    puntos: [
      "Los datos se conservan mientras la cuenta esté activa o sean necesarios para prestar el servicio.",
      "Cierta información puede conservarse durante un tiempo adicional para seguridad, prevención de fraude, atención de reclamaciones o cumplimiento de obligaciones legales.",
      "Los plazos definitivos deben documentarse antes del lanzamiento comercial.",
    ],
  },
  {
    titulo: "5. Derechos de los titulares",
    puntos: [
      "Conocer, actualizar y rectificar los datos personales.",
      "Solicitar información sobre el uso dado a los datos.",
      "Solicitar la supresión cuando sea procedente.",
      "Revocar la autorización cuando la ley lo permita.",
      "Presentar consultas o reclamos mediante el canal formal que FeatMusic habilite.",
    ],
  },
  {
    titulo: "6. Seguridad",
    puntos: [
      "FeatMusic aplica controles técnicos y organizativos razonables para proteger cuentas y contenido.",
      "Ningún sistema es infalible; los usuarios también deben proteger sus contraseñas y dispositivos.",
      "Los incidentes relevantes deben evaluarse y gestionarse de acuerdo con la normativa aplicable.",
    ],
  },
  {
    titulo: "7. Menores de edad",
    puntos: [
      "La versión definitiva debe establecer una política clara de edad mínima y autorización de representantes legales.",
      "No deben tratarse datos de menores sin las garantías especiales exigidas por la legislación aplicable.",
    ],
  },
  {
    titulo: "8. Cambios y contacto",
    puntos: [
      "Los cambios importantes de esta política deben comunicarse de forma visible.",
      "Antes de publicar la versión definitiva se debe indicar el nombre legal del responsable, domicilio y correo para consultas y reclamos.",
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#dddddd] text-slate-900">
      <EncabezadoSecundario />

      <article className="featmusic-legal-copy mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,.09)] sm:p-9">
          <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-800">
            Borrador pendiente de revisión legal
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Política de privacidad y tratamiento de datos
          </h1>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Última actualización del borrador: 6 de agosto de 2026
          </p>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Este borrador se estructura tomando como referencia el marco
            colombiano de protección de datos personales. Debe completarse con
            la identidad y los canales reales del responsable antes de su
            publicación definitiva.
          </p>

          <div className="mt-8 space-y-7">
            {secciones.map((seccion) => (
              <section key={seccion.titulo}>
                <h2 className="text-base font-black text-slate-950">
                  {seccion.titulo}
                </h2>
                <ul className="mt-3 space-y-2">
                  {seccion.puntos.map((punto) => (
                    <li
                      key={punto}
                      className="flex gap-3 text-sm leading-7 text-slate-600"
                    >
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                      <span>{punto}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-xs leading-6 text-yellow-900">
            Este documento no reemplaza una revisión profesional. También debe
            coordinarse con los formularios de autorización, cookies, proveedores
            tecnológicos y procedimientos internos de atención de titulares.
          </div>
        </div>
      </article>
    </main>
  );
}
