import { NextRequest, NextResponse } from "next/server";
import { PlanoService } from "@/modules/planos/service";

const planoService = new PlanoService();

/** GET: lista planos (leitura). Cadastro removido: planos definidos no código/seed. */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const operadoraId = searchParams.get("operadoraId");
    const ativo = searchParams.get("ativo");

    const planos = await planoService.getAll(
      operadoraId || undefined,
      ativo !== null ? ativo === "true" : undefined
    );

    return NextResponse.json(planos);
  } catch (error) {
    console.error("Error fetching planos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar planos" },
      { status: 500 }
    );
  }
}


