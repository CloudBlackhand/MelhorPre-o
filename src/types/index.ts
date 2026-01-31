import { z } from "zod";

// Operadora Types
export const OperadoraSchema = z.object({
  id: z.string(),
  nome: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  siteUrl: z.string().nullable(),
  telefone: z.string().nullable(),
  email: z.string().nullable(),
  ativo: z.boolean(),
  ordemRecomendacao: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Operadora = z.infer<typeof OperadoraSchema>;

export const CreateOperadoraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  logoUrl: z.string().url().optional().nullable(),
  siteUrl: z.string().url().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  ativo: z.boolean().default(true),
  ordemRecomendacao: z.number().int().positive().optional().nullable(),
});

export type CreateOperadoraInput = z.infer<typeof CreateOperadoraSchema>;

// Plano Types
export const PlanoSchema = z.object({
  id: z.string(),
  operadoraId: z.string(),
  nome: z.string(),
  velocidadeDownload: z.number(),
  velocidadeUpload: z.number(),
  preco: z.number(),
  descricao: z.string().nullable(),
  beneficios: z.array(z.string()).nullable(),
  ativo: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Plano = z.infer<typeof PlanoSchema>;

export const CreatePlanoSchema = z.object({
  operadoraId: z.string().min(1, "Operadora é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  velocidadeDownload: z.number().int().positive("Velocidade deve ser positiva"),
  velocidadeUpload: z.number().int().positive("Velocidade deve ser positiva"),
  preco: z.number().positive("Preço deve ser positivo"),
  descricao: z.string().optional().nullable(),
  beneficios: z.array(z.string()).optional().nullable(),
  ativo: z.boolean().default(true),
});

export type CreatePlanoInput = z.infer<typeof CreatePlanoSchema>;

// Cobertura Types
export const CoberturaAreaSchema = z.object({
  id: z.string(),
  operadoraId: z.string(),
  nomeArea: z.string(),
  geometria: z.any(), // GeoJSON
  kmlOriginal: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CoberturaArea = z.infer<typeof CoberturaAreaSchema>;

export const CreateCoberturaAreaSchema = z.object({
  operadoraId: z.string().min(1, "Operadora é obrigatória"),
  nomeArea: z.string().min(1, "Nome da área é obrigatório"),
  geometria: z.any(), // GeoJSON
  kmlOriginal: z.string().optional().nullable(),
});

export type CreateCoberturaAreaInput = z.infer<typeof CreateCoberturaAreaSchema>;

// Recomendacao Types
export const RecomendacaoSchema = z.object({
  id: z.string(),
  operadoraId: z.string(),
  prioridade: z.number(),
  motivo: z.string().nullable(),
  badgeText: z.string().nullable(),
  ativo: z.boolean(),
  createdAt: z.date(),
});

export type Recomendacao = z.infer<typeof RecomendacaoSchema>;

export const CreateRecomendacaoSchema = z.object({
  operadoraId: z.string().min(1, "Operadora é obrigatória"),
  prioridade: z.number().int().positive("Prioridade deve ser positiva"),
  motivo: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

export type CreateRecomendacaoInput = z.infer<typeof CreateRecomendacaoSchema>;

// API Response Types
export interface CoberturaResponse {
  operadoras: Array<{
    id: string;
    nome: string;
    slug: string;
    logoUrl: string | null;
    planos: Plano[];
  }>;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  cep?: string;
  /** Mensagem explicativa quando não há planos (ex.: CEP sem localização, região sem cobertura) */
  mensagem?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}


