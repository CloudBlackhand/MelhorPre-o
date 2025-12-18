import { NextRequest, NextResponse } from "next/server";
import { CoberturaService } from "@/modules/cobertura/service";
import { requireAdmin } from "@/lib/auth/middleware";

const coberturaService = new CoberturaService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    await coberturaService.deleteArea(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting area:", error);
    return NextResponse.json(
      { error: "Erro ao deletar área de cobertura" },
      { status: 500 }
    );
  }
}

