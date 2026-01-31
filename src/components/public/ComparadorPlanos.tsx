"use client";

import { useEffect, useState } from "react";
import type { CoberturaResponse } from "@/types";
import { CardPlano } from "./CardPlano";
import { FiltrosPlanos } from "./FiltrosPlanos";
import { PLANOS_EXEMPLO_COMPARADOR } from "@/lib/planos-exemplo";
import axios from "axios";

interface ComparadorPlanosProps {
  cep: string;
}

export function ComparadorPlanos({ cep }: ComparadorPlanosProps) {
  const [data, setData] = useState<CoberturaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    velocidadeMin: 0,
    precoMax: Infinity,
    operadora: "",
  });

  useEffect(() => {
    fetchPlanos();
  }, [cep]);

  const fetchPlanos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/cobertura?cep=${cep}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching planos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Carregando planos...</p>
      </div>
    );
  }

  if (!data || data.operadoras.length === 0) {
    return (
      <div className="space-y-10">
        <div className="text-center py-6 space-y-2">
          <p className="text-muted-foreground">
            {data?.mensagem || "Nenhum plano encontrado para este CEP. Tente outro CEP."}
          </p>
          {data?.coordenadas && (
            <p className="text-sm text-muted-foreground">
              Coordenadas consultadas: {data.coordenadas.lat.toFixed(4)}, {data.coordenadas.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Cards de exemplo: mesmo layout que aparece quando há cobertura */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Exemplo de como ficam os planos (quando há cobertura)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLANOS_EXEMPLO_COMPARADOR.map((plano) => (
              <CardPlano key={plano.id} plano={plano} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Flatten all plans from all operators
  const allPlanos = data.operadoras.flatMap((op) =>
    op.planos.map((plano) => ({
      ...plano,
      operadora: {
        id: op.id,
        nome: op.nome,
        slug: op.slug,
        logoUrl: op.logoUrl,
      },
    }))
  );

  // Apply filters
  const filteredPlanos = allPlanos.filter((plano) => {
    if (filtros.velocidadeMin > 0 && plano.velocidadeDownload < filtros.velocidadeMin) {
      return false;
    }
    if (filtros.precoMax < Infinity && plano.preco > filtros.precoMax) {
      return false;
    }
    if (filtros.operadora && plano.operadora.id !== filtros.operadora) {
      return false;
    }
    return true;
  });

  // Sort by price
  filteredPlanos.sort((a, b) => a.preco - b.preco);

  return (
    <div className="space-y-6">
      <FiltrosPlanos
        operadoras={data.operadoras}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlanos.map((plano) => (
          <CardPlano key={plano.id} plano={plano} />
        ))}
      </div>

      {filteredPlanos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum plano encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}


