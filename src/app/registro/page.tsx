import Link from "next/link";



const generos = [
  "Reguetón",
  "Trap",
  "Rap",
  "Pop",
  "R&B",
  "Afrobeats",
  "Electrónica",
  "Rock",
  "Salsa",
  "Bachata",
  "Regional mexicano",
  "Otro",
];

export default function RegistroPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Volver a FeatMusic
        </Link>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-7 md:p-10">
          <p className="text-sm font-semibold text-violet-400">
            Crea tu perfil profesional
          </p>

          <h1 className="mt-3 text-4xl font-bold">Únete a FeatMusic</h1>

          <p className="mt-3 text-zinc-400">
            Estos datos nos ayudarán a mostrarte artistas y colaboraciones
            realmente compatibles contigo.
          </p>

          <form
  action="/api/registro"
  method="post"
  className="mt-10 space-y-8"
>
            <div className="grid gap-5 md:grid-cols-2">
              <Campo
                label="Nombre real"
                name="nombre"
                placeholder="Tu nombre"
              />

              <Campo
                label="Nombre artístico"
                name="nombreArtistico"
                placeholder="Ejemplo: MeraKrema"
              />

              <Campo
                label="Correo electrónico"
                name="correo"
                type="email"
                placeholder="artista@correo.com"
              />

              <Campo
                label="Contraseña"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
              />

              <Campo label="País" name="pais" placeholder="Colombia" />

              <Campo label="Ciudad" name="ciudad" placeholder="Cali" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Select
                label="Idioma principal"
                name="idiomaPrincipal"
                options={["Español", "Inglés", "Portugués", "Otro"]}
              />

              <Select
                label="Rol principal"
                name="rolPrincipal"
                options={[
                  "Cantante",
                  "Rapero",
                  "Productor",
                  "Beatmaker",
                  "Compositor",
                  "Músico",
                  "Ingeniero de mezcla",
                  "Ingeniero de mastering",
                  "DJ",
                  "Otro",
                ]}
              />
            </div>

            <fieldset>
              <legend className="font-semibold">Géneros musicales</legend>
              <p className="mt-1 text-sm text-zinc-500">
                Puedes seleccionar varios.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {generos.map((genero) => (
                  <label
                    key={genero}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 p-3 text-sm hover:border-violet-500"
                  >
                    <input
                      type="checkbox"
                      name="generos"
                      value={genero}
                      className="accent-violet-600"
                    />
                    {genero}
                  </label>
                ))}
              </div>
            </fieldset>

            <Select
              label="¿Qué tipo de colaboración buscas?"
              name="tipoColaboracion"
              options={[
                "Colaboraciones por intercambio",
                "Trabajos pagos",
                "Ambas opciones",
              ]}
            />

            <label className="flex items-start gap-3 text-sm text-zinc-400">
              <input
                type="checkbox"
                required
                className="mt-1 accent-violet-600"
              />
              <span>
                Acepto los términos de uso y la política de privacidad de
                FeatMusic.
              </span>
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-violet-600 px-6 py-4 font-semibold transition hover:bg-violet-500"
            >
              Crear mi cuenta
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

type CampoProps = {
  label: string;
  name: string;
  placeholder: string;
  type?: "text" | "email" | "password";
};

function Campo({
  label,
  name,
  placeholder,
  type = "text",
}: CampoProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        required
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none transition placeholder:text-zinc-600 focus:border-violet-500"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select
        required
        name={name}
        defaultValue=""
        className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-violet-500"
      >
        <option value="" disabled>
          Selecciona una opción
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}