import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { CoberturaService } from "@/modules/cobertura/service";
import { KMLParser } from "@/modules/cobertura/kml-parser";
import { OperadoraService } from "@/modules/operadoras/service";
import { requireAdmin } from "@/lib/auth/middleware";

const coberturaService = new CoberturaService();
const operadoraService = new OperadoraService();

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

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slugify(value: string): string {
  const slug = normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "operadora";
}

async function buildUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = slugify(baseName);
  let candidate = baseSlug;
  let suffix = 2;

  while (await operadoraService.getBySlug(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function inferFromFileName(fileName: string): { operadoraNome?: string; nomeArea?: string } {
  const baseName = fileName.replace(/\.(kml|kmz)$/i, "").trim();
  const cleaned = baseName.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/\s*[-|]\s*/).filter(Boolean);
  const noiseRegex =
    /\b(cobertura|area|área|regiao|região|mapa|poligono|polígono|kml|kmz|google earth|googleearth)\b/gi;

  const stripNoise = (value: string): string =>
    value.replace(noiseRegex, " ").replace(/\s+/g, " ").trim();

  const rawOperadora = parts[0] || cleaned;
  const rawArea = parts.length > 1 ? parts.slice(1).join(" - ") : cleaned;

  const operadoraNome = stripNoise(rawOperadora);
  let nomeArea = stripNoise(rawArea);

  if (!nomeArea || normalizeText(nomeArea) === normalizeText(operadoraNome)) {
    nomeArea = cleaned;
  }

  return {
    operadoraNome: operadoraNome || undefined,
    nomeArea: nomeArea || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const operadoraId = ((formData.get("operadoraId") as string) || "").trim();
    const nomeArea = ((formData.get("nomeArea") as string) || "").trim();

    if (!file) {
      return NextResponse.json({ error: "Arquivo KML/KMZ é obrigatório" }, { status: 400 });
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

    // Resolve operadora e nome da área automaticamente quando não enviados
    const inferred = inferFromFileName(file.name);
    const resolvedNomeArea = nomeArea || inferred.nomeArea;
    let resolvedOperadoraId = operadoraId;

    if (!resolvedNomeArea) {
      return NextResponse.json(
        {
          error: "Não foi possível identificar o nome da área automaticamente. Informe manualmente.",
        },
        { status: 400 }
      );
    }

    if (!resolvedOperadoraId) {
      const operadoras = await operadoraService.getAll();
      const normalizedFileName = normalizeText(file.name);
      const normalizedInferredOperadora = inferred.operadoraNome
        ? normalizeText(inferred.operadoraNome)
        : "";

      const matchedOperadora = operadoras.find((op) => {
        const opName = normalizeText(op.nome);
        return (
          normalizedFileName.includes(opName) ||
          (normalizedInferredOperadora && normalizedInferredOperadora.includes(opName))
        );
      });

      if (matchedOperadora) {
        resolvedOperadoraId = matchedOperadora.id;
      } else if (inferred.operadoraNome) {
        const uniqueSlug = await buildUniqueSlug(inferred.operadoraNome);
        const createdOperadora = await operadoraService.create({
          nome: inferred.operadoraNome,
          slug: uniqueSlug,
          ativo: true,
        });
        resolvedOperadoraId = createdOperadora.id;
      } else {
        return NextResponse.json(
          {
            error:
              "Não foi possível identificar a operadora automaticamente. Selecione uma operadora manualmente.",
          },
          { status: 400 }
        );
      }
    }

    // Process KML
    const result = await coberturaService.processKML(
      kmlString,
      resolvedOperadoraId,
      resolvedNomeArea
    );

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
