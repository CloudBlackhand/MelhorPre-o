import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { GeometryService } from "@/modules/cobertura/geometry-service";
import * as turf from "@turf/turf";

export const dynamic = "force-dynamic";

/**
 * GET /api/kml/debug?lat=X&lng=Y
 * Debug endpoint — tests point-in-polygon for every stored area, including LineString circles.
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Parâmetros lat e lng são obrigatórios" },
        { status: 400 }
      );
    }

    const testLat = parseFloat(lat);
    const testLng = parseFloat(lng);

    if (isNaN(testLat) || isNaN(testLng)) {
      return NextResponse.json(
        { error: "Coordenadas inválidas" },
        { status: 400 }
      );
    }

    const areas = await prisma.coberturaArea.findMany({
      include: { operadora: true },
      orderBy: { createdAt: "desc" },
    });

    const results = areas.map((area) => {
      const geojson = area.geometria as any;

      if (!geojson || geojson.type !== "FeatureCollection") {
        return {
          areaId: area.id,
          nomeArea: area.nomeArea,
          operadora: area.operadora.nome,
          status: "invalid_geojson",
          featureCount: 0,
          details: "GeoJSON inválido ou não é FeatureCollection",
        };
      }

      const featureCount = geojson.features?.length || 0;

      // Use the same logic as the main flow
      const containsPoint = GeometryService.pointInPolygons(
        { lat: testLat, lng: testLng },
        geojson
      );

      // Build per-feature details for debugging
      const testDetails: any[] = [];
      const turfPoint = turf.point([testLng, testLat]);

      for (let i = 0; i < featureCount; i++) {
        const feature = geojson.features[i];
        if (!feature.geometry) continue;

        const geometry = feature.geometry;
        let contains = false;
        let error: string | null = null;

        try {
          if (geometry.type === "Polygon") {
            const polygon = turf.polygon(geometry.coordinates);
            contains = turf.booleanPointInPolygon(turfPoint, polygon);
            const bbox = turf.bbox(polygon);
            testDetails.push({
              featureIndex: i,
              type: "Polygon",
              contains,
              bbox: { minLng: bbox[0], minLat: bbox[1], maxLng: bbox[2], maxLat: bbox[3] },
              pointInBbox:
                testLng >= bbox[0] && testLng <= bbox[2] &&
                testLat >= bbox[1] && testLat <= bbox[3],
              coordinatesSample: geometry.coordinates[0]?.slice(0, 3),
            });
          } else if (geometry.type === "MultiPolygon") {
            const multiPolygon = turf.multiPolygon(geometry.coordinates);
            contains = turf.booleanPointInPolygon(turfPoint, multiPolygon);
            const bbox = turf.bbox(multiPolygon);
            testDetails.push({
              featureIndex: i,
              type: "MultiPolygon",
              contains,
              bbox: { minLng: bbox[0], minLat: bbox[1], maxLng: bbox[2], maxLat: bbox[3] },
              pointInBbox:
                testLng >= bbox[0] && testLng <= bbox[2] &&
                testLat >= bbox[1] && testLat <= bbox[3],
              polygonCount: geometry.coordinates.length,
            });
          } else if (geometry.type === "LineString") {
            const lineCoords = geometry.coordinates;
            if (lineCoords && lineCoords.length >= 3) {
              const first = lineCoords[0];
              const last = lineCoords[lineCoords.length - 1];
              const isClosed =
                (first[0] === last[0] && first[1] === last[1]) ||
                (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);

              if (isClosed) {
                const polygon = turf.polygon([lineCoords]);
                contains = turf.booleanPointInPolygon(turfPoint, polygon);
                const bbox = turf.bbox(polygon);
                testDetails.push({
                  featureIndex: i,
                  type: "LineString (closed → Polygon)",
                  contains,
                  bbox: { minLng: bbox[0], minLat: bbox[1], maxLng: bbox[2], maxLat: bbox[3] },
                  pointInBbox:
                    testLng >= bbox[0] && testLng <= bbox[2] &&
                    testLat >= bbox[1] && testLat <= bbox[3],
                });
              } else {
                error = "LineString aberta (não é polígono)";
              }
            } else {
              error = "LineString com pontos insuficientes";
            }
          } else {
            error = `Tipo de geometria não suportado: ${geometry.type}`;
          }
        } catch (err) {
          error = err instanceof Error ? err.message : "Erro desconhecido";
        }

        if (error) {
          testDetails.push({ featureIndex: i, error });
        }
      }

      return {
        areaId: area.id,
        nomeArea: area.nomeArea,
        operadora: area.operadora.nome,
        bbox: {
          minLat: area.bboxMinLat,
          maxLat: area.bboxMaxLat,
          minLng: area.bboxMinLng,
          maxLng: area.bboxMaxLng,
        },
        status: containsPoint ? "contains_point" : "does_not_contain",
        featureCount,
        testDetails,
      };
    });

    return NextResponse.json({
      testPoint: { lat: testLat, lng: testLng },
      totalAreas: areas.length,
      results,
      summary: {
        areasContainingPoint: results.filter((r) => r.status === "contains_point").length,
        areasNotContaining: results.filter((r) => r.status === "does_not_contain").length,
        invalidAreas: results.filter((r) => r.status === "invalid_geojson").length,
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar debug",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
