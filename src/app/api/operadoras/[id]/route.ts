import { NextRequest, NextResponse } from "next/server";
import { OperadoraService } from "@/modules/operadoras/service";
import { requireAdmin } from "@/lib/auth/middleware";
import { z } from "zod";

const operadoraService = new OperadoraService();

const UpdateOrdemSchema = z.object({
  ordemRecomendacao: z.number().int().min(0).nullable().optional(),
  ativo: z.boolean().optional(),
});

/** GET: uma operadora (leitura). */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const operadora = await operadoraService.getById(params.id);

    if (!operadora) {
      return NextResponse.json({ error: "Operadora não encontrada" }, { status: 404 });
    }

    return NextResponse.json(operadora);
  } catch (error) {
    console.error("Error fetching operadora:", error);
    return NextResponse.json(
      { error: "Erro ao buscar operadora" },
      { status: 500 }
    );
  }
}

/** PUT: apenas ordem/ativo (admin). Cadastro removido: operadoras definidas no código/seed. */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const data = UpdateOrdemSchema.parse(body);

    const operadora = await operadoraService.update(params.id, data);

    return NextResponse.json(operadora);
  } catch (error) {
    console.error("Error updating operadora:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar operadora" },
      { status: 500 }
    );
  }
}


