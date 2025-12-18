import tj from "@mapbox/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import type { FeatureCollection, Geometry } from "geojson";

export interface KMLParseResult {
  geojson: FeatureCollection;
  isValid: boolean;
  errors: string[];
}

export class KMLParser {
  /**
   * Parse KML string to GeoJSON
   */
  static parse(kmlString: string): KMLParseResult {
    const errors: string[] = [];
    let geojson: FeatureCollection | null = null;

    try {
      // Parse XML
      const kml = new DOMParser().parseFromString(kmlString, "text/xml");

      // Check for parsing errors
      const parseError = kml.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        errors.push("Erro ao fazer parse do XML do KML");
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      // Convert KML to GeoJSON
      geojson = tj.kml(kml) as FeatureCollection;

      // Validate GeoJSON structure
      if (!geojson || !geojson.type || geojson.type !== "FeatureCollection") {
        errors.push("KML não contém uma estrutura GeoJSON válida");
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      // Validate features
      if (!geojson.features || geojson.features.length === 0) {
        errors.push("KML não contém nenhuma geometria válida");
        return {
          geojson,
          isValid: false,
          errors,
        };
      }

      // Validate each feature
      geojson.features.forEach((feature, index) => {
        if (!feature.geometry) {
          errors.push(`Feature ${index + 1} não possui geometria`);
        } else {
          const geom = feature.geometry as Geometry;
          if (!geom.type) {
            errors.push(`Feature ${index + 1} possui geometria sem tipo`);
          }
        }
      });

      return {
        geojson,
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Erro ao processar KML: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
      return {
        geojson: { type: "FeatureCollection", features: [] },
        isValid: false,
        errors,
      };
    }
  }

  /**
   * Validate KML file before upload
   */
  static validateKMLFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push("Arquivo muito grande. Máximo permitido: 10MB");
    }

    // Check file type
    const validTypes = [
      "application/vnd.google-earth.kml+xml",
      "application/xml",
      "text/xml",
    ];
    const validExtensions = [".kml"];

    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      errors.push("Arquivo deve ser do tipo KML (.kml)");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


