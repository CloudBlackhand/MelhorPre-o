"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOperadoraSchema, type CreateOperadoraInput, type Operadora } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

interface OperadoraFormProps {
  operadoraId?: string;
}

export function OperadoraForm({ operadoraId }: OperadoraFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [operadora, setOperadora] = useState<Operadora | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateOperadoraInput>({
    resolver: zodResolver(CreateOperadoraSchema),
  });

  useEffect(() => {
    if (operadoraId) {
      fetchOperadora();
    }
  }, [operadoraId]);

  const fetchOperadora = async () => {
    try {
      const response = await axios.get(`/api/operadoras/${operadoraId}`);
      const data = response.data;
      setOperadora(data);
      setValue("nome", data.nome);
      setValue("slug", data.slug);
      setValue("logoUrl", data.logoUrl || "");
      setValue("siteUrl", data.siteUrl || "");
      setValue("telefone", data.telefone || "");
      setValue("email", data.email || "");
      setValue("ativo", data.ativo);
      setValue("ordemRecomendacao", data.ordemRecomendacao || null);
    } catch (error) {
      console.error("Error fetching operadora:", error);
    }
  };

  const onSubmit = async (data: CreateOperadoraInput) => {
    setLoading(true);
    try {
      if (operadoraId) {
        await axios.put(`/api/operadoras/${operadoraId}`, data);
      } else {
        await axios.post("/api/operadoras", data);
      }
      router.push("/admin/operadoras");
      router.refresh();
    } catch (error) {
      console.error("Error saving operadora:", error);
      alert("Erro ao salvar operadora");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{operadoraId ? "Editar Operadora" : "Nova Operadora"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" {...register("slug")} placeholder="ex: claro-fibra" />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL do Logo</Label>
            <Input id="logoUrl" type="url" {...register("logoUrl")} />
            {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">URL do Site</Label>
            <Input id="siteUrl" type="url" {...register("siteUrl")} />
            {errors.siteUrl && <p className="text-sm text-destructive">{errors.siteUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" {...register("telefone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ordemRecomendacao">Ordem de Recomendação</Label>
            <Input
              id="ordemRecomendacao"
              type="number"
              {...register("ordemRecomendacao", { valueAsNumber: true })}
            />
            {errors.ordemRecomendacao && (
              <p className="text-sm text-destructive">{errors.ordemRecomendacao.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              {...register("ativo")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="ativo">Operadora ativa</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/operadoras")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


