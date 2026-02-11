"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

interface Stats {
  visitantes: {
    total: number;
    novos: number;
    recorrentes: number;
  };
  origem: {
    origem: Record<string, number>;
    medium: Record<string, number>;
  };
  areasMaisBuscadas: Array<{
    cidade: string | null;
    estado: string | null;
    cep: string | null;
    totalBuscas: number;
  }>;
  eventosMaisComuns: Array<{
    tipo: string;
    acao: string | null;
    total: number;
  }>;
  taxaConversao: {
    total: number;
    comCobertura: number;
    taxa: number;
  };
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes" | "ano">("mes");

  useEffect(() => {
    fetchStats();
  }, [periodo]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tracking/stats?periodo=${periodo}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a] mb-2"></div>
        <p className="text-muted-foreground">Carregando estatísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Erro ao carregar estatísticas</p>
      </div>
    );
  }

  // Ordenar origens por quantidade
  const origensOrdenadas = Object.entries(stats.origem.origem)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["dia", "semana", "mes", "ano"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  periodo === p
                    ? "bg-[#1e3a8a] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {p === "dia"
                  ? "Hoje"
                  : p === "semana"
                  ? "7 dias"
                  : p === "mes"
                  ? "30 dias"
                  : "1 ano"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Visitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.visitantes.total}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {stats.visitantes.novos} novos • {stats.visitantes.recorrentes}{" "}
              recorrentes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Buscas de Cobertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.taxaConversao.total}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {stats.taxaConversao.comCobertura} com cobertura encontrada
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.taxaConversao.taxa.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Buscas com cobertura encontrada
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.eventosMaisComuns.reduce((acc, e) => acc + e.total, 0)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Total de interações
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Origem dos Visitantes */}
      <Card>
        <CardHeader>
          <CardTitle>Origem dos Visitantes</CardTitle>
        </CardHeader>
        <CardContent>
          {origensOrdenadas.length === 0 ? (
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-3">
              {origensOrdenadas.map(([origem, count]) => {
                const total = Object.values(stats.origem.origem).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentual = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={origem}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        {origem === "direto" ? "Acesso Direto" : origem}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentual.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#1e3a8a] h-2 rounded-full transition-all"
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Áreas Mais Buscadas */}
      <Card>
        <CardHeader>
          <CardTitle>Áreas Mais Buscadas</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.areasMaisBuscadas.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma busca registrada</p>
          ) : (
            <div className="space-y-3">
              {stats.areasMaisBuscadas.map((area, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {area.cidade || area.cep || "Localização desconhecida"}
                      {area.estado && `, ${area.estado}`}
                    </div>
                    {area.cep && (
                      <div className="text-sm text-muted-foreground">
                        CEP: {area.cep}
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-bold text-[#1e3a8a]">
                    {area.totalBuscas}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eventos Mais Comuns */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Mais Comuns</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.eventosMaisComuns.length === 0 ? (
            <p className="text-muted-foreground">Nenhum evento registrado</p>
          ) : (
            <div className="space-y-2">
              {stats.eventosMaisComuns.map((evento, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <span className="font-medium">{evento.tipo}</span>
                    {evento.acao && (
                      <span className="text-sm text-muted-foreground ml-2">
                        • {evento.acao}
                      </span>
                    )}
                  </div>
                  <span className="font-bold">{evento.total}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
