import { NextRequest, NextResponse } from "next/server";
import { OperadoraService } from "@/modules/operadoras/service";

const operadoraService = new OperadoraService();

/** GET: lista operadoras (leitura). Cadastro removido: operadoras definidas no código/seed. */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ativo = searchParams.get("ativo");

    const operadoras = await operadoraService.getAll(
      ativo !== null ? ativo === "true" : undefined
    );

    return NextResponse.json(operadoras);
  } catch (error) {
    console.error("Error fetching operadoras:", error);
    return NextResponse.json(
      { error: "Erro ao buscar operadoras" },
      { status: 500 }
    );
  }
}


