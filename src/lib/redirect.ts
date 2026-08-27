import { NextResponse } from "next/server";

export function redirigir(ruta: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: ruta },
  });
}
