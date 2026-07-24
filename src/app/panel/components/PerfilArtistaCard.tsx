"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type PerfilActualizado = {
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  biografia: string | null;
  fotoPerfil: string | null;
};

type PerfilArtistaCardProps = {
  nombreArtistico: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  biografia: string | null;
  rol: string;
  tipoColaboracion: string;
  generos: string[];
  ubicacion: string;
  idiomaPrincipal: string;
  fechaRegistro: string;
  correoVerificado: boolean;
  perfilCompleto: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function obtenerIniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

export default function PerfilArtistaCard({
  nombreArtistico: nombreInicial,
  nombreUsuario,
  fotoPerfil: fotoInicial,
  biografia: biografiaInicial,
  rol,
  tipoColaboracion,
  generos,
  ubicacion,
  idiomaPrincipal,
  fechaRegistro,
  correoVerificado,
  perfilCompleto,
}: PerfilArtistaCardProps) {
  const [perfil, setPerfil] = useState<PerfilActualizado>({
    nombreArtistico: nombreInicial,
    nombreUsuario,
    biografia: biografiaInicial,
    fotoPerfil: fotoInicial,
  });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreArtistico, setNombreArtistico] = useState(nombreInicial);
  const [biografia, setBiografia] = useState(biografiaInicial ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(fotoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const nombreVisible = perfil.nombreArtistico?.trim() || "Artista";
  const iniciales = useMemo(
    () => obtenerIniciales(nombreVisible),
    [nombreVisible],
  );

  useEffect(() => {
    if (!modalAbierto) return;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !guardando) {
        cerrarModal();
      }
    };

    document.addEventListener("keydown", cerrarConEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = "";
    };
  }, [modalAbierto, guardando]);

  useEffect(() => {
    return () => {
      if (vistaPrevia?.startsWith("blob:")) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  function abrirModal() {
    setNombreArtistico(perfil.nombreArtistico ?? "");
    setBiografia(perfil.biografia ?? "");
    setArchivo(null);
    setVistaPrevia(perfil.fotoPerfil);
    setError("");
    setExito("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    if (vistaPrevia?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setModalAbierto(false);
    setArchivo(null);
    setVistaPrevia(perfil.fotoPerfil);
    setError("");
    setExito("");
  }

  function seleccionarImagen(event: ChangeEvent<HTMLInputElement>) {
    const imagen = event.target.files?.[0];

    if (!imagen) return;

    setError("");
    setExito("");

    if (!IMAGE_TYPES.includes(imagen.type)) {
      setError("La imagen debe ser JPG, JPEG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (imagen.size > MAX_IMAGE_SIZE) {
      setError("La imagen no puede pesar más de 5 MB.");
      event.target.value = "";
      return;
    }

    if (vistaPrevia?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setArchivo(imagen);
    setVistaPrevia(URL.createObjectURL(imagen));
  }

  async function guardarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (guardando) return;

    setError("");
    setExito("");

    const nombreLimpio = nombreArtistico.trim();

    if (nombreLimpio.length < 2) {
      setError("El nombre artístico debe tener al menos 2 caracteres.");
      return;
    }

    if (biografia.trim().length > 300) {
      setError("La biografía no puede superar 300 caracteres.");
      return;
    }

    const formData = new FormData();
    formData.set("nombreArtistico", nombreLimpio);
    formData.set("biografia", biografia.trim());

    if (archivo) {
      formData.set("fotoPerfil", archivo);
    }

    try {
      setGuardando(true);

      const response = await fetch("/api/perfil", {
        method: "PATCH",
        body: formData,
      });

      const data = (await response.json()) as {
        ok: boolean;
        mensaje?: string;
        usuario?: PerfilActualizado;
      };

      if (!response.ok || !data.ok || !data.usuario) {
        throw new Error(data.mensaje ?? "No se pudo actualizar el perfil.");
      }

      setPerfil(data.usuario);
      setNombreArtistico(data.usuario.nombreArtistico ?? "");
      setBiografia(data.usuario.biografia ?? "");
      setVistaPrevia(data.usuario.fotoPerfil);
      setArchivo(null);
      setExito(data.mensaje ?? "Perfil actualizado correctamente.");

      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el perfil.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <article className="relative flex h-full min-h-[430px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/95 p-5 shadow-2xl shadow-black/30 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-300">
                1
              </span>
              <h2 className="text-sm font-semibold text-white">
                Perfil del artista
              </h2>
            </div>
            <p className="mt-1 pl-8 text-xs text-zinc-500">
              {perfilCompleto ? "Perfil completo" : "Perfil pendiente"}
            </p>
          </div>

          <button
            type="button"
            onClick={abrirModal}
            className="shrink-0 rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            Editar perfil
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-600 to-fuchsia-700 text-xl font-bold text-white">
            {perfil.fotoPerfil ? (
              // Se usa <img> porque Cloudinary es un dominio externo y así no
              // necesitas modificar next.config.ts.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={perfil.fotoPerfil}
                alt={`Foto de perfil de ${nombreVisible}`}
                className="h-full w-full object-cover"
              />
            ) : (
              iniciales
            )}
            {correoVerificado && (
              <span
                className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-zinc-950 bg-violet-500 text-[10px]"
                aria-label="Cuenta verificada"
                title="Cuenta verificada"
              >
                ✓
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-white">
              {nombreVisible}
            </h3>
            <p className="mt-1 truncate text-sm text-violet-300">
              @{perfil.nombreUsuario || nombreUsuario}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                {rol}
              </span>
              <span className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
                {tipoColaboracion}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.025] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Biografía
          </p>
          <p className="mt-1.5 line-clamp-3 text-sm leading-5 text-zinc-300">
            {perfil.biografia || "Todavía no has agregado una biografía."}
          </p>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500">Géneros musicales</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(generos.length ? generos : ["Sin completar"]).map((genero) => (
                <span
                  key={genero}
                  className="rounded-md border border-white/5 bg-white/[0.035] px-2 py-1 text-[11px] text-zinc-300"
                >
                  {genero}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500">Ciudad y país</p>
            <p className="mt-1 font-medium text-zinc-200">{ubicacion}</p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">Idioma principal</p>
            <p className="mt-1 font-medium text-zinc-200">{idiomaPrincipal}</p>
          </div>

          <div>
            <p className="text-xs text-zinc-500">Miembro desde</p>
            <p className="mt-1 font-medium text-zinc-200">{fechaRegistro}</p>
          </div>
        </div>

        <p className="mt-auto pt-4 text-xs text-zinc-500">
          {correoVerificado ? "Cuenta verificada" : "Verificación pendiente"}
        </p>
      </article>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-perfil-titulo"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="editar-perfil-titulo"
                  className="text-xl font-bold text-white"
                >
                  Editar perfil
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Actualiza tu foto, nombre artístico y biografía.
                </p>
              </div>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarPerfil} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-200">
                  Foto de perfil
                </label>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-600 to-fuchsia-700 text-2xl font-bold text-white">
                    {vistaPrevia ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vistaPrevia}
                        alt="Vista previa de la foto de perfil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      obtenerIniciales(nombreArtistico || nombreVisible)
                    )}
                  </div>

                  <div className="min-w-0">
                    <input
                      ref={inputArchivoRef}
                      id="fotoPerfil"
                      name="fotoPerfil"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={seleccionarImagen}
                      disabled={guardando}
                      className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:font-semibold file:text-violet-200 hover:file:bg-violet-500/25 disabled:opacity-50"
                    />
                    <p className="mt-2 text-xs leading-4 text-zinc-500">
                      JPG, PNG o WebP. Máximo 5 MB.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="nombreArtistico"
                  className="text-sm font-semibold text-zinc-200"
                >
                  Nombre artístico
                </label>
                <input
                  id="nombreArtistico"
                  name="nombreArtistico"
                  value={nombreArtistico}
                  onChange={(event) => setNombreArtistico(event.target.value)}
                  minLength={2}
                  maxLength={80}
                  required
                  disabled={guardando}
                  autoComplete="nickname"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="biografia"
                    className="text-sm font-semibold text-zinc-200"
                  >
                    Biografía
                  </label>
                  <span
                    className={`text-xs ${
                      biografia.length > 300
                        ? "text-red-400"
                        : "text-zinc-500"
                    }`}
                  >
                    {biografia.length}/300
                  </span>
                </div>
                <textarea
                  id="biografia"
                  name="biografia"
                  value={biografia}
                  onChange={(event) => setBiografia(event.target.value)}
                  maxLength={300}
                  rows={5}
                  disabled={guardando}
                  placeholder="Cuéntales a otros artistas quién eres y qué tipo de música haces."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              {exito && (
                <p
                  role="status"
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300"
                >
                  {exito}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    guardando ||
                    nombreArtistico.trim().length < 2 ||
                    biografia.length > 300
                  }
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
