import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { CoberturaService } from "@/modules/cobertura/service";
import { KMLParser } from "@/modules/cobertura/kml-parser";
import { requireAdmin } from "@/lib/auth/middleware";

const coberturaService = new CoberturaService();

async function extractKmlFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".kmz")) {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    // KMZ geralmente tem doc.kml na raiz
    const docKml = zip.file("doc.kml") ?? zip.file(/\.kml$/i)[0];
    if (!docKml) {
      throw new Error("KMZ não contém arquivo .kml (procure doc.kml ou qualquer .kml)");
    }
    return docKml.async("string");
  }
  return file.text();
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const operadoraId = formData.get("operadoraId") as string;
    const nomeArea = formData.get("nomeArea") as string;

    if (!file) {
      return NextResponse.json({ error: "Arquivo KML/KMZ é obrigatório" }, { status: 400 });
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

    // Read content: KML direto ou extrair do KMZ
    let kmlString: string;
    try {
      kmlString = await extractKmlFromFile(file);
    } catch (err) {
      return NextResponse.json(
        { error: "Erro ao ler arquivo", message: err instanceof Error ? err.message : "KMZ inválido ou sem .kml" },
        { status: 400 }
      );
    }

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
