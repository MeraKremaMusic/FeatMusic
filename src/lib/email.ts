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

// FEATMUSIC_REPORTES_DIRECTOS_CORREO_V1

type ReporteUsuarioEmail = {
  reportanteUsuario: string;
  reportadoUsuario: string;
  motivo: string;
  descripcion: string;
  enviadoEn: Date;
};

function escaparHtmlReporte(valor: string) {
  return valor
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nombreMotivoReporte(motivo: string) {
  const nombres: Record<string, string> = {
    SPAM: "Spam",
    SUPLANTACION: "Suplantación",
    ACOSO: "Acoso",
    CONTENIDO_ROBADO: "Contenido robado",
    CONTENIDO_INAPROPIADO: "Contenido inapropiado",
    OTRO: "Otro",
  };

  return nombres[motivo] || motivo;
}

function fechaReporteColombia(fecha: Date) {
  try {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "America/Bogota",
    }).format(fecha);
  } catch {
    return fecha.toISOString();
  }
}

export async function enviarReporteUsuarioPorCorreo({
  reportanteUsuario,
  reportadoUsuario,
  motivo,
  descripcion,
  enviadoEn,
}: ReporteUsuarioEmail) {
  const configuracion = obtenerConfiguracionSmtp();
  const transportador = nodemailer.createTransport({
    host: configuracion.host,
    port: configuracion.puerto,
    secure: configuracion.puerto === 465,
    auth: {
      user: configuracion.usuario,
      pass: configuracion.password,
    },
  });

  const destinatario =
    process.env.REPORTES_ADMIN_EMAIL?.trim() || "contact@featmusic.pro";
  const reportante = reportanteUsuario.trim().replace(/^@+/, "");
  const reportado = reportadoUsuario.trim().replace(/^@+/, "");
  const motivoVisible = nombreMotivoReporte(motivo);
  const fechaVisible = fechaReporteColombia(enviadoEn);

  await transportador.verify();

  await transportador.sendMail({
    from: configuracion.remitente,
    to: destinatario,
    subject: `[FeatMusic] Reporte sobre @${reportado}`,
    text: `Se recibió un reporte de usuario en FeatMusic.

Reportante: @${reportante}
Usuario reportado: @${reportado}
Motivo: ${motivoVisible}
Fecha: ${fechaVisible}

Descripción:
${descripcion}

Este reporte fue enviado directamente por correo y no se guardó en la base de datos.`,
    html: `
      <div style="background:#f1f5f9;padding:24px;font-family:Arial,sans-serif;color:#0f172a">
        <div style="max-width:640px;margin:auto;overflow:hidden;border:1px solid #dbe4ea;border-radius:18px;background:#ffffff">
          <div style="background:#020504;padding:22px 26px;color:#ffffff">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6ee7b7">FeatMusic · Seguridad</p>
            <h1 style="margin:0;font-size:24px">Nuevo reporte de usuario</h1>
          </div>
          <div style="padding:26px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700">Reportante</td><td style="padding:10px;border-bottom:1px solid #e2e8f0">@${escaparHtmlReporte(reportante)}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700">Reportado</td><td style="padding:10px;border-bottom:1px solid #e2e8f0">@${escaparHtmlReporte(reportado)}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700">Motivo</td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${escaparHtmlReporte(motivoVisible)}</td></tr>
              <tr><td style="padding:10px;border-bottom:1px solid #e2e8f0;font-weight:700">Fecha</td><td style="padding:10px;border-bottom:1px solid #e2e8f0">${escaparHtmlReporte(fechaVisible)}</td></tr>
            </table>
            <div style="margin-top:22px;padding:18px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#047857">Descripción</p>
              <p style="margin:0;white-space:pre-wrap;line-height:1.7;color:#334155">${escaparHtmlReporte(descripcion)}</p>
            </div>
            <p style="margin:20px 0 0;font-size:11px;line-height:1.6;color:#64748b">Este reporte llegó directamente al correo y no creó ningún registro en la base de datos.</p>
          </div>
        </div>
      </div>
    `,
  });
}

