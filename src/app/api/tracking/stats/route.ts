import { NextRequest, NextResponse } from "next/server";
import { TrackingService } from "@/modules/tracking/service";
import { requireAdmin } from "@/lib/auth/middleware";

/**
 * GET /api/tracking/stats
 * Obtém estatísticas de tracking (apenas admin)
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get("periodo") as "dia" | "semana" | "mes" | "ano" | undefined;

    const [visitantes, origem, areasMaisBuscadas, eventosMaisComuns, taxaConversao] =
      await Promise.all([
        TrackingService.getVisitantesStats(periodo),
        TrackingService.getOrigemVisitantes(periodo),
        TrackingService.getAreasMaisBuscadas(10),
        TrackingService.getEventosMaisComuns(10),
        TrackingService.getTaxaConversao(periodo),
      ]);

    return NextResponse.json({
      visitantes,
      origem,
      areasMaisBuscadas,
      eventosMaisComuns,
      taxaConversao,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    return NextResponse.json(
      { error: "Erro ao obter estatísticas" },
      { status: 500 }
    );
  }
}
