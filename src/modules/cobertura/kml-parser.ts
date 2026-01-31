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
   * Validate KML/KMZ file before upload
   */
  static validateKMLFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size (max 25MB - cobertura pode ser grande)
    if (file.size > 25 * 1024 * 1024) {
      errors.push("Arquivo muito grande. Máximo permitido: 25MB");
    }

    // Check file type: KML ou KMZ
    const validKmlTypes = [
      "application/vnd.google-earth.kml+xml",
      "application/xml",
      "text/xml",
    ];
    const validKmzTypes = ["application/vnd.google-earth.kmz", "application/zip"];
    const validExtensions = [".kml", ".kmz"];

    const name = file.name.toLowerCase();
    const hasKmlExt = name.endsWith(".kml");
    const hasKmzExt = name.endsWith(".kmz");
    const hasValidType =
      validKmlTypes.includes(file.type) ||
      validKmzTypes.includes(file.type) ||
      hasKmlExt ||
      hasKmzExt;

    if (!hasValidType) {
      errors.push("Arquivo deve ser KML (.kml) ou KMZ (.kmz)");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}


