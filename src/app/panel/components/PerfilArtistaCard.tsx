"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

type PerfilActualizado = {
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  biografia: string | null;
  fotoPerfil: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  distribuidoraPreferida: string | null;
  softwarePreferido: string | null;
};

type PerfilArtistaCardProps = PerfilActualizado & {
  nombreArtistico: string;
  nombreUsuario: string;
  rol: string;
  tipoColaboracion: string;
  generos: string[];
  ubicacion: string;
  idiomaPrincipal: string;
  fechaRegistro: string;
  correoVerificado: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const USUARIO_REGEX = /^[a-z0-9._]{3,24}$/;
const DISTRIBUIDORAS = [
  "ONErpm",
  "DistroKid",
  "TuneCore",
  "CD Baby",
  "Amuse",
  "SoundOn",
  "Ditto",
  "UnitedMasters",
  "Symphonic",
  "Believe",
  "Ninguna",
] as const;

const SOFTWARES_MUSICA = [
  "FL Studio",
  "Ableton Live",
  "Logic Pro",
  "Pro Tools",
  "Cubase",
  "Studio One",
  "REAPER",
  "Reason",
  "Bitwig Studio",
  "GarageBand",
  "Cakewalk",
  "Adobe Audition",
  "LMMS",
  "Ninguno",
] as const;

function obtenerIniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

function normalizarUsuario(valor: string) {
  return valor
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._]/g, "");
}

function esUrlHttpValida(valor: string) {
  if (!valor.trim()) return true;

  try {
    const url = new URL(valor.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function obtenerSeleccionDistribuidora(valor: string | null) {
  if (!valor) {
    return { seleccion: "", otra: "" };
  }

  if (DISTRIBUIDORAS.includes(valor as (typeof DISTRIBUIDORAS)[number])) {
    return { seleccion: valor, otra: "" };
  }

  return { seleccion: "Otra", otra: valor };
}

function obtenerSeleccionSoftware(valor: string | null) {
  if (!valor) {
    return { seleccion: "", otro: "" };
  }

  if (SOFTWARES_MUSICA.includes(valor as (typeof SOFTWARES_MUSICA)[number])) {
    return { seleccion: valor, otro: "" };
  }

  return { seleccion: "Otro", otro: valor };
}

function IconoPlataforma({ plataforma }: { plataforma: "spotify" | "youtube" | "instagram" }) {
  if (plataforma === "spotify") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.58 14.42a.75.75 0 0 1-1.03.25c-2.83-1.73-6.39-2.12-10.58-1.16a.75.75 0 1 1-.34-1.46c4.58-1.05 8.52-.6 11.7 1.34.35.22.46.68.25 1.03Zm1.47-3.25a.94.94 0 0 1-1.29.31c-3.24-1.99-8.18-2.57-12.01-1.4a.94.94 0 1 1-.55-1.8c4.39-1.33 9.83-.69 13.54 1.59.44.27.58.85.31 1.3Zm.13-3.38C14.3 7.49 7.9 7.28 4.2 8.4a1.13 1.13 0 0 1-.65-2.16c4.25-1.28 11.33-1.03 15.79 1.61a1.13 1.13 0 0 1-1.15 1.94Z" />
      </svg>
    );
  }

  if (plataforma === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M21.58 7.19a2.99 2.99 0 0 0-2.1-2.12C17.62 4.56 12 4.56 12 4.56s-5.62 0-7.48.51a2.99 2.99 0 0 0-2.1 2.12A31.2 31.2 0 0 0 1.91 12c0 1.62.17 3.23.51 4.81a2.99 2.99 0 0 0 2.1 2.12c1.86.51 7.48.51 7.48.51s5.62 0 7.48-.51a2.99 2.99 0 0 0 2.1-2.12c.34-1.58.51-3.19.51-4.81s-.17-3.23-.51-4.81ZM9.94 15.15v-6.3L15.4 12l-5.46 3.15Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BotonPlataforma({
  href,
  plataforma,
  children,
}: {
  href: string;
  plataforma: "spotify" | "youtube" | "instagram";
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-500/[0.07] px-2.5 py-1.5 text-[10px] font-bold text-violet-200 transition hover:border-violet-400/40 hover:bg-violet-500/15 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
    >
      <IconoPlataforma plataforma={plataforma} />
      {children}
    </a>
  );
}

export default function PerfilArtistaCard({
  nombreArtistico: nombreInicial,
  nombreUsuario: usuarioInicial,
  fotoPerfil: fotoInicial,
  biografia: biografiaInicial,
  spotifyUrl: spotifyInicial,
  youtubeUrl: youtubeInicial,
  instagramUrl: instagramInicial,
  distribuidoraPreferida: distribuidoraInicial,
  softwarePreferido: softwareInicial,
  rol,
  tipoColaboracion,
  generos,
  ubicacion,
  idiomaPrincipal,
  fechaRegistro,
  correoVerificado,
}: PerfilArtistaCardProps) {
  const [perfil, setPerfil] = useState<PerfilActualizado>({
    nombreArtistico: nombreInicial,
    nombreUsuario: usuarioInicial,
    biografia: biografiaInicial,
    fotoPerfil: fotoInicial,
    spotifyUrl: spotifyInicial,
    youtubeUrl: youtubeInicial,
    instagramUrl: instagramInicial,
    distribuidoraPreferida: distribuidoraInicial,
    softwarePreferido: softwareInicial,
  });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreArtistico, setNombreArtistico] = useState(nombreInicial);
  const [nombreUsuario, setNombreUsuario] = useState(usuarioInicial);
  const [biografia, setBiografia] = useState(biografiaInicial ?? "");
  const [spotifyUrl, setSpotifyUrl] = useState(spotifyInicial ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(youtubeInicial ?? "");
  const [instagramUrl, setInstagramUrl] = useState(instagramInicial ?? "");
  const distribuidoraInicialNormalizada = obtenerSeleccionDistribuidora(distribuidoraInicial);
  const [distribuidoraSeleccionada, setDistribuidoraSeleccionada] = useState(
    distribuidoraInicialNormalizada.seleccion,
  );
  const [otraDistribuidora, setOtraDistribuidora] = useState(
    distribuidoraInicialNormalizada.otra,
  );
  const softwareInicialNormalizado = obtenerSeleccionSoftware(softwareInicial);
  const [softwareSeleccionado, setSoftwareSeleccionado] = useState(
    softwareInicialNormalizado.seleccion,
  );
  const [otroSoftware, setOtroSoftware] = useState(
    softwareInicialNormalizado.otro,
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(fotoInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const nombreVisible = perfil.nombreArtistico?.trim() || "Artista";
  const usuarioVisible = perfil.nombreUsuario?.trim() || usuarioInicial;
  const iniciales = useMemo(() => obtenerIniciales(nombreVisible), [nombreVisible]);
  const tienePlataformas = Boolean(
    perfil.spotifyUrl || perfil.youtubeUrl || perfil.instagramUrl,
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
    const distribuidora = obtenerSeleccionDistribuidora(
      perfil.distribuidoraPreferida,
    );
    const software = obtenerSeleccionSoftware(perfil.softwarePreferido);

    setNombreArtistico(perfil.nombreArtistico ?? "");
    setNombreUsuario(perfil.nombreUsuario ?? usuarioInicial);
    setBiografia(perfil.biografia ?? "");
    setSpotifyUrl(perfil.spotifyUrl ?? "");
    setYoutubeUrl(perfil.youtubeUrl ?? "");
    setInstagramUrl(perfil.instagramUrl ?? "");
    setDistribuidoraSeleccionada(distribuidora.seleccion);
    setOtraDistribuidora(distribuidora.otra);
    setSoftwareSeleccionado(software.seleccion);
    setOtroSoftware(software.otro);
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
    const usuarioLimpio = normalizarUsuario(nombreUsuario);
    const bioLimpia = biografia.trim();
    const spotifyLimpio = spotifyUrl.trim();
    const youtubeLimpio = youtubeUrl.trim();
    const instagramLimpio = instagramUrl.trim();
    const distribuidoraLimpia =
      distribuidoraSeleccionada === "Otra"
        ? otraDistribuidora.trim()
        : distribuidoraSeleccionada.trim();
    const softwareLimpio =
      softwareSeleccionado === "Otro"
        ? otroSoftware.trim()
        : softwareSeleccionado.trim();

    if (nombreLimpio.length < 2) {
      setError("El nombre artístico debe tener al menos 2 caracteres.");
      return;
    }

    if (!USUARIO_REGEX.test(usuarioLimpio)) {
      setError(
        "El nombre de usuario debe tener entre 3 y 24 caracteres y usar solo letras, números, punto o guion bajo.",
      );
      return;
    }

    if (bioLimpia.length > 80) {
      setError("La biografía no puede superar 80 caracteres.");
      return;
    }

    const enlaces = [
      ["Spotify", spotifyLimpio],
      ["YouTube", youtubeLimpio],
      ["Instagram", instagramLimpio],
    ] as const;

    for (const [plataforma, enlace] of enlaces) {
      if (!esUrlHttpValida(enlace)) {
        setError(`El enlace de ${plataforma} debe comenzar con http:// o https://.`);
        return;
      }

      if (enlace.length > 500) {
        setError(`El enlace de ${plataforma} no puede superar 500 caracteres.`);
        return;
      }
    }

    if (distribuidoraLimpia.length > 120) {
      setError("La distribuidora no puede superar 120 caracteres.");
      return;
    }

    if (softwareLimpio.length > 120) {
      setError("El software preferido no puede superar 120 caracteres.");
      return;
    }

    const formData = new FormData();
    formData.set("nombreArtistico", nombreLimpio);
    formData.set("nombreUsuario", usuarioLimpio);
    formData.set("biografia", bioLimpia);
    formData.set("spotifyUrl", spotifyLimpio);
    formData.set("youtubeUrl", youtubeLimpio);
    formData.set("instagramUrl", instagramLimpio);
    formData.set("distribuidoraPreferida", distribuidoraLimpia);
    formData.set("softwarePreferido", softwareLimpio);

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
      setNombreUsuario(data.usuario.nombreUsuario ?? "");
      setBiografia(data.usuario.biografia ?? "");
      setSpotifyUrl(data.usuario.spotifyUrl ?? "");
      setYoutubeUrl(data.usuario.youtubeUrl ?? "");
      setInstagramUrl(data.usuario.instagramUrl ?? "");

      const distribuidoraActualizada = obtenerSeleccionDistribuidora(
        data.usuario.distribuidoraPreferida,
      );
      setDistribuidoraSeleccionada(distribuidoraActualizada.seleccion);
      setOtraDistribuidora(distribuidoraActualizada.otra);

      const softwareActualizado = obtenerSeleccionSoftware(
        data.usuario.softwarePreferido,
      );
      setSoftwareSeleccionado(softwareActualizado.seleccion);
      setOtroSoftware(softwareActualizado.otro);
      setVistaPrevia(data.usuario.fotoPerfil);
      setArchivo(null);

      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }

      // Cierra el editor después de guardar correctamente para que
      // el usuario pueda apreciar inmediatamente los cambios en el panel.
      setExito("");
      setModalAbierto(false);
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
      <article className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-white/15 bg-[#0d0913]/95 p-5 shadow-2xl shadow-black/35 lg:rounded-[18px] lg:p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-600 text-2xl font-black shadow-lg shadow-black/30">
              {perfil.fotoPerfil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfil.fotoPerfil}
                  alt={`Foto de perfil de ${nombreVisible}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                iniciales
              )}

            </div>

            <div className="min-w-0 flex-1 pt-1">
              <h2 className="break-words text-lg font-black leading-tight tracking-tight text-white">
                {nombreVisible}
                {correoVerificado && (
                  <span
                    title="Cuenta verificada"
                    aria-label="Cuenta verificada"
                    className="ml-1.5 inline-flex h-4 w-4 shrink-0 translate-y-[-1px] items-center justify-center rounded-full bg-violet-500 text-[8px] font-black text-white align-middle"
                  >
                    ✓
                  </span>
                )}
              </h2>
              <p className="mt-0.5 truncate text-[11px] text-violet-300">
                @{usuarioVisible}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-300">
                  {rol}
                </span>
                <span className="rounded-md border border-violet-400/20 bg-violet-500/[0.07] px-2 py-1 text-[10px] text-violet-200">
                  {tipoColaboracion}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirModal}
            title="Editar perfil"
            aria-label="Editar perfil"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-violet-300 transition hover:bg-violet-500/15 hover:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-white/[0.025] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-zinc-500">
            Biografía
          </p>
          <p className="mt-2 text-[12px] leading-5 text-zinc-200">
            {perfil.biografia || "Todavía no has agregado una biografía."}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
          <div>
            <p className="text-zinc-500">Géneros musicales</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {(generos.length ? generos : ["Sin completar"]).slice(0, 4).map((genero) => (
                <span
                  key={genero}
                  className="rounded-md border border-white/5 bg-white/[0.035] px-2 py-1 text-[10px] text-zinc-300"
                >
                  {genero}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-500">Ciudad y país</p>
            <p className="mt-1 font-medium text-zinc-200">{ubicacion}</p>
          </div>

          <div>
            <p className="text-zinc-500">Idioma principal</p>
            <p className="mt-1 font-medium text-zinc-200">{idiomaPrincipal}</p>
          </div>

          <div>
            <p className="text-zinc-500">Miembro desde</p>
            <p className="mt-1 font-medium text-zinc-200">{fechaRegistro}</p>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-zinc-500">
            Presencia musical
          </p>

          {tienePlataformas ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {perfil.spotifyUrl && (
                <BotonPlataforma href={perfil.spotifyUrl} plataforma="spotify">
                  Spotify
                </BotonPlataforma>
              )}
              {perfil.youtubeUrl && (
                <BotonPlataforma href={perfil.youtubeUrl} plataforma="youtube">
                  YouTube
                </BotonPlataforma>
              )}
              {perfil.instagramUrl && (
                <BotonPlataforma href={perfil.instagramUrl} plataforma="instagram">
                  Instagram
                </BotonPlataforma>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[10px] text-zinc-500">
              Agrega tus plataformas desde “Editar perfil”.
            </p>
          )}

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <span className="text-[10px] text-zinc-500">
                Distribuidora preferida
              </span>
              <span className="max-w-[55%] truncate text-right text-[10px] font-semibold text-zinc-200">
                {perfil.distribuidoraPreferida || "Sin especificar"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
              <span className="text-[10px] text-zinc-500">
                Software preferido
              </span>
              <span className="max-w-[55%] truncate text-right text-[10px] font-semibold text-zinc-200">
                {perfil.softwarePreferido || "Sin especificar"}
              </span>
            </div>
          </div>
        </div>

      </article>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-perfil-titulo"
            className="max-h-[94dvh] w-full overflow-y-auto rounded-t-[24px] border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="editar-perfil-titulo" className="text-xl font-bold text-white">
                  Editar perfil
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Actualiza tu identidad, plataformas, distribuidora y software musical.
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
                <p className="text-sm font-semibold text-zinc-200">Foto de perfil</p>
                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => inputArchivoRef.current?.click()}
                    disabled={guardando}
                    className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 to-fuchsia-600 text-xl font-black text-white disabled:opacity-60"
                  >
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
                  </button>

                  <div>
                    <button
                      type="button"
                      onClick={() => inputArchivoRef.current?.click()}
                      disabled={guardando}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/5 disabled:opacity-60"
                    >
                      Seleccionar imagen
                    </button>
                    <p className="mt-2 text-[10px] text-zinc-500">
                      JPG, PNG o WebP. Máximo 5 MB.
                    </p>
                  </div>
                </div>

                <input
                  ref={inputArchivoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={seleccionarImagen}
                  disabled={guardando}
                  className="hidden"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-semibold text-zinc-200">
                    Nombre artístico
                  </span>
                  <input
                    value={nombreArtistico}
                    onChange={(event) => setNombreArtistico(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                    disabled={guardando}
                    autoComplete="nickname"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-zinc-200">
                    Nombre de usuario
                  </span>
                  <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-black/40 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
                    <span className="flex items-center border-r border-white/10 px-3 text-sm text-zinc-500">@</span>
                    <input
                      value={nombreUsuario}
                      onChange={(event) => setNombreUsuario(normalizarUsuario(event.target.value))}
                      minLength={3}
                      maxLength={24}
                      required
                      disabled={guardando}
                      autoComplete="username"
                      className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-white outline-none disabled:opacity-60"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Biografía</span>
                  <span className={`text-xs ${biografia.length > 80 ? "text-red-400" : "text-zinc-500"}`}>
                    {biografia.length}/80
                  </span>
                </div>
                <textarea
                  value={biografia}
                  onChange={(event) => setBiografia(event.target.value)}
                  maxLength={80}
                  rows={4}
                  disabled={guardando}
                  placeholder="Cuéntales a otros artistas quién eres y qué tipo de música haces."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                />
              </label>

              <div className="border-t border-white/10 pt-5">
                <p className="text-sm font-semibold text-zinc-200">Plataformas del artista</p>
                <div className="mt-3 grid gap-4">
                  <label>
                    <span className="text-xs text-zinc-400">Perfil de Spotify</span>
                    <input
                      type="url"
                      value={spotifyUrl}
                      onChange={(event) => setSpotifyUrl(event.target.value)}
                      maxLength={500}
                      disabled={guardando}
                      placeholder="https://open.spotify.com/artist/..."
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                    />
                  </label>

                  <label>
                    <span className="text-xs text-zinc-400">Canal de YouTube</span>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(event) => setYoutubeUrl(event.target.value)}
                      maxLength={500}
                      disabled={guardando}
                      placeholder="https://www.youtube.com/@artista"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                    />
                  </label>

                  <label>
                    <span className="text-xs text-zinc-400">Instagram</span>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(event) => setInstagramUrl(event.target.value)}
                      maxLength={500}
                      disabled={guardando}
                      placeholder="https://www.instagram.com/artista"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-white/10 pt-5">
                <label>
                  <span className="text-sm font-semibold text-zinc-200">
                    Distribuidora musical preferida
                  </span>
                  <select
                    value={distribuidoraSeleccionada}
                    onChange={(event) => setDistribuidoraSeleccionada(event.target.value)}
                    disabled={guardando}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  >
                    <option value="">Sin especificar</option>
                    {DISTRIBUIDORAS.map((distribuidora) => (
                      <option key={distribuidora} value={distribuidora}>
                        {distribuidora}
                      </option>
                    ))}
                    <option value="Otra">Otra</option>
                  </select>
                </label>

                {distribuidoraSeleccionada === "Otra" && (
                  <label className="mt-3 block">
                    <span className="text-xs text-zinc-400">Escribe la distribuidora</span>
                    <input
                      value={otraDistribuidora}
                      onChange={(event) => setOtraDistribuidora(event.target.value)}
                      maxLength={120}
                      disabled={guardando}
                      placeholder="Nombre de la distribuidora"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                    />
                  </label>
                )}

                <label className="mt-5 block">
                  <span className="text-sm font-semibold text-zinc-200">
                    Software musical preferido
                  </span>
                  <select
                    value={softwareSeleccionado}
                    onChange={(event) => setSoftwareSeleccionado(event.target.value)}
                    disabled={guardando}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  >
                    <option value="">Sin especificar</option>
                    {SOFTWARES_MUSICA.map((software) => (
                      <option key={software} value={software}>
                        {software}
                      </option>
                    ))}
                    <option value="Otro">Otro</option>
                  </select>
                </label>

                {softwareSeleccionado === "Otro" && (
                  <label className="mt-3 block">
                    <span className="text-xs text-zinc-400">
                      Escribe el software
                    </span>
                    <input
                      value={otroSoftware}
                      onChange={(event) => setOtroSoftware(event.target.value)}
                      maxLength={120}
                      disabled={guardando}
                      placeholder="Nombre del software musical"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                    />
                  </label>
                )}
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
                  {error}
                </p>
              )}

              {exito && (
                <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
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
                    !USUARIO_REGEX.test(normalizarUsuario(nombreUsuario)) ||
                    biografia.length > 80
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