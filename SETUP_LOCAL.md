# 🚀 Guia de Setup Local - MelhorPreço.net

## ⚠️ Pré-requisitos

Você precisa ter os seguintes serviços rodando:

1. **PostgreSQL** - Banco de dados
2. **Redis** (opcional) - Cache

## 📋 Passo a Passo

### 1. Iniciar PostgreSQL

```bash
# Iniciar o serviço PostgreSQL
sudo systemctl start postgresql

# Verificar se está rodando
pg_isready -h localhost
```

### 2. Criar o banco de dados (se necessário)

```bash
# Conectar ao PostgreSQL como usuário postgres
sudo -u postgres psql

# Dentro do psql, criar o banco:
CREATE DATABASE melhorpreco;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE melhorpreco TO postgres;
\q
```

### 3. Iniciar Redis (opcional)

Se você tiver Redis instalado:

```bash
sudo systemctl start redis
# ou
redis-server
```

**Nota:** O sistema funciona sem Redis, mas o cache será desabilitado.

### 4. Configurar o banco de dados com Prisma

```bash
# Carregar Node.js (se usar nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Gerar cliente Prisma
npx prisma generate

# Aplicar schema ao banco
npx prisma db push
```

### 5. Iniciar o servidor de desenvolvimento

```bash
# Carregar Node.js (se usar nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Iniciar servidor
npm run dev
```

Acesse: http://localhost:3000

## 🐳 Alternativa com Docker

Se você tiver Docker instalado, pode usar o `docker-compose.yml`:

```bash
# Iniciar PostgreSQL e Redis
docker-compose up -d

# Verificar serviços
docker-compose ps
```

## 🔐 Criar usuário Admin

Após o banco estar configurado:

```bash
# Carregar Node.js (se usar nvm)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Criar admin
npm run create-admin
```

Ou use o Prisma Studio:

```bash
npx prisma studio
```

## 📝 Variáveis de Ambiente

O arquivo `.env` já foi criado com as configurações padrão:

- `DATABASE_URL` - Conexão PostgreSQL
- `NEXTAUTH_SECRET` - Secret para autenticação
- `NEXTAUTH_URL` - URL da aplicação
- `REDIS_URL` - URL do Redis (opcional)

## ✅ Verificação

Para verificar se tudo está funcionando:

1. ✅ PostgreSQL rodando: `pg_isready -h localhost`
2. ✅ Banco criado: `psql -h localhost -U postgres -d melhorpreco -c "\dt"`
3. ✅ Servidor Next.js: Acesse http://localhost:3000

