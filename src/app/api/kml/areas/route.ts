import { NextRequest, NextResponse } from "next/server";
import { CoberturaService } from "@/modules/cobertura/service";
import { requireAdmin } from "@/lib/auth/middleware";

const coberturaService = new CoberturaService();

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const operadoraId = searchParams.get("operadoraId");

    const areas = await coberturaService.getAllAreas(operadoraId || undefined);

    return NextResponse.json(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar áreas de cobertura" },
      { status: 500 }
    );
  }
}

/** Apaga todas as áreas de cobertura do banco. Requer autenticação admin. */
export async function DELETE(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { deleted } = await coberturaService.deleteAllAreas();
    return NextResponse.json({ deleted, message: `${deleted} área(s) de cobertura removida(s).` });
  } catch (error) {
    console.error("Error deleting all areas:", error);
    return NextResponse.json(
      { error: "Erro ao apagar áreas de cobertura" },
      { status: 500 }
    );
  }
}


