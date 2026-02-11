"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import axios from "axios";

interface Config {
  id: string;
  chave: string;
  valor: string;
  descricao?: string | null;
}

export function ConfigForm() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<{ valor: string; descricao?: string }>({
    defaultValues: {
      valor: "",
      descricao: "",
    },
  });

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get("/api/configs?chave=whatsapp_number");
      const data = response.data;
      setConfig(data);
      setValue("valor", data.valor || "");
      setValue("descricao", data.descricao || "");
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Config não existe ainda, criar com valores padrão
        setConfig(null);
        setValue("valor", "5511999999999");
        setValue("descricao", "Número do WhatsApp para contato (formato: código do país + DDD + número)");
      } else {
        console.error("Error fetching config:", error);
      }
    }
  };

  const onSubmit = async (data: { valor: string; descricao?: string }) => {
    setLoading(true);
    setSaved(false);

    try {
      await axios.post("/api/configs", {
        chave: "whatsapp_number",
        valor: data.valor.trim(),
        descricao: data.descricao?.trim() || null,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await fetchConfig(); // Recarregar para pegar o ID
    } catch (error: any) {
      console.error("Error saving config:", error);
      alert("Erro ao salvar configuração: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const valorAtual = watch("valor");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do WhatsApp</CardTitle>
        <CardDescription>
          Configure o número do WhatsApp que será usado no botão &quot;Contratar&quot; dos planos.
          Formato: código do país + DDD + número (ex: 5511999999999)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="valor">Número do WhatsApp</Label>
            <Input
              id="valor"
              {...register("valor", {
                required: "Número é obrigatório",
                pattern: {
                  value: /^\d{10,15}$/,
                  message: "Formato inválido. Use apenas números (10-15 dígitos)",
                },
              })}
              placeholder="5511999999999"
              className="font-mono"
            />
            {errors.valor && (
              <p className="text-sm text-red-600">{errors.valor.message}</p>
            )}
            {valorAtual && (
              <p className="text-sm text-gray-500">
                Link de teste:{" "}
                <a
                  href={`https://wa.me/${valorAtual}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://wa.me/{valorAtual}
                </a>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Input
              id="descricao"
              {...register("descricao")}
              placeholder="Descrição da configuração"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Configuração"}
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Configuração salva com sucesso!
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
