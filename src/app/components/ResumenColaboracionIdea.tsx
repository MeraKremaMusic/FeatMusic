import {
  formatearIdiomaBuscado,
  formatearModalidadColaboracion,
  formatearRolBuscado,
  formatearTipoAcuerdo,
  formatearUbicacionPreferida,
  type DatosColaboracionIdea,
} from "@/lib/colaboracion-ideas";

type ResumenColaboracionIdeaProps = DatosColaboracionIdea & {
  compacta?: boolean;
  className?: string;
  variante?: "etiquetas" | "frase";
};

function minuscula(texto: string) {
  return texto.charAt(0).toLocaleLowerCase("es") + texto.slice(1);
}

export function crearFraseColaboracion({
  rolBuscado,
  generoMusical,
  idiomaBuscado,
  modalidadColaboracion,
  paisPreferido,
  departamentoPreferido,
  ciudadPreferida,
  tipoAcuerdo,
}: DatosColaboracionIdea) {
  const rol = formatearRolBuscado(rolBuscado);
  const idioma = formatearIdiomaBuscado(idiomaBuscado);
  const ubicacion = formatearUbicacionPreferida({
    ciudadPreferida,
    departamentoPreferido,
    paisPreferido,
  });
  const genero = generoMusical?.trim();

  let frase = rol
    ? `Busca ${minuscula(rol)}`
    : genero
      ? "Busca talento musical"
      : "Busca una colaboración musical";

  if (genero) {
    frase += rol ? ` de ${genero.toLocaleLowerCase("es")}` : ` especializado en ${genero.toLocaleLowerCase("es")}`;
  }

  if (idiomaBuscado === "ESPANOL") {
    frase +=
      rolBuscado === "CANTANTE"
        ? " que cante en español"
        : rolBuscado === "COMPOSITOR"
          ? " que componga en español"
          : " que trabaje en español";
  } else if (idiomaBuscado === "INGLES") {
    frase +=
      rolBuscado === "CANTANTE"
        ? " que cante en inglés"
        : rolBuscado === "COMPOSITOR"
          ? " que componga en inglés"
          : " que trabaje en inglés";
  } else if (idiomaBuscado === "PORTUGUES") {
    frase +=
      rolBuscado === "CANTANTE"
        ? " que cante en portugués"
        : rolBuscado === "COMPOSITOR"
          ? " que componga en portugués"
          : " que trabaje en portugués";
  } else if (idiomaBuscado === "CUALQUIERA") {
    frase += " sin restricción de idioma";
  } else if (idioma) {
    frase += ` que trabaje en ${minuscula(idioma)}`;
  }

  if (modalidadColaboracion === "REMOTA") {
    frase += ubicacion
      ? `, con disponibilidad para colaborar a distancia y preferencia por artistas ubicados en ${ubicacion}`
      : ", con disponibilidad para colaborar a distancia desde cualquier lugar";
  } else if (modalidadColaboracion === "PRESENCIAL") {
    frase += ubicacion
      ? `, para colaborar de forma presencial en ${ubicacion}`
      : ", para colaborar de forma presencial";
  } else if (ubicacion) {
    frase += `, preferiblemente ubicado en ${ubicacion}`;
  }

  frase += ".";

  if (tipoAcuerdo === "REGALIAS") {
    frase += " El acuerdo propuesto contempla reparto de regalías.";
  } else if (tipoAcuerdo === "GRATUITA") {
    frase += " La colaboración se plantea sin pago inicial.";
  } else if (tipoAcuerdo === "PAGADO") {
    frase += " El trabajo será remunerado.";
  } else {
    const acuerdo = formatearTipoAcuerdo(tipoAcuerdo);
    if (acuerdo) {
      frase += ` Modalidad de acuerdo: ${minuscula(acuerdo)}.`;
    }
  }

  return frase;
}

export default function ResumenColaboracionIdea({
  rolBuscado,
  generoMusical,
  idiomaBuscado,
  modalidadColaboracion,
  paisPreferido,
  departamentoPreferido,
  ciudadPreferida,
  tipoAcuerdo,
  compacta = false,
  className = "",
  variante = "etiquetas",
}: ResumenColaboracionIdeaProps) {
  if (variante === "frase") {
    const frase = crearFraseColaboracion({
      rolBuscado,
      generoMusical,
      idiomaBuscado,
      modalidadColaboracion,
      paisPreferido,
      departamentoPreferido,
      ciudadPreferida,
      tipoAcuerdo,
    });

    return (
      <div
        className={`mt-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 ${className}`.trim()}
        aria-label="Resumen de la colaboración buscada"
      >
        <p className="text-[10px] leading-4 text-slate-600 sm:text-[11px] sm:leading-[1.15rem]">
          <span className="font-black text-slate-800">Colaboración buscada:</span>{" "}
          {frase}
        </p>
      </div>
    );
  }

  const rol = formatearRolBuscado(rolBuscado);
  const idioma = formatearIdiomaBuscado(idiomaBuscado);
  const modalidad = formatearModalidadColaboracion(modalidadColaboracion);
  const acuerdo = formatearTipoAcuerdo(tipoAcuerdo);
  const ubicacion = formatearUbicacionPreferida({
    ciudadPreferida,
    departamentoPreferido,
    paisPreferido,
  });

  const detalles = [
    rol ? `Busca ${rol}` : null,
    generoMusical?.trim() || null,
    idioma,
    modalidad,
    acuerdo,
    ubicacion,
  ].filter((detalle): detalle is string => Boolean(detalle));

  if (detalles.length === 0) return null;

  return (
    <div
      className={`${compacta ? "mt-2 gap-1" : "mt-2.5 gap-1.5"} flex flex-wrap ${className}`.trim()}
      aria-label="Datos de la colaboración buscada"
    >
      {detalles.map((detalle, indice) => (
        <span
          key={`${detalle}-${indice}`}
          className={
            compacta
              ? "rounded-full border border-emerald-400/15 bg-emerald-500/[0.065] px-2 py-0.5 text-[8px] font-semibold text-emerald-200/85"
              : "rounded-full border border-emerald-400/20 bg-emerald-500/[0.08] px-2.5 py-1 text-[9px] font-semibold text-emerald-100/90 sm:text-[10px]"
          }
        >
          {detalle}
        </span>
      ))}
    </div>
  );
}
