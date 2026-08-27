export const PLANES_FEATMUSIC = {
  GRATUITO: {
    nombre: "Gratuito",
    ideasActivas: 3,
    propuestasPorIdea: 3,
    puedeEnviarConCuposCompletos: false,
    precioCop: 0,
  },
  CREATOR: {
    nombre: "Creator",
    ideasActivas: 10,
    propuestasPorIdea: 10,
    puedeEnviarConCuposCompletos: false,
    precioCop: 9_900,
  },
  PRO: {
    nombre: "Pro",
    ideasActivas: 20,
    propuestasPorIdea: 20,
    // FEATMUSIC_PRO_CUPOS_COMPLETOS_V1
    puedeEnviarConCuposCompletos: true,
    precioCop: 19_990,
  },
} as const;

export type PlanFeatMusic = keyof typeof PLANES_FEATMUSIC;
export type PlanPagoFeatMusic = Exclude<PlanFeatMusic, "GRATUITO">;

export function normalizarPlan(plan: string | null | undefined): PlanFeatMusic {
  if (plan && plan in PLANES_FEATMUSIC) {
    return plan as PlanFeatMusic;
  }

  // Ante cualquier valor desconocido, usamos el plan más restrictivo.
  return "GRATUITO";
}

export function esPlanPago(plan: string | null | undefined): plan is PlanPagoFeatMusic {
  return plan === "CREATOR" || plan === "PRO";
}

export function obtenerLimitesPlan(plan: string | null | undefined) {
  const planNormalizado = normalizarPlan(plan);
  return PLANES_FEATMUSIC[planNormalizado];
}

export function obtenerDatosPagoPlan(plan: PlanPagoFeatMusic) {
  const datos = PLANES_FEATMUSIC[plan];

  return {
    plan,
    nombre: datos.nombre,
    montoCop: datos.precioCop,
    motivo: `FeatMusic ${datos.nombre}`,
  } as const;
}


export function formatearPrecioCop(precioCop: number) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(precioCop);
}
