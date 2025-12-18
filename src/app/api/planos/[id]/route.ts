import { NextRequest, NextResponse } from "next/server";
import { PlanoService } from "@/modules/planos/service";
import { CreatePlanoSchema } from "@/types";
import { requireAdmin } from "@/lib/auth/middleware";

const planoService = new PlanoService();

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const data = CreatePlanoSchema.partial().parse(body);

    const plano = await planoService.update(params.id, data);

    return NextResponse.json(plano);
  } catch (error) {
    console.error("Error updating plano:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar plano" },
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

    await planoService.delete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting plano:", error);
    return NextResponse.json(
      { error: "Erro ao deletar plano" },
      { status: 500 }
    );
  }
}


