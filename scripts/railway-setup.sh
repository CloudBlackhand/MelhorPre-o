#!/bin/bash

# Script para setup inicial no Railway
# Execute após o primeiro deploy: railway run bash scripts/railway-setup.sh

echo "🚀 Configurando aplicação no Railway..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erro: DATABASE_URL não está configurada"
    exit 1
fi

echo "✅ DATABASE_URL configurada"

# Habilitar PostGIS
echo "📦 Habilitando PostGIS..."
npx prisma db execute --stdin <<EOF
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
EOF

if [ $? -eq 0 ]; then
    echo "✅ PostGIS habilitado"
else
    echo "⚠️  Aviso: Não foi possível habilitar PostGIS (pode já estar habilitado)"
fi

# Gerar Prisma Client
echo "🔧 Gerando Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client gerado"
else
    echo "❌ Erro ao gerar Prisma Client"
    exit 1
fi

# Executar migrações
echo "📊 Executando migrações..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrações executadas"
else
    echo "❌ Erro ao executar migrações"
    exit 1
fi

# Verificar se precisa criar admin
echo "👤 Verificando usuário admin..."
echo "Para criar um usuário admin, execute: npm run create-admin"

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Crie um usuário admin: npm run create-admin"
echo "2. Acesse /admin/login e faça login"
echo "3. Configure operadoras e planos"
echo "4. Faça upload de KMLs de cobertura"
