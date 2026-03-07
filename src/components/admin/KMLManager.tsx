"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoberturaArea } from "@/types";
import axios from "axios";

export function KMLManager() {
  const [areas, setAreas] = useState<CoberturaArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/kml/areas");
      setAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta área de cobertura?")) {
      return;
    }

    try {
      await axios.delete(`/api/kml/areas/${id}`);
      fetchAreas();
    } catch (error) {
      console.error("Error deleting area:", error);
      alert("Erro ao deletar área");
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Tem certeza que deseja apagar TODAS as áreas de cobertura do banco? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setDeletingAll(true);
    try {
      const res = await axios.delete("/api/kml/areas");
      const deleted = res.data?.deleted ?? 0;
      alert(`${deleted} área(s) de cobertura removida(s) do banco.`);
      await fetchAreas();
    } catch (error: any) {
      console.error("Error deleting all areas:", error);
      const msg = error.response?.data?.error || "Erro ao apagar áreas.";
      alert(msg);
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Áreas de Cobertura</CardTitle>
          <p className="text-sm text-muted-foreground">
            Áreas são carregadas pelo seed a partir da pasta KM/. Ajuste prioridade em Ranqueamento.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Áreas Cadastradas</CardTitle>
          {areas.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={deletingAll}
            >
              {deletingAll ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Apagando...
                </span>
              ) : (
                "Apagar todas do banco"
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a] mb-2"></div>
              <p className="text-muted-foreground">Carregando áreas...</p>
            </div>
          ) : areas.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-muted-foreground font-medium">Nenhuma área de cobertura</p>
              <p className="text-sm text-muted-foreground mt-1">Rode o seed (pasta KM/) para carregar as áreas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {areas.map((area) => (
                <div key={area.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{area.nomeArea}</h3>
                      <p className="text-sm text-muted-foreground">
                        Operadora ID: {area.operadoraId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(area.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(area.id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
