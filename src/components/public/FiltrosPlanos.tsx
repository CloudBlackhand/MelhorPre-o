"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FiltrosPlanosProps {
  operadoras: Array<{
    id: string;
    nome: string;
  }>;
  filtros: {
    velocidadeMin: number;
    precoMax: number;
    operadora: string;
  };
  onFiltrosChange: (filtros: {
    velocidadeMin: number;
    precoMax: number;
    operadora: string;
  }) => void;
}

export function FiltrosPlanos({ operadoras, filtros, onFiltrosChange }: FiltrosPlanosProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="velocidadeMin">Velocidade Mínima (Mbps)</Label>
            <Input
              id="velocidadeMin"
              type="number"
              value={filtros.velocidadeMin || ""}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  velocidadeMin: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precoMax">Preço Máximo (R$)</Label>
            <Input
              id="precoMax"
              type="number"
              value={filtros.precoMax === Infinity ? "" : filtros.precoMax}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  precoMax: parseInt(e.target.value) || Infinity,
                })
              }
              placeholder="Sem limite"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operadora">Operadora</Label>
            <select
              id="operadora"
              value={filtros.operadora}
              onChange={(e) =>
                onFiltrosChange({
                  ...filtros,
                  operadora: e.target.value,
                })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todas</option>
              {operadoras.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


