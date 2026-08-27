/**
 * Organiza la tarjeta “Perfil del artista” usando los datos disponibles
 * en la tabla Usuario.
 *
 * Ejecutar desde la raíz del proyecto:
 *
 * node aplicar-perfil-completo.js
 *
 * Modifica:
 * src/app/panel/page.tsx
 *
 * Crea una copia de seguridad:
 * src/app/panel/page.tsx.backup-perfil-completo
 */

const fs = require("fs");
const path = require("path");

const pagePath = path.join(
  process.cwd(),
  "src",
  "app",
  "panel",
  "page.tsx",
);

const backupPath = `${pagePath}.backup-perfil-completo`;

if (!fs.existsSync(pagePath)) {
  console.error(`No se encontró el archivo: ${pagePath}`);
  process.exit(1);
}

let content = fs.readFileSync(pagePath, "utf8");

/**
 * Agregamos una función para convertir las fechas
 * de la base de datos a un formato legible.
 */
if (!content.includes("function formatearFecha(")) {
  const marker = "type IconoTipo =";

  const helper = `function formatearFecha(
  fecha: Date | string | null | undefined,
) {
  if (!fecha) {
    return "Sin registrar";
  }

  const fechaConvertida =
    fecha instanceof Date ? fecha : new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return "Sin registrar";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fechaConvertida);
}

`;

  if (!content.includes(marker)) {
    console.error(
      'No se encontró "type IconoTipo =" dentro de page.tsx.',
    );
    process.exit(1);
  }

  content = content.replace(marker, helper + marker);
}

/**
 * Buscamos el bloque donde se prepara la ubicación.
 */
const variablesMarker = `  const ubicacion =
    [usuario.ciudad, usuario.pais].filter(Boolean).join(", ") ||
    "Ubicación sin completar";
`;

const variablesNuevas = `  const ubicacion =
    [usuario.ciudad, usuario.pais].filter(Boolean).join(", ") ||
    "Ubicación sin completar";

  const nombreReal =
    usuario.nombre?.trim() || "Sin completar";

  const idioma =
    usuario.idiomaPrincipal?.trim() || "Sin completar";

  const tipoColaboracion =
    usuario.tipoColaboracion?.trim() || "Sin completar";

  const fechaRegistro =
    formatearFecha(usuario.creadoEn);

  const fechaActualizacion =
    formatearFecha(usuario.actualizadoEn);

  const fechaTerminos =
    formatearFecha(usuario.aceptoTerminosEn);
`;

if (
  !content.includes(
    "const fechaRegistro =\n    formatearFecha(usuario.creadoEn);",
  )
) {
  if (!content.includes(variablesMarker)) {
    console.error(
      "No se encontró el bloque de variables del usuario.",
    );
    process.exit(1);
  }

  content = content.replace(
    variablesMarker,
    variablesNuevas,
  );
}

/**
 * Identificamos la primera y la segunda tarjeta del carrusel.
 */
const cardMarker =
  '<section className="min-h-0 w-full shrink-0 snap-center';

const firstCardStart = content.indexOf(cardMarker);

if (firstCardStart === -1) {
  console.error(
    "No se encontró la primera tarjeta del carrusel.",
  );
  process.exit(1);
}

const secondCardStart = content.indexOf(
  cardMarker,
  firstCardStart + cardMarker.length,
);

if (secondCardStart === -1) {
  console.error(
    "No se encontró la segunda tarjeta del carrusel.",
  );
  process.exit(1);
}

/**
 * Nueva tarjeta del perfil.
 */
const newProfileCard = `          <section className="min-h-0 w-full shrink-0 snap-center overflow-y-auto rounded-[18px] border border-white/15 bg-[#0d0913]/95 p-4 shadow-xl shadow-black/25 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:min-w-0 lg:shrink">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 lg:text-[9px]">
                <Icono
                  tipo="perfil"
                  className="h-3.5 w-3.5 text-violet-400"
                />

                <span className="text-violet-400">
                  1
                </span>

                Perfil del artista
              </div>

              <span
                className={\`rounded-full border px-2.5 py-1 text-[10px] font-bold \${
                  usuario.perfilCompleto
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                    : "border-amber-400/25 bg-amber-400/10 text-amber-300"
                }\`}
              >
                {usuario.perfilCompleto
                  ? "Perfil completo"
                  : "Perfil pendiente"}
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-violet-300/40 bg-gradient-to-br from-violet-700 to-fuchsia-500 text-[26px] font-black shadow-xl shadow-violet-950/40 lg:h-16 lg:w-16 lg:text-2xl">
                {iniciales}

                {usuario.correoVerificado && (
                  <span
                    title="Correo verificado"
                    className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-[#0d0913] bg-violet-500 text-[11px] font-black"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[21px] font-black leading-tight tracking-tight lg:text-lg">
                  {nombreArtistico}
                </h1>

                <p className="mt-1 truncate text-[12px] text-zinc-400 lg:text-[10px]">
                  @{usuarioPublico}
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200 lg:text-[10px]">
                    {rol}
                  </span>

                  <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-200 lg:text-[10px]">
                    {tipoColaboracion}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Nombre
                </p>

                <p className="mt-1 truncate text-[12px] font-semibold text-zinc-200">
                  {nombreReal}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Rol principal
                </p>

                <p className="mt-1 truncate text-[12px] font-semibold text-zinc-200">
                  {rol}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Géneros musicales
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {(generos.length > 0
                  ? generos
                  : ["Sin completar"]
                ).map((genero) => (
                  <span
                    key={genero}
                    className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-medium text-violet-200"
                  >
                    {genero}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <Icono
                    tipo="ubicacion"
                    className="h-4 w-4"
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Ciudad y país
                  </p>

                  <p className="truncate text-[12px] font-semibold text-zinc-200">
                    {ubicacion}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <Icono
                    tipo="mundo"
                    className="h-4 w-4"
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Idioma principal
                  </p>

                  <p className="truncate text-[12px] font-semibold text-zinc-200">
                    {idioma}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <Icono
                    tipo="musica"
                    className="h-4 w-4"
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Tipo de colaboración
                  </p>

                  <p className="truncate text-[12px] font-semibold text-zinc-200">
                    {tipoColaboracion}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                    Correo de la cuenta
                  </p>

                  <p className="mt-1 break-all text-[11px] font-semibold text-zinc-300">
                    {usuario.correo}
                  </p>
                </div>

                <span
                  className={\`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold \${
                    usuario.correoVerificado
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-amber-400/10 text-amber-300"
                  }\`}
                >
                  {usuario.correoVerificado
                    ? "Verificado"
                    : "Pendiente"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                  Miembro desde
                </p>

                <p className="mt-1 text-[11px] font-semibold text-zinc-200">
                  {fechaRegistro}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                  Última actualización
                </p>

                <p className="mt-1 text-[11px] font-semibold text-zinc-200">
                  {fechaActualizacion}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                  Términos aceptados
                </p>

                <p className="mt-1 text-[11px] font-semibold text-zinc-200">
                  {fechaTerminos}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                  ID de cuenta
                </p>

                <p className="mt-1 text-[11px] font-semibold text-zinc-200">
                  #{usuario.id}
                </p>
              </div>
            </div>
          </section>

`;

/**
 * Creamos la copia de seguridad y reemplazamos
 * únicamente la primera tarjeta.
 */
fs.copyFileSync(pagePath, backupPath);

content =
  content.slice(0, firstCardStart) +
  newProfileCard +
  content.slice(secondCardStart);

fs.writeFileSync(pagePath, content, "utf8");

console.log("");
console.log("Perfil completo aplicado correctamente.");
console.log(`Archivo modificado: ${pagePath}`);
console.log(`Copia de seguridad: ${backupPath}`);
console.log("");
console.log(
  "El campo passwordHash no se muestra por seguridad.",
);