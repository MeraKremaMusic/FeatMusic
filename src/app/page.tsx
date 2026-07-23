import { redirect } from "next/navigation";

import { obtenerSesion } from "@/lib/session";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const sesion = await obtenerSesion();

  if (sesion) {
    redirect("/panel");
  }

  return <HomeClient />;
}