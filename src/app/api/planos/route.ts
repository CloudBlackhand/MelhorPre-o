import { NextRequest, NextResponse } from "next/server";
import { PlanoService } from "@/modules/planos/service";
import { CreatePlanoSchema } from "@/types";
import { requireAdmin } from "@/lib/auth/middleware";

const planoService = new PlanoService();

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

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const data = CreatePlanoSchema.parse(body);

    const plano = await planoService.create(data);

    return NextResponse.json(plano, { status: 201 });
  } catch (error) {
    console.error("Error creating plano:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar plano" },
      { status: 500 }
    );
  }
}

