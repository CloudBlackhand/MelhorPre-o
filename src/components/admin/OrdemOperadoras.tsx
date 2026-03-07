"use client";

import { useEffect, useState } from "react";
import type { Operadora } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

export function OrdemOperadoras() {
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordemById, setOrdemById] = useState<Record<string, number | "">>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOperadoras();
  }, []);

  const fetchOperadoras = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/operadoras");
      const list = response.data as Operadora[];
      setOperadoras(list);
      const initial: Record<string, number | ""> = {};
      list.forEach((op) => {
        initial[op.id] = op.ordemRecomendacao ?? "";
      });
      setOrdemById(initial);
    } catch (error) {
      console.error("Error fetching operadoras:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    const raw = ordemById[id];
    const value = raw === "" ? null : Number(raw);
    if (value !== null && (Number.isNaN(value) || value < 0)) {
      alert("Ordem deve ser um número não negativo.");
      return;
    }

    setSavingId(id);
    try {
      await axios.put(`/api/operadoras/${id}`, { ordemRecomendacao: value });
      await fetchOperadoras();
    } catch (error) {
      console.error("Error saving ordem:", error);
      alert("Erro ao salvar ordem.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a] mb-4" />
        <p className="text-muted-foreground">Carregando operadoras...</p>
      </div>
    );
  }

  if (operadoras.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nenhuma operadora. Rode o seed para carregar do config.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordem de recomendação</CardTitle>
        <p className="text-sm text-muted-foreground">
          Quanto menor o número, maior a prioridade quando várias operadoras cobrirem o mesmo CEP (desempate após o rank da área).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {operadoras.map((op) => (
          <div key={op.id} className="flex flex-wrap items-center gap-4 border rounded-lg p-4">
            <div className="flex-1 min-w-[200px]">
              <p className="font-semibold">{op.nome}</p>
              <p className="text-sm text-muted-foreground">{op.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor={`ordem-${op.id}`} className="whitespace-nowrap">
                Ordem
              </Label>
              <Input
                id={`ordem-${op.id}`}
                type="number"
                min={0}
                value={ordemById[op.id] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setOrdemById((prev) => ({ ...prev, [op.id]: v === "" ? "" : parseInt(v, 10) }));
                }}
                className="w-24"
              />
              <Button
                size="sm"
                onClick={() => handleSave(op.id)}
                disabled={savingId === op.id}
              >
                {savingId === op.id ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
