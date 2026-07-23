import bcrypt from "bcryptjs";
import { z } from "zod";

import { MAXIMO_INTENTOS_CODIGO } from "@/lib/codigos";
import { prisma } from "@/lib/prisma";
import { redirigir } from "@/lib/redirect";

const schema = z.object({
  correo: z.string().trim().email().toLowerCase(),
  codigo: z.string().trim().regex(/^\d{6}$/),
  password: z.string().min(8).max(128),
  repetirPassword: z.string().min(8).max(128),
}).refine((datos) => datos.password === datos.repetirPassword, { path: ["repetirPassword"] });

const ruta = (correo: string, error: string) => `/restablecer-contrasena?${new URLSearchParams({ correo, error }).toString()}`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resultado = schema.safeParse({ correo: formData.get("correo"), codigo: formData.get("codigo"), password: formData.get("password"), repetirPassword: formData.get("repetirPassword") });
    if (!resultado.success) return redirigir(ruta(String(formData.get("correo") ?? ""), "datos-invalidos"));
    const datos = resultado.data;
    const recuperacion = await prisma.recuperacionPassword.findUnique({ where: { correo: datos.correo } });
    if (!recuperacion || recuperacion.codigoExpiraEn < new Date()) return redirigir(ruta(datos.correo, "codigo-vencido"));
    if (recuperacion.intentosCodigo >= MAXIMO_INTENTOS_CODIGO) return redirigir(ruta(datos.correo, "demasiados-intentos"));
    if (!(await bcrypt.compare(datos.codigo, recuperacion.codigoHash))) {
      await prisma.recuperacionPassword.update({ where: { id: recuperacion.id }, data: { intentosCodigo: { increment: 1 } } });
      return redirigir(ruta(datos.correo, "codigo-incorrecto"));
    }
    await prisma.$transaction([
      prisma.usuario.update({ where: { correo: datos.correo }, data: { passwordHash: await bcrypt.hash(datos.password, 12) } }),
      prisma.recuperacionPassword.delete({ where: { id: recuperacion.id } }),
    ]);
    return redirigir("/iniciar-sesion?exito=password-restablecida");
  } catch (error) {
    console.error("No se pudo restablecer la contraseña.", error);
    return redirigir("/recuperar-contrasena?error=servidor");
  }
}
