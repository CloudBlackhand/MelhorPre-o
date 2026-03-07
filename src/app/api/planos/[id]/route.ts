import { NextRequest, NextResponse } from "next/server";
import { PlanoService } from "@/modules/planos/service";

const planoService = new PlanoService();

/** GET: um plano (leitura). Cadastro removido: planos definidos no código/seed. */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plano = await planoService.getById(params.id);

    if (!plano) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    return NextResponse.json(plano);
  } catch (error) {
    console.error("Error fetching plano:", error);
    return NextResponse.json(
      { error: "Erro ao buscar plano" },
      { status: 500 }
    );
  }
}


