/**
 * Sistema de tracking de visitantes e eventos
 * Registra visitas, cliques e interações dos usuários
 */

import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";

export interface TrackingData {
  ip?: string;
  userAgent?: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
}

export interface EventData {
  tipo: string; // page_view, click, search_cep, view_plan, etc
  pagina?: string;
  elemento?: string;
  dados?: Record<string, any>;
}

/**
 * Extrai informações do request para tracking
 */
export function extractTrackingData(request: Request): TrackingData {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || undefined;
  const referer = headersList.get("referer") || undefined;
  const ip = 
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    undefined;

  // Parse UTM parameters from referer or URL
  const url = new URL(request.url);
  const utmSource = url.searchParams.get("utm_source") || undefined;
  const utmMedium = url.searchParams.get("utm_medium") || undefined;
  const utmCampaign = url.searchParams.get("utm_campaign") || undefined;
  const utmContent = url.searchParams.get("utm_content") || undefined;

  // Parse referer domain
  let refererDomain: string | undefined;
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      refererDomain = refererUrl.hostname;
    } catch {
      refererDomain = referer;
    }
  }

  // Detect device type from user agent
  const device = detectDevice(userAgent);
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);

  return {
    ip,
    userAgent,
    referer: refererDomain,
    utmSource: utmSource || extractSourceFromReferer(refererDomain),
    utmMedium,
    utmCampaign,
    utmContent,
    device,
    browser,
    os,
  };
}

/**
 * Detecta tipo de dispositivo do user agent
 */
function detectDevice(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

/**
 * Detecta navegador do user agent
 */
function detectBrowser(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("edg")) return "Edge";
  if (ua.includes("opera") || ua.includes("opr")) return "Opera";
  return "Other";
}

/**
 * Detecta sistema operacional do user agent
 */
function detectOS(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("android")) return "Android";
  if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) return "iOS";
  return "Other";
}

/**
 * Extrai fonte de tráfego do referer
 */
function extractSourceFromReferer(referer?: string): string | undefined {
  if (!referer) return "direct";
  
  const domain = referer.toLowerCase();
  
  // Google
  if (domain.includes("google.com") || domain.includes("google.")) {
    return "google";
  }
  
  // Facebook
  if (domain.includes("facebook.com") || domain.includes("fb.com")) {
    return "facebook";
  }
  
  // Instagram
  if (domain.includes("instagram.com")) {
    return "instagram";
  }
  
  // Twitter/X
  if (domain.includes("twitter.com") || domain.includes("x.com")) {
    return "twitter";
  }
  
  // LinkedIn
  if (domain.includes("linkedin.com")) {
    return "linkedin";
  }
  
  // YouTube
  if (domain.includes("youtube.com") || domain.includes("youtu.be")) {
    return "youtube";
  }
  
  // Bing
  if (domain.includes("bing.com")) {
    return "bing";
  }
  
  // Yahoo
  if (domain.includes("yahoo.com")) {
    return "yahoo";
  }
  
  // Outros sites (referral)
  return "referral";
}

/**
 * Gera ou recupera session ID
 */
export function getOrCreateSessionId(): string {
  // Em produção, usar cookies ou localStorage
  // Por enquanto, gerar um ID único por request
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Registra uma visita no banco de dados
 */
export async function trackVisit(data: TrackingData, sessionId: string) {
  try {
    await prisma.visitante.create({
      data: {
        ipAddress: data.ip,
        userAgent: data.userAgent,
        referer: data.referer,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        cidade: data.city,
        sessionId,
      },
    });
  } catch (error) {
    // Não quebrar a aplicação se o tracking falhar
    console.error("Error tracking visit:", error);
  }
}

/**
 * Registra um evento no banco de dados
 */
export async function trackEvent(
  sessionId: string,
  eventData: EventData
) {
  try {
    // Buscar visitante pela sessionId
    const visitante = await prisma.visitante.findFirst({
      where: { sessionId },
      orderBy: { lastVisit: "desc" },
    });

    if (!visitante) {
      console.warn(`Visitante não encontrado para sessionId: ${sessionId}`);
      return;
    }

    await prisma.evento.create({
      data: {
        visitanteId: visitante.id,
        tipo: eventData.tipo,
        acao: eventData.pagina,
        url: eventData.pagina,
        elemento: eventData.elemento,
        metadata: eventData.dados || {},
      },
    });
  } catch (error) {
    console.error("Error tracking event:", error);
  }
}
