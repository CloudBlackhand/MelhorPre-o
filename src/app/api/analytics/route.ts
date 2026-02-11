import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/middleware";
import { trackEvent } from "@/lib/analytics/tracker";

/**
 * GET /api/analytics - Estatísticas de visitantes e eventos
 * Requer autenticação admin
 */
export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get("periodo") || "7"; // dias
    const tipo = searchParams.get("tipo") || "all"; // all, visits, events

    const dias = parseInt(periodo);
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);

    // Estatísticas de visitantes
    const totalVisitantes = await prisma.visitante.count({
      where: {
        firstVisit: {
          gte: dataInicio,
        },
      },
    });

    // Visitantes por fonte de tráfego
    const visitantesPorFonte = await prisma.visitante.groupBy({
      by: ["utmSource"],
      where: {
        firstVisit: {
          gte: dataInicio,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Visitantes por referer
    const visitantesPorReferer = await prisma.visitante.groupBy({
      by: ["referer"],
      where: {
        firstVisit: {
          gte: dataInicio,
        },
        referer: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Total de eventos
    const totalEventos = await prisma.evento.count({
      where: {
        createdAt: {
          gte: dataInicio,
        },
      },
    });

    // Eventos por tipo
    const eventosPorTipo = await prisma.evento.groupBy({
      by: ["tipo"],
      where: {
        createdAt: {
          gte: dataInicio,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Eventos de busca por CEP
    const buscasCEP = await prisma.evento.count({
      where: {
        tipo: "search_cep",
        createdAt: {
          gte: dataInicio,
        },
      },
    });

    // Eventos de visualização de planos
    const visualizacoesPlanos = await prisma.evento.count({
      where: {
        tipo: "view_plan",
        createdAt: {
          gte: dataInicio,
        },
      },
    });

    // Cliques em planos
    const cliquesPlanos = await prisma.evento.count({
      where: {
        tipo: "click_plan",
        createdAt: {
          gte: dataInicio,
        },
      },
    });

    // Visitantes únicos por dia (últimos 7 dias)
    const visitantesPorDia = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE(first_visit) as date,
        COUNT(DISTINCT session_id) as count
      FROM visitantes
      WHERE first_visit >= ${dataInicio}
      GROUP BY DATE(first_visit)
      ORDER BY date DESC
      LIMIT 30
    `;

    return NextResponse.json({
      periodo: `${dias} dias`,
      dataInicio: dataInicio.toISOString(),
      visitantes: {
        total: totalVisitantes,
        porFonte: visitantesPorFonte.map((v) => ({
          fonte: v.utmSource || "direct",
          quantidade: v._count.id,
        })),
        porReferer: visitantesPorReferer.map((v) => ({
          referer: v.referer,
          quantidade: v._count.id,
        })),
        porDia: visitantesPorDia.map((v) => ({
          data: v.date,
          quantidade: Number(v.count),
        })),
      },
      eventos: {
        total: totalEventos,
        porTipo: eventosPorTipo.map((e) => ({
          tipo: e.tipo,
          quantidade: e._count.id,
        })),
        buscasCEP,
        visualizacoesPlanos,
        cliquesPlanos,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics - Registrar evento manualmente (client-side)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, pagina, elemento, dados } = body;
    const sessionId = request.cookies.get("session_id")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID não encontrado" },
        { status: 400 }
      );
    }

    if (!tipo) {
      return NextResponse.json(
        { error: "Tipo de evento é obrigatório" },
        { status: 400 }
      );
    }

    await trackEvent(sessionId, {
      tipo,
      pagina,
      elemento,
      dados,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json(
      { error: "Erro ao registrar evento" },
      { status: 500 }
    );
  }
}
