// FEATMUSIC_ENTRADA_PERFIL_NUEVO_V2
import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/session";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const sesion = await obtenerSesion();

  if (sesion) {
    redirect("/artistas/mi-perfil");
  }

  return <HomeClient />;
}