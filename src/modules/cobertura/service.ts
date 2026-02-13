import { CoberturaRepository } from "./repository";
import { KMLParser } from "./kml-parser";
import { GeometryService } from "./geometry-service";
import { GeolocationService } from "./geolocation";
import type { CoberturaArea, CreateCoberturaAreaInput, GeoLocation, CoberturaResponse } from "@/types";
import type { FeatureCollection } from "geojson";
import { getCache, setCache } from "@/lib/redis";
import { PlanoService } from "../planos/service";
import { OperadoraService } from "../operadoras/service";

export class CoberturaService {
  private repository: CoberturaRepository;
  private planoService: PlanoService;
  private operadoraService: OperadoraService;

  constructor() {
    this.repository = new CoberturaRepository();
    this.planoService = new PlanoService();
    this.operadoraService = new OperadoraService();
  }

  /**
   * Process and save KML file
   */
  async processKML(kmlString: string, operadoraId: string, nomeArea: string): Promise<{
    success: boolean;
    area?: CoberturaArea;
    errors: string[];
  }> {
    console.log(`[CoberturaService] Processando KML para operadora ${operadoraId}, área: ${nomeArea}`);
    
    // Parse KML
    const parseResult = KMLParser.parse(kmlString);

    if (!parseResult.isValid) {
      console.error(`[CoberturaService] KML inválido:`, parseResult.errors);
      return {
        success: false,
        errors: parseResult.errors,
      };
    }

    console.log(
      `[CoberturaService] KML parseado com sucesso. ${parseResult.geojson.features?.length || 0} feature(s) encontrada(s)`
    );

    return this.processGeoJSON(parseResult.geojson, operadoraId, nomeArea, kmlString);
  }

  /**
   * Process and save GeoJSON already parsed from KML/KMZ
   */
  async processGeoJSON(
    geojson: FeatureCollection,
    operadoraId: string,
    nomeArea: string,
    kmlOriginal?: string
  ): Promise<{
    success: boolean;
    area?: CoberturaArea;
    errors: string[];
  }> {
    const prepared = this.prepareCoverageGeoJSON(geojson);
    if (!prepared.success || !prepared.geojson) {
      return {
        success: false,
        errors: prepared.errors,
      };
    }

    try {
      console.log(`[CoberturaService] Salvando área de cobertura no banco de dados`);
      const area = await this.repository.create({
        operadoraId,
        nomeArea,
        geometria: prepared.geojson,
        kmlOriginal: kmlOriginal || null,
      });

      console.log(`[CoberturaService] Área de cobertura salva com sucesso. ID: ${area.id}`);

      // Invalidate cache
      await this.invalidateCache();

      return {
        success: true,
        area,
        errors: [],
      };
    } catch (error) {
      console.error(`[CoberturaService] Erro ao salvar área de cobertura:`, error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Erro ao salvar área de cobertura"],
      };
    }
  }

  private prepareCoverageGeoJSON(
    source: FeatureCollection
  ): { success: boolean; geojson?: FeatureCollection; errors: string[] } {
    // Clone para evitar mutar objeto de entrada
    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [],
    };

    const originalFeatureCount = source.features?.length || 0;
    let convertedCount = 0;
    let filteredCount = 0;

    // Processar cada feature: converter LineString fechada para Polygon, manter Polygon/MultiPolygon
    for (const feature of source.features || []) {
      if (!feature.geometry) {
        filteredCount++;
        continue;
      }

      const geometry = feature.geometry;
      
      if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
        // Já é polígono, manter
        geojson.features.push(feature);
      } else if (geometry.type === "LineString") {
        // Verificar se LineString está fechada (círculo)
        const lineCoords = (geometry as any).coordinates;
        if (lineCoords && lineCoords.length >= 3) {
          const first = lineCoords[0];
          const last = lineCoords[lineCoords.length - 1];
          const isClosed =
            (first[0] === last[0] && first[1] === last[1]) ||
            (Math.abs(first[0] - last[0]) < 0.000001 && Math.abs(first[1] - last[1]) < 0.000001);

          if (isClosed) {
            // Converter LineString fechada para Polygon (círculo)
            const polygonFeature = {
              ...feature,
              geometry: {
                type: "Polygon" as const,
                coordinates: [lineCoords], // Polygon precisa de array de rings
              },
            };
            geojson.features.push(polygonFeature);
            convertedCount++;
            console.log(`[CoberturaService] LineString fechada convertida para Polygon (círculo)`);
          } else {
            // LineString não fechada - não é área de cobertura
            filteredCount++;
            console.log(`[CoberturaService] LineString não fechada ignorada`);
          }
        } else {
          filteredCount++;
        }
      } else if (geometry.type === "Point") {
        // Point pode ser centro de círculo se tiver radius nas properties
        // Por enquanto, ignorar (seria necessário processar <Circle> do KML antes da conversão)
        filteredCount++;
        console.log(`[CoberturaService] Point ignorado (não é área de cobertura)`);
      } else {
        // Outros tipos não suportados
        filteredCount++;
        console.log(`[CoberturaService] Tipo de geometria não suportado: ${geometry.type}`);
      }
    }

    if (convertedCount > 0) {
      console.log(`[CoberturaService] ${convertedCount} LineString(s) fechada(s) convertida(s) para Polygon`);
    }
    if (filteredCount > 0) {
      console.log(`[CoberturaService] ${filteredCount} feature(s) não-polygon ignorada(s)`);
    }

    // Validate geometry (precisa ter pelo menos uma área)
    if (geojson.features.length === 0) {
      return {
        success: false,
        errors: [
          "Nenhuma área de cobertura válida encontrada. O arquivo deve conter polígonos ou círculos (LineString fechadas).",
        ],
      };
    }

    const geometryValidation = GeometryService.validateGeometry(geojson);
    if (!geometryValidation.valid) {
      console.error(`[CoberturaService] Geometria inválida:`, geometryValidation.errors);
      return {
        success: false,
        errors: geometryValidation.errors,
      };
    }

    return {
      success: true,
      geojson,
      errors: [],
    };
  }

  /**
   * Check coverage by CEP
   */
  async checkCoverageByCEP(cep: string): Promise<CoberturaResponse> {
    // Normalize CEP (apenas dígitos, 8 chars)
    const normalizedCEP = cep.replace(/\D/g, "");
    if (normalizedCEP.length !== 8) {
      console.warn(`[CoberturaService] CEP inválido recebido: ${cep} (normalizado: ${normalizedCEP})`);
      return {
        operadoras: [],
        cep: normalizedCEP || cep,
        mensagem: "CEP inválido. Informe 8 dígitos (ex: 30130-100).",
      };
    }

    // Check cache
    const cacheKey = `cobertura:cep:${normalizedCEP}`;
    const cached = await getCache<CoberturaResponse>(cacheKey);
    if (cached) {
      console.log(`[CoberturaService] Cache hit para CEP: ${normalizedCEP}`);
      return cached;
    }

    try {
      console.log(`[CoberturaService] Buscando coordenadas para CEP: ${normalizedCEP}`);
      // Get coordinates from CEP (ViaCEP + Nominatim)
      const location = await GeolocationService.cepToCoordinates(normalizedCEP);

      if (!location || location.lat == null || location.lng == null) {
        console.warn(`[CoberturaService] Não foi possível obter coordenadas para CEP: ${normalizedCEP}`);
        return {
          operadoras: [],
          cep: normalizedCEP,
          mensagem: "Não foi possível obter a localização deste CEP. Verifique o número ou tente outro.",
        };
      }

      console.log(`[CoberturaService] Coordenadas obtidas: ${location.lat}, ${location.lng} para CEP: ${normalizedCEP}`);
      
      // Check coverage
      const result = await this.checkCoverageByCoordinates(location.lat, location.lng);
      result.cep = normalizedCEP;
      if (result.operadoras.length === 0 && !result.mensagem) {
        result.mensagem =
          "CEP encontrado, mas não há cobertura cadastrada para esta região. Cadastre áreas KML no painel admin.";
      }

      // Cache for 24 hours
      await setCache(cacheKey, result, 86400);
      console.log(`[CoberturaService] Resultado cacheado para CEP: ${normalizedCEP}`);

      return result;
    } catch (error) {
      console.error(`[CoberturaService] Erro ao buscar cobertura para CEP ${normalizedCEP}:`, error);
      const msg = error instanceof Error ? error.message : "Erro ao consultar CEP.";
      const isNotFound = msg.includes("não encontrado") || msg.includes("CEP não encontrado");
      
      return {
        operadoras: [],
        cep: normalizedCEP,
        mensagem: isNotFound 
          ? "CEP não encontrado. Verifique o número e tente novamente."
          : "Erro ao consultar CEP. Tente novamente mais tarde.",
      };
    }
  }

  /**
   * Check coverage by coordinates
   */
  async checkCoverageByCoordinates(lat: number, lng: number): Promise<CoberturaResponse> {
    // Validate coordinates
    if (!GeolocationService.validateCoordinates(lat, lng)) {
      console.warn(`[CoberturaService] Coordenadas inválidas: ${lat}, ${lng}`);
      return {
        operadoras: [],
        coordenadas: { lat, lng },
        mensagem: "Coordenadas fora dos limites do Brasil.",
      };
    }

    // Check cache
    const cacheKey = `cobertura:coord:${lat}:${lng}`;
    const cached = await getCache<CoberturaResponse>(cacheKey);
    if (cached) {
      console.log(`[CoberturaService] Cache hit para coordenadas: ${lat}, ${lng}`);
      return cached;
    }

    try {
      console.log(`[CoberturaService] Buscando áreas contendo ponto: ${lat}, ${lng}`);
      // Find areas containing the point
      const areas = await this.repository.findAreasContainingPoint(lat, lng);
      console.log(`[CoberturaService] ${areas.length} área(s) encontrada(s) contendo o ponto`);

      // Get unique operadora IDs
      const operadoraIds = [...new Set(areas.map((area) => area.operadoraId))];
      console.log(`[CoberturaService] ${operadoraIds.length} operadora(s) única(s) encontrada(s)`);

      // Get operadoras and their plans
      const operadoras = await Promise.all(
        operadoraIds.map(async (id) => {
          try {
            const operadora = await this.operadoraService.getById(id);
            if (!operadora) {
              console.warn(`[CoberturaService] Operadora ${id} não encontrada`);
              return null;
            }

            const planos = await this.planoService.getByOperadoraId(id, true);
            console.log(`[CoberturaService] ${planos.length} plano(s) encontrado(s) para operadora ${operadora.nome}`);

            return {
              id: operadora.id,
              nome: operadora.nome,
              slug: operadora.slug,
              logoUrl: operadora.logoUrl,
              planos: planos.map((p) => ({
                id: p.id,
                nome: p.nome,
                velocidadeDownload: p.velocidadeDownload,
                velocidadeUpload: p.velocidadeUpload,
                preco: p.preco,
                descricao: p.descricao,
                beneficios: p.beneficios,
              })),
            };
          } catch (error) {
            console.error(`[CoberturaService] Erro ao buscar dados da operadora ${id}:`, error);
            return null;
          }
        })
      );

      const validOperadoras = operadoras.filter((o) => o !== null) as any;
      const result: CoberturaResponse = {
        operadoras: validOperadoras,
        coordenadas: { lat, lng },
      };
      
      if (result.operadoras.length === 0) {
        result.mensagem =
          "Não há cobertura cadastrada para esta região. Cadastre áreas KML no painel admin.";
      } else {
        const totalPlanos = result.operadoras.reduce((sum, op) => sum + op.planos.length, 0);
        console.log(`[CoberturaService] Total de ${totalPlanos} plano(s) encontrado(s) para ${result.operadoras.length} operadora(s)`);
      }

      // Cache for 24 hours
      await setCache(cacheKey, result, 86400);

      return result;
    } catch (error) {
      console.error(`[CoberturaService] Erro ao buscar cobertura por coordenadas ${lat}, ${lng}:`, error);
      return {
        operadoras: [],
        coordenadas: { lat, lng },
        mensagem: "Erro ao buscar cobertura. Tente novamente mais tarde.",
      };
    }
  }

  /**
   * Get all coverage areas
   */
  async getAllAreas(operadoraId?: string): Promise<CoberturaArea[]> {
    return this.repository.findAll(operadoraId);
  }

  /**
   * Get coverage area by ID
   */
  async getAreaById(id: string): Promise<CoberturaArea | null> {
    return this.repository.findById(id);
  }

  /**
   * Update rank and score of a coverage area
   */
  async updateRank(
    id: string,
    data: { rank: number | null; score: number | null }
  ): Promise<CoberturaArea | null> {
    try {
      const { prisma } = await import("@/lib/db/prisma");
      const updated = await prisma.coberturaArea.update({
        where: { id },
        data: {
          rank: data.rank,
          score: data.score,
        },
        include: {
          operadora: true,
        },
      });
      
      // Invalidate cache
      await this.invalidateCache();
      
      return {
        ...updated,
        geometria: updated.geometria as any,
      } as CoberturaArea;
    } catch (error) {
      console.error(`[CoberturaService] Erro ao atualizar rank da área ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete coverage area
   */
  async deleteArea(id: string): Promise<void> {
    await this.repository.delete(id);
    await this.invalidateCache();
  }

  /**
   * Invalidate all coverage cache
   */
  private async invalidateCache(): Promise<void> {
    // In production, you might want to use pattern matching to delete all coverage cache
    // For now, we'll let cache expire naturally
  }
}


