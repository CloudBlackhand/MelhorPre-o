import { NextRequest, NextResponse } from "next/server";
import { OperadoraService } from "@/modules/operadoras/service";
import { CreateOperadoraSchema } from "@/types";
import { requireAdmin } from "@/lib/auth/middleware";

const operadoraService = new OperadoraService();

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const data = CreateOperadoraSchema.partial().parse(body);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await operadoraService.delete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting operadora:", error);
    return NextResponse.json(
      { error: "Erro ao deletar operadora" },
      { status: 500 }
    );
  }
}

