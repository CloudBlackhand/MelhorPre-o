"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      const response = await axios.get(`/api/cobertura?cep=${cep}`);
      setData(response.data);
    } catch (err: any) {
      console.error("Error fetching planos:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.mensagem || "Erro ao buscar planos. Tente novamente.";
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCEP = (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length === 8) {
      return `${clean.slice(0, 5)}-${clean.slice(5)}`;
    }
    return cepValue;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a8a] mb-4"></div>
        <p className="text-gray-600 text-lg">Buscando planos para o CEP {formatCEP(cep)}...</p>
        <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="w-16 h-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erro ao buscar planos</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={fetchPlanos}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Tentar Novamente
                </Button>
                <Link href="/comparar">
                  <Button variant="outline">Nova Busca</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.operadoras.length === 0) {
    const hasMessage = data?.mensagem;
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                CEP: {formatCEP(cep)}
              </h3>
              <p className="text-blue-800 mb-4">
                {hasMessage
                  ? data.mensagem
                  : "Não encontramos cobertura cadastrada para este CEP. Exibindo planos de exemplo abaixo."}
              </p>
              <Link href="/comparar">
                <Button variant="outline" size="sm">
                  Buscar outro CEP
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Planos de Exemplo</h2>
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
      {/* Indicador de CEP e sucesso */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-600">CEP pesquisado:</p>
              <p className="text-lg font-semibold text-gray-900">{formatCEP(cep)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {data.operadoras.length} {data.operadoras.length === 1 ? "operadora" : "operadoras"} encontrada{data.operadoras.length === 1 ? "" : "s"}
            </span>
            <Link href="/comparar">
              <Button variant="outline" size="sm">
                Nova Busca
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <FiltrosPlanos
        operadoras={data.operadoras}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      {filteredPlanos.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredPlanos.length} {filteredPlanos.length === 1 ? "plano encontrado" : "planos encontrados"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlanos.map((plano) => (
              <CardPlano key={plano.id} plano={plano} />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            Nenhum plano encontrado
          </h3>
          <p className="text-yellow-800 mb-4">
            Nenhum plano corresponde aos filtros aplicados. Tente ajustar os filtros acima.
          </p>
          <Button
            onClick={() => setFiltros({ velocidadeMin: 0, precoMax: Infinity, operadora: "" })}
            variant="outline"
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}


