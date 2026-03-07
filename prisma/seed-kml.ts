/**
 * Seed de cobertura a partir dos KMLs na pasta KM/.
 *
 * Estrutura esperada:
 *   KM/doc.kml              → Vero/AmNET (pastas = operadoras)
 *   KM/Area-de-Cobertura*.kml → Desktop (GPON por cidade)
 *   KM/*.kmz / *.zip        → KMZ (extrai .kml de dentro)
 *
 * Roda: npx tsx prisma/seed-kml.ts
 */
import { PrismaClient } from "@prisma/client";
import { DOMParser } from "@xmldom/xmldom";
import tj from "@mapbox/togeojson";
import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import type { FeatureCollection, Feature, Geometry } from "geojson";

const prisma = new PrismaClient();

const KM_DIR = path.resolve(__dirname, "..", "KM");

// ─── Helpers ────────────────────────────────────────────────

interface BBox { minLat: number; maxLat: number; minLng: number; maxLng: number }

function computeBBox(fc: FeatureCollection): BBox | null {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  const walk = (c: any): void => {
    if (!Array.isArray(c)) return;
    if (typeof c[0] === "number") {
      const [lng, lat] = c;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    } else { for (const x of c) walk(x); }
  };
  for (const f of fc.features) {
    if (f.geometry && "coordinates" in f.geometry) walk((f.geometry as any).coordinates);
  }
  return Number.isFinite(minLat) ? { minLat, maxLat, minLng, maxLng } : null;
}

/** Convert closed LineString features to Polygon. */
function prepareFeatures(features: Feature[]): Feature[] {
  const out: Feature[] = [];
  for (const f of features) {
    if (!f.geometry) continue;
    const g = f.geometry;
    if (g.type === "Polygon" || g.type === "MultiPolygon") {
      out.push(f);
    } else if (g.type === "LineString") {
      const coords = (g as any).coordinates;
      if (coords && coords.length >= 3) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        const closed =
          (first[0] === last[0] && first[1] === last[1]) ||
          (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
        if (closed) {
          out.push({ ...f, geometry: { type: "Polygon", coordinates: [coords] } as Geometry });
        }
      }
    }
  }
  return out;
}

// ─── XML Folder Tree Parsing ────────────────────────────────

interface FolderNode {
  name: string;
  placemarks: Element[];
  children: FolderNode[];
}

function parseFolderTree(el: Element): FolderNode {
  const nameEl = Array.from(el.childNodes).find(
    (n) => n.nodeName === "name"
  ) as Element | undefined;
  const name = nameEl?.textContent?.trim() || "";

  const placemarks: Element[] = [];
  const children: FolderNode[] = [];

  for (let i = 0; i < el.childNodes.length; i++) {
    const child = el.childNodes[i] as Element;
    if (child.nodeName === "Folder") {
      children.push(parseFolderTree(child));
    } else if (child.nodeName === "Placemark") {
      placemarks.push(child);
    }
  }

  return { name, placemarks, children };
}

/** Convert a single Placemark Element to a GeoJSON Feature using togeojson. */
function placemarkToFeature(placemark: Element, doc: Document): Feature | null {
  const wrapper = doc.createElement("kml");
  const docEl = doc.createElement("Document");
  docEl.appendChild(placemark.cloneNode(true));
  wrapper.appendChild(docEl);

  const tmpDoc = new DOMParser().parseFromString(wrapper.toString(), "text/xml");
  const fc = tj.kml(tmpDoc) as FeatureCollection;
  return fc.features?.[0] || null;
}

/** Collect all features under a folder tree recursively. */
function collectFeatures(node: FolderNode, xmlDoc: Document): Feature[] {
  const features: Feature[] = [];
  for (const pm of node.placemarks) {
    const f = placemarkToFeature(pm, xmlDoc);
    if (f) features.push(f);
  }
  for (const child of node.children) {
    features.push(...collectFeatures(child, xmlDoc));
  }
  return features;
}

// ─── Operator groups from Folder hierarchy ──────────────────

interface OperatorGroup {
  operatorName: string;
  areaName: string;
  features: Feature[];
}

/**
 * doc.kml hierarchy:
 *   Document > Folder "AREA DE COBERTURA NOVA VERO"
 *     > Folder "AmNET rede Corp" (placemarks)
 *     > Folder "VERO"
 *       > Folder "CONEXÃO CERRADO" (placemarks)
 *       > Folder "CONEXÃO DO SUL" (placemarks)
 *       ...
 *     > Folder "AmNET Varejo e Corp"
 *       > Folder "GRUPO AMERICANET" (placemarks)
 *       ...
 */
function extractDocKmlGroups(root: FolderNode, xmlDoc: Document): OperatorGroup[] {
  const groups: OperatorGroup[] = [];

  for (const topFolder of root.children) {
    if (topFolder.children.length === 0) {
      // Leaf folder with placemarks → single operator
      const features = collectFeatures(topFolder, xmlDoc);
      if (features.length > 0) {
        groups.push({
          operatorName: topFolder.name,
          areaName: topFolder.name,
          features,
        });
      }
    } else {
      // Has sub-folders → each sub-folder is a separate operator/area
      for (const subFolder of topFolder.children) {
        const features = collectFeatures(subFolder, xmlDoc);
        if (features.length > 0) {
          const operatorName = topFolder.name === "VERO"
            ? `VERO ${subFolder.name}`.trim()
            : subFolder.name;
          groups.push({
            operatorName,
            areaName: subFolder.name,
            features,
          });
        }
      }
      // Also grab any direct placemarks in the parent folder
      if (topFolder.placemarks.length > 0) {
        const directFeatures: Feature[] = [];
        for (const pm of topFolder.placemarks) {
          const f = placemarkToFeature(pm, xmlDoc);
          if (f) directFeatures.push(f);
        }
        if (directFeatures.length > 0) {
          groups.push({
            operatorName: topFolder.name,
            areaName: topFolder.name,
            features: directFeatures,
          });
        }
      }
    }
  }

  return groups;
}

/**
 * Area-de-Cobertura KML hierarchy:
 *   Document > ... styles ... > Folder "Area-de-Cobertura"
 *     > Folder "GPON" > Folder "Cidade"
 *       > Folder "Aguaí" (placemarks)
 *       > Folder "Americana" > sub-folders (placemarks)
 *       ...
 *
 * All areas belong to a single operator ("Desktop").
 */
function extractDesktopKmlGroups(root: FolderNode, xmlDoc: Document): OperatorGroup[] {
  const allFeatures = collectFeatures(root, xmlDoc);
  if (allFeatures.length === 0) return [];

  return [{
    operatorName: "Desktop",
    areaName: "Area de Cobertura Desktop",
    features: allFeatures,
  }];
}

// ─── DB operations ──────────────────────────────────────────
// Operadoras vêm do config (seed principal). Só criamos áreas para operadoras existentes.

async function getOperadoraIdByKmlName(operatorName: string): Promise<string | null> {
  const { resolveSlugByKmlOperatorName } = await import("../src/config/operadoras-planos");
  const slug = resolveSlugByKmlOperatorName(operatorName);
  if (!slug) return null;
  const operadora = await prisma.operadora.findUnique({ where: { slug } });
  return operadora?.id ?? null;
}

async function createCoberturaArea(
  operadoraId: string,
  nomeArea: string,
  features: Feature[],
): Promise<void> {
  const prepared = prepareFeatures(features);
  if (prepared.length === 0) {
    console.log(`  ⁃ "${nomeArea}": 0 polígonos válidos, pulando`);
    return;
  }

  const fc: FeatureCollection = { type: "FeatureCollection", features: prepared };
  const bbox = computeBBox(fc);

  // Skip if area with same name already exists for this operadora
  const existing = await prisma.coberturaArea.findFirst({
    where: { operadoraId, nomeArea },
  });
  if (existing) {
    console.log(`  ⁃ "${nomeArea}": já existe, pulando`);
    return;
  }

  await prisma.coberturaArea.create({
    data: {
      operadoraId,
      nomeArea,
      geometria: fc as any,
      bboxMinLat: bbox?.minLat ?? null,
      bboxMaxLat: bbox?.maxLat ?? null,
      bboxMinLng: bbox?.minLng ?? null,
      bboxMaxLng: bbox?.maxLng ?? null,
    },
  });

  console.log(`  + "${nomeArea}": ${prepared.length} polígono(s) salvos`);
}

// ─── File processing ────────────────────────────────────────

async function readKmlFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".kml") {
    return fs.readFileSync(filePath, "utf-8");
  }
  if (ext === ".kmz" || ext === ".zip") {
    const buf = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(buf);
    const kmlFile = zip.file("doc.kml") ?? zip.file(/\.kml$/i)[0];
    if (!kmlFile) throw new Error(`Nenhum .kml encontrado dentro de ${filePath}`);
    return kmlFile.async("string");
  }
  throw new Error(`Extensão não suportada: ${ext}`);
}

function isDesktopKml(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.includes("area-de-cobertura") || lower.includes("area de cobertura 30");
}

async function processKmlFile(filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  console.log(`\nProcessando: ${fileName}`);

  const kmlString = await readKmlFromFile(filePath);
  const xmlDoc = new DOMParser().parseFromString(kmlString, "text/xml");

  // Find the Document element
  const docElements = xmlDoc.getElementsByTagName("Document");
  if (docElements.length === 0) {
    console.log("  Sem <Document>, pulando");
    return;
  }
  const documentEl = docElements[0];

  // Find the top-level Folder(s)
  const topFolders: FolderNode[] = [];
  for (let i = 0; i < documentEl.childNodes.length; i++) {
    const child = documentEl.childNodes[i] as Element;
    if (child.nodeName === "Folder") {
      topFolders.push(parseFolderTree(child));
    }
  }

  if (topFolders.length === 0) {
    console.log("  Sem <Folder> no Document, pulando");
    return;
  }

  let groups: OperatorGroup[];

  if (isDesktopKml(fileName)) {
    // Desktop KML: single operator, all features
    groups = [];
    for (const folder of topFolders) {
      groups.push(...extractDesktopKmlGroups(folder, xmlDoc));
    }
  } else {
    // Vero/AmNET KML: multiple operators from folder hierarchy
    groups = [];
    for (const folder of topFolders) {
      groups.push(...extractDocKmlGroups(folder, xmlDoc));
    }
  }

  console.log(`  ${groups.length} grupo(s) de operadoras encontrados`);

  for (const group of groups) {
    const operadoraId = await getOperadoraIdByKmlName(group.operatorName);
    if (!operadoraId) {
      console.log(`  ⁃ Operadora não mapeada no config, pulando: "${group.operatorName}"`);
      continue;
    }
    await createCoberturaArea(operadoraId, group.areaName, group.features);
  }
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log("=== Seed KML: carregando coberturas da pasta KM/ ===");

  if (!fs.existsSync(KM_DIR)) {
    console.log(`Pasta ${KM_DIR} não encontrada. Nada a importar.`);
    return;
  }

  const files = fs.readdirSync(KM_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext === ".kml" || ext === ".kmz" || ext === ".zip";
  });

  if (files.length === 0) {
    console.log("Nenhum arquivo KML/KMZ encontrado na pasta KM/.");
    return;
  }

  console.log(`Encontrados ${files.length} arquivo(s): ${files.join(", ")}`);

  for (const file of files) {
    try {
      await processKmlFile(path.join(KM_DIR, file));
    } catch (err) {
      console.error(`  Erro ao processar ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("\n=== Seed KML concluído ===");
}

main()
  .catch((e) => {
    console.error("Erro fatal no seed-kml:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
