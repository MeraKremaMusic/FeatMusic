import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/session";
import SelectorUbicacion from "./SelectorUbicacion";
import CampoNombreUsuario from "./CampoNombreUsuario";
import RegistroPerfilPorPasos from "./RegistroPerfilPorPasos";

const roles = [
  ["CANTANTE", "Cantante"],
  ["COMPOSITOR", "Compositor"],
  ["BEATMAKER", "Beatmaker"],
] as const;

const generos = [
  "Urbano",
  "Pop",
  "Reggaetón",
  "Trap",
  "R&B",
  "Afrobeat",
  "Rock",
  "Electrónica",
];

const mensajes: Record<string, string> = {
  "datos-invalidos":
    "Completa los campos obligatorios y elige al menos un género.",
  "ubicacion-invalida":
    "Selecciona nuevamente el país, departamento y ciudad.",
  "usuario-invalido":
    "Elige un nombre de usuario de 3 a 24 caracteres usando solo letras, números, punto o guion bajo.",
  "usuario-ocupado":
    "Ese nombre de usuario ya está en uso. Elige otro.",
  "usuario-permanente":
    "Tu nombre de usuario ya fue establecido y es permanente.",
  servidor: "No pudimos guardar tu perfil. Inténtalo de nuevo.",
};

type PasoRegistro = 0 | 1 | 2 | 3 | 4;

function pasoInicialSegunError(error?: string): PasoRegistro {
  if (error === "usuario-invalido" || error === "usuario-ocupado" || error === "usuario-permanente") {
    return 1;
  }

  if (error === "ubicacion-invalida") {
    return 2;
  }

  return 0;
}

export default async function CompletarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/iniciar-sesion");

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.usuarioId },
  });

  if (!usuario) redirect("/iniciar-sesion");
  if (usuario.perfilCompleto) redirect("/artistas/mi-perfil");

  const { error } = await searchParams;
  const nombreUsuarioFijado = Boolean(usuario.nombreUsuario?.trim());
  const generosSeleccionados = Array.isArray(usuario.generos)
    ? usuario.generos.filter(
        (genero): genero is string => typeof genero === "string",
      )
    : [];
  const pasoInicial = pasoInicialSegunError(error);

  return (
    <main className="featmusic-registro-ambiental relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-[#080808] px-3 py-2 text-white sm:px-6 sm:py-4">
      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col p-4 sm:p-6 lg:p-7">
        <p className="text-xs font-semibold text-[#FFD400] sm:text-sm">Completa tu perfil</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight sm:mt-1.5 sm:text-3xl">
          Cuéntanos sobre ti
        </h1>
        <p className="mt-1.5 hidden max-w-2xl text-sm leading-snug text-zinc-400 sm:block">
          Iremos paso a paso. Tus respuestas se guardarán juntas cuando termines.
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-yellow-900 bg-yellow-950/50 p-2.5 text-xs leading-snug text-yellow-200 sm:mt-4 sm:p-3 sm:text-sm"
          >
            {mensajes[error] ?? mensajes.servidor}
          </p>
        ) : null}

        <RegistroPerfilPorPasos pasoInicial={pasoInicial}>
          <section data-registro-paso hidden={pasoInicial !== 0}>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <Campo
                etiqueta="Tu nombre"
                nombre="nombre"
                valor={usuario.nombre ?? ""}
              />
              <Campo
                etiqueta="Nombre artístico"
                nombre="nombreArtistico"
                valor={usuario.nombreArtistico ?? ""}
              />
            </div>
          </section>

          <section data-registro-paso hidden={pasoInicial !== 1}>
            <CampoNombreUsuario
              valorInicial={usuario.nombreUsuario ?? ""}
              bloqueado={nombreUsuarioFijado}
            />
          </section>

          <section data-registro-paso hidden={pasoInicial !== 2} className="[&_select]:py-2.5 [&_input]:py-2.5 [&_.grid]:gap-3">
            <SelectorUbicacion
              paisInicial={usuario.pais}
              departamentoInicial={usuario.departamento}
              ciudadInicial={usuario.ciudad}
            />
          </section>

          <section data-registro-paso hidden={pasoInicial !== 3}>
            <div className="space-y-4 sm:space-y-5">
              <fieldset>
                <legend className="mb-2 text-xs font-medium sm:text-sm">
                  Tu rol principal
                </legend>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {roles.map(([valor, etiqueta]) => (
                    <label
                      key={valor}
                      className="cursor-pointer rounded-xl border border-zinc-800 bg-black px-2 py-2.5 text-center text-xs transition hover:border-[#FFD400] sm:p-3 sm:text-sm"
                    >
                      <input
                        className="mr-1 accent-[#FFD400] sm:mr-2"
                        type="radio"
                        name="rolPrincipal"
                        value={valor}
                        defaultChecked={
                          (usuario.rolPrincipal ?? "CANTANTE") === valor
                        }
                      />
                      {etiqueta}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset data-generos-group>
                <legend className="mb-2 text-xs font-medium sm:text-sm">
                  Géneros que te representan{" "}
                  <span className="text-zinc-500">(elige de 1 a 5)</span>
                </legend>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {generos.map((genero) => (
                    <label
                      key={genero}
                      className="cursor-pointer rounded-full border border-zinc-800 px-2.5 py-1.5 text-xs transition hover:border-[#FFD400] sm:px-3 sm:py-2 sm:text-sm"
                    >
                      <input
                        className="mr-1 accent-[#FFD400] sm:mr-2"
                        type="checkbox"
                        name="generos"
                        value={genero}
                        defaultChecked={generosSeleccionados.includes(genero)}
                      />
                      {genero}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>

          <section data-registro-paso hidden={pasoInicial !== 4}>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <Selector
                etiqueta="Idioma principal"
                nombre="idiomaPrincipal"
                valor={usuario.idiomaPrincipal ?? "Español"}
                opciones={[
                  ["Español", "Español"],
                  ["English", "English"],
                  ["Português", "Português"],
                ]}
              />
              <Selector
                etiqueta="Quiero usar FeatMusic para"
                nombre="tipoColaboracion"
                valor={usuario.tipoColaboracion ?? "AMBAS"}
                opciones={[
                  ["AMBAS", "Colaborar y recibir propuestas"],
                  ["BUSCO_COLABORAR", "Encontrar colaboraciones"],
                  ["BUSCO_PROPUESTAS", "Recibir propuestas"],
                ]}
              />
            </div>
          </section>
        </RegistroPerfilPorPasos>
      </section>
    </main>
  );
}

function Campo({
  etiqueta,
  nombre,
  valor,
}: {
  etiqueta: string;
  nombre: string;
  valor: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium sm:mb-1.5 sm:text-sm">{etiqueta}</span>
      <input
        required
        name={nombre}
        defaultValue={valor}
        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2.5 text-sm outline-none transition focus:border-[#FFD400] sm:px-4 sm:text-base"
      />
    </label>
  );
}

function Selector({
  etiqueta,
  nombre,
  valor,
  opciones,
}: {
  etiqueta: string;
  nombre: string;
  valor: string;
  opciones: readonly (readonly [string, string])[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium sm:mb-1.5 sm:text-sm">{etiqueta}</span>
      <select
        name={nombre}
        defaultValue={valor}
        className="w-full rounded-xl border border-zinc-800 bg-black px-3 py-2.5 text-sm outline-none transition focus:border-[#FFD400] sm:px-4 sm:text-base"
      >
        {opciones.map(([opcion, texto]) => (
          <option key={opcion} value={opcion}>
            {texto}
          </option>
        ))}
      </select>
    </label>
  );
}
