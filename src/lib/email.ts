import nodemailer from "nodemailer";

type TipoCodigo = "verificacion" | "recuperacion";

type CodigoEmail = {
  correo: string;
  codigo: string;
  tipo: TipoCodigo;
};

function obtenerConfiguracionSmtp() {
  const host = process.env.SMTP_HOST?.trim();
  const puertoTexto = process.env.SMTP_PORT?.trim();
  const usuario = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();

  const faltantes: string[] = [];

  if (!host) faltantes.push("SMTP_HOST");
  if (!puertoTexto) faltantes.push("SMTP_PORT");
  if (!usuario) faltantes.push("SMTP_USER");
  if (!password) faltantes.push("SMTP_PASSWORD");

  if (faltantes.length > 0) {
    console.error(
      `[FeatMusic] Variables SMTP faltantes: ${faltantes.join(", ")}`,
    );

    throw new Error(`SMTP_NO_CONFIGURADO:${faltantes.join(",")}`);
  }

  const puerto = Number(puertoTexto);

  if (!Number.isInteger(puerto) || puerto <= 0) {
    throw new Error("SMTP_PUERTO_INVALIDO");
  }

  /*
   * SMTP_FROM ahora es opcional.
   * Si Hostinger no la guarda, se utiliza SMTP_USER.
   */
  const remitente =
    process.env.SMTP_FROM?.trim() || `FeatMusic <${usuario}>`;

  return {
    host,
    puerto,
    usuario,
    password,
    remitente,
  };
}

export async function enviarCodigoPorCorreo({
  correo,
  codigo,
  tipo,
}: CodigoEmail) {
  const esRecuperacion = tipo === "recuperacion";

  const asunto = esRecuperacion
    ? "Restablece tu contraseña de FeatMusic"
    : "Verifica tu correo en FeatMusic";

  const mensaje = esRecuperacion
    ? "Usa este código para restablecer tu contraseña"
    : "Usa este código para verificar tu correo";

  /*
   * En desarrollo conservamos la posibilidad de ver el código
   * si no existe configuración SMTP.
   */
  let configuracion;

  try {
    configuracion = obtenerConfiguracionSmtp();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[FeatMusic] ${mensaje} para ${correo}: ${codigo}`,
      );
      return;
    }

    throw error;
  }

  const transportador = nodemailer.createTransport({
    host: configuracion.host,
    port: configuracion.puerto,
    secure: configuracion.puerto === 465,
    auth: {
      user: configuracion.usuario,
      pass: configuracion.password,
    },
  });

  /*
   * Comprueba primero que Hostinger pueda conectarse al SMTP.
   */
  await transportador.verify();

  await transportador.sendMail({
    from: configuracion.remitente,
    to: correo,
    subject: asunto,
    text: `${mensaje}: ${codigo}.

El código vence en 10 minutos.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h1>FeatMusic</h1>
        <p>${mensaje}:</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px">
          ${codigo}
        </p>
        <p>Este código vence en 10 minutos. No lo compartas con nadie.</p>
      </div>
    `,
  });
}