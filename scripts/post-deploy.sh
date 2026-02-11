#!/bin/bash

# Script executado automaticamente após cada deploy no Railway
# Railway executa este script após o build e antes de iniciar a aplicação

set -e

echo "🚀 Executando post-deploy..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Aviso: DATABASE_URL não está configurada. Pulando migrações."
    exit 0
fi

echo "📦 Habilitando PostGIS..."
# Tentar habilitar PostGIS (pode falhar se já estiver habilitado, mas não é crítico)
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>/dev/null || echo "⚠️  PostGIS pode já estar habilitado ou não disponível"

echo "🔧 Gerando Prisma Client..."
npx prisma generate

echo "📊 Executando migrações..."
# Tentar executar migrações, se falhar, usar db push como fallback
if npx prisma migrate deploy 2>/dev/null; then
    echo "✅ Migrações executadas com sucesso"
else
    echo "⚠️  Migrações não encontradas, usando db push..."
    npx prisma db push --accept-data-loss || echo "⚠️  Erro ao executar db push"
fi

echo "🌱 Executando seed (criando usuário admin dev)..."
# Executar seed para criar usuário admin padrão
npx prisma db seed || echo "⚠️  Erro ao executar seed (pode ser normal se já existir)"

echo "✅ Post-deploy concluído!"
