import { NextRequest, NextResponse } from "next/server";
import { TrackingService } from "@/modules/tracking/service";
import { randomBytes } from "crypto";

/**
 * POST /api/tracking/event
 * Registra um evento de tracking (clique, view, etc)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, acao, url, elemento, valor, metadata } = body;

    if (!tipo) {
      return NextResponse.json(
        { error: "Tipo de evento é obrigatório" },
        { status: 400 }
      );
    }

    // Obter ou criar sessionId
    let sessionId = request.cookies.get("session_id")?.value;
    if (!sessionId) {
      sessionId = randomBytes(16).toString("hex");
    }

    // Extrair dados do request
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;
    const referer = request.headers.get("referer") || undefined;

    // Extrair UTM params da URL
    const urlObj = new URL(request.url);
    const utmSource = urlObj.searchParams.get("utm_source") || undefined;
    const utmMedium = urlObj.searchParams.get("utm_medium") || undefined;
    const utmCampaign = urlObj.searchParams.get("utm_campaign") || undefined;

    // Obter ou criar visitante
    const visitanteId = await TrackingService.getOrCreateVisitante(sessionId, {
      ipAddress,
      userAgent,
      referer,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    // Set cookie se não existir
    const response = NextResponse.json({ success: true });
    if (!request.cookies.get("session_id")) {
      response.cookies.set("session_id", sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1 ano
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // Registrar evento
    await TrackingService.trackEvent(visitanteId, {
      tipo,
      acao,
      url: url || request.url,
      elemento,
      valor,
      metadata,
    });

    return response;
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json(
      { error: "Erro ao registrar evento" },
      { status: 500 }
    );
  }
}
