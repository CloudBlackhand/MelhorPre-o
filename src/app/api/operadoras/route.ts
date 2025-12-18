import { NextRequest, NextResponse } from "next/server";
import { OperadoraService } from "@/modules/operadoras/service";
import { CreateOperadoraSchema } from "@/types";
import { requireAdmin } from "@/lib/auth/middleware";

const operadoraService = new OperadoraService();

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

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const data = CreateOperadoraSchema.parse(body);

    const operadora = await operadoraService.create(data);

    return NextResponse.json(operadora, { status: 201 });
  } catch (error) {
    console.error("Error creating operadora:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Dados inválidos", details: (error as any).errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar operadora" },
      { status: 500 }
    );
  }
}

