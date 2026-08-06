import type { Metadata } from "next";
import Link from "next/link";

import EncabezadoSecundario from "@/app/components/EncabezadoSecundario";

// FEATMUSIC_CENTRO_AYUDA_COMPLETO_V2

export const metadata: Metadata = {
  title: "Ayuda y soporte | FeatMusic",
  description:
    "Aprende a completar tu perfil, publicar ideas, enviar propuestas, usar los mensajes y proteger tu cuenta en FeatMusic.",
};

type Categoria = {
  id: string;
  titulo: string;
  descripcion: string;
  icono:
    | "inicio"
    | "ideas"
    | "propuestas"
    | "mensajes"
    | "seguridad"
    | "planes";
  preguntas: {
    pregunta: string;
    respuesta: string;
    nota?: string;
  }[];
};

const pasosRapidos = [
  {
    numero: "01",
    titulo: "Completa tu perfil",
    descripcion:
      "Agrega foto, portada, biografía, géneros, ubicación y enlaces musicales para que otros artistas entiendan quién eres.",
  },
  {
    numero: "02",
    titulo: "Publica una idea",
    descripcion:
      "Sube un audio, explica qué colaboración buscas y define el género, rol, idioma, modalidad y tipo de acuerdo.",
  },
  {
    numero: "03",
    titulo: "Explora artistas",
    descripcion:
      "Descubre perfiles, escucha ideas, sigue artistas y revisa quién encaja con el tipo de colaboración que buscas.",
  },
  {
    numero: "04",
    titulo: "Envía o recibe propuestas",
    descripcion:
      "Presenta una versión de audio o revisa las propuestas que otros artistas enviaron a tus publicaciones.",
  },
  {
    numero: "05",
    titulo: "Continúa por mensajes",
    descripcion:
      "Cuando una propuesta es aceptada, FeatMusic conecta a los dos artistas en una conversación privada.",
  },
  {
    numero: "06",
    titulo: "Empieza la colaboración",
    descripcion:
      "Usa el chat para acordar próximos pasos, créditos, entregas y cualquier detalle necesario para avanzar.",
  },
];

const categorias: Categoria[] = [
  {
    id: "primeros-pasos",
    titulo: "Primeros pasos y perfil",
    descripcion:
      "Prepara una presentación clara para que otros artistas puedan encontrarte y entender qué buscas.",
    icono: "inicio",
    preguntas: [
      {
        pregunta: "¿Qué información debería completar primero?",
        respuesta:
          "Empieza por tu nombre artístico, foto, portada, biografía, rol principal, géneros musicales, ciudad y país. Después conecta tus redes y añade tus preferencias de software o distribución. Un perfil completo ayuda a que otros artistas entiendan tu estilo antes de enviarte una propuesta.",
      },
      {
        pregunta: "¿Qué debería escribir en mi biografía?",
        respuesta:
          "Explica qué haces, qué estilos trabajas, qué tipo de artistas buscas y qué puedes aportar a una colaboración. Evita textos demasiado generales. Una biografía útil podría mencionar tu rol, géneros principales, experiencia, modalidad preferida y objetivo actual.",
      },
      {
        pregunta: "¿Para qué sirven la foto y la portada?",
        respuesta:
          "La foto identifica tu perfil y la portada le da una presentación visual más personal. La portada aparece detrás de la información del artista y puede ayudar a que tu perfil sea más reconocible en la plataforma.",
      },
      {
        pregunta: "¿Cómo edito mi perfil?",
        respuesta:
          "Entra a Mi perfil y selecciona Editar perfil. Desde allí puedes modificar los datos visibles, la foto, la portada, la biografía, las redes sociales y tus preferencias musicales.",
      },
      {
        pregunta: "¿Cómo funciona Seguir o Seguido?",
        respuesta:
          "Cuando visitas otro perfil, el icono de persona con el signo + sirve para seguirlo. Al seguirlo cambia al estado de persona verificada. Puedes tocarlo nuevamente para dejar de seguir. Los contadores del perfil se actualizan inmediatamente.",
      },
      {
        pregunta: "¿Qué puedo compartir de mi perfil?",
        respuesta:
          "Desde Compartir perfil puedes abrir el menú de aplicaciones del teléfono, enviar el enlace por WhatsApp, Facebook, Telegram o X, o copiarlo para pegarlo en cualquier otra red.",
      },
    ],
  },
  {
    id: "ideas-musicales",
    titulo: "Ideas musicales",
    descripcion:
      "Todo lo necesario para publicar, presentar y administrar tus oportunidades de colaboración.",
    icono: "ideas",
    preguntas: [
      {
        pregunta: "¿Cómo publico una idea musical?",
        respuesta:
          "En móvil toca el botón central de publicar. En escritorio entra a la opción de publicación disponible en tu panel. Selecciona el audio y completa el título, descripción, BPM, tonalidad, rol buscado, género, idioma, modalidad, ubicación si es presencial y tipo de acuerdo.",
      },
      {
        pregunta: "¿Qué formatos de audio puedo subir?",
        respuesta:
          "Puedes seleccionar archivos MP3, WAV, FLAC, M4A, AAC, OGG, AIFF u OPUS. FeatMusic procesa el archivo y guarda una versión optimizada en MP3 para facilitar su reproducción y descarga.",
      },
      {
        pregunta: "¿Cuánto puede pesar y durar el audio?",
        respuesta:
          "El archivo original puede pesar hasta 50 MB y el audio no puede durar más de 4 minutos. Si supera alguno de esos límites, la publicación será rechazada antes de guardarse.",
      },
      {
        pregunta: "¿La portada de la idea es obligatoria?",
        respuesta:
          "No. La portada es opcional. Cuando decidas usar una, debe ser JPG, PNG o WebP y no puede pesar más de 5 MB.",
      },
      {
        pregunta: "¿Cuántas ideas puedo mantener activas?",
        respuesta:
          "El límite actual del plan gratuito es de 3 ideas activas. Para publicar otra, primero debes eliminar una publicación activa o esperar a que termine su vigencia.",
      },
      {
        pregunta: "¿Cuánto tiempo permanece activa una idea?",
        respuesta:
          "Cada idea se publica con una vigencia de 60 días. Después de ese tiempo deja de considerarse activa.",
      },
      {
        pregunta: "¿Puedo eliminar una idea si me equivoqué?",
        respuesta:
          "Sí. En tu perfil privado, dentro de la pestaña Activas, utiliza Eliminar en la tarjeta correspondiente. Revisa bien antes de confirmar porque la publicación y sus datos relacionados pueden dejar de estar disponibles.",
      },
      {
        pregunta: "¿Qué significa cada dato de colaboración?",
        respuesta:
          "El rol indica a quién buscas; el género y el idioma explican el estilo de la propuesta; la modalidad define si será remota o presencial; la ubicación se usa cuando necesitas trabajar presencialmente; y el tipo de acuerdo aclara si la colaboración es gratuita, por regalías o pagada.",
      },
      {
        pregunta: "¿Cómo consigo propuestas más útiles?",
        respuesta:
          "Usa un título específico, describe qué parte está terminada y qué necesitas del otro artista. Indica referencias, tono creativo, expectativas y tipo de acuerdo. Un audio claro y una descripción concreta reducen propuestas que no encajan.",
      },
    ],
  },
  {
    id: "propuestas",
    titulo: "Propuestas y colaboración",
    descripcion:
      "Envía una versión, responde correctamente y entiende qué ocurre con cada cupo.",
    icono: "propuestas",
    preguntas: [
      {
        pregunta: "¿Cómo envío una propuesta?",
        respuesta:
          "Abre una idea y selecciona Enviar propuesta. Adjunta el audio que quieres presentar y escribe un mensaje breve que explique qué hiciste, qué puedes aportar y cómo te gustaría continuar la colaboración.",
      },
      {
        pregunta: "¿Dónde veo mis propuestas?",
        respuesta:
          "En tu perfil privado encontrarás las pestañas Enviadas y Recibidas. Enviadas muestra lo que presentaste a otros artistas; Recibidas muestra las versiones que llegaron a tus propias ideas.",
      },
      {
        pregunta: "¿Qué significan los estados de una propuesta?",
        respuesta:
          "Pendiente significa que todavía no fue respondida. Aceptada confirma la colaboración y abre la continuación por chat. Cambios solicitados indica que el propietario espera una nueva versión. Rechazada significa que la versión no fue seleccionada; el mensaje mostrará si existe o no otra oportunidad.",
      },
      {
        pregunta: "¿Puedo cancelar una propuesta enviada por error?",
        respuesta:
          "Sí, pero únicamente mientras continúe pendiente. Al cancelarla se elimina la propuesta, el cupo vuelve a quedar libre y puedes preparar un audio nuevo.",
      },
      {
        pregunta: "¿Qué ocurre cuando solicitan cambios?",
        respuesta:
          "El motivo aparecerá en tu propuesta para que sepas qué debes corregir. El cupo sigue reservado mientras preparas una nueva versión. La plataforma permite un máximo de 2 intentos por persona para la misma idea.",
      },
      {
        pregunta: "¿Qué ocurre cuando una propuesta es aceptada?",
        respuesta:
          "La aceptación es definitiva, el cupo queda ocupado y FeatMusic crea o conecta una conversación privada entre los dos artistas. Desde allí pueden continuar coordinando la colaboración.",
      },
      {
        pregunta: "¿Qué diferencia hay entre rechazar con o sin reintento?",
        respuesta:
          "Si el propietario permite otro intento, el cupo se libera y puedes volver a participar si aún hay espacio disponible y no agotaste tus intentos. Si el rechazo es definitivo, ya no podrás presentar otra propuesta para esa misma idea.",
      },
      {
        pregunta: "¿Qué audio conviene enviar?",
        respuesta:
          "Envía una versión que permita escuchar claramente tu aporte. Evita archivos vacíos, pruebas demasiado cortas o mezclas donde tu parte no pueda distinguirse. Incluye en el mensaje qué cambiaste y qué falta por terminar.",
      },
    ],
  },
  {
    id: "mensajes",
    titulo: "Mensajes, notificaciones y seguimiento",
    descripcion:
      "Mantén el contacto, identifica novedades y vuelve rápidamente a tus conversaciones.",
    icono: "mensajes",
    preguntas: [
      {
        pregunta: "¿Cuándo se crea una conversación?",
        respuesta:
          "Cuando el propietario acepta una propuesta, FeatMusic crea o reutiliza una conversación privada entre ambos artistas y conecta la propuesta aceptada con ese chat.",
      },
      {
        pregunta: "¿Dónde encuentro los mensajes?",
        respuesta:
          "Entra a Mensajes desde la navegación principal. Allí verás tus conversaciones ordenadas por actividad reciente y podrás abrir la que corresponda al artista con el que estás trabajando.",
      },
      {
        pregunta: "¿Para qué sirven las notificaciones?",
        respuesta:
          "Te avisan sobre eventos importantes como nuevas propuestas, decisiones, solicitudes de cambios, seguidores y actividad relacionada con tus colaboraciones. Tocar una notificación puede llevarte directamente a la sección correspondiente.",
      },
      {
        pregunta: "¿Por qué aparece una notificación como no leída?",
        respuesta:
          "Permanece pendiente hasta que abres o marcas la información relacionada. Si el contador no cambia inmediatamente, actualiza la página y revisa tanto Notificaciones como Mensajes.",
      },
      {
        pregunta: "¿Qué sucede cuando sigo a un artista?",
        respuesta:
          "El artista se añade a tu lista de seguidos y su contador de seguidores aumenta. FeatMusic también puede utilizar esa relación para mostrarte actividad o avisarte cuando publique nuevas ideas.",
      },
      {
        pregunta: "¿Puedo guardar una idea para verla después?",
        respuesta:
          "Sí. Usa Guardar en la publicación. La idea quedará asociada a tu cuenta para que puedas encontrarla nuevamente mientras continúe disponible.",
      },
    ],
  },
  {
    id: "seguridad",
    titulo: "Seguridad y reportes",
    descripcion:
      "Protege la comunidad e informa comportamientos que no deberían estar en FeatMusic.",
    icono: "seguridad",
    preguntas: [
      {
        pregunta: "¿Qué situaciones puedo reportar?",
        respuesta:
          "Puedes informar spam, suplantación, acoso, contenido robado, contenido inapropiado u otra conducta que afecte la seguridad o la confianza dentro de la plataforma.",
      },
      {
        pregunta: "¿Cómo reporto a un usuario?",
        respuesta:
          "Abre Reportar un usuario desde el menú Más. Escribe su nombre de usuario, selecciona el motivo y explica lo ocurrido con suficiente detalle. Debes iniciar sesión para enviar el reporte.",
      },
      {
        pregunta: "¿Qué debería escribir en la descripción del reporte?",
        respuesta:
          "Explica qué ocurrió, dónde sucedió y por qué consideras que debe revisarse. La descripción debe tener al menos 20 caracteres y puede incluir hasta 1000. No compartas contraseñas ni datos financieros.",
      },
      {
        pregunta: "¿Puedo enviar varios reportes sobre la misma persona?",
        respuesta:
          "No puedes repetir inmediatamente un reporte pendiente sobre el mismo usuario. Esto evita duplicados y permite que cada caso se revise con más claridad.",
      },
      {
        pregunta: "¿Existe un límite de reportes?",
        respuesta:
          "Sí. Una cuenta puede enviar hasta 5 reportes en un periodo de 24 horas. El límite ayuda a reducir el abuso del formulario.",
      },
      {
        pregunta: "¿Puedo reportar mi propia cuenta?",
        respuesta:
          "No. El formulario está diseñado para informar conductas de otros usuarios. Para problemas con tu propia cuenta utiliza las opciones de recuperación o la sección de ayuda.",
      },
      {
        pregunta: "¿Qué hago si alguien me pide mi contraseña?",
        respuesta:
          "No la compartas. FeatMusic no necesita que entregues tu contraseña a otro artista para colaborar. Cambia la contraseña si crees que alguien pudo conocerla y evita abrir enlaces sospechosos enviados por mensajes.",
      },
    ],
  },
  {
    id: "planes",
    titulo: "Planes y límites",
    descripcion:
      "Compara la capacidad disponible y entiende qué está activo actualmente.",
    icono: "planes",
    preguntas: [
      {
        pregunta: "¿Qué incluye el plan gratuito?",
        respuesta:
          "La página de planes presenta el plan gratuito con hasta 3 ideas activas, hasta 3 propuestas por cada idea y sin comisión por colaborar.",
      },
      {
        pregunta: "¿Qué muestran Creator y Pro?",
        respuesta:
          "Creator presenta más espacios para ideas y propuestas. Pro añade una capacidad mayor, perfil destacado y propuestas extra cuando una idea alcanza su límite normal.",
      },
      {
        pregunta: "¿Ya puedo pagar una suscripción?",
        respuesta:
          "Por ahora la página de planes es informativa. Los precios y beneficios se muestran para presentar la estructura propuesta, pero los pagos y las suscripciones no se activan hasta que FeatMusic conecte oficialmente un sistema de cobros.",
        nota:
          "No realices pagos por fuera de la plataforma a personas que prometan activar un plan.",
      },
      {
        pregunta: "¿FeatMusic cobra comisión por colaborar?",
        respuesta:
          "Los planes publicados indican que no existe comisión por colaborar. Cualquier pago directo entre artistas por una colaboración depende del tipo de acuerdo elegido y de lo que ambas partes definan.",
      },
    ],
  },
];

function IconoCategoria({
  tipo,
  className = "h-5 w-5",
}: {
  tipo: Categoria["icono"];
  className?: string;
}) {
  if (tipo === "inicio") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20c.8-4.4 3.2-6.5 7-6.5s6.2 2.1 7 6.5" />
        <path d="M18 4h3M19.5 2.5v3" />
      </svg>
    );
  }

  if (tipo === "ideas") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18V5l11-2v13" />
        <ellipse cx="6" cy="18" rx="3" ry="2" />
        <ellipse cx="17" cy="16" rx="3" ry="2" />
      </svg>
    );
  }

  if (tipo === "propuestas") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5h16v14H4z" />
        <path d="m4 7 8 6 8-6" />
        <path d="M8 16h8" />
      </svg>
    );
  }

  if (tipo === "mensajes") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16v12H8l-4 4V4Z" />
        <path d="M8 8h8M8 12h5" />
      </svg>
    );
  }

  if (tipo === "seguridad") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3 5 6v5c0 4.8 2.7 8 7 10 4.3-2 7-5.2 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8h16v11H4z" />
      <path d="M7 8V5h10v3M8 13h8M8 16h5" />
    </svg>
  );
}

function IconoFlecha() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function AyudaPage() {
  return (
    <main className="featmusic-secondary-page min-h-[100dvh] bg-[#d8dee7] text-slate-900">
      <EncabezadoSecundario />

      <section className="relative overflow-hidden border-b border-slate-300/70 bg-[linear-gradient(145deg,#07120e,#020504)] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(16,185,129,.22),transparent_30%),radial-gradient(circle_at_88%_80%,rgba(52,211,153,.12),transparent_28%)]"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
            Centro de ayuda
          </span>

          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Aprende a usar FeatMusic y lleva tus colaboraciones más lejos.
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 sm:text-base">
            Encuentra respuestas sobre tu perfil, publicación de ideas,
            propuestas, mensajes, seguridad y planes. Empieza por la guía
            rápida o entra directamente al tema que necesitas.
          </p>

          <nav
            aria-label="Categorías de ayuda"
            className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categorias.map((categoria) => (
              <a
                key={categoria.id}
                href={`#${categoria.id}`}
                className="group flex min-h-16 touch-manipulation items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-emerald-400/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
                  <IconoCategoria tipo={categoria.icono} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black text-white">
                    {categoria.titulo}
                  </span>
                  <span className="mt-0.5 block truncate text-[9px] text-white/45">
                    {categoria.preguntas.length} respuestas
                  </span>
                </span>
                <span className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-emerald-300">
                  <IconoFlecha />
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_55px_rgba(15,23,42,.08)] sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                Guía rápida
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                De tu perfil a una colaboración en 6 pasos
              </h2>
            </div>
            <p className="max-w-sm text-xs leading-5 text-slate-500">
              Este es el recorrido recomendado para empezar a recibir y enviar
              oportunidades de manera clara.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pasosRapidos.map((paso) => (
              <article
                key={paso.numero}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <span className="absolute right-3 top-2 text-3xl font-black text-slate-200">
                  {paso.numero}
                </span>
                <h3 className="relative pr-10 text-sm font-black text-slate-950">
                  {paso.titulo}
                </h3>
                <p className="relative mt-2 text-[11px] leading-5 text-slate-600">
                  {paso.descripcion}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {categorias.map((categoria) => (
            <section
              key={categoria.id}
              id={categoria.id}
              className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,.065)] sm:p-7"
            >
              <header className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                  <IconoCategoria tipo={categoria.icono} className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-950">
                    {categoria.titulo}
                  </h2>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">
                    {categoria.descripcion}
                  </p>
                </div>
              </header>

              <div className="mt-5 space-y-3">
                {categoria.preguntas.map((item) => (
                  <details
                    key={item.pregunta}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 open:border-emerald-200 open:bg-white"
                  >
                    <summary className="flex min-h-14 cursor-pointer list-none touch-manipulation items-center justify-between gap-4 px-4 py-3 text-sm font-black text-slate-900 marker:hidden">
                      <span>{item.pregunta}</span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-base text-emerald-700 transition group-open:rotate-45 group-open:border-emerald-200 group-open:bg-emerald-50">
                        +
                      </span>
                    </summary>

                    <div className="border-t border-slate-200 px-4 py-4">
                      <p className="text-xs leading-6 text-slate-600">
                        {item.respuesta}
                      </p>

                      {item.nota && (
                        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] font-semibold leading-5 text-amber-900">
                          Importante: {item.nota}
                        </p>
                      )}
                    </div>
                  </details>
                ))}
              </div>

              <div className="mt-5 text-right">
                <a
                  href="#top"
                  className="inline-flex touch-manipulation items-center gap-1 text-[10px] font-black text-emerald-700 hover:text-emerald-800"
                >
                  Volver arriba
                  <span aria-hidden="true">↑</span>
                </a>
              </div>
            </section>
          ))}
        </div>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-900 bg-slate-950 p-6 text-white shadow-[0_20px_55px_rgba(15,23,42,.18)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                Accesos útiles
              </span>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                ¿Necesitas revisar una regla o informar un problema?
              </h2>
              <p className="mt-3 max-w-2xl text-xs leading-6 text-white/60">
                Utiliza las páginas oficiales dentro de FeatMusic para enviar
                reportes, conocer los planes y consultar la información legal
                de la plataforma.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <Link
                href="/reportar-usuario"
                className="flex min-h-12 touch-manipulation items-center justify-between rounded-xl border border-red-300/15 bg-red-400/[0.08] px-4 text-xs font-black text-red-100 transition hover:border-red-300/30 hover:bg-red-400/15"
              >
                Reportar un usuario
                <IconoFlecha />
              </Link>
              <Link
                href="/planes"
                className="flex min-h-12 touch-manipulation items-center justify-between rounded-xl border border-amber-300/15 bg-amber-400/[0.08] px-4 text-xs font-black text-amber-100 transition hover:border-amber-300/30 hover:bg-amber-400/15"
              >
                Ver planes
                <IconoFlecha />
              </Link>
              <Link
                href="/terminos"
                className="flex min-h-12 touch-manipulation items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-4 text-xs font-black text-white transition hover:bg-white/10"
              >
                Términos y condiciones
                <IconoFlecha />
              </Link>
              <Link
                href="/privacidad"
                className="flex min-h-12 touch-manipulation items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-4 text-xs font-black text-white transition hover:bg-white/10"
              >
                Política de privacidad
                <IconoFlecha />
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
