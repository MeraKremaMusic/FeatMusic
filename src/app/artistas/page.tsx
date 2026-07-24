import { obtenerSesion } from "@/lib/session";
import ArtistasClient from "./ArtistasClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArtistasPage() {
  const sesion = await obtenerSesion();

  return <ArtistasClient sesionActiva={Boolean(sesion)} />;
}