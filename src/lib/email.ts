import nodemailer from "nodemailer";

type TipoCodigo = "verificacion" | "recuperacion";

type CodigoEmail = {
  correo: string;
  codigo: string;
  tipo: TipoCodigo;
};

function configuracionSmtpDisponible() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM,
  );
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

  if (!configuracionSmtpDisponible()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[FeatMusic] ${mensaje} para ${correo}: ${codigo}`);
      return;
    }

    throw new Error("SMTP_NO_CONFIGURADO");
  }

  const transportador = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transportador.sendMail({
    from: process.env.SMTP_FROM,
    to: correo,
    subject: asunto,
    text: `${mensaje}: ${codigo}. El código vence en 10 minutos.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#0a0710;color:#ffffff;padding:32px">
        <h1 style="margin:0 0 16px;color:#c084fc">FeatMusic</h1>
        <p style="font-size:16px">${mensaje}:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px">${codigo}</p>
        <p style="color:#c4b5fd">Este código vence en 10 minutos. No lo compartas con nadie.</p>
      </div>
    `,
  });
}
