"use client";

import { useEffect, useState } from "react";
import type { Plano } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

export function PlanosList() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const response = await axios.get("/api/planos");
      setPlanos(response.data);
    } catch (error) {
      console.error("Error fetching planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este plano?")) {
      return;
    }

    try {
      await axios.delete(`/api/planos/${id}`);
      fetchPlanos();
    } catch (error) {
      console.error("Error deleting plano:", error);
      alert("Erro ao deletar plano");
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (planos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Nenhum plano cadastrado</p>
          <Link href="/admin/planos/novo">
            <Button className="mt-4">Criar primeiro plano</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {planos.map((plano) => (
        <Card key={plano.id}>
          <CardHeader>
            <CardTitle>{plano.nome}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Velocidade:</strong> {plano.velocidadeDownload} Mbps download /{" "}
                {plano.velocidadeUpload} Mbps upload
              </p>
              <p className="text-sm">
                <strong>Preço:</strong> R$ {plano.preco.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Status: {plano.ativo ? "Ativo" : "Inativo"}
              </p>
              <div className="flex gap-2 mt-4">
                <Link href={`/admin/planos/${plano.id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(plano.id)}
                >
                  Deletar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

