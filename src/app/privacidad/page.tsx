import type { Metadata } from "next";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";
import {
  CORREO_LEGAL_FEATMUSIC,
  EDAD_MINIMA_FEATMUSIC,
  FECHA_VIGENCIA_LEGAL,
  RESPONSABLE_LEGAL_FEATMUSIC,
  TIPO_RESPONSABLE_LEGAL_FEATMUSIC,
  VERSION_LEGAL_ACTUAL,
} from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidad | FeatMusic",
  description:
    "Política de privacidad y tratamiento de datos personales vigente de FeatMusic.",
};

const secciones = [
  {
    titulo: "1. Responsable del tratamiento",
    puntos: [
      `${RESPONSABLE_LEGAL_FEATMUSIC}, ${TIPO_RESPONSABLE_LEGAL_FEATMUSIC}, es responsable del tratamiento de los datos personales asociados a FeatMusic en Colombia.`,
      `El canal electrónico para consultas, reclamos, solicitudes de derechos y asuntos de privacidad es ${CORREO_LEGAL_FEATMUSIC}.`,
    ],
  },
  {
    titulo: "2. Datos que puede tratar FeatMusic",
    puntos: [
      "Datos de cuenta: correo electrónico, nombre de usuario, credenciales protegidas y estado de la cuenta.",
      "Datos de perfil: nombre o nombre artístico, foto, portada, biografía, ubicación declarada, géneros, rol, software y enlaces a redes o plataformas.",
      "Contenido e interacciones: ideas, audios, portadas, propuestas, mensajes, seguidores, vistas, guardados, notificaciones y reportes.",
      "Datos de suscripción y pago necesarios para administrar el plan, como identificadores de transacción, estado del pago, plan, monto, moneda y correo del pagador cuando corresponda. Los datos completos del instrumento de pago pueden ser tratados directamente por el proveedor de pagos.",
      "Datos técnicos y de seguridad necesarios para sesión, prevención de fraude, control de abuso, diagnóstico y protección de la plataforma.",
      `Evidencia de consentimiento: fecha de aceptación, versión legal aceptada (${VERSION_LEGAL_ACTUAL}) y fecha en la que el usuario declaró tener ${EDAD_MINIMA_FEATMUSIC} años o más. FeatMusic no necesita pedir la fecha exacta de nacimiento para esta finalidad.`,
    ],
  },
  {
    titulo: "3. Finalidades del tratamiento",
    puntos: [
      "Crear, verificar y administrar cuentas de usuario.",
      "Mostrar perfiles, ideas y oportunidades de colaboración según las funciones de la plataforma.",
      "Procesar propuestas, mensajes, notificaciones, seguimientos, guardados y demás interacciones solicitadas.",
      "Administrar planes, renovaciones, cancelaciones y estados de pago.",
      "Prevenir fraude, abuso, spam, accesos no autorizados y vulneraciones de seguridad.",
      "Atender soporte, reportes, consultas, reclamaciones y solicitudes de derechos.",
      "Mantener, diagnosticar y mejorar la estabilidad y seguridad de FeatMusic.",
      "Cumplir obligaciones legales y atender requerimientos válidos de autoridades competentes.",
    ],
  },
  {
    titulo: "4. Autorización y prueba del consentimiento",
    puntos: [
      "Al registrarse, el usuario debe aceptar expresamente los Términos y esta Política de Privacidad y confirmar que cumple la edad mínima.",
      "FeatMusic puede conservar evidencia electrónica de esa manifestación, incluida su fecha y la versión legal aceptada, con el fin de demostrar la autorización y gestionar futuras actualizaciones.",
      "Cuando una actualización requiera una nueva autorización, FeatMusic podrá solicitarla antes de permitir el uso de determinadas funciones.",
    ],
  },
  {
    titulo: "5. Datos visibles para otros usuarios",
    puntos: [
      "La información que el usuario decide incorporar a su perfil público, sus ideas y otras publicaciones puede ser visible para visitantes o usuarios de FeatMusic de acuerdo con el diseño de cada función.",
      "Los mensajes privados y la información que no esté destinada a publicación no deben mostrarse públicamente salvo autorización, necesidad operativa, obligación legal o medidas de seguridad debidamente justificadas.",
      "El usuario debe evitar publicar en espacios públicos información personal que no sea necesaria para colaborar con otros artistas.",
    ],
  },
  {
    titulo: "6. Proveedores, transmisiones y transferencias",
    puntos: [
      "FeatMusic puede utilizar proveedores de hosting, base de datos, almacenamiento de imágenes o audio, correo electrónico, seguridad y procesamiento de pagos para operar la plataforma.",
      "Algunos proveedores pueden tratar información desde otros países. FeatMusic procurará que las transmisiones o transferencias de datos se realicen bajo las reglas y garantías aplicables.",
      "Los proveedores deben recibir únicamente la información necesaria para prestar su servicio y tratarla conforme a sus obligaciones contractuales y legales.",
    ],
  },
  {
    titulo: "7. Conservación y eliminación",
    puntos: [
      "Los datos se conservan mientras la cuenta esté activa o durante el tiempo razonablemente necesario para prestar las funciones solicitadas.",
      "Al eliminar una cuenta, FeatMusic puede eliminar o desidentificar información personal. Determinados registros mínimos pueden conservarse cuando sean necesarios para seguridad, prevención de fraude, obligaciones legales, contabilidad, reclamaciones, moderación o integridad de interacciones compartidas.",
      "La eliminación de una cuenta no obliga a alterar de forma retroactiva mensajes o registros que también formen parte del historial legítimo de otro usuario, siempre que se reduzca la identificación personal cuando corresponda.",
    ],
  },
  {
    titulo: "8. Derechos del titular",
    puntos: [
      "Conocer, actualizar y rectificar sus datos personales.",
      "Solicitar prueba de la autorización cuando legalmente corresponda.",
      "Ser informado sobre el uso dado a sus datos.",
      "Presentar consultas y reclamos sobre el tratamiento.",
      "Solicitar la supresión o revocar la autorización cuando sea procedente y no exista un deber legal o contractual que justifique conservar la información.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio una vez agotado el trámite que corresponda ante el responsable, en los casos previstos por la ley.",
    ],
  },
  {
    titulo: "9. Cómo ejercer tus derechos",
    puntos: [
      `Las solicitudes pueden enviarse a ${CORREO_LEGAL_FEATMUSIC}. Para proteger la cuenta, FeatMusic puede solicitar información razonable para verificar la identidad del solicitante.`,
      "La solicitud debe indicar de forma clara qué derecho se desea ejercer y la información necesaria para localizar los datos involucrados.",
      "FeatMusic atenderá consultas y reclamos dentro de los términos establecidos por la normativa colombiana aplicable.",
    ],
  },
  {
    titulo: "10. Mayores de edad",
    puntos: [
      `FeatMusic está dirigido exclusivamente a personas de ${EDAD_MINIMA_FEATMUSIC} años o más.`,
      "La plataforma no solicita la fecha exacta de nacimiento como requisito general; solicita una declaración expresa de mayoría de edad y conserva la fecha de esa confirmación.",
      "Si FeatMusic conoce que una cuenta pertenece a una persona menor de edad, podrá restringir la cuenta y adoptar medidas razonables para eliminar o proteger sus datos, teniendo en cuenta las obligaciones legales aplicables y los derechos prevalentes de niños, niñas y adolescentes.",
    ],
  },
  {
    titulo: "11. Cookies, sesión y tecnologías necesarias",
    puntos: [
      "FeatMusic puede utilizar cookies u otros mecanismos estrictamente necesarios para mantener sesiones, proteger cuentas, conservar preferencias y permitir el funcionamiento técnico del servicio.",
      "Si en el futuro se incorporan tecnologías no necesarias para publicidad, medición u otras finalidades que requieran una autorización adicional, se informará y solicitará el consentimiento cuando corresponda.",
    ],
  },
  {
    titulo: "12. Seguridad",
    puntos: [
      "FeatMusic aplica medidas técnicas y organizativas razonables para reducir riesgos de acceso no autorizado, pérdida, alteración, fraude y abuso.",
      "Las contraseñas se almacenan de forma protegida y la plataforma puede aplicar controles de sesión, límites de intentos y otros mecanismos de seguridad.",
      "Ningún sistema conectado a Internet puede garantizar seguridad absoluta; los usuarios también deben proteger sus contraseñas y dispositivos.",
    ],
  },
  {
    titulo: "13. Cambios de esta Política",
    puntos: [
      "La versión vigente y su fecha se publican en esta página.",
      "Cuando exista un cambio material en las finalidades, categorías de datos o condiciones de autorización, FeatMusic podrá informar al usuario y solicitar una nueva aceptación cuando sea necesaria.",
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
            Versión vigente
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
            Política de privacidad y tratamiento de datos
          </h1>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Versión {VERSION_LEGAL_ACTUAL} · Vigente desde {FECHA_VIGENCIA_LEGAL}
          </p>

          <p className="mt-5 text-sm leading-7 text-slate-600">
            Esta Política explica qué datos puede tratar FeatMusic, para qué los
            utiliza y cómo puedes ejercer tus derechos como titular de la
            información.
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
            <p>
              Para ejercer tus derechos o realizar una consulta de privacidad,
              escribe a{" "}
              <a
                href={`mailto:${CORREO_LEGAL_FEATMUSIC}`}
                className="font-black underline underline-offset-2"
              >
                {CORREO_LEGAL_FEATMUSIC}
              </a>
              .
            </p>
            <p className="mt-2">
              También puedes consultar a la{" "}
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
