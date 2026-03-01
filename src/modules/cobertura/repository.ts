import { prisma } from "@/lib/db/prisma";
import type { CoberturaArea, CreateCoberturaAreaInput } from "@/types";
import type { FeatureCollection } from "geojson";

interface BBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

function computeBBox(geojson: unknown): BBox | null {
  const fc = geojson as FeatureCollection | undefined;
  if (!fc?.features?.length) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const processCoords = (coords: number[]) => {
    const [lng, lat] = coords;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  };

  const walk = (coords: any): void => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === "number") {
      processCoords(coords as number[]);
    } else {
      for (const c of coords) walk(c);
    }
  };

  for (const feature of fc.features) {
    if (feature.geometry && "coordinates" in feature.geometry) {
      walk((feature.geometry as any).coordinates);
    }
  }

  if (!Number.isFinite(minLat)) return null;
  return { minLat, maxLat, minLng, maxLng };
}

function mapArea(area: any): CoberturaArea {
  return {
    id: area.id,
    operadoraId: area.operadoraId,
    nomeArea: area.nomeArea,
    geometria: area.geometria as any,
    kmlOriginal: area.kmlOriginal,
    rank: area.rank ?? null,
    score: area.score ?? null,
    createdAt: area.createdAt,
    updatedAt: area.updatedAt,
  } as CoberturaArea;
}

export class CoberturaRepository {
  async findAll(operadoraId?: string): Promise<CoberturaArea[]> {
    const where = operadoraId ? { operadoraId } : {};
    const areas = await prisma.coberturaArea.findMany({
      where,
      include: { operadora: true },
      orderBy: { createdAt: "desc" },
    });
    return areas.map(mapArea);
  }

  async findById(id: string): Promise<CoberturaArea | null> {
    const area = await prisma.coberturaArea.findUnique({
      where: { id },
      include: { operadora: true },
    });
    return area ? mapArea(area) : null;
  }

  async findByOperadoraId(operadoraId: string): Promise<CoberturaArea[]> {
    return this.findAll(operadoraId);
  }

  async create(data: CreateCoberturaAreaInput): Promise<CoberturaArea> {
    const bbox = computeBBox(data.geometria);

    const area = await prisma.coberturaArea.create({
      data: {
        ...data,
        geometria: data.geometria,
        kmlOriginal: data.kmlOriginal || null,
        bboxMinLat: bbox?.minLat ?? null,
        bboxMaxLat: bbox?.maxLat ?? null,
        bboxMinLng: bbox?.minLng ?? null,
        bboxMaxLng: bbox?.maxLng ?? null,
      },
      include: { operadora: true },
    });

    return mapArea(area);
  }

  async update(id: string, data: Partial<CreateCoberturaAreaInput>): Promise<CoberturaArea> {
    const updateData: any = {
      ...data,
      geometria: data.geometria !== undefined ? data.geometria : undefined,
    };

    if (data.geometria !== undefined) {
      const bbox = computeBBox(data.geometria);
      updateData.bboxMinLat = bbox?.minLat ?? null;
      updateData.bboxMaxLat = bbox?.maxLat ?? null;
      updateData.bboxMinLng = bbox?.minLng ?? null;
      updateData.bboxMaxLng = bbox?.maxLng ?? null;
    }

    const area = await prisma.coberturaArea.update({
      where: { id },
      data: updateData,
      include: { operadora: true },
    });

    return mapArea(area);
  }

  async delete(id: string): Promise<void> {
    await prisma.coberturaArea.delete({ where: { id } });
  }

  async deleteAll(): Promise<number> {
    const result = await prisma.coberturaArea.deleteMany({});
    return result.count;
  }

  /**
   * Pre-filter by bounding box in SQL, then refine with Turf.js point-in-polygon in memory.
   */
  async findAreasContainingPoint(lat: number, lng: number): Promise<CoberturaArea[]> {
    // SQL pre-filter: only load areas whose bbox contains the point
    const candidates = await prisma.coberturaArea.findMany({
      where: {
        OR: [
          // Areas with bbox set — filter by bounds
          {
            bboxMinLat: { not: null, lte: lat },
            bboxMaxLat: { not: null, gte: lat },
            bboxMinLng: { not: null, lte: lng },
            bboxMaxLng: { not: null, gte: lng },
          },
          // Areas without bbox (legacy data) — include to avoid missing them
          { bboxMinLat: null },
        ],
      },
      include: { operadora: true },
    });

    const { GeometryService } = await import("./geometry-service");
    const containingAreas: CoberturaArea[] = [];

    for (const raw of candidates) {
      const area = mapArea(raw);
      const geojson = area.geometria as any;
      if (geojson?.type === "FeatureCollection") {
        if (GeometryService.pointInPolygons({ lat, lng }, geojson)) {
          containingAreas.push(area);
        }
      }
    }

    return containingAreas;
  }
}
