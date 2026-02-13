import * as turf from "@turf/turf";
import type { FeatureCollection, Point, Polygon, MultiPolygon } from "geojson";

export class GeometryService {
  /**
   * Check if a point is inside any polygon in a FeatureCollection
   * Uses Turf.js for point-in-polygon calculation
   * 
   * Note: Turf.js expects coordinates as [lng, lat] (longitude first)
   */
  static pointInPolygons(
    point: { lat: number; lng: number },
    featureCollection: FeatureCollection
  ): boolean {
    // Turf.js expects [lng, lat] format
    const turfPoint = turf.point([point.lng, point.lat]);

    if (!featureCollection.features || featureCollection.features.length === 0) {
      console.warn("[GeometryService] FeatureCollection vazio");
      return false;
    }

    for (let i = 0; i < featureCollection.features.length; i++) {
      const feature = featureCollection.features[i];
      if (!feature.geometry) {
        console.warn(`[GeometryService] Feature ${i} não possui geometria`);
        continue;
      }

      const geometry = feature.geometry;

      try {
        if (geometry.type === "Polygon") {
          const coords = (geometry as Polygon).coordinates;
          if (!coords || coords.length === 0) {
            console.warn(`[GeometryService] Polygon ${i} sem coordenadas`);
            continue;
          }

          // Validar formato das coordenadas (deve ser [lng, lat])
          const firstCoord = coords[0]?.[0];
          if (firstCoord && Array.isArray(firstCoord) && firstCoord.length >= 2) {
            // Verificar se pode estar invertido (lat muito grande = provavelmente lng)
            const possibleLng = firstCoord[0];
            const possibleLat = firstCoord[1];
            
            // Se lat > 90 ou lat < -90, provavelmente está invertido
            if (Math.abs(possibleLat) > 90) {
              console.warn(
                `[GeometryService] Coordenadas possivelmente invertidas no Polygon ${i}: [${possibleLat}, ${possibleLng}]`
              );
            }
          }

          const polygon = turf.polygon(coords);
          if (turf.booleanPointInPolygon(turfPoint, polygon)) {
            console.log(`[GeometryService] Ponto (${point.lat}, ${point.lng}) está dentro do Polygon ${i}`);
            return true;
          }
        } else if (geometry.type === "MultiPolygon") {
          const coords = (geometry as MultiPolygon).coordinates;
          if (!coords || coords.length === 0) {
            console.warn(`[GeometryService] MultiPolygon ${i} sem coordenadas`);
            continue;
          }

          const multiPolygon = turf.multiPolygon(coords);
          if (turf.booleanPointInPolygon(turfPoint, multiPolygon)) {
            console.log(`[GeometryService] Ponto (${point.lat}, ${point.lng}) está dentro do MultiPolygon ${i}`);
            return true;
          }
        } else if (geometry.type === "LineString") {
          // LineString fechada = círculo, converter para Polygon e verificar
          const lineCoords = (geometry as any).coordinates;
          if (lineCoords && lineCoords.length >= 3) {
            const first = lineCoords[0];
            const last = lineCoords[lineCoords.length - 1];
            const isClosed =
              (first[0] === last[0] && first[1] === last[1]) ||
              (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);

            if (isClosed) {
              // Converter para Polygon e verificar
              const polygon = turf.polygon([lineCoords]);
              if (turf.booleanPointInPolygon(turfPoint, polygon)) {
                console.log(`[GeometryService] Ponto (${point.lat}, ${point.lng}) está dentro do círculo (LineString fechada) ${i}`);
                return true;
              }
            }
          }
        } else {
          console.warn(`[GeometryService] Tipo de geometria não suportado: ${geometry.type}`);
        }
      } catch (error) {
        console.error(`[GeometryService] Erro ao verificar feature ${i}:`, error);
      }
    }

    return false;
  }

  /**
   * Get all polygons that contain a point
   */
  static getPolygonsContainingPoint(
    point: { lat: number; lng: number },
    featureCollection: FeatureCollection
  ): number[] {
    const indices: number[] = [];
    const turfPoint = turf.point([point.lng, point.lat]);

    featureCollection.features.forEach((feature, index) => {
      if (!feature.geometry) return;

      const geometry = feature.geometry;
      let contains = false;

      if (geometry.type === "Polygon") {
        const polygon = turf.polygon((geometry as Polygon).coordinates);
        contains = turf.booleanPointInPolygon(turfPoint, polygon);
      } else if (geometry.type === "MultiPolygon") {
        const multiPolygon = turf.multiPolygon((geometry as MultiPolygon).coordinates);
        contains = turf.booleanPointInPolygon(turfPoint, multiPolygon);
      } else if (geometry.type === "LineString") {
        // LineString fechada = círculo
        const lineCoords = (geometry as any).coordinates;
        if (lineCoords && lineCoords.length >= 3) {
          const first = lineCoords[0];
          const last = lineCoords[lineCoords.length - 1];
          const isClosed =
            (first[0] === last[0] && first[1] === last[1]) ||
            (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);

          if (isClosed) {
            const polygon = turf.polygon([lineCoords]);
            contains = turf.booleanPointInPolygon(turfPoint, polygon);
          }
        }
      }

      if (contains) {
        indices.push(index);
      }
    });

    return indices;
  }

  /**
   * Validate GeoJSON geometry
   */
  static validateGeometry(geojson: FeatureCollection): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!geojson || !geojson.type || geojson.type !== "FeatureCollection") {
      errors.push("GeoJSON deve ser do tipo FeatureCollection");
      return { valid: false, errors };
    }

    if (!geojson.features || geojson.features.length === 0) {
      errors.push("GeoJSON deve conter pelo menos uma feature");
      return { valid: false, errors };
    }

    geojson.features.forEach((feature, index) => {
      if (!feature.geometry) {
        errors.push(`Feature ${index + 1} não possui geometria`);
        return;
      }

      const geom = feature.geometry;
      if (geom.type === "Polygon" || geom.type === "MultiPolygon") {
        // Válido
      } else if (geom.type === "LineString") {
        // Verificar se LineString está fechada (será convertida para Polygon)
        const coords = (geom as any).coordinates;
        if (coords && coords.length >= 3) {
          const first = coords[0];
          const last = coords[coords.length - 1];
          const isClosed =
            (first[0] === last[0] && first[1] === last[1]) ||
            (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
          
          if (!isClosed) {
            errors.push(`Feature ${index + 1} é LineString mas não está fechada (não forma um polígono/círculo)`);
          }
        } else {
          errors.push(`Feature ${index + 1} é LineString mas não tem coordenadas suficientes para formar um polígono`);
        }
      } else {
        errors.push(`Feature ${index + 1} deve ser Polygon, MultiPolygon ou LineString fechada, encontrado: ${geom.type}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate bounding box of a FeatureCollection
   */
  static getBoundingBox(featureCollection: FeatureCollection): {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null {
    if (!featureCollection.features || featureCollection.features.length === 0) {
      return null;
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    featureCollection.features.forEach((feature) => {
      if (!feature.geometry) return;

      const bbox = turf.bbox(feature);
      if (bbox[0] < minLng) minLng = bbox[0];
      if (bbox[1] < minLat) minLat = bbox[1];
      if (bbox[2] > maxLng) maxLng = bbox[2];
      if (bbox[3] > maxLat) maxLat = bbox[3];
    });

    if (minLat === Infinity) return null;

    return { minLat, maxLat, minLng, maxLng };
  }
}

