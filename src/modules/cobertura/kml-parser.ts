import tj from "@mapbox/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import type { FeatureCollection, Geometry } from "geojson";

export interface KMLParseResult {
  geojson: FeatureCollection;
  isValid: boolean;
  errors: string[];
}

export class KMLParser {
  // Brazil bounds: GeoJSON format [lng, lat] → lng -75 to -30, lat -35 to 5
  private static readonly BRAZIL_LNG_MIN = -75;
  private static readonly BRAZIL_LNG_MAX = -30;
  private static readonly BRAZIL_LAT_MIN = -35;
  private static readonly BRAZIL_LAT_MAX = 5;

  /**
   * Validate and fix coordinate order if needed.
   * @mapbox/togeojson already outputs [lng, lat] (GeoJSON standard), but some
   * malformed KML files may produce inverted coordinates. We detect this by
   * checking if the centroid of the first feature falls inside Brazil bounds.
   */
  private static normalizeCoordinates(geojson: FeatureCollection): FeatureCollection {
    if (!geojson.features?.length) return geojson;

    // Sample the first coordinate of the first feature with coordinates
    const sample = this.sampleCoordinate(geojson);
    if (!sample) return geojson;

    const [first, second] = sample;
    const asIs = this.isInsideBrazil(first, second);      // [lng, lat]
    const swapped = this.isInsideBrazil(second, first);    // [lat, lng] swapped

    if (asIs) return geojson; // Already correct
    if (!swapped) return geojson; // Neither works — leave as-is, the geometry might not be in Brazil

    // Coordinates are swapped — fix all features
    console.warn("[KMLParser] Coordenadas invertidas detectadas, corrigindo [lat,lng] → [lng,lat]");
    return this.swapAllCoordinates(geojson);
  }

  private static isInsideBrazil(lng: number, lat: number): boolean {
    return (
      lng >= this.BRAZIL_LNG_MIN && lng <= this.BRAZIL_LNG_MAX &&
      lat >= this.BRAZIL_LAT_MIN && lat <= this.BRAZIL_LAT_MAX
    );
  }

  private static sampleCoordinate(fc: FeatureCollection): number[] | null {
    for (const feature of fc.features) {
      if (!feature.geometry || !("coordinates" in feature.geometry)) continue;
      const coords = (feature.geometry as any).coordinates;
      const flat = this.flattenFirst(coords);
      if (flat) return flat;
    }
    return null;
  }

  private static flattenFirst(coords: any): number[] | null {
    if (!Array.isArray(coords)) return null;
    if (typeof coords[0] === "number" && coords.length >= 2) return coords;
    return this.flattenFirst(coords[0]);
  }

  private static swapAllCoordinates(fc: FeatureCollection): FeatureCollection {
    return {
      type: "FeatureCollection",
      features: fc.features.map((feature) => {
        if (!feature.geometry || !("coordinates" in feature.geometry)) return feature;
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: this.swapCoords((feature.geometry as any).coordinates),
          },
        };
      }),
    };
  }

  private static swapCoords(coords: any): any {
    if (!Array.isArray(coords)) return coords;
    if (typeof coords[0] === "number" && coords.length >= 2) {
      return [coords[1], coords[0], ...coords.slice(2)];
    }
    return coords.map((c: any) => this.swapCoords(c));
  }

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
      return {
        geojson: { type: "FeatureCollection", features: [] },
        isValid: false,
        errors,
      };
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
        
        // Normalizar coordenadas: garantir formato [lng, lat] para GeoJSON
        // toGeoJSON pode retornar [lat, lng] em alguns casos
        geojson = this.normalizeCoordinates(geojson);
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
      let lineStringCount = 0;
      let closedLineStringCount = 0;
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
            } else if (geom.type === "LineString") {
              lineStringCount++;
              // Verificar se LineString está fechada (será convertida para Polygon depois)
              const coords = (geom as any).coordinates;
              if (coords && coords.length >= 3) {
                const first = coords[0];
                const last = coords[coords.length - 1];
                const isClosed =
                  (first[0] === last[0] && first[1] === last[1]) ||
                  (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);
                if (isClosed) {
                  closedLineStringCount++;
                }
              }
            } else {
              otherGeometryCount++;
            }
          }
        }
      });

      // Warn if no polygons or closed LineStrings found
      if (polygonCount === 0 && multiPolygonCount === 0 && closedLineStringCount === 0) {
        errors.push(
          `KML não contém polígonos ou círculos válidos. ` +
          `Encontrados: ${polygonCount} Polygon(s), ${multiPolygonCount} MultiPolygon(s), ` +
          `${lineStringCount} LineString(s) (${closedLineStringCount} fechada(s)), ` +
          `${otherGeometryCount} outro(s) tipo(s). ` +
          `Para cobertura, são necessários polígonos ou LineString fechadas (círculos).`
        );
      } else if (closedLineStringCount > 0) {
        // Info: LineStrings fechadas serão convertidas para Polygon
        console.log(
          `[KMLParser] ${closedLineStringCount} LineString(s) fechada(s) detectada(s) - serão convertidas para Polygon`
        );
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


