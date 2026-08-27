// FEATMUSIC_ADMIN_FASE2_MODERACION_V1

export type DatosEstadoCuenta = {
  estadoCuenta: string;
  suspendidoHasta: Date | null;
};

export type RestriccionCuenta =
  | {
      tipo: "BLOQUEADA";
      suspendidoHasta: null;
    }
  | {
      tipo: "SUSPENDIDA";
      suspendidoHasta: Date;
    };

export function evaluarRestriccionCuenta(
  datos: DatosEstadoCuenta,
  ahora = new Date(),
): RestriccionCuenta | null {
  if (datos.estadoCuenta === "BLOQUEADA") {
    return {
      tipo: "BLOQUEADA",
      suspendidoHasta: null,
    };
  }

  if (datos.suspendidoHasta && datos.suspendidoHasta.getTime() > ahora.getTime()) {
    return {
      tipo: "SUSPENDIDA",
      suspendidoHasta: datos.suspendidoHasta,
    };
  }

  return null;
}

export function suspensionYaVencio(
  datos: DatosEstadoCuenta,
  ahora = new Date(),
) {
  return Boolean(
    datos.suspendidoHasta &&
      datos.suspendidoHasta.getTime() <= ahora.getTime(),
  );
}
