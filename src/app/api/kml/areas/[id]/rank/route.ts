import { NextRequest, NextResponse } from "next/server";
import { CoberturaService } from "@/modules/cobertura/service";
import { requireAdmin } from "@/lib/auth/middleware";

const coberturaService = new CoberturaService();

/**
 * Atualiza o rank e score de uma área de cobertura
 * PUT /api/kml/areas/[id]/rank
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = params;
    const body = await request.json();
    const { rank, score } = body;

    if (rank !== undefined && (typeof rank !== "number" || rank < 0)) {
      return NextResponse.json(
        { error: "Rank deve ser um número positivo" },
        { status: 400 }
      );
    }

    if (score !== undefined && (typeof score !== "number" || score < 0 || score > 10)) {
      return NextResponse.json(
        { error: "Score deve ser um número entre 0 e 10" },
        { status: 400 }
      );
    }

    const updated = await coberturaService.updateRank(id, {
      rank: rank !== undefined ? rank : null,
      score: score !== undefined ? score : null,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Área de cobertura não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating rank:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar rank" },
      { status: 500 }
    );
  }
}
