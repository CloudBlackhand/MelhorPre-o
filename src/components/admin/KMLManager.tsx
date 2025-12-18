"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoberturaArea, Operadora } from "@/types";
import axios from "axios";

export function KMLManager() {
  const [areas, setAreas] = useState<CoberturaArea[]>([]);
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [operadoraId, setOperadoraId] = useState("");
  const [nomeArea, setNomeArea] = useState("");

  useEffect(() => {
    fetchAreas();
    fetchOperadoras();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await axios.get("/api/kml/areas");
      setAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchOperadoras = async () => {
    try {
      const response = await axios.get("/api/operadoras?ativo=true");
      setOperadoras(response.data);
    } catch (error) {
      console.error("Error fetching operadoras:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !operadoraId || !nomeArea) {
      alert("Preencha todos os campos");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("operadoraId", operadoraId);
      formData.append("nomeArea", nomeArea);

      await axios.post("/api/kml", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("KML processado com sucesso!");
      setSelectedFile(null);
      setOperadoraId("");
      setNomeArea("");
      fetchAreas();
    } catch (error: any) {
      console.error("Error uploading KML:", error);
      alert(error.response?.data?.error || "Erro ao processar KML");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta área de cobertura?")) {
      return;
    }

    try {
      await axios.delete(`/api/kml/areas/${id}`);
      fetchAreas();
    } catch (error) {
      console.error("Error deleting area:", error);
      alert("Erro ao deletar área");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de KML</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operadora">Operadora *</Label>
            <select
              id="operadora"
              value={operadoraId}
              onChange={(e) => setOperadoraId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione uma operadora</option>
              {operadoras.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeArea">Nome da Área *</Label>
            <Input
              id="nomeArea"
              value={nomeArea}
              onChange={(e) => setNomeArea(e.target.value)}
              placeholder="ex: Região Metropolitana de São Paulo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo KML *</Label>
            <Input
              id="file"
              type="file"
              accept=".kml,application/vnd.google-earth.kml+xml,application/xml"
              onChange={handleFileChange}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <Button onClick={handleUpload} disabled={uploading || !selectedFile || !operadoraId || !nomeArea}>
            {uploading ? "Processando..." : "Upload e Processar KML"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Áreas de Cobertura Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {areas.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma área de cobertura cadastrada</p>
          ) : (
            <div className="space-y-4">
              {areas.map((area) => (
                <div key={area.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{area.nomeArea}</h3>
                      <p className="text-sm text-muted-foreground">
                        Operadora: {(area as any).operadora?.nome || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(area.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(area.id)}
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

