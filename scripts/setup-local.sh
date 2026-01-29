#!/bin/bash

# Script de setup local para MelhorPreço.net
# Carrega nvm e executa comandos necessários

set -e

echo "🚀 Configurando ambiente local..."

# Carregar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando Node.js 18..."
    nvm install 18
fi

echo "✅ Node.js $(node --version)"

# Verificar PostgreSQL
if ! pg_isready -h localhost &> /dev/null; then
    echo "⚠️  PostgreSQL não está rodando!"
    echo "   Execute: sudo systemctl start postgresql"
    exit 1
fi

echo "✅ PostgreSQL está rodando"

# Gerar cliente Prisma
echo "📦 Gerando cliente Prisma..."
npx prisma generate

# Aplicar schema
echo "🗄️  Aplicando schema ao banco de dados..."
npx prisma db push

echo "✅ Setup concluído!"
echo ""
echo "Para iniciar o servidor:"
echo "  export NVM_DIR=\"\$HOME/.nvm\""
echo "  [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\""
echo "  npm run dev"

