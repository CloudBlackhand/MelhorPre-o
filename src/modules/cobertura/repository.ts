import { prisma } from "@/lib/db/prisma";
import type { CoberturaArea, CreateCoberturaAreaInput } from "@/types";

export class CoberturaRepository {
  async findAll(operadoraId?: string): Promise<CoberturaArea[]> {
    const where = operadoraId ? { operadoraId } : {};
    const areas = await prisma.coberturaArea.findMany({
      where,
      include: {
        operadora: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return areas.map((area) => ({
      id: area.id,
      operadoraId: area.operadoraId,
      nomeArea: area.nomeArea,
      geometria: area.geometria as any,
      kmlOriginal: area.kmlOriginal,
      rank: area.rank ?? null,
      score: area.score ?? null,
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
    })) as CoberturaArea[];
  }

  async findById(id: string): Promise<CoberturaArea | null> {
    const area = await prisma.coberturaArea.findUnique({
      where: { id },
      include: {
        operadora: true,
      },
    });

    if (!area) return null;

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

  async findByOperadoraId(operadoraId: string): Promise<CoberturaArea[]> {
    return this.findAll(operadoraId);
  }

  async create(data: CreateCoberturaAreaInput): Promise<CoberturaArea> {
    const area = await prisma.coberturaArea.create({
      data: {
        ...data,
        geometria: data.geometria,
        kmlOriginal: data.kmlOriginal || null,
      },
      include: {
        operadora: true,
      },
    });

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

  async update(id: string, data: Partial<CreateCoberturaAreaInput>): Promise<CoberturaArea> {
    const area = await prisma.coberturaArea.update({
      where: { id },
      data: {
        ...data,
        geometria: data.geometria !== undefined ? data.geometria : undefined,
      },
      include: {
        operadora: true,
      },
    });

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

  async delete(id: string): Promise<void> {
    await prisma.coberturaArea.delete({
      where: { id },
    });
  }

  /**
   * Find all coverage areas that might contain a point
   * This is a simplified version - in production with PostGIS, use ST_Contains
   */
  async findAreasContainingPoint(lat: number, lng: number): Promise<CoberturaArea[]> {
    // Get all areas (in production, use spatial index)
    const allAreas = await this.findAll();

    // Filter areas that contain the point
    // Note: This is done in memory - for production, use PostGIS ST_Contains
    const { GeometryService } = await import("./geometry-service");
    const containingAreas: CoberturaArea[] = [];

    for (const area of allAreas) {
      const geojson = area.geometria as any;
      if (geojson && geojson.type === "FeatureCollection") {
        if (GeometryService.pointInPolygons({ lat, lng }, geojson)) {
          containingAreas.push(area);
        }
      }
    }

    return containingAreas;
  }
}


