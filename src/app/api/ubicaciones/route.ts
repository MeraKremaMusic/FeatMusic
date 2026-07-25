import { NextResponse } from "next/server";

import {
  obtenerCiudades,
  obtenerDepartamentos,
  obtenerPaises,
} from "@/lib/ubicaciones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODIGO_PAIS_REGEX = /^[A-Z]{2}$/;
const CODIGO_DEPARTAMENTO_REGEX = /^[A-Z0-9_-]{1,30}$/;

function respuesta(opciones: Awaited<ReturnType<typeof obtenerPaises>>) {
  return NextResponse.json(
    { ok: true, opciones },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pais = (searchParams.get("pais") ?? "").trim().toUpperCase();
    const departamento = (searchParams.get("departamento") ?? "")
      .trim()
      .toUpperCase();

    if (!pais) {
      return respuesta(await obtenerPaises());
    }

    if (!CODIGO_PAIS_REGEX.test(pais)) {
      return NextResponse.json(
        { ok: false, mensaje: "El código del país no es válido." },
        { status: 400 },
      );
    }

    if (!departamento) {
      return respuesta(await obtenerDepartamentos(pais));
    }

    if (!CODIGO_DEPARTAMENTO_REGEX.test(departamento)) {
      return NextResponse.json(
        { ok: false, mensaje: "El código del departamento no es válido." },
        { status: 400 },
      );
    }

    return respuesta(await obtenerCiudades(pais, departamento));
  } catch (error) {
    console.error("No se pudieron cargar las ubicaciones.", error);
    return NextResponse.json(
      {
        ok: false,
        mensaje: "No se pudieron cargar las ubicaciones. Inténtalo nuevamente.",
      },
      { status: 500 },
    );
  }
}
