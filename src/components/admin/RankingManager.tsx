"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoberturaArea } from "@/types";
import axios from "axios";

export function RankingManager() {
  const [areas, setAreas] = useState<CoberturaArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRank, setEditRank] = useState<number>(999);
  const [editScore, setEditScore] = useState<number | null>(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/kml/areas");
      // Ordenar por rank (menor = maior prioridade)
      const sorted = response.data.sort((a: CoberturaArea, b: CoberturaArea) => {
        const rankA = a.rank ?? 999;
        const rankB = b.rank ?? 999;
        return rankA - rankB;
      });
      setAreas(sorted);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (area: CoberturaArea) => {
    setEditingId(area.id);
    setEditRank(area.rank ?? 999);
    setEditScore(area.score ?? null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditRank(999);
    setEditScore(null);
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      await axios.put(`/api/kml/areas/${id}/rank`, {
        rank: editRank,
        score: editScore,
      });
      setEditingId(null);
      await fetchAreas();
    } catch (error) {
      console.error("Error updating rank:", error);
      alert("Erro ao atualizar ranqueamento");
    } finally {
      setSaving(false);
    }
  };

  const getRankBadgeColor = (rank: number | null | undefined) => {
    if (!rank || rank >= 999) return "bg-gray-100 text-gray-700";
    if (rank <= 3) return "bg-green-100 text-green-700";
    if (rank <= 10) return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getScoreBadgeColor = (score: number | null | undefined) => {
    if (!score) return "bg-gray-100 text-gray-700";
    if (score >= 8) return "bg-green-100 text-green-700";
    if (score >= 6) return "bg-blue-100 text-blue-700";
    if (score >= 4) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Áreas de Cobertura - Ranqueamento</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Rank:</strong> Ordem de prioridade (menor número = maior prioridade). 
          Ex: Rank 1 aparece primeiro nos resultados.
          <br />
          <strong>Score:</strong> Nota de 0 a 10 (opcional). Usado para ordenação secundária.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a] mb-2"></div>
            <p className="text-muted-foreground">Carregando áreas...</p>
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-muted-foreground font-medium">
              Nenhuma área de cobertura cadastrada
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Faça upload de arquivos KML/KMZ primeiro
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {areas.map((area, index) => (
              <div
                key={area.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                {editingId === area.id ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{area.nomeArea}</h3>
                      <p className="text-sm text-muted-foreground">
                        Operadora: {(area as any).operadora?.nome || "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`rank-${area.id}`}>
                          Rank (Prioridade) *
                        </Label>
                        <Input
                          id={`rank-${area.id}`}
                          type="number"
                          min="1"
                          value={editRank}
                          onChange={(e) => setEditRank(parseInt(e.target.value) || 999)}
                          placeholder="999"
                        />
                        <p className="text-xs text-muted-foreground">
                          Menor número = maior prioridade
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`score-${area.id}`}>
                          Score (0-10)
                        </Label>
                        <Input
                          id={`score-${area.id}`}
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={editScore ?? ""}
                          onChange={(e) =>
                            setEditScore(
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          placeholder="Opcional"
                        />
                        <p className="text-xs text-muted-foreground">
                          Nota opcional para ordenação
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(area.id)}
                        disabled={saving}
                        size="sm"
                      >
                        {saving ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-muted-foreground font-mono">
                          #{index + 1}
                        </span>
                        <h3 className="font-semibold">{area.nomeArea}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Operadora: {(area as any).operadora?.nome || "N/A"}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getRankBadgeColor(
                            area.rank
                          )}`}
                        >
                          Rank: {area.rank ?? 999}
                        </span>
                        {area.score !== null && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getScoreBadgeColor(
                              area.score
                            )}`}
                          >
                            Score: {area.score?.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleEdit(area)}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
