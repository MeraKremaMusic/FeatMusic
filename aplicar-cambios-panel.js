#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const pagePath = path.join(root, "src", "app", "panel", "page.tsx");
const cardPath = path.join(
  root,
  "src",
  "app",
  "panel",
  "components",
  "PerfilArtistaCard.tsx",
);

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo: ${filePath}`);
  }
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n");
}

function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first === -1) {
    throw new Error(
      `${label}: no se encontró el bloque esperado. ` +
        "Es posible que el repositorio haya cambiado o que el ajuste ya esté aplicado.",
    );
  }

  const second = text.indexOf(before, first + before.length);
  if (second !== -1) {
    throw new Error(`${label}: se encontraron varios bloques y no es seguro continuar.`);
  }

  return text.slice(0, first) + after + text.slice(first + before.length);
}

function replaceRegexOnce(text, regex, replacement, label) {
  const matches = [...text.matchAll(new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`))];

  if (matches.length !== 1) {
    throw new Error(
      `${label}: se esperaba exactamente un bloque, pero se encontraron ${matches.length}. ` +
        "No se modificó ningún archivo.",
    );
  }

  return text.replace(regex, replacement);
}

function insertBeforeOnce(text, marker, insertion, label) {
  const first = text.indexOf(marker);
  if (first === -1) {
    throw new Error(`${label}: no se encontró el punto de inserción esperado.`);
  }

  const second = text.indexOf(marker, first + marker.length);
  if (second !== -1) {
    throw new Error(`${label}: el punto de inserción no es único.`);
  }

  return text.slice(0, first) + insertion + text.slice(first);
}

function backup(filePath, rawContents) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${filePath}.bak-${stamp}`;
  fs.writeFileSync(backupPath, rawContents);
  return backupPath;
}

try {
  requireFile(pagePath);
  requireFile(cardPath);

  const pageRaw = fs.readFileSync(pagePath, "utf8");
  const cardRaw = fs.readFileSync(cardPath, "utf8");

  let page = normalize(pageRaw);
  let card = normalize(cardRaw);

  // 1) Encabezado: dejar únicamente FeatMusic y el botón Cerrar sesión.
  page = replaceRegexOnce(
    page,
    /\n        <nav className="hidden h-full items-center gap-5 md:flex">[\s\S]*?\n        <\/nav>/,
    "",
    "Eliminar navegación central del encabezado",
  );

  page = replaceRegexOnce(
    page,
    /\n          <button\n            type="button"\n            aria-label="Notificaciones"[\s\S]*?\n          <\/button>/,
    "",
    "Eliminar icono circular de notificaciones",
  );

  page = replaceOnce(
    page,
    '        <div className="flex items-center gap-3">\n          <form action="/api/cerrar-sesion"',
    '        <div className="flex items-center">\n          <form action="/api/cerrar-sesion"',
    "Ajustar espaciado del encabezado",
  );

  // 2) Perfil: quitar el verificado de la foto.
  card = replaceRegexOnce(
    card,
    /\n          \{correoVerificado && \(\n            <span\n              title="Cuenta verificada"\n              className="absolute bottom-1 right-1[^"]*"\n            >\n              ✓\n            <\/span>\n          \)\}/,
    "",
    "Quitar verificado de la foto",
  );

  card = replaceOnce(
    card,
    'className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl',
    'className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl',
    "Limpiar contenedor de la foto",
  );

  card = replaceOnce(
    card,
    `          <div className="min-w-0 pt-1">
            <h2 className="truncate text-lg font-black tracking-tight text-white">
              {nombreVisible}
            </h2>`,
    `          <div className="min-w-0 pt-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="min-w-0 truncate text-lg font-black tracking-tight text-white">
                {nombreVisible}
              </h2>
              {correoVerificado && (
                <span
                  aria-label="Cuenta verificada"
                  title="Cuenta verificada"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[8px] font-black text-white"
                >
                  ✓
                </span>
              )}
            </div>`,
    "Mover verificado al lado del nombre",
  );

  // 3) Al guardar correctamente: cerrar el editor y mostrar confirmación en la tarjeta.
  card = replaceOnce(
    card,
    `      setExito(data.mensaje ?? "Perfil actualizado correctamente.");
      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }`,
    `      setExito(data.mensaje ?? "Perfil actualizado correctamente.");
      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }
      setModalAbierto(false);`,
    "Cerrar editor después de guardar",
  );

  const successBanner = `        {exito && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300"
          >
            {exito}
          </p>
        )}
`;

  card = insertBeforeOnce(
    card,
    '        <div className="mt-5 rounded-xl',
    successBanner,
    "Agregar confirmación visible en el panel",
  );

  // Crear copias de seguridad solo después de validar todos los cambios.
  const pageBackup = backup(pagePath, pageRaw);
  const cardBackup = backup(cardPath, cardRaw);

  fs.writeFileSync(pagePath, page, "utf8");
  fs.writeFileSync(cardPath, card, "utf8");

  console.log("\nCambios aplicados correctamente:\n");
  console.log(`- ${path.relative(root, pagePath)}`);
  console.log(`- ${path.relative(root, cardPath)}`);
  console.log("\nCopias de seguridad:");
  console.log(`- ${path.relative(root, pageBackup)}`);
  console.log(`- ${path.relative(root, cardBackup)}`);
  console.log("\nSiguiente paso:");
  console.log("  npm run lint");
  console.log("  npm run build");
  console.log("  git diff");
} catch (error) {
  console.error("\nNo se aplicaron los cambios.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
