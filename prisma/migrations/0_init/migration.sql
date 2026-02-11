-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "operadoras" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "site_url" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem_recomendacao" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operadoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "operadora_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "velocidade_download" INTEGER NOT NULL,
    "velocidade_upload" INTEGER NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT,
    "beneficios" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cobertura_areas" (
    "id" TEXT NOT NULL,
    "operadora_id" TEXT NOT NULL,
    "nome_area" TEXT NOT NULL,
    "geometria" JSONB NOT NULL,
    "kml_original" TEXT,
    "rank" INTEGER DEFAULT 999,
    "score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cobertura_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recomendacoes" (
    "id" TEXT NOT NULL,
    "operadora_id" TEXT NOT NULL,
    "prioridade" INTEGER NOT NULL,
    "motivo" TEXT,
    "badge_text" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recomendacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configs" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitantes" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "first_visit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_visit" TIMESTAMP(3) NOT NULL,
    "visit_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "visitantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "visitante_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "acao" TEXT,
    "url" TEXT,
    "elemento" TEXT,
    "valor" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "busca_cobertura" (
    "id" TEXT NOT NULL,
    "visitante_id" TEXT,
    "cep" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "cidade" TEXT,
    "estado" TEXT,
    "encontrou_cobertura" BOOLEAN NOT NULL DEFAULT false,
    "operadoras_encontradas" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "busca_cobertura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operadoras_slug_key" ON "operadoras"("slug");

-- CreateIndex
CREATE INDEX "operadoras_ativo_idx" ON "operadoras"("ativo");

-- CreateIndex
CREATE INDEX "operadoras_ordem_recomendacao_idx" ON "operadoras"("ordem_recomendacao");

-- CreateIndex
CREATE INDEX "planos_operadora_id_ativo_idx" ON "planos"("operadora_id", "ativo");

-- CreateIndex
CREATE INDEX "planos_ativo_idx" ON "planos"("ativo");

-- CreateIndex
CREATE INDEX "cobertura_areas_operadora_id_idx" ON "cobertura_areas"("operadora_id");

-- CreateIndex
CREATE INDEX "cobertura_areas_rank_idx" ON "cobertura_areas"("rank");

-- CreateIndex
CREATE INDEX "cobertura_areas_score_idx" ON "cobertura_areas"("score");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "recomendacoes_operadora_id_idx" ON "recomendacoes"("operadora_id");

-- CreateIndex
CREATE INDEX "recomendacoes_ativo_prioridade_idx" ON "recomendacoes"("ativo", "prioridade");

-- CreateIndex
CREATE UNIQUE INDEX "configs_chave_key" ON "configs"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "visitantes_session_id_key" ON "visitantes"("session_id");

-- CreateIndex
CREATE INDEX "visitantes_first_visit_idx" ON "visitantes"("first_visit");

-- CreateIndex
CREATE INDEX "visitantes_utm_source_idx" ON "visitantes"("utm_source");

-- CreateIndex
CREATE INDEX "visitantes_cidade_idx" ON "visitantes"("cidade");

-- CreateIndex
CREATE INDEX "eventos_visitante_id_idx" ON "eventos"("visitante_id");

-- CreateIndex
CREATE INDEX "eventos_tipo_idx" ON "eventos"("tipo");

-- CreateIndex
CREATE INDEX "eventos_created_at_idx" ON "eventos"("created_at");

-- CreateIndex
CREATE INDEX "eventos_acao_idx" ON "eventos"("acao");

-- CreateIndex
CREATE INDEX "busca_cobertura_visitante_id_idx" ON "busca_cobertura"("visitante_id");

-- CreateIndex
CREATE INDEX "busca_cobertura_cep_idx" ON "busca_cobertura"("cep");

-- CreateIndex
CREATE INDEX "busca_cobertura_cidade_idx" ON "busca_cobertura"("cidade");

-- CreateIndex
CREATE INDEX "busca_cobertura_estado_idx" ON "busca_cobertura"("estado");

-- CreateIndex
CREATE INDEX "busca_cobertura_created_at_idx" ON "busca_cobertura"("created_at");

-- CreateIndex
CREATE INDEX "busca_cobertura_encontrou_cobertura_idx" ON "busca_cobertura"("encontrou_cobertura");

-- AddForeignKey
ALTER TABLE "planos" ADD CONSTRAINT "planos_operadora_id_fkey" FOREIGN KEY ("operadora_id") REFERENCES "operadoras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobertura_areas" ADD CONSTRAINT "cobertura_areas_operadora_id_fkey" FOREIGN KEY ("operadora_id") REFERENCES "operadoras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomendacoes" ADD CONSTRAINT "recomendacoes_operadora_id_fkey" FOREIGN KEY ("operadora_id") REFERENCES "operadoras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "visitantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "busca_cobertura" ADD CONSTRAINT "busca_cobertura_visitante_id_fkey" FOREIGN KEY ("visitante_id") REFERENCES "visitantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
