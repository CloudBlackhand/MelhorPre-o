import { prisma } from "@/lib/db/prisma";
import { randomBytes } from "crypto";

export interface TrackingData {
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  cidade?: string;
  estado?: string;
}

export interface EventData {
  tipo: string; // click, view, search, etc
  acao?: string;
  url?: string;
  elemento?: string;
  valor?: string;
  metadata?: Record<string, any>;
}

export class TrackingService {
  /**
   * Obtém ou cria um visitante baseado na sessão
   * Nota: sessionId deve ser passado como parâmetro (gerado no route handler)
   */
  static async getOrCreateVisitante(
    sessionId: string,
    data: TrackingData
  ): Promise<string> {

    // Verificar se visitante já existe
    const existing = await prisma.visitante.findUnique({
      where: { sessionId },
    });

    if (existing) {
      // Atualizar última visita e contador
      await prisma.visitante.update({
        where: { id: existing.id },
        data: {
          lastVisit: new Date(),
          visitCount: existing.visitCount + 1,
          // Atualizar dados se fornecidos
          ...(data.ipAddress && { ipAddress: data.ipAddress }),
          ...(data.userAgent && { userAgent: data.userAgent }),
          ...(data.referer && { referer: data.referer }),
          ...(data.utmSource && { utmSource: data.utmSource }),
          ...(data.utmMedium && { utmMedium: data.utmMedium }),
          ...(data.utmCampaign && { utmCampaign: data.utmCampaign }),
          ...(data.cidade && { cidade: data.cidade }),
          ...(data.estado && { estado: data.estado }),
        },
      });
      return existing.id;
    }

    // Criar novo visitante
    const visitante = await prisma.visitante.create({
      data: {
        sessionId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referer: data.referer,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        cidade: data.cidade,
        estado: data.estado,
      },
    });

    return visitante.id;
  }

  /**
   * Registra um evento
   */
  static async trackEvent(visitanteId: string, eventData: EventData): Promise<void> {
    await prisma.evento.create({
      data: {
        visitanteId,
        tipo: eventData.tipo,
        acao: eventData.acao,
        url: eventData.url,
        elemento: eventData.elemento,
        valor: eventData.valor,
        metadata: eventData.metadata || {},
      },
    });
  }

  /**
   * Registra uma busca de cobertura
   */
  static async trackBuscaCobertura(
    visitanteId: string | null,
    data: {
      cep?: string;
      lat?: number;
      lng?: number;
      cidade?: string;
      estado?: string;
      encontrouCobertura: boolean;
      operadorasEncontradas?: string[];
    }
  ): Promise<void> {
    await prisma.buscaCobertura.create({
      data: {
        visitanteId,
        cep: data.cep,
        lat: data.lat,
        lng: data.lng,
        cidade: data.cidade,
        estado: data.estado,
        encontrouCobertura: data.encontrouCobertura,
        operadorasEncontradas: data.operadorasEncontradas || [],
      },
    });
  }

  /**
   * Obtém estatísticas de visitantes
   */
  static async getVisitantesStats(periodo?: "dia" | "semana" | "mes" | "ano") {
    const now = new Date();
    let startDate: Date;

    switch (periodo) {
      case "dia":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "semana":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "mes":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "ano":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // Todos
    }

    const [total, novos, recorrentes] = await Promise.all([
      prisma.visitante.count({
        where: { firstVisit: { gte: startDate } },
      }),
      prisma.visitante.count({
        where: {
          firstVisit: { gte: startDate },
          visitCount: 1,
        },
      }),
      prisma.visitante.count({
        where: {
          firstVisit: { gte: startDate },
          visitCount: { gt: 1 },
        },
      }),
    ]);

    return { total, novos, recorrentes };
  }

  /**
   * Obtém origem dos visitantes (UTM sources)
   */
  static async getOrigemVisitantes(periodo?: "dia" | "semana" | "mes" | "ano") {
    const now = new Date();
    let startDate: Date;

    switch (periodo) {
      case "dia":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "semana":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "mes":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "ano":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const visitantes = await prisma.visitante.findMany({
      where: { firstVisit: { gte: startDate } },
      select: {
        utmSource: true,
        utmMedium: true,
        referer: true,
      },
    });

    const origem: Record<string, number> = {};
    const medium: Record<string, number> = {};

    visitantes.forEach((v) => {
      const source = v.utmSource || v.referer || "direto";
      origem[source] = (origem[source] || 0) + 1;

      if (v.utmMedium) {
        medium[v.utmMedium] = (medium[v.utmMedium] || 0) + 1;
      }
    });

    return { origem, medium };
  }

  /**
   * Obtém áreas mais buscadas
   */
  static async getAreasMaisBuscadas(limit: number = 10) {
    const buscas = await prisma.buscaCobertura.groupBy({
      by: ["cidade", "estado", "cep"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    return buscas.map((b) => ({
      cidade: b.cidade,
      estado: b.estado,
      cep: b.cep,
      totalBuscas: b._count.id,
    }));
  }

  /**
   * Obtém eventos mais comuns
   */
  static async getEventosMaisComuns(limit: number = 10) {
    const eventos = await prisma.evento.groupBy({
      by: ["tipo", "acao"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    return eventos.map((e) => ({
      tipo: e.tipo,
      acao: e.acao,
      total: e._count.id,
    }));
  }

  /**
   * Obtém taxa de conversão (buscas com cobertura encontrada)
   */
  static async getTaxaConversao(periodo?: "dia" | "semana" | "mes" | "ano") {
    const now = new Date();
    let startDate: Date;

    switch (periodo) {
      case "dia":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "semana":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "mes":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "ano":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const [total, comCobertura] = await Promise.all([
      prisma.buscaCobertura.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.buscaCobertura.count({
        where: {
          createdAt: { gte: startDate },
          encontrouCobertura: true,
        },
      }),
    ]);

    return {
      total,
      comCobertura,
      taxa: total > 0 ? (comCobertura / total) * 100 : 0,
    };
  }
}
