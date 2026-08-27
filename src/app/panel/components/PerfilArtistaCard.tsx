"use client";

// FEATMUSIC_PORTADA_RECARGA_SEGURA_V2

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

import ContadoresSeguimiento from "@/app/components/ContadoresSeguimiento";
import {
  NOMBRE_USUARIO_REGEX,
  sanitizarEntradaNombreUsuario,
} from "@/lib/nombreUsuario";

import CentroNotificaciones from "./CentroNotificaciones";

type PerfilActualizado = {
  nombreArtistico: string | null;
  nombreUsuario: string | null;
  biografia: string | null;
  fotoPerfil: string | null;
  portadaPerfil?: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  distribuidoraPreferida: string | null;
  softwarePreferido: string | null;
  perfilPrivado?: boolean;
  enlacePerfilPrivado?: string | null;
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
  seguidores: number;
  siguiendo: number;
  modo?: "tarjeta" | "controles";
};

// FEATMUSIC_CONTROLES_PERFIL_PUBLICO_PROPIO_V1
// FEATMUSIC_CONTROLES_INTEGRADOS_PERFIL_PRIVADO_V1
// FEATMUSIC_PORTADA_PERFIL_ARTISTA_V1

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/20 bg-yellow-500/[0.07] px-2.5 py-1.5 text-[10px] font-bold text-yellow-200 transition hover:border-yellow-400/40 hover:bg-yellow-500/15 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
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
  portadaPerfil: portadaInicial = null,
  biografia: biografiaInicial,
  spotifyUrl: spotifyInicial,
  youtubeUrl: youtubeInicial,
  instagramUrl: instagramInicial,
  distribuidoraPreferida: distribuidoraInicial,
  softwarePreferido: softwareInicial,
  perfilPrivado: perfilPrivadoInicial = false,
  enlacePerfilPrivado: enlacePrivadoInicial = null,
  rol,
  tipoColaboracion,
  generos,
  ubicacion,
  idiomaPrincipal,
  fechaRegistro,
  correoVerificado,
  seguidores,
  siguiendo,
  modo = "tarjeta",
}: PerfilArtistaCardProps) {
  const router = useRouter();
  const usuarioInicialEsAlternativo = /^artista-\d+$/i.test(
    usuarioInicial.trim(),
  );
  const usuarioEditableInicial = usuarioInicialEsAlternativo
    ? ""
    : usuarioInicial;
  const [perfil, setPerfil] = useState<PerfilActualizado>({
    nombreArtistico: nombreInicial,
    nombreUsuario: usuarioInicialEsAlternativo ? null : usuarioInicial,
    biografia: biografiaInicial,
    fotoPerfil: fotoInicial,
    portadaPerfil: portadaInicial,
    spotifyUrl: spotifyInicial,
    youtubeUrl: youtubeInicial,
    instagramUrl: instagramInicial,
    distribuidoraPreferida: distribuidoraInicial,
    softwarePreferido: softwareInicial,
    perfilPrivado: perfilPrivadoInicial,
    enlacePerfilPrivado: enlacePrivadoInicial,
  });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreArtistico, setNombreArtistico] = useState(nombreInicial);
  const [nombreUsuario, setNombreUsuario] = useState(usuarioEditableInicial);
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
  const [perfilPrivadoSeleccionado, setPerfilPrivadoSeleccionado] = useState(
    Boolean(perfilPrivadoInicial),
  );
  const [copiandoEnlace, setCopiandoEnlace] = useState(false);
  const [regenerandoEnlace, setRegenerandoEnlace] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(fotoInicial);
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [vistaPreviaPortada, setVistaPreviaPortada] = useState<string | null>(
    portadaInicial,
  );
  const [eliminarPortada, setEliminarPortada] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const inputPortadaRef = useRef<HTMLInputElement>(null);

  const nombreVisible = perfil.nombreArtistico?.trim() || "Artista";
  const usuarioVisible = perfil.nombreUsuario?.trim() || usuarioInicial;
  const nombreUsuarioFijado = Boolean(perfil.nombreUsuario?.trim());
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

      if (vistaPreviaPortada?.startsWith("blob:")) {
        URL.revokeObjectURL(vistaPreviaPortada);
      }
    };
  }, [vistaPrevia, vistaPreviaPortada]);

  function abrirModal() {
    const distribuidora = obtenerSeleccionDistribuidora(
      perfil.distribuidoraPreferida,
    );
    const software = obtenerSeleccionSoftware(perfil.softwarePreferido);

    setNombreArtistico(perfil.nombreArtistico ?? "");
    setNombreUsuario(perfil.nombreUsuario ?? usuarioEditableInicial);
    setBiografia(perfil.biografia ?? "");
    setSpotifyUrl(perfil.spotifyUrl ?? "");
    setYoutubeUrl(perfil.youtubeUrl ?? "");
    setInstagramUrl(perfil.instagramUrl ?? "");
    setDistribuidoraSeleccionada(distribuidora.seleccion);
    setOtraDistribuidora(distribuidora.otra);
    setSoftwareSeleccionado(software.seleccion);
    setOtroSoftware(software.otro);
    setPerfilPrivadoSeleccionado(Boolean(perfil.perfilPrivado));
    setArchivo(null);
    setVistaPrevia(perfil.fotoPerfil);
    setArchivoPortada(null);
    setVistaPreviaPortada(perfil.portadaPerfil ?? null);
    setEliminarPortada(false);
    setError("");
    setExito("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    if (vistaPrevia?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPrevia);
    }

    if (vistaPreviaPortada?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    setModalAbierto(false);
    setArchivo(null);
    setVistaPrevia(perfil.fotoPerfil);
    setArchivoPortada(null);
    setVistaPreviaPortada(perfil.portadaPerfil ?? null);
    setEliminarPortada(false);
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

  function seleccionarPortada(event: ChangeEvent<HTMLInputElement>) {
    const imagen = event.target.files?.[0];
    if (!imagen) return;

    setError("");
    setExito("");

    if (!IMAGE_TYPES.includes(imagen.type)) {
      setError("La portada debe ser JPG, JPEG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (imagen.size > MAX_IMAGE_SIZE) {
      setError("La portada no puede pesar más de 5 MB.");
      event.target.value = "";
      return;
    }

    if (vistaPreviaPortada?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    setArchivoPortada(imagen);
    setVistaPreviaPortada(URL.createObjectURL(imagen));
    setEliminarPortada(false);
  }

  function quitarPortadaSeleccionada() {
    if (vistaPreviaPortada?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPreviaPortada);
    }

    setArchivoPortada(null);
    setVistaPreviaPortada(null);
    setEliminarPortada(Boolean(perfil.portadaPerfil));

    if (inputPortadaRef.current) {
      inputPortadaRef.current.value = "";
    }
  }

  async function copiarEnlacePrivado() {
    const enlace = perfil.enlacePerfilPrivado?.trim();
    if (!enlace || copiandoEnlace) return;

    try {
      setCopiandoEnlace(true);
      await navigator.clipboard.writeText(enlace);
      setError("");
      setExito("Enlace privado copiado.");
    } catch {
      setExito("");
      setError("No se pudo copiar el enlace. Selecciónalo y cópialo manualmente.");
    } finally {
      setCopiandoEnlace(false);
    }
  }

  async function regenerarEnlacePrivado() {
    if (regenerandoEnlace || guardando) return;

    try {
      setRegenerandoEnlace(true);
      setError("");
      setExito("");

      const respuesta = await fetch("/api/perfil/enlace-privado", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
      const datos = (await respuesta.json()) as {
        ok: boolean;
        mensaje?: string;
        enlacePerfilPrivado?: string;
      };

      if (!respuesta.ok || !datos.ok || !datos.enlacePerfilPrivado) {
        throw new Error(datos.mensaje ?? "No se pudo generar un nuevo enlace.");
      }

      setPerfil((actual) => ({
        ...actual,
        enlacePerfilPrivado: datos.enlacePerfilPrivado ?? null,
      }));
      setExito("Nuevo enlace privado generado. El enlace anterior dejó de funcionar.");
    } catch (err) {
      setExito("");
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo generar un nuevo enlace privado.",
      );
    } finally {
      setRegenerandoEnlace(false);
    }
  }

  async function guardarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando) return;

    setError("");
    setExito("");

    const nombreLimpio = nombreArtistico.trim();
    const usuarioLimpio = sanitizarEntradaNombreUsuario(nombreUsuario);
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

    if (!nombreUsuarioFijado && !NOMBRE_USUARIO_REGEX.test(usuarioLimpio)) {
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
    formData.set("perfilPrivado", perfilPrivadoSeleccionado ? "true" : "false");

    if (archivo) {
      formData.set("fotoPerfil", archivo);
    }

    if (archivoPortada) {
      formData.set("portadaPerfil", archivoPortada);
    } else if (eliminarPortada) {
      formData.set("eliminarPortada", "true");
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

      if (archivoPortada && !data.usuario.portadaPerfil) {
        throw new Error(
          "La portada se subió, pero el servidor no devolvió la imagen guardada.",
        );
      }

      setPerfil(data.usuario);
      setNombreArtistico(data.usuario.nombreArtistico ?? "");
      setNombreUsuario(data.usuario.nombreUsuario ?? "");
      setBiografia(data.usuario.biografia ?? "");
      setSpotifyUrl(data.usuario.spotifyUrl ?? "");
      setYoutubeUrl(data.usuario.youtubeUrl ?? "");
      setInstagramUrl(data.usuario.instagramUrl ?? "");
      setPerfilPrivadoSeleccionado(Boolean(data.usuario.perfilPrivado));

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
      setVistaPreviaPortada(data.usuario.portadaPerfil ?? null);
      setArchivo(null);
      setArchivoPortada(null);
      setEliminarPortada(false);

      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = "";
      }

      if (inputPortadaRef.current) {
        inputPortadaRef.current.value = "";
      }

      // Cierra el editor después de guardar correctamente para que
      // el usuario pueda apreciar inmediatamente los cambios en el panel.
      setExito("");
      setModalAbierto(false);

      if (modo === "controles") {
        router.refresh();

        // En Next.js el refresco suave puede conservar el árbol anterior.
        // La recarga completa garantiza que la portada recién guardada se vea.
        window.setTimeout(() => {
          window.location.reload();
        }, 100);
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
      {modo === "controles" ? (
        <>
          <button
            type="button"
            onClick={abrirModal}
            className="featmusic-profile-dark-control flex min-h-10 min-w-0 items-center justify-center gap-1.5 px-1.5 py-2 text-center text-[9px] font-black leading-tight text-slate-600 transition hover:bg-yellow-50 hover:text-yellow-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500/30 sm:min-h-11 sm:py-2.5 sm:text-[10px]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
            <span>Editar perfil</span>
          </button>
        </>
      ) : (
        <article className="flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-white/15 bg-[#0f0f0f]/95 p-5 shadow-2xl shadow-black/35 lg:rounded-[18px] lg:p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-700 to-yellow-600 text-2xl font-black shadow-lg shadow-black/30">
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
                    className="ml-1.5 inline-flex h-4 w-4 shrink-0 translate-y-[-1px] items-center justify-center rounded-full bg-yellow-500 text-[8px] font-black text-white align-middle"
                  >
                    ✓
                  </span>
                )}
              </h2>
              <p className="mt-0.5 truncate text-[11px] text-[#FFD400]">
                @{usuarioVisible}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-300">
                  {rol}
                </span>
                <span className="rounded-md border border-yellow-400/20 bg-yellow-500/[0.07] px-2 py-1 text-[10px] text-yellow-200">
                  {tipoColaboracion}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <CentroNotificaciones />

            <button
              type="button"
              onClick={abrirModal}
              title="Editar perfil"
              aria-label="Editar perfil"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-yellow-300 transition hover:bg-yellow-500/15 hover:text-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/40"
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
        </div>

        <ContadoresSeguimiento
          nombreUsuario={usuarioVisible}
          seguidores={seguidores}
          siguiendo={siguiendo}
          className="mt-4"
        />

        <div className="mt-3 rounded-xl bg-white/[0.025] p-3.5">
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
      )}

      {modalAbierto &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          className="featmusic-edit-profile-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-perfil-titulo"
            className="featmusic-app-light featmusic-edit-profile-dialog max-h-[94dvh] w-full overflow-y-auto rounded-t-[24px] border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="editar-perfil-titulo" className="text-xl font-bold text-white">
                  Editar perfil
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Actualiza tu identidad, portada, plataformas, distribuidora y software musical.
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
                    className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-700 to-yellow-600 text-xl font-black text-white disabled:opacity-60"
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
                      className="featmusic-edit-profile-yellow-action rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/5 disabled:opacity-60"
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

              <div className="border-t border-white/10 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">
                      Portada del perfil
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      Se mostrará detrás de tu información con un degradado negro.
                    </p>
                  </div>

                  {vistaPreviaPortada && (
                    <button
                      type="button"
                      onClick={quitarPortadaSeleccionada}
                      disabled={guardando}
                      className="featmusic-edit-profile-remove shrink-0 rounded-lg border border-yellow-400/20 px-2.5 py-1.5 text-[10px] font-bold text-yellow-300 transition hover:bg-yellow-500/10 disabled:opacity-60"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => inputPortadaRef.current?.click()}
                  disabled={guardando}
                  className="relative mt-3 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-sm font-semibold text-zinc-300 transition hover:border-yellow-400/40 disabled:opacity-60"
                >
                  {vistaPreviaPortada ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={vistaPreviaPortada}
                        alt="Vista previa de la portada"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
                      <span className="featmusic-edit-profile-yellow-action relative z-10 rounded-lg bg-black/45 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">
                        Cambiar portada
                      </span>
                    </>
                  ) : (
                    <span className="featmusic-edit-profile-yellow-action rounded-lg px-3 py-2 text-xs font-bold">Seleccionar portada</span>
                  )}
                </button>

                <input
                  ref={inputPortadaRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={seleccionarPortada}
                  disabled={guardando}
                  className="hidden"
                />

                <p className="mt-2 text-[10px] text-zinc-500">
                  Recomendado: imagen horizontal. JPG, PNG o WebP. Máximo 5 MB.
                </p>
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
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-zinc-200">
                    Nombre de usuario
                  </span>
                  <div className="mt-2 flex overflow-hidden rounded-xl border border-white/10 bg-black/40 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20">
                    <span className="flex items-center border-r border-white/10 px-3 text-sm text-zinc-500">@</span>
                    <input
                      value={nombreUsuario}
                      onChange={(event) =>
                        setNombreUsuario(
                          sanitizarEntradaNombreUsuario(event.target.value),
                        )
                      }
                      minLength={3}
                      maxLength={24}
                      required
                      readOnly={nombreUsuarioFijado}
                      disabled={guardando}
                      autoComplete="username"
                      className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm text-white outline-none read-only:cursor-not-allowed read-only:text-zinc-400 disabled:opacity-60"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-500">
                    {nombreUsuarioFijado
                      ? "Tu @usuario es único y permanente."
                      : "Elige tu @usuario definitivo. Podrás establecerlo una sola vez."}
                  </p>
                </label>
              </div>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Biografía</span>
                  <span className={`text-xs ${biografia.length > 80 ? "text-yellow-400" : "text-zinc-500"}`}>
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
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
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
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
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
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
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
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
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
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
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
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
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
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
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
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-60"
                    />
                  </label>
                )}
              </div>

              <div className="border-t border-white/10 pt-5">
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-200">
                      Perfil privado
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-zinc-500 sm:text-[11px]">
                      Tu información básica seguirá visible, pero tus ideas solo podrán verlas quienes tengan tu enlace privado.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={perfilPrivadoSeleccionado}
                    aria-label="Activar o desactivar perfil privado"
                    disabled={guardando}
                    onClick={() => {
                      setPerfilPrivadoSeleccionado((valor) => !valor);
                      setError("");
                      setExito("");
                    }}
                    className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      perfilPrivadoSeleccionado
                        ? "border-yellow-400 bg-yellow-400"
                        : "border-white/15 bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                        perfilPrivadoSeleccionado ? "left-[25px]" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-yellow-300">
                        Enlace privado único
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                        Este enlace se mantiene igual al cambiar entre perfil público y privado.
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${
                      perfilPrivadoSeleccionado
                        ? "bg-yellow-400 text-black"
                        : "bg-white/10 text-zinc-300"
                    }`}>
                      {perfilPrivadoSeleccionado ? "Privado" : "Público"}
                    </span>
                  </div>

                  {perfil.enlacePerfilPrivado ? (
                    <>
                      <div className="mt-3 flex gap-2">
                        <input
                          readOnly
                          value={perfil.enlacePerfilPrivado}
                          onFocus={(event) => event.currentTarget.select()}
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[10px] text-zinc-300 outline-none"
                        />
                        <button
                          type="button"
                          disabled={guardando || copiandoEnlace || regenerandoEnlace}
                          onClick={copiarEnlacePrivado}
                          className="featmusic-edit-profile-yellow-action shrink-0 rounded-xl bg-yellow-400 px-3 py-2.5 text-[10px] font-black text-black transition hover:bg-yellow-300 disabled:opacity-60"
                        >
                          {copiandoEnlace ? "Copiando..." : "Copiar enlace"}
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={guardando || regenerandoEnlace || copiandoEnlace}
                        onClick={regenerarEnlacePrivado}
                        className="mt-3 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-[10px] font-black text-zinc-200 transition hover:border-yellow-400/40 hover:bg-yellow-400/[0.08] hover:text-yellow-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {regenerandoEnlace
                          ? "Generando nuevo enlace..."
                          : "Generar nuevo enlace privado"}
                      </button>

                      <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                        Si generas uno nuevo, el enlace anterior deja de funcionar inmediatamente. Cuando el perfil es público, ambos accesos muestran lo mismo; cuando es privado, solo este enlace permite ver las ideas.
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-[10px] leading-4 text-zinc-500">
                      Guarda los cambios una vez para preparar tu enlace privado.
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2.5 text-sm text-yellow-300">
                  {error}
                </p>
              )}

              {exito && (
                <p role="status" className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2.5 text-sm text-yellow-300">
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
                    (!nombreUsuarioFijado &&
                      !NOMBRE_USUARIO_REGEX.test(
                        sanitizarEntradaNombreUsuario(nombreUsuario),
                      )) ||
                    biografia.length > 80
                  }
                  className="featmusic-edit-profile-yellow-action featmusic-edit-profile-save rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}