import { redirigir } from "@/lib/redirect";
import { eliminarSesion } from "@/lib/session";

export async function POST() {
  await eliminarSesion();
  return redirigir("/");
}
