#!/bin/bash

# Script para iniciar o ambiente local completo

set -e

echo "🚀 Iniciando MelhorPreço.net localmente..."

# Carregar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar PostgreSQL
if ! pg_isready -h localhost &> /dev/null; then
    echo "⚠️  PostgreSQL não está rodando!"
    echo ""
    echo "Por favor, execute em outro terminal:"
    echo "  sudo systemctl start postgresql"
    echo ""
    echo "Ou se preferir usar Docker:"
    echo "  docker-compose up -d"
    echo ""
    read -p "Pressione ENTER após iniciar o PostgreSQL, ou Ctrl+C para cancelar..."
fi

# Verificar se o banco existe
if ! psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw melhorpreco; then
    echo "📦 Criando banco de dados..."
    PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE melhorpreco;" 2>/dev/null || {
        echo "⚠️  Não foi possível criar o banco automaticamente."
        echo "Execute manualmente:"
        echo "  sudo -u postgres psql -c 'CREATE DATABASE melhorpreco;'"
        exit 1
    }
fi

# Configurar Prisma
echo "🗄️  Configurando banco de dados..."
npx prisma db push --skip-generate

echo "✅ Tudo pronto!"
echo ""
echo "🌐 Iniciando servidor de desenvolvimento..."
echo "   Acesse: http://localhost:3000"
echo ""

npm run dev

