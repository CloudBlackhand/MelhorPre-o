"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface BuscaCoberturaProps {
  hideTitle?: boolean;
}

export function BuscaCobertura({ hideTitle = false }: BuscaCoberturaProps) {
  const router = useRouter();
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length === 8) {
      router.push(`/comparar?cep=${cleanCEP}`);
    } else {
      alert("CEP inválido. Digite um CEP com 8 dígitos.");
    }
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
      {!hideTitle && (
        <CardHeader className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white">
          <CardTitle className="text-2xl text-center font-bold">
            Encontre os melhores planos de internet na sua região
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={hideTitle ? "p-8" : "p-8"}>
        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="Digite seu CEP (ex: 12345-678)"
              value={formatCEP(cep)}
              onChange={(e) => setCep(e.target.value)}
              maxLength={9}
              className="flex-1 h-14 text-lg border-2 border-gray-200 focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 rounded-xl transition-all"
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] hover:from-[#1e40af] hover:to-[#1e3a8a] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


