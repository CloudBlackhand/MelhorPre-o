import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/middleware";

// GET - Buscar configuração (público para buscar whatsapp)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chave = searchParams.get("chave");

    if (chave) {
      const config = await prisma.config.findUnique({
        where: { chave },
      });

      if (!config) {
        return NextResponse.json(
          { error: "Configuração não encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(config);
    }

    // Se não especificar chave, retorna todas (apenas admin)
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const configs = await prisma.config.findMany({
      orderBy: { chave: "asc" },
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching configs:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// POST/PUT - Criar ou atualizar configuração (apenas admin)
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { chave, valor, descricao } = body;

    if (!chave || !valor) {
      return NextResponse.json(
        { error: "Chave e valor são obrigatórios" },
        { status: 400 }
      );
    }

    const config = await prisma.config.upsert({
      where: { chave },
      update: {
        valor,
        descricao: descricao || null,
      },
      create: {
        chave,
        valor,
        descricao: descricao || null,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return POST(request); // Mesma lógica do POST
}
