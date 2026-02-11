import { NextRequest, NextResponse } from "next/server";
import { CoberturaService } from "@/modules/cobertura/service";
import { TrackingService } from "@/modules/tracking/service";
import { CEPSchema, CoordinateSchema } from "@/modules/shared/validations";
import { z } from "zod";

const coberturaService = new CoberturaService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cep = searchParams.get("cep");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Check coverage by CEP
    if (cep) {
      try {
        const normalizedCEP = CEPSchema.parse(cep);
        console.log(`[API] Buscando cobertura para CEP: ${normalizedCEP}`);
        const result = await coberturaService.checkCoverageByCEP(normalizedCEP);
        console.log(`[API] Cobertura encontrada: ${result.operadoras.length} operadora(s)`);
        
        // Registrar busca no tracking (assíncrono, não bloqueia resposta)
        try {
          let sessionId = request.cookies.get("session_id")?.value;
          if (!sessionId) {
            const { randomBytes } = await import("crypto");
            sessionId = randomBytes(16).toString("hex");
          }

          const ipAddress = request.headers.get("x-forwarded-for") || 
                           request.headers.get("x-real-ip") || 
                           undefined;
          const userAgent = request.headers.get("user-agent") || undefined;
          const referer = request.headers.get("referer") || undefined;
          
          const urlObj = new URL(request.url);
          const utmSource = urlObj.searchParams.get("utm_source") || undefined;
          const utmMedium = urlObj.searchParams.get("utm_medium") || undefined;
          const utmCampaign = urlObj.searchParams.get("utm_campaign") || undefined;

          const visitanteId = await TrackingService.getOrCreateVisitante(sessionId, {
            ipAddress,
            userAgent,
            referer,
            utmSource,
            utmMedium,
            utmCampaign,
          });

          await TrackingService.trackBuscaCobertura(visitanteId, {
            cep: normalizedCEP,
            cidade: result.cidade,
            estado: result.estado,
            encontrouCobertura: result.operadoras.length > 0,
            operadorasEncontradas: result.operadoras.map((op: any) => op.id),
          });
        } catch (trackingError) {
          // Não falhar se tracking der erro
          console.error("Error tracking busca:", trackingError);
        }
        
        return NextResponse.json(result);
      } catch (error) {
        console.error(`[API] Erro ao buscar cobertura por CEP ${cep}:`, error);
        
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { 
              error: "CEP inválido",
              mensagem: "O CEP informado não é válido. Verifique se contém 8 dígitos.",
              details: error.errors 
            },
            { status: 400 }
          );
        }
        
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        return NextResponse.json(
          { 
            error: "Erro ao verificar cobertura",
            mensagem: errorMessage.includes("não encontrado") 
              ? "CEP não encontrado. Verifique o número e tente novamente."
              : "Não foi possível verificar a cobertura. Tente novamente mais tarde.",
            message: errorMessage
          },
          { status: 500 }
        );
      }
    }

    // Check coverage by coordinates
    if (lat && lng) {
      try {
        const coordinates = CoordinateSchema.parse({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        });
        console.log(`[API] Buscando cobertura para coordenadas: ${coordinates.lat}, ${coordinates.lng}`);
        const result = await coberturaService.checkCoverageByCoordinates(
          coordinates.lat,
          coordinates.lng
        );
        console.log(`[API] Cobertura encontrada: ${result.operadoras.length} operadora(s)`);
        
        // Registrar busca no tracking (assíncrono)
        try {
          let sessionId = request.cookies.get("session_id")?.value;
          if (!sessionId) {
            const { randomBytes } = await import("crypto");
            sessionId = randomBytes(16).toString("hex");
          }

          const ipAddress = request.headers.get("x-forwarded-for") || 
                           request.headers.get("x-real-ip") || 
                           undefined;
          const userAgent = request.headers.get("user-agent") || undefined;
          const referer = request.headers.get("referer") || undefined;
          
          const urlObj = new URL(request.url);
          const utmSource = urlObj.searchParams.get("utm_source") || undefined;
          const utmMedium = urlObj.searchParams.get("utm_medium") || undefined;
          const utmCampaign = urlObj.searchParams.get("utm_campaign") || undefined;

          const visitanteId = await TrackingService.getOrCreateVisitante(sessionId, {
            ipAddress,
            userAgent,
            referer,
            utmSource,
            utmMedium,
            utmCampaign,
          });

          await TrackingService.trackBuscaCobertura(visitanteId, {
            lat: coordinates.lat,
            lng: coordinates.lng,
            cidade: result.cidade,
            estado: result.estado,
            encontrouCobertura: result.operadoras.length > 0,
            operadorasEncontradas: result.operadoras.map((op: any) => op.id),
          });
        } catch (trackingError) {
          console.error("Error tracking busca:", trackingError);
        }
        
        return NextResponse.json(result);
      } catch (error) {
        console.error(`[API] Erro ao buscar cobertura por coordenadas ${lat}, ${lng}:`, error);
        
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { 
              error: "Coordenadas inválidas",
              mensagem: "As coordenadas informadas não são válidas.",
              details: error.errors 
            },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { 
            error: "Erro ao verificar cobertura",
            mensagem: "Não foi possível verificar a cobertura para estas coordenadas.",
            message: error instanceof Error ? error.message : "Erro desconhecido"
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: "Parâmetros inválidos",
        mensagem: "É necessário informar um CEP ou coordenadas (lat, lng) para buscar cobertura."
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] Erro inesperado na API de cobertura:", error);
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        mensagem: "Ocorreu um erro inesperado. Tente novamente mais tarde."
      },
      { status: 500 }
    );
  }
}


