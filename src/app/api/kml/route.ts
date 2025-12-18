import { NextRequest, NextResponse } from "next/server";
import { CoberturaService } from "@/modules/cobertura/service";
import { KMLParser } from "@/modules/cobertura/kml-parser";
import { requireAdmin } from "@/lib/auth/middleware";

const coberturaService = new CoberturaService();

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const operadoraId = formData.get("operadoraId") as string;
    const nomeArea = formData.get("nomeArea") as string;

    if (!file) {
      return NextResponse.json({ error: "Arquivo KML é obrigatório" }, { status: 400 });
    }

    if (!operadoraId) {
      return NextResponse.json({ error: "Operadora é obrigatória" }, { status: 400 });
    }

    if (!nomeArea) {
      return NextResponse.json({ error: "Nome da área é obrigatório" }, { status: 400 });
    }

    // Validate file
    const fileValidation = KMLParser.validateKMLFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: "Arquivo inválido", details: fileValidation.errors },
        { status: 400 }
      );
    }

    // Read file content
    const kmlString = await file.text();

    // Process KML
    const result = await coberturaService.processKML(kmlString, operadoraId, nomeArea);

    if (!result.success) {
      return NextResponse.json(
        { error: "Erro ao processar KML", details: result.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      area: result.area,
    });
  } catch (error) {
    console.error("Error processing KML:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
