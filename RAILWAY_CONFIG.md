# ⚙️ Configuração Railway - Resumo Técnico

## 📦 Arquivos de Configuração

### `railway.json`
- **Builder**: NIXPACKS (detecção automática)
- **Build Command**: `npm ci && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- **Post Deploy**: `npx prisma migrate deploy || npx prisma db push`
- **Health Check**: `/api/health` (timeout: 100ms)

### `nixpacks.toml`
- **Node.js**: 20
- **PostgreSQL**: 16 (para PostGIS)
- **Build**: Gera Prisma Client e builda Next.js
- **Deploy**: Executa migrações automaticamente

### Scripts

#### `scripts/post-deploy.sh`
Executado automaticamente após cada deploy:
- ✅ Verifica DATABASE_URL
- ✅ Habilita PostGIS
- ✅ Gera Prisma Client
- ✅ Executa migrações (com fallback para db push)

#### `scripts/railway-setup.sh`
Para setup inicial manual:
- ✅ Habilita PostGIS
- ✅ Gera Prisma Client
- ✅ Executa migrações
- ✅ Instruções para criar admin

## 🔄 Fluxo de Deploy Automático

1. **Push no GitHub** → Trigger automático
2. **Railway detecta** → Next.js project
3. **Build Phase**:
   - `npm ci` (instala dependências)
   - `npx prisma generate` (gera Prisma Client)
   - `npm run build` (builda Next.js)
4. **Post-Deploy Phase**:
   - `npx prisma migrate deploy` (executa migrações)
   - Fallback: `npx prisma db push` (se não houver migrações)
5. **Start Phase**:
   - `npm start` (inicia aplicação)
   - Health check em `/api/health`

## 🔐 Variáveis de Ambiente Necessárias

### Obrigatórias:
```env
DATABASE_URL          # Adicionada automaticamente pelo Railway
NEXTAUTH_SECRET       # Gerar: openssl rand -base64 32
NEXTAUTH_URL          # https://seu-app.up.railway.app
NODE_ENV=production
```

### Opcionais:
```env
REDIS_URL             # Se usar Redis para cache
```

## 🗄️ Banco de Dados

### PostgreSQL + PostGIS

**Setup Automático**:
- Railway cria PostgreSQL automaticamente
- PostGIS é habilitado pelo script `post-deploy.sh`

**Setup Manual** (se necessário):
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

### Migrações

**Automático**: Executadas após cada deploy via `postDeployCommand`

**Manual**:
```bash
railway run npx prisma migrate deploy
```

**Fallback** (se não houver migrações):
```bash
railway run npx prisma db push
```

## 📊 Health Check

Endpoint: `/api/health`

Retorna:
```json
{
  "status": "ok" | "degraded" | "error",
  "database": "connected" | "disconnected",
  "cache": "connected" | "disconnected" | "not_configured",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Status Codes:
- `200`: Tudo OK
- `503`: Degradado (banco desconectado)
- `500`: Erro

## 🚀 Comandos Úteis

### Railway CLI

```bash
# Instalar
npm i -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Ver logs
railway logs

# Executar comandos
railway run npm run create-admin

# Abrir shell
railway shell
```

### Setup Inicial

```bash
# Opção 1: Script automático
railway run bash scripts/railway-setup.sh

# Opção 2: Manual
railway run psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
railway run npx prisma migrate deploy
railway run npm run create-admin
```

## 🔍 Troubleshooting

### Build falha
- Verifique logs em **Deployments** → **View Logs**
- Verifique se todas as dependências estão no `package.json`

### Migrações não executam
- Verifique se `DATABASE_URL` está configurada
- Execute manualmente: `railway run npx prisma migrate deploy`

### PostGIS não funciona
- Execute: `railway run psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"`
- Verifique se o PostgreSQL suporta PostGIS

### Health check falha
- Verifique se o banco está conectado
- Verifique logs da aplicação
- Teste manualmente: `curl https://seu-app.up.railway.app/api/health`

## 📝 Notas Importantes

1. **DATABASE_URL**: Adicionada automaticamente quando você conecta PostgreSQL
2. **PostGIS**: Precisa ser habilitado manualmente (script faz isso automaticamente)
3. **Migrações**: Executadas automaticamente após cada deploy
4. **Deploy**: Automático a cada push no branch principal
5. **Health Check**: Railway usa para verificar se o app está rodando

## ✅ Checklist de Deploy

- [ ] Repositório GitHub configurado
- [ ] Projeto Railway criado
- [ ] PostgreSQL adicionado
- [ ] Variáveis de ambiente configuradas
- [ ] Primeiro deploy executado
- [ ] PostGIS habilitado
- [ ] Migrações executadas
- [ ] Usuário admin criado
- [ ] Health check funcionando
- [ ] App acessível

---

**Tudo configurado e pronto para deploy! 🚀**
