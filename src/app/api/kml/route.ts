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

function inferFromFeatureLabel(label: string): { operadoraNome?: string; nomeArea?: string } {
  if (!label) return {};
  const cleaned = label.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/\s*[-|:]\s*/).filter(Boolean);
  if (parts.length < 2) {
    return { nomeArea: cleaned || undefined };
  }

  const operadoraNome = parts[0].trim();
  const nomeArea = parts.slice(1).join(" - ").trim();
  return {
    operadoraNome: operadoraNome || undefined,
    nomeArea: nomeArea || undefined,
  };
}

function extractFeatureLabel(feature: any): string {
  const properties = feature?.properties || {};
  const value =
    properties.name ||
    properties.Name ||
    properties.title ||
    properties.TITLE ||
    properties.descricao ||
    properties.description ||
    "";
  return typeof value === "string" ? value.trim() : "";
}

async function resolveOrCreateOperadoraId(operadoraNome: string): Promise<string> {
  const normalizedName = normalizeText(operadoraNome);
  const operadoras = await operadoraService.getAll();

  const matchedOperadora = operadoras.find((op) => {
    const opName = normalizeText(op.nome);
    return opName === normalizedName || normalizedName.includes(opName) || opName.includes(normalizedName);
  });

  if (matchedOperadora) {
    return matchedOperadora.id;
  }

  const uniqueSlug = await buildUniqueSlug(operadoraNome);
  const createdOperadora = await operadoraService.create({
    nome: operadoraNome,
    slug: uniqueSlug,
    ativo: true,
  });
  return createdOperadora.id;
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

    // Parse uma vez e decide se salva 1 ou N áreas/operadoras
    const parseResult = KMLParser.parse(kmlString);
    if (!parseResult.isValid) {
      return NextResponse.json(
        { error: "Erro ao processar KML", details: parseResult.errors },
        { status: 400 }
      );
    }

    const inferredFromFile = inferFromFileName(file.name);

    // Se operadora foi definida manualmente, mantém comportamento de área única
    if (operadoraId) {
      const resolvedNomeArea = nomeArea || inferredFromFile.nomeArea || file.name.replace(/\.(kml|kmz)$/i, "");
      const singleResult = await coberturaService.processGeoJSON(
        parseResult.geojson,
        operadoraId,
        resolvedNomeArea,
        kmlString
      );

      if (!singleResult.success) {
        return NextResponse.json(
          { error: "Erro ao processar KML", details: singleResult.errors },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        area: singleResult.area,
        areas: singleResult.area ? [singleResult.area] : [],
      });
    }

    // Auto: tenta detectar múltiplas operadoras a partir dos nomes das features
    const groups = new Map<
      string,
      { operadoraNome: string; nomeAreaHint?: string; features: any[] }
    >();

    for (const feature of parseResult.geojson.features || []) {
      const label = extractFeatureLabel(feature);
      const fromLabel = inferFromFeatureLabel(label);
      const operadoraNome = fromLabel.operadoraNome || inferredFromFile.operadoraNome;
      const nomeAreaHint = fromLabel.nomeArea || inferredFromFile.nomeArea || label || undefined;

      if (!operadoraNome) continue;

      const key = normalizeText(operadoraNome);
      const current = groups.get(key);
      if (current) {
        current.features.push(feature);
        if (!current.nomeAreaHint && nomeAreaHint) current.nomeAreaHint = nomeAreaHint;
      } else {
        groups.set(key, {
          operadoraNome,
          nomeAreaHint,
          features: [feature],
        });
      }
    }

    // Fallback: não encontrou operadora em feature, usa inferência por nome do arquivo
    if (groups.size === 0 && inferredFromFile.operadoraNome) {
      groups.set(normalizeText(inferredFromFile.operadoraNome), {
        operadoraNome: inferredFromFile.operadoraNome,
        nomeAreaHint: inferredFromFile.nomeArea,
        features: parseResult.geojson.features || [],
      });
    }

    if (groups.size === 0) {
      return NextResponse.json(
        {
          error:
            "Não foi possível identificar operadora(s) automaticamente no arquivo. Selecione manualmente a operadora.",
        },
        { status: 400 }
      );
    }

    const createdAreas = [];
    const errors: string[] = [];

    for (const group of groups.values()) {
      try {
        const resolvedOperadoraId = await resolveOrCreateOperadoraId(group.operadoraNome);
        const groupGeoJSON = {
          type: "FeatureCollection" as const,
          features: group.features,
        };

        const baseNomeArea =
          nomeArea ||
          group.nomeAreaHint ||
          inferredFromFile.nomeArea ||
          `Cobertura ${group.operadoraNome}`;
        const resolvedNomeArea =
          groups.size > 1 && nomeArea
            ? `${baseNomeArea} - ${group.operadoraNome}`
            : baseNomeArea;

        const result = await coberturaService.processGeoJSON(
          groupGeoJSON,
          resolvedOperadoraId,
          resolvedNomeArea,
          kmlString
        );

        if (result.success && result.area) {
          createdAreas.push(result.area);
        } else {
          errors.push(
            `Falha ao processar operadora "${group.operadoraNome}": ${
              result.errors.join("; ") || "erro desconhecido"
            }`
          );
        }
      } catch (err) {
        errors.push(
          `Falha ao processar operadora "${group.operadoraNome}": ${
            err instanceof Error ? err.message : "erro desconhecido"
          }`
        );
      }
    }

    if (createdAreas.length === 0) {
      return NextResponse.json(
        { error: "Erro ao processar KML/KMZ", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      area: createdAreas[0],
      areas: createdAreas,
      warnings: errors,
      summary: {
        operadorasDetectadas: groups.size,
        areasCriadas: createdAreas.length,
      },
    });
  } catch (error) {
    console.error("Error processing KML:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
