"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function BuscaCobertura() {
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Encontre os melhores planos de internet na sua região
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Digite seu CEP (ex: 12345-678)"
              value={formatCEP(cep)}
              onChange={(e) => setCep(e.target.value)}
              maxLength={9}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Digite seu CEP para ver os planos disponíveis na sua região
          </p>
        </form>
      </CardContent>
    </Card>
  );
}


