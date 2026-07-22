import { NextResponse } from "next/server";

import { eliminarSesion } from "@/lib/session";

export async function POST(request: Request) {
  await eliminarSesion();
  return NextResponse.redirect(new URL("/", request.url), 303);
}
