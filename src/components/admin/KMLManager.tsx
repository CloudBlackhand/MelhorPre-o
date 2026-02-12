"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CoberturaArea, Operadora } from "@/types";
import axios from "axios";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const VALID_EXTENSIONS = [".kml", ".kmz"];
const VALID_MIME_TYPES = [
  "application/vnd.google-earth.kml+xml",
  "application/vnd.google-earth.kmz",
  "application/xml",
  "text/xml",
  "application/zip",
];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function inferFromFileName(fileName: string): { operadoraNome?: string; nomeArea?: string } {
  const baseName = fileName.replace(/\.(kml|kmz)$/i, "").trim();
  const cleaned = baseName.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/\s*[-|]\s*/).filter(Boolean);
  const noiseRegex =
    /\b(cobertura|area|área|regiao|região|mapa|poligono|polígono|kml|kmz|google earth|googleearth)\b/gi;

  const stripNoise = (value: string): string =>
    value.replace(noiseRegex, " ").replace(/\s+/g, " ").trim();

  const operadoraNome = stripNoise(parts[0] || cleaned);
  let nomeArea = stripNoise(parts.length > 1 ? parts.slice(1).join(" - ") : cleaned);

  if (!nomeArea || normalizeText(nomeArea) === normalizeText(operadoraNome)) {
    nomeArea = cleaned;
  }

  return {
    operadoraNome: operadoraNome || undefined,
    nomeArea: nomeArea || undefined,
  };
}

export function KMLManager() {
  const [areas, setAreas] = useState<CoberturaArea[]>([]);
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [operadoraId, setOperadoraId] = useState("");
  const [nomeArea, setNomeArea] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);

  useEffect(() => {
    fetchAreas();
    fetchOperadoras();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/kml/areas");
      setAreas(response.data);
    } catch (error) {
      console.error("Error fetching areas:", error);
    } finally {
      setLoading(false);
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

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB. Arquivo atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = VALID_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return {
        valid: false,
        error: `Extensão inválida. Use apenas arquivos .kml ou .kmz`,
      };
    }

    // Check MIME type (optional, browsers may not always provide accurate MIME types)
    if (file.type && !VALID_MIME_TYPES.includes(file.type)) {
      // Don't fail if MIME type is empty or unknown, just warn
      console.warn(`MIME type não reconhecido: ${file.type}`);
    }

    return { valid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileValidationError(null);
    setUploadError(null);
    setUploadSuccess(false);

    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setFileValidationError(validation.error || "Arquivo inválido");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);

      // Auto-preencher campos vazios com base no nome do arquivo
      const inferred = inferFromFileName(file.name);
      if (!nomeArea && inferred.nomeArea) {
        setNomeArea(inferred.nomeArea);
      }
      if (!operadoraId && inferred.operadoraNome) {
        const matchedOperadora = operadoras.find(
          (op) =>
            normalizeText(op.nome) === normalizeText(inferred.operadoraNome!) ||
            normalizeText(file.name).includes(normalizeText(op.nome))
        );
        if (matchedOperadora) {
          setOperadoraId(matchedOperadora.id);
        }
      }
    } else {
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Selecione um arquivo KML/KMZ");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (operadoraId) {
        formData.append("operadoraId", operadoraId);
      }
      if (nomeArea.trim()) {
        formData.append("nomeArea", nomeArea.trim());
      }

      await axios.post("/api/kml", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess(true);
      setSelectedFile(null);
      setOperadoraId("");
      setNomeArea("");
      setFileValidationError(null);
      
      // Reset success message after 5 seconds
      setTimeout(() => setUploadSuccess(false), 5000);
      
      await fetchAreas();
    } catch (error: any) {
      console.error("Error uploading KML:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details?.join(", ") || "Erro ao processar KML. Verifique o arquivo e tente novamente.";
      setUploadError(errorMessage);
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
            <Label htmlFor="operadora">Operadora (opcional)</Label>
            <select
              id="operadora"
              value={operadoraId}
              onChange={(e) => setOperadoraId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Detectar automaticamente pelo arquivo</option>
              {operadoras.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.nome}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Se vazio, o sistema tenta identificar no nome do arquivo e cria a operadora se nao existir.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeArea">Nome da Área (opcional)</Label>
            <Input
              id="nomeArea"
              value={nomeArea}
              onChange={(e) => setNomeArea(e.target.value)}
              placeholder="Se vazio, tenta usar o nome do arquivo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo KML/KMZ *</Label>
            <Input
              id="file"
              type="file"
              accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz,application/xml,application/zip"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {fileValidationError && (
              <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{fileValidationError}</span>
              </div>
            )}
            {selectedFile && !fileValidationError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{selectedFile.name}</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Tamanho: {formatFileSize(selectedFile.size)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Tipo: {selectedFile.type || "Não especificado"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {uploadSuccess && (
            <div className="flex items-start gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">KML processado com sucesso! A área de cobertura foi cadastrada.</span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold">Erro ao processar KML</p>
                <p className="mt-1">{uploadError}</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={uploading || !selectedFile || !!fileValidationError}
            className="w-full"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando KML...
              </span>
            ) : (
              "Upload e Processar KML"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Áreas de Cobertura Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a8a] mb-2"></div>
              <p className="text-muted-foreground">Carregando áreas...</p>
            </div>
          ) : areas.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-muted-foreground font-medium">Nenhuma área de cobertura cadastrada</p>
              <p className="text-sm text-muted-foreground mt-1">Faça upload de um arquivo KML/KMZ acima para começar</p>
            </div>
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


