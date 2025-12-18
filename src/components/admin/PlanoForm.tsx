"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreatePlanoSchema, type CreatePlanoInput, type Plano, type Operadora } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

interface PlanoFormProps {
  planoId?: string;
}

export function PlanoForm({ planoId }: PlanoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [plano, setPlano] = useState<Plano | null>(null);
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreatePlanoInput>({
    resolver: zodResolver(CreatePlanoSchema),
  });

  useEffect(() => {
    fetchOperadoras();
    if (planoId) {
      fetchPlano();
    }
  }, [planoId]);

  const fetchOperadoras = async () => {
    try {
      const response = await axios.get("/api/operadoras?ativo=true");
      setOperadoras(response.data);
    } catch (error) {
      console.error("Error fetching operadoras:", error);
    }
  };

  const fetchPlano = async () => {
    try {
      const response = await axios.get(`/api/planos/${planoId}`);
      const data = response.data;
      setPlano(data);
      setValue("operadoraId", data.operadoraId);
      setValue("nome", data.nome);
      setValue("velocidadeDownload", data.velocidadeDownload);
      setValue("velocidadeUpload", data.velocidadeUpload);
      setValue("preco", data.preco);
      setValue("descricao", data.descricao || "");
      setValue("ativo", data.ativo);
    } catch (error) {
      console.error("Error fetching plano:", error);
    }
  };

  const onSubmit = async (data: CreatePlanoInput) => {
    setLoading(true);
    try {
      if (planoId) {
        await axios.put(`/api/planos/${planoId}`, data);
      } else {
        await axios.post("/api/planos", data);
      }
      router.push("/admin/planos");
      router.refresh();
    } catch (error) {
      console.error("Error saving plano:", error);
      alert("Erro ao salvar plano");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{planoId ? "Editar Plano" : "Novo Plano"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operadoraId">Operadora *</Label>
            <select
              id="operadoraId"
              {...register("operadoraId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione uma operadora</option>
              {operadoras.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nome}
                </option>
              ))}
            </select>
            {errors.operadoraId && (
              <p className="text-sm text-destructive">{errors.operadoraId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="velocidadeDownload">Download (Mbps) *</Label>
              <Input
                id="velocidadeDownload"
                type="number"
                {...register("velocidadeDownload", { valueAsNumber: true })}
              />
              {errors.velocidadeDownload && (
                <p className="text-sm text-destructive">{errors.velocidadeDownload.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="velocidadeUpload">Upload (Mbps) *</Label>
              <Input
                id="velocidadeUpload"
                type="number"
                {...register("velocidadeUpload", { valueAsNumber: true })}
              />
              {errors.velocidadeUpload && (
                <p className="text-sm text-destructive">{errors.velocidadeUpload.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              {...register("preco", { valueAsNumber: true })}
            />
            {errors.preco && <p className="text-sm text-destructive">{errors.preco.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              {...register("descricao")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              {...register("ativo")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="ativo">Plano ativo</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/planos")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

