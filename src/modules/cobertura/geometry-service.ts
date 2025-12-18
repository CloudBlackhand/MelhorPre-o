// @ts-expect-error - Turf.js has type resolution issues with package.json exports
import * as turf from "@turf/turf";
import type { FeatureCollection, Point, Polygon, MultiPolygon } from "geojson";

export class GeometryService {
  /**
   * Check if a point is inside any polygon in a FeatureCollection
   * Uses Turf.js for point-in-polygon calculation
   */
  static pointInPolygons(
    point: { lat: number; lng: number },
    featureCollection: FeatureCollection
  ): boolean {
    const turfPoint = turf.point([point.lng, point.lat]);

    for (const feature of featureCollection.features) {
      if (!feature.geometry) continue;

      const geometry = feature.geometry;

      if (geometry.type === "Polygon") {
        const polygon = turf.polygon((geometry as Polygon).coordinates);
        if (turf.booleanPointInPolygon(turfPoint, polygon)) {
          return true;
        }
      } else if (geometry.type === "MultiPolygon") {
        const multiPolygon = turf.multiPolygon((geometry as MultiPolygon).coordinates);
        if (turf.booleanPointInPolygon(turfPoint, multiPolygon)) {
          return true;
        }
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
      if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") {
        errors.push(`Feature ${index + 1} deve ser Polygon ou MultiPolygon, encontrado: ${geom.type}`);
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

