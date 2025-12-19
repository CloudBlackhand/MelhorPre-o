"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CardPlano } from "./CardPlano";

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

export function PlanosDestaque() {
  const [planos, setPlanos] = useState<PlanoComOperadora[]>([]);
  const [loading, setLoading] = useState(true);

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
      setPlanos(allPlanos.slice(0, 6));
    } catch (error) {
      console.error("Error fetching planos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Carregando planos em destaque...</p>
      </div>
    );
  }

  if (planos.length === 0) {
    return null;
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <CardPlano key={plano.id} plano={plano} />
        ))}
      </div>

      <div className="text-center pt-4">
        <p className="text-gray-600">
          Digite seu CEP no topo da página para ver todos os planos disponíveis na sua região
        </p>
      </div>
    </div>
  );
}

