"use client";

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
};

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
}: ResumenColaboracionIdeaProps) {
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
              ? "rounded-full border border-violet-400/15 bg-violet-500/[0.065] px-2 py-0.5 text-[8px] font-semibold text-violet-200/85"
              : "rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-2.5 py-1 text-[9px] font-semibold text-violet-100/90 sm:text-[10px]"
          }
        >
          {detalle}
        </span>
      ))}
    </div>
  );
}
