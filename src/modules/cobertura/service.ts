import { CoberturaRepository } from "./repository";
import { KMLParser } from "./kml-parser";
import { GeometryService } from "./geometry-service";
import { GeolocationService } from "./geolocation";
import type { CoberturaArea, CreateCoberturaAreaInput, GeoLocation, CoberturaResponse } from "@/types";
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
    // Parse KML
    const parseResult = KMLParser.parse(kmlString);

    if (!parseResult.isValid) {
      return {
        success: false,
        errors: parseResult.errors,
      };
    }

    // Usar apenas Polygon e MultiPolygon (KML pode ter LineString - ignorar para cobertura)
    const geojson = parseResult.geojson;
    geojson.features = (geojson.features || []).filter((f) => {
      const t = f.geometry?.type;
      return t === "Polygon" || t === "MultiPolygon";
    });

    // Validate geometry (precisa ter pelo menos uma área)
    const geometryValidation = GeometryService.validateGeometry(geojson);
    if (!geometryValidation.valid) {
      return {
        success: false,
        errors: geometryValidation.errors,
      };
    }

    // Save to database
    try {
      const area = await this.repository.create({
        operadoraId,
        nomeArea,
        geometria: geojson,
        kmlOriginal: kmlString,
      });

      // Invalidate cache
      await this.invalidateCache();

      return {
        success: true,
        area,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Erro ao salvar área de cobertura"],
      };
    }
  }

  /**
   * Check coverage by CEP
   */
  async checkCoverageByCEP(cep: string): Promise<CoberturaResponse> {
    // Normalize CEP (apenas dígitos, 8 chars)
    const normalizedCEP = cep.replace(/\D/g, "");
    if (normalizedCEP.length !== 8) {
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
      return cached;
    }

    try {
      // Get coordinates from CEP (ViaCEP + Nominatim)
      const location = await GeolocationService.cepToCoordinates(normalizedCEP);

      if (!location || location.lat == null || location.lng == null) {
        return {
          operadoras: [],
          cep: normalizedCEP,
          mensagem: "Não foi possível obter a localização deste CEP. Verifique o número ou tente outro.",
        };
      }

      // Check coverage
      const result = await this.checkCoverageByCoordinates(location.lat, location.lng);
      result.cep = normalizedCEP;
      if (result.operadoras.length === 0 && !result.mensagem) {
        result.mensagem =
          "CEP encontrado, mas não há cobertura cadastrada para esta região. Cadastre áreas KML no painel admin.";
      }

      // Cache for 24 hours
      await setCache(cacheKey, result, 86400);

      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao consultar CEP.";
      return {
        operadoras: [],
        cep: normalizedCEP,
        mensagem: msg.includes("não encontrado") ? "CEP não encontrado. Verifique o número." : msg,
      };
    }
  }

  /**
   * Check coverage by coordinates
   */
  async checkCoverageByCoordinates(lat: number, lng: number): Promise<CoberturaResponse> {
    // Validate coordinates
    if (!GeolocationService.validateCoordinates(lat, lng)) {
      return {
        operadoras: [],
        coordenadas: { lat, lng },
      };
    }

    // Check cache
    const cacheKey = `cobertura:coord:${lat}:${lng}`;
    const cached = await getCache<CoberturaResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Find areas containing the point
    const areas = await this.repository.findAreasContainingPoint(lat, lng);

    // Get unique operadora IDs
    const operadoraIds = [...new Set(areas.map((area) => area.operadoraId))];

    // Get operadoras and their plans
    const operadoras = await Promise.all(
      operadoraIds.map(async (id) => {
        const operadora = await this.operadoraService.getById(id);
        if (!operadora) return null;

        const planos = await this.planoService.getByOperadoraId(id, true);

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
      })
    );

    const result: CoberturaResponse = {
      operadoras: operadoras.filter((o) => o !== null) as any,
      coordenadas: { lat, lng },
    };
    if (result.operadoras.length === 0) {
      result.mensagem =
        "Não há cobertura cadastrada para esta região. Cadastre áreas KML no painel admin.";
    }

    // Cache for 24 hours
    await setCache(cacheKey, result, 86400);

    return result;
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


