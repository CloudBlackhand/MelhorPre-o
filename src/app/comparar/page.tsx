"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ComparadorPlanos } from "@/components/public/ComparadorPlanos";
import { BuscaCobertura } from "@/components/public/BuscaCobertura";

function CompararContent() {
  const searchParams = useSearchParams();
  const cep = searchParams.get("cep");

  if (!cep) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <BuscaCobertura />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Planos Disponíveis</h1>
          <p className="text-muted-foreground">CEP: {cep}</p>
        </div>
        <ComparadorPlanos cep={cep} />
      </div>
    </div>
  );
}

export default function CompararPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CompararContent />
    </Suspense>
  );
}
