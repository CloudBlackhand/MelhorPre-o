"use client";

import { useEffect, useState } from "react";
import type { Operadora } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

export function OperadorasList() {
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperadoras();
  }, []);

  const fetchOperadoras = async () => {
    try {
      const response = await axios.get("/api/operadoras");
      setOperadoras(response.data);
    } catch (error) {
      console.error("Error fetching operadoras:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {operadoras.map((operadora) => (
        <Card key={operadora.id}>
          <CardHeader>
            <CardTitle>{operadora.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Status: {operadora.ativo ? "Ativa" : "Inativa"}
              </p>
              {operadora.ordemRecomendacao != null && (
                <p className="text-sm text-muted-foreground">
                  Ordem de recomendação: {operadora.ordemRecomendacao}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Link href="/admin/ordem">
                  <Button variant="outline" size="sm">
                    Alterar ordem
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


