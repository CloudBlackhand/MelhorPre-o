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

    // Validate input
    if (!kmlString || typeof kmlString !== "string" || kmlString.trim().length === 0) {
      errors.push("KML vazio ou inválido. O arquivo deve conter conteúdo válido.");
      return {
        geojson: { type: "FeatureCollection", features: [] },
        isValid: false,
        errors,
      };
    }

    // Check if it looks like XML/KML
    if (!kmlString.trim().startsWith("<") || !kmlString.includes("kml")) {
      errors.push("Arquivo não parece ser um KML válido. Verifique se o arquivo está correto.");
    }

    try {
      // Parse XML
      const kml = new DOMParser().parseFromString(kmlString, "text/xml");

      // Check for parsing errors
      const parseError = kml.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        const errorText = parseError[0].textContent || "";
        errors.push(`Erro ao fazer parse do XML do KML. ${errorText.substring(0, 200)}`);
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      // Check if root element is KML
      const rootElement = kml.documentElement;
      if (!rootElement || rootElement.nodeName.toLowerCase() !== "kml") {
        errors.push("Arquivo não é um KML válido. O elemento raiz deve ser <kml>");
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      // Convert KML to GeoJSON
      try {
        geojson = tj.kml(kml) as FeatureCollection;
      } catch (conversionError) {
        errors.push(`Erro ao converter KML para GeoJSON: ${conversionError instanceof Error ? conversionError.message : "Erro desconhecido"}`);
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      // Validate GeoJSON structure
      if (!geojson || !geojson.type || geojson.type !== "FeatureCollection") {
        errors.push("KML não contém uma estrutura GeoJSON válida após conversão");
        return {
          geojson: { type: "FeatureCollection", features: [] },
          isValid: false,
          errors,
        };
      }

      // Validate features
      if (!geojson.features || geojson.features.length === 0) {
        errors.push("KML não contém nenhuma geometria válida. Verifique se o arquivo possui polígonos ou áreas de cobertura.");
        return {
          geojson,
          isValid: false,
          errors,
        };
      }

      // Validate each feature and count geometry types
      let polygonCount = 0;
      let multiPolygonCount = 0;
      let otherGeometryCount = 0;

      geojson.features.forEach((feature, index) => {
        if (!feature.geometry) {
          errors.push(`Feature ${index + 1} não possui geometria`);
        } else {
          const geom = feature.geometry as Geometry;
          if (!geom.type) {
            errors.push(`Feature ${index + 1} possui geometria sem tipo`);
          } else {
            // Count geometry types
            if (geom.type === "Polygon") {
              polygonCount++;
            } else if (geom.type === "MultiPolygon") {
              multiPolygonCount++;
            } else {
              otherGeometryCount++;
            }
          }
        }
      });

      // Warn if no polygons found
      if (polygonCount === 0 && multiPolygonCount === 0) {
        errors.push(`KML não contém polígonos válidos. Encontrados ${otherGeometryCount} geometria(s) de outros tipos. Para cobertura, são necessários polígonos (Polygon ou MultiPolygon).`);
      }

      return {
        geojson,
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      errors.push(`Erro ao processar KML: ${errorMessage}`);
      
      // Try to provide more context
      if (errorMessage.includes("XML")) {
        errors.push("Verifique se o arquivo é um XML/KML válido e bem formatado.");
      }
      
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


