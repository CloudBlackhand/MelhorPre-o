"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CardPlano } from "./CardPlano";
import { PLANOS_PLACEHOLDER } from "@/lib/planos-exemplo";

interface PlanoComOperadora {
  id: string;
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao?: string | null;
  beneficios?: string[] | null;
  operadora: {
    id: string;
    nome: string;
    slug: string;
    logoUrl?: string | null;
  };
}

interface PlanosDestaqueProps {
  /** Esconde badges nos cards (usado na camada de reveal do zipper para as tags não aparecerem na hora errada) */
  hideBadges?: boolean;
}

export function PlanosDestaque({ hideBadges = false }: PlanosDestaqueProps) {
  const [planos, setPlanos] = useState<PlanoComOperadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);

  useEffect(() => {
    fetchPlanosDestaque();
  }, []);

  const fetchPlanosDestaque = async () => {
    try {
      // Buscar todas as operadoras ativas
      const operadorasResponse = await axios.get("/api/operadoras?ativo=true");
      const operadoras = operadorasResponse.data;

      // Buscar planos de todas as operadoras
      const planosPromises = operadoras.map((op: any) =>
        axios.get(`/api/planos?operadoraId=${op.id}&ativo=true`)
      );

      const planosResponses = await Promise.all(planosPromises);

      // Flatten e adicionar informações da operadora
      const allPlanos: PlanoComOperadora[] = planosResponses.flatMap((response, index) =>
        response.data.map((plano: any) => ({
          ...plano,
          operadora: {
            id: operadoras[index].id,
            nome: operadoras[index].nome,
            slug: operadoras[index].slug,
            logoUrl: operadoras[index].logoUrl,
          },
        }))
      );

      // Ordenar por preço e pegar os 6 mais baratos
      allPlanos.sort((a, b) => Number(a.preco) - Number(b.preco));
      const planosFinais = allPlanos.slice(0, 6);
      
      if (planosFinais.length > 0) {
        setPlanos(planosFinais);
        setUsingPlaceholder(false);
      } else {
        // Se não houver planos, usar placeholders
        setPlanos(PLANOS_PLACEHOLDER);
        setUsingPlaceholder(true);
      }
    } catch (error) {
      console.error("Error fetching planos:", error);
      // Em caso de erro, usar placeholders
      setPlanos(PLANOS_PLACEHOLDER);
      setUsingPlaceholder(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a] mb-4"></div>
        <p className="text-gray-600 text-lg">Carregando planos em destaque...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Planos em <span className="text-[#1e3a8a]">Destaque</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Confira os melhores planos de internet disponíveis
        </p>
        {usingPlaceholder && (
          <p className="text-sm text-amber-600 mt-2 max-w-2xl mx-auto">
            💡 Exibindo planos de exemplo. Digite seu CEP para ver os planos disponíveis na sua região.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <CardPlano key={plano.id} plano={plano} hideBadge={hideBadges} />
        ))}
      </div>

      <div className="text-center pt-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-700 font-medium">
            Digite seu CEP no topo da página para ver todos os planos disponíveis na sua região
          </p>
        </div>
      </div>
    </div>
  );
}

