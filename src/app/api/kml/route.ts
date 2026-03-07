import { NextRequest, NextResponse } from "next/server";

/** Upload de KML desativado: áreas de cobertura são definidas via seed (pasta KM/). */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Upload de KML desativado",
      mensagem: "Áreas de cobertura são carregadas pelo seed a partir da pasta KM/. Rode o seed no deploy ou localmente.",
    },
    { status: 410 }
  );
}
