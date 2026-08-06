import type { Metadata } from "next";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";

export const metadata: Metadata = {
  title: "Términos y condiciones | FeatMusic",
  description:
    "Borrador de los términos y condiciones de uso de la plataforma FeatMusic.",
};

const secciones = [
  {
    titulo: "1. Alcance de la plataforma",
    texto:
      "FeatMusic es una plataforma para descubrir artistas, publicar ideas musicales, enviar propuestas, conversar y facilitar posibles colaboraciones. FeatMusic no garantiza que una colaboración se complete, que exista compatibilidad entre usuarios ni que una obra obtenga resultados comerciales.",
  },
  {
    titulo: "2. Cuenta y veracidad de la información",
    texto:
      "Cada usuario es responsable de mantener seguras sus credenciales y de suministrar información veraz y actualizada. No está permitido crear cuentas para suplantar personas, organizaciones o proyectos musicales.",
  },
  {
    titulo: "3. Contenido de los usuarios",
    texto:
      "El usuario conserva los derechos que le correspondan sobre audios, portadas, textos y demás contenido que publique. Al cargar contenido, autoriza a FeatMusic a almacenarlo, procesarlo técnicamente y mostrarlo dentro de la plataforma únicamente para operar el servicio y permitir las funciones solicitadas.",
  },
  {
    titulo: "4. Derechos de autor y autorizaciones",
    texto:
      "Solo debes publicar material propio o material para el cual tengas las autorizaciones necesarias. No se permite subir obras, grabaciones, imágenes, marcas o interpretaciones que infrinjan derechos de terceros.",
  },
  {
    titulo: "5. Propuestas y acuerdos entre artistas",
    texto:
      "Las propuestas, porcentajes, pagos, regalías, créditos y demás condiciones de una colaboración son responsabilidad de los usuarios participantes. FeatMusic facilita el contacto, pero no sustituye un contrato profesional ni actúa como representante, sello, distribuidora o asesor legal de los usuarios.",
  },
  {
    titulo: "6. Conductas prohibidas",
    texto:
      "No se permite el acoso, amenazas, discriminación, spam, fraude, suplantación, manipulación de métricas, contenido ilegal, malware, extracción automatizada no autorizada ni el uso de la plataforma para vulnerar la seguridad o privacidad de otras personas.",
  },
  {
    titulo: "7. Moderación y reportes",
    texto:
      "FeatMusic podrá revisar reportes, limitar funciones, ocultar contenido o suspender cuentas cuando existan indicios razonables de incumplimiento. Estas medidas podrán adoptarse para proteger a los usuarios, preservar la seguridad o cumplir obligaciones legales.",
  },
  {
    titulo: "8. Planes Premium",
    texto:
      "Las funciones Premium, sus precios, límites, renovación y condiciones solo serán vinculantes cuando se publiquen de forma definitiva y el usuario las acepte antes de pagar. Una página marcada como 'Próximamente' no constituye una oferta comercial.",
  },
  {
    titulo: "9. Disponibilidad y cambios",
    texto:
      "La plataforma puede experimentar interrupciones, mantenimiento o cambios. FeatMusic podrá modificar funciones para mejorar el servicio, corregir errores, reforzar la seguridad o adaptarse a requisitos técnicos y legales.",
  },
  {
    titulo: "10. Terminación",
    texto:
      "El usuario puede dejar de utilizar la plataforma. FeatMusic podrá restringir o cerrar una cuenta cuando se incumplan estos términos, exista riesgo para otros usuarios o sea necesario por razones legales o de seguridad.",
  },
  {
    titulo: "11. Legislación aplicable",
    texto:
      "Este borrador está pensado para una operación con base en Colombia. Antes del lanzamiento comercial deben completarse los datos legales del responsable, el canal formal de contacto y el mecanismo aplicable para resolver solicitudes o controversias.",
  },
];

export default function TerminosPage() {
  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#d8dee7] text-slate-900">
      <EncabezadoSecundario />

      <article className="featmusic-legal-copy mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,.09)] sm:p-9">
          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
            Borrador pendiente de revisión legal
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Términos y condiciones de FeatMusic
          </h1>
          <p className="mt-2 text-xs font-semibold text-slate-500">
            Última actualización del borrador: 6 de agosto de 2026
          </p>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            Este documento organiza las reglas generales previstas para usar
            FeatMusic. Debe revisarse y completarse con información jurídica
            real antes de considerarse una versión definitiva.
          </p>

          <div className="mt-8 space-y-7">
            {secciones.map((seccion) => (
              <section key={seccion.titulo}>
                <h2 className="text-base font-black text-slate-950">
                  {seccion.titulo}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {seccion.texto}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
            Antes de publicar estos términos como definitivos, completa la
            identidad legal del responsable, domicilio, correo de contacto,
            reglas de edad, condiciones de pago y procedimiento de atención de
            reclamaciones.
          </div>
        </div>
      </article>
    </main>
  );
}
