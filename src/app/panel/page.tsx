import { redirect } from "next/navigation";

// FEATMUSIC_RETIRAR_PANEL_VIEJO_V1
// Esta ruta se conserva para enlaces y marcadores antiguos.
export default function PanelAntiguoPage() {
  redirect("/artistas/mi-perfil");
}
