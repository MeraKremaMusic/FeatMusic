import type { Metadata } from "next";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import { crearMetadataPagina } from "@/lib/seo";
import {
  CORREO_LEGAL_FEATMUSIC,
  EDAD_MINIMA_FEATMUSIC,
  FECHA_VIGENCIA_LEGAL,
  RESPONSABLE_LEGAL_FEATMUSIC,
  TIPO_RESPONSABLE_LEGAL_FEATMUSIC,
  VERSION_LEGAL_ACTUAL,
} from "@/lib/legal";

// FEATMUSIC_SEO_TECNICO_V1
export const metadata = crearMetadataPagina({
  title: "Términos y condiciones | FeatMusic",
  description: "Consulta los términos y condiciones vigentes para el uso de FeatMusic y sus herramientas de colaboración musical entre artistas.",
  path: "/terminos",
});

const secciones = [
  {
    titulo: "1. Responsable y contacto",
    texto:
      `FeatMusic es operada en Colombia por ${RESPONSABLE_LEGAL_FEATMUSIC}, ${TIPO_RESPONSABLE_LEGAL_FEATMUSIC}. El canal electrónico oficial para soporte, solicitudes, quejas y asuntos legales es ${CORREO_LEGAL_FEATMUSIC}. La información comercial y de contacto adicional exigible para una compra deberá mostrarse de forma clara antes de completar la transacción.`,
  },
  {
    titulo: "2. Aceptación y edad mínima",
    texto:
      `Para crear una cuenta debes tener al menos ${EDAD_MINIMA_FEATMUSIC} años. Al registrarte declaras que cumples esta edad y aceptas estos Términos y la Política de Privacidad. FeatMusic puede conservar la fecha y la versión legal aceptada como evidencia de dicha manifestación. Si se detecta razonablemente que una cuenta pertenece a una persona menor de edad, FeatMusic podrá restringirla o cerrarla conforme a la ley y a sus obligaciones de protección de datos.`,
  },
  {
    titulo: "3. Qué hace FeatMusic",
    texto:
      "FeatMusic es una plataforma tecnológica para descubrir artistas, publicar ideas musicales, enviar propuestas, conversar y facilitar posibles colaboraciones. FeatMusic no garantiza que una colaboración se complete, que exista compatibilidad entre usuarios, que una obra sea publicada ni que genere resultados económicos o comerciales.",
  },
  {
    titulo: "4. Cuenta, seguridad y veracidad",
    texto:
      "Cada usuario debe suministrar información veraz y actualizada, proteger sus credenciales y usar únicamente su propia cuenta. Está prohibida la suplantación de personas, organizaciones o proyectos. El usuario debe informar a FeatMusic si advierte un acceso no autorizado o un riesgo relevante para su cuenta.",
  },
  {
    titulo: "5. Contenido y licencia técnica",
    texto:
      "El usuario conserva los derechos que le correspondan sobre sus audios, imágenes, portadas, textos y demás contenido. Al publicarlo, concede a FeatMusic una autorización no exclusiva y limitada para alojarlo, procesarlo técnicamente, reproducirlo dentro de la plataforma y mostrarlo en la medida necesaria para prestar las funciones solicitadas. Esta autorización termina cuando el contenido deja de ser necesario para el servicio, salvo conservación permitida o exigida por ley.",
  },
  {
    titulo: "6. Propiedad intelectual y reclamaciones",
    texto:
      `Solo puedes publicar contenido propio o contenido para el cual cuentes con derechos o autorizaciones suficientes. FeatMusic podrá retirar o restringir material ante una reclamación fundada de derechos de autor, marca, imagen u otros derechos de terceros. Las reclamaciones pueden enviarse a ${CORREO_LEGAL_FEATMUSIC} identificando el contenido, el derecho presuntamente afectado y la información necesaria para evaluar la solicitud.`,
  },
  {
    titulo: "7. Propuestas y acuerdos entre artistas",
    texto:
      "FeatMusic facilita el contacto, pero no es parte de los acuerdos creativos o comerciales celebrados entre usuarios. Porcentajes, regalías, pagos, créditos, propiedad de masters, derechos editoriales, entregables y demás condiciones deben ser acordados por los participantes. FeatMusic no actúa como sello, editorial, distribuidora, representante, abogado ni asesor financiero de los usuarios.",
  },
  {
    titulo: "8. Conductas prohibidas",
    texto:
      "No se permite el acoso, amenazas, discriminación, fraude, spam, suplantación, manipulación de métricas, malware, contenido ilegal, extracción automatizada no autorizada, intentos de vulnerar la seguridad, publicación de datos de terceros sin autorización ni cualquier uso que afecte derechos de otras personas o el funcionamiento de FeatMusic.",
  },
  {
    titulo: "9. Moderación, reportes y medidas sobre cuentas",
    texto:
      "FeatMusic puede recibir y revisar reportes, emitir advertencias, limitar funciones, suspender temporalmente, bloquear cuentas o retirar contenido cuando existan razones razonables de seguridad, fraude, abuso, incumplimiento de estos Términos o requerimientos legales. Las medidas se procurarán aplicar de forma proporcional al riesgo y podrán revisarse cuando corresponda.",
  },
  {
    titulo: "10. Planes, precios y pagos",
    texto:
      "Las características, límites, precio total, moneda, periodicidad y condiciones aplicables a un plan se muestran antes de la compra y forman parte de la oferta aceptada por el usuario. Los pagos pueden ser procesados por Mercado Pago u otros proveedores autorizados. FeatMusic no necesita almacenar los datos completos de la tarjeta u otro instrumento cuando estos son gestionados directamente por el procesador de pagos.",
  },
  {
    titulo: "11. Renovación, cancelación y derechos del consumidor",
    texto:
      `Cuando un plan tenga renovación periódica, la plataforma debe informar esa condición antes de contratar. El usuario podrá solicitar la cancelación por los mecanismos habilitados y conservará los beneficios hasta la fecha que corresponda según el ciclo pagado y las condiciones mostradas. Los derechos irrenunciables del consumidor, incluido el retracto o la reversión del pago cuando legalmente procedan, no quedan limitados por estos Términos. Las solicitudes pueden iniciarse en ${CORREO_LEGAL_FEATMUSIC}.`,
  },
  {
    titulo: "12. Disponibilidad, mantenimiento y cambios del servicio",
    texto:
      "FeatMusic puede experimentar interrupciones, mantenimiento, fallos de proveedores o cambios técnicos. La plataforma puede modificar funciones para mejorar el servicio, corregir errores, reforzar la seguridad o cumplir requisitos legales. Cuando un cambio afecte de forma material un servicio pagado, se procurará informarlo de manera adecuada.",
  },
  {
    titulo: "13. Eliminación de cuenta y conservación necesaria",
    texto:
      "El usuario puede solicitar la eliminación de su cuenta mediante las funciones disponibles. FeatMusic podrá eliminar o desidentificar información personal y conservar únicamente registros mínimos cuando sean necesarios para seguridad, prevención de fraude, obligaciones legales, defensa de reclamaciones, historial de moderación, transacciones o integridad de conversaciones y colaboraciones compartidas con otros usuarios.",
  },
  {
    titulo: "14. Cambios de estos Términos",
    texto:
      "FeatMusic puede actualizar estos Términos. La versión vigente y su fecha estarán disponibles en esta página. Cuando un cambio sea material, podrá solicitarse una nueva aceptación antes de continuar utilizando determinadas funciones. El uso de la plataforma nunca implicará renuncia a derechos que la ley considere irrenunciables.",
  },
  {
    titulo: "15. Atención de solicitudes y autoridad de consumo",
    texto:
      `Las solicitudes, quejas o reclamaciones relacionadas con FeatMusic pueden enviarse a ${CORREO_LEGAL_FEATMUSIC}. Los usuarios también pueden consultar la información y canales de la Superintendencia de Industria y Comercio de Colombia, autoridad nacional de protección al consumidor y de datos personales.`,
  },
  {
    titulo: "16. Ley aplicable",
    texto:
      "Estos Términos se interpretan de acuerdo con la legislación de la República de Colombia. Cualquier mecanismo de solución de controversias se aplicará sin desconocer la competencia de las autoridades administrativas o judiciales ni los derechos especiales que correspondan a consumidores y titulares de datos personales.",
  },
];

export default function TerminosPage() {
  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#dddddd] text-slate-900">
      <EncabezadoSecundario />

      <article className="featmusic-legal-copy mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,.09)] sm:p-9">
          <span className="inline-flex rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-yellow-800">
            Versión vigente
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Términos y condiciones de FeatMusic
          </h1>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Versión {VERSION_LEGAL_ACTUAL} · Vigente desde {FECHA_VIGENCIA_LEGAL}
          </p>

          <p className="mt-5 text-sm leading-7 text-slate-600">
            Estos Términos regulan el acceso y uso de FeatMusic. Al crear una
            cuenta confirmas que tienes {EDAD_MINIMA_FEATMUSIC} años o más y
            que has leído y aceptado esta versión junto con la Política de
            Privacidad.
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

          <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-xs leading-6 text-yellow-900">
            <p>
              Contacto oficial:{" "}
              <a
                href={`mailto:${CORREO_LEGAL_FEATMUSIC}`}
                className="font-black underline underline-offset-2"
              >
                {CORREO_LEGAL_FEATMUSIC}
              </a>
            </p>
            <p className="mt-2">
              Información de la autoridad de protección al consumidor:{" "}
              <a
                href="https://www.sic.gov.co/"
                target="_blank"
                rel="noreferrer"
                className="font-black underline underline-offset-2"
              >
                Superintendencia de Industria y Comercio
              </a>
              .
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
