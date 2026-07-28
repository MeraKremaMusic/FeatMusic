export type PropuestaFeed = {
  estado: string;
  motivoDecision: string | null;
  permiteReintento: boolean;
  numeroIntento: number;
};

export type CompatibilidadFeed = {
  porcentaje: number;
  razones: string[];
};

export type OportunidadFeed = {
  id: number;
  titulo: string;
  descripcion: string;
  audioUrl: string;
  duracionSegundos: number;
  bpm: number;
  tonalidad: string;
  rolBuscado: string | null;
  generoMusical: string | null;
  idiomaBuscado: string | null;
  modalidadColaboracion: string | null;
  paisPreferido: string | null;
  departamentoPreferido: string | null;
  ciudadPreferida: string | null;
  tipoAcuerdo: string | null;
  creadoEn: string;
  expiraEn: string;
  propuestasActuales: number;
  vistasUnicas: number;
  guardada: boolean;
  propuestaUsuario: PropuestaFeed | null;
  esSeguido: boolean;
  compatibilidad: CompatibilidadFeed;
  artista: {
    id: number;
    nombreArtistico: string;
    nombreUsuario: string;
    fotoPerfil: string | null;
    ciudad: string;
    pais: string;
    rol: string;
    generos: string[];
  };
};

export type PerfilParaCompatibilidad = {
  rolPrincipal: string;
  generos: string[];
  idiomaPrincipal: string | null;
  tipoColaboracion: string | null;
  pais: string | null;
  ciudad: string | null;
};

export type IdeaParaCompatibilidad = {
  rolBuscado: string | null;
  generoMusical: string | null;
  idiomaBuscado: string | null;
  modalidadColaboracion: string | null;
  paisPreferido: string | null;
  ciudadPreferida: string | null;
};

function normalizar(valor: string | null | undefined) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es");
}

function codigoIdiomaPerfil(idioma: string | null | undefined) {
  const idiomaNormalizado = normalizar(idioma);

  if (idiomaNormalizado === "espanol") return "ESPANOL";
  if (idiomaNormalizado === "english" || idiomaNormalizado === "ingles") {
    return "INGLES";
  }
  if (
    idiomaNormalizado === "portugues" ||
    idiomaNormalizado === "portuguese"
  ) {
    return "PORTUGUES";
  }

  return "";
}

export function obtenerGenerosPerfil(generos: unknown): string[] {
  if (!Array.isArray(generos)) return [];

  return generos
    .filter((genero): genero is string => typeof genero === "string")
    .map((genero) => genero.trim())
    .filter(Boolean);
}

export function calcularCompatibilidad(
  perfil: PerfilParaCompatibilidad,
  idea: IdeaParaCompatibilidad,
): CompatibilidadFeed {
  let puntos = 0;
  const razones: string[] = [];

  if (
    idea.rolBuscado &&
    normalizar(idea.rolBuscado) === normalizar(perfil.rolPrincipal)
  ) {
    puntos += 40;
    razones.push("Busca tu rol");
  }

  const generoCoincidente = perfil.generos.find(
    (genero) => normalizar(genero) === normalizar(idea.generoMusical),
  );

  if (generoCoincidente) {
    puntos += 25;
    razones.push(`Coincide con ${generoCoincidente}`);
  }

  const idiomaPerfil = codigoIdiomaPerfil(perfil.idiomaPrincipal);
  if (
    idea.idiomaBuscado === "CUALQUIERA" ||
    (idiomaPerfil && idea.idiomaBuscado === idiomaPerfil)
  ) {
    puntos += 15;
    razones.push(
      idea.idiomaBuscado === "CUALQUIERA"
        ? "Acepta cualquier idioma"
        : "Coincide con tu idioma",
    );
  }

  if (
    perfil.tipoColaboracion === "BUSCO_COLABORAR" ||
    perfil.tipoColaboracion === "AMBAS"
  ) {
    puntos += 10;
    razones.push("Tu perfil busca colaborar");
  }

  if (idea.modalidadColaboracion === "REMOTA") {
    puntos += 10;
    razones.push("Se puede hacer a distancia");
  } else if (idea.modalidadColaboracion === "PRESENCIAL") {
    const mismaCiudad =
      normalizar(perfil.ciudad) &&
      normalizar(perfil.ciudad) === normalizar(idea.ciudadPreferida);
    const mismoPais =
      normalizar(perfil.pais) &&
      normalizar(perfil.pais) === normalizar(idea.paisPreferido);

    if (mismaCiudad) {
      puntos += 10;
      razones.push("Está en tu ciudad");
    } else if (mismoPais) {
      puntos += 5;
      razones.push("Está en tu país");
    }
  }

  return {
    porcentaje: Math.max(0, Math.min(100, puntos)),
    razones,
  };
}
