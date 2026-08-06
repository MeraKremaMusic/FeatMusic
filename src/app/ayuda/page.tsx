import type { Metadata } from "next";
import Link from "next/link";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";

export const metadata: Metadata = {
  title: "Ayuda y soporte | FeatMusic",
  description:
    "Resuelve dudas sobre perfiles, ideas musicales, propuestas, mensajes y seguridad en FeatMusic.",
};

const preguntas = [
  {
    pregunta: "¿Cómo publico una idea musical?",
    respuesta:
      "Usa el botón central de publicar en móvil o entra al panel. Agrega el audio, título, descripción, BPM, tonalidad y los datos de colaboración. La portada es opcional.",
  },
  {
    pregunta: "¿Qué ocurre cuando envío una propuesta?",
    respuesta:
      "El propietario de la idea recibe tu propuesta y puede aceptarla, solicitar cambios o rechazarla. Mientras siga pendiente, puedes cancelarla desde tu perfil.",
  },
  {
    pregunta: "¿Cómo cambio la información de mi perfil?",
    respuesta:
      "Entra a Mi perfil y toca Editar perfil. Allí puedes modificar tu foto, portada, biografía, redes, géneros y preferencias musicales.",
  },
  {
    pregunta: "¿Cómo funcionan los mensajes?",
    respuesta:
      "Cada conversación agrupa el contacto entre dos artistas. Cuando una colaboración es aceptada, la información relacionada puede aparecer dentro del chat.",
  },
  {
    pregunta: "¿Qué hago si encuentro spam, acoso o suplantación?",
    respuesta:
      "Usa la página Reportar un usuario. Describe el problema con claridad para que el reporte pueda revisarse.",
  },
  {
    pregunta: "¿FeatMusic cobra actualmente por usar la plataforma?",
    respuesta:
      "La página de planes muestra funciones en preparación. No se deben considerar activos precios, cobros o beneficios que todavía no estén publicados de forma definitiva.",
  },
];

export default function AyudaPage() {
  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#d8dee7] text-slate-900">
      <EncabezadoSecundario />

      <section className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_55px_rgba(15,23,42,.09)] sm:p-8">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            Centro de ayuda
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            ¿En qué podemos ayudarte?
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Encuentra respuestas rápidas sobre las funciones principales de
            FeatMusic y los pasos recomendados cuando necesitas soporte.
          </p>

          <div className="mt-7 space-y-3">
            {preguntas.map((item) => (
              <details
                key={item.pregunta}
                className="group rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 open:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-slate-900">
                  {item.pregunta}
                  <span className="text-lg text-emerald-600 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-6 text-slate-600">
                  {item.respuesta}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Link
            href="/reportar-usuario"
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
          >
            <span className="text-sm font-black text-slate-950">
              Reportar un usuario
            </span>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Informa spam, acoso, suplantación o contenido inapropiado.
            </p>
          </Link>
          <Link
            href="/terminos"
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
          >
            <span className="text-sm font-black text-slate-950">
              Términos de uso
            </span>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Consulta las reglas y responsabilidades de la plataforma.
            </p>
          </Link>
          <Link
            href="/privacidad"
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
          >
            <span className="text-sm font-black text-slate-950">
              Privacidad
            </span>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Conoce qué datos se usan y los derechos de los titulares.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
