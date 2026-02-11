# 🚀 Guia de Deploy no Railway via GitHub

## 📋 Pré-requisitos

1. ✅ Conta no [Railway](https://railway.app)
2. ✅ Repositório no GitHub com código commitado
3. ✅ Conta GitHub conectada ao Railway

---

## 🎯 Passo a Passo Rápido

### 1. Preparar o Repositório GitHub

Certifique-se de que tudo está commitado e pushado:

```bash
git add .
git commit -m "Preparar para deploy Railway"
git push origin main
```

### 2. Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Autorize o Railway a acessar seu GitHub (se necessário)
5. Escolha o repositório `MelhorPreçoNet`
6. Railway detectará automaticamente que é um projeto Next.js

### 3. Adicionar PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. Railway criará automaticamente um PostgreSQL
4. **IMPORTANTE**: Anote a `DATABASE_URL` que será criada automaticamente

### 4. Habilitar PostGIS

O Railway não habilita PostGIS por padrão. Após o primeiro deploy:

1. Vá em **"PostgreSQL"** → **"Query"**
2. Execute este SQL:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```

Ou via Railway CLI:

```bash
railway run psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 5. Configurar Variáveis de Ambiente

No serviço da **aplicação** (não no PostgreSQL), vá em **"Variables"** e adicione:

#### Obrigatórias:

```env
DATABASE_URL=<copiado automaticamente do PostgreSQL>
NEXTAUTH_SECRET=<gerar um secret seguro>
NEXTAUTH_URL=<URL do seu app no Railway>
NODE_ENV=production
```

#### Gerar NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

#### NEXTAUTH_URL:

Será algo como: `https://seu-app.up.railway.app`

**⚠️ IMPORTANTE**: A `DATABASE_URL` já é adicionada automaticamente pelo Railway quando você conecta o PostgreSQL. Você só precisa adicionar manualmente se não estiver aparecendo.

### 6. Deploy Automático

O Railway fará deploy automático a cada push no branch principal!

O processo automático:
1. ✅ Detecta mudanças no GitHub
2. ✅ Executa `npm ci`
3. ✅ Gera Prisma Client (`npx prisma generate`)
4. ✅ Builda a aplicação (`npm run build`)
5. ✅ Executa migrações (`npx prisma migrate deploy`)
6. ✅ Inicia a aplicação (`npm start`)

### 7. Primeiro Deploy - Setup Inicial

Após o primeiro deploy, execute no shell do Railway:

```bash
# Via Railway Dashboard: Deployments → ... → Open Shell
# Ou via Railway CLI:
railway run bash scripts/railway-setup.sh
```

Ou manualmente:

```bash
# Habilitar PostGIS
railway run psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Executar migrações (se necessário)
railway run npx prisma migrate deploy

# Criar usuário admin
railway run npm run create-admin
```

### 8. Verificar Deploy

1. Acesse a URL do seu app (ex: `https://seu-app.up.railway.app`)
2. Verifique se está funcionando
3. Acesse `/admin/login` e faça login
4. Teste upload de KML
5. Teste busca de cobertura

---

## 🔧 Configuração via Railway CLI (Opcional)

### Instalar Railway CLI

```bash
npm i -g @railway/cli
```

### Login e Link

```bash
railway login
railway link
```

### Executar Comandos

```bash
# Ver logs
railway logs

# Executar comandos
railway run npm run create-admin

# Abrir shell
railway shell
```

---

## 🔄 Deploy Contínuo

O Railway faz deploy automático a cada push no branch principal.

### Desabilitar Auto Deploy

1. Vá em **"Settings"** → **"Source"**
2. Desabilite **"Auto Deploy"**

### Deploy Manual

1. Vá em **"Deployments"**
2. Clique em **"Redeploy"**

---

## 🐛 Troubleshooting

### Erro: "PostGIS extension not found"

Execute no banco:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Via Railway CLI:
```bash
railway run psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### Erro: "Prisma Client not generated"

O build já gera automaticamente. Se falhar, execute:
```bash
railway run npx prisma generate
```

### Erro: "Migration not applied"

Execute:
```bash
railway run npx prisma migrate deploy
```

Ou use db push como fallback:
```bash
railway run npx prisma db push
```

### Build falha

Verifique os logs em **"Deployments"** → **"View Logs"**

### Variáveis de ambiente não funcionam

- Certifique-se de que estão no serviço correto (aplicação, não PostgreSQL)
- Reinicie o serviço após adicionar variáveis
- Verifique se não há espaços extras nos valores

### Erro de conexão com banco

- Verifique se `DATABASE_URL` está configurada
- Verifique se o PostgreSQL está rodando
- Verifique se as credenciais estão corretas

---

## 📊 Monitoramento

### Logs

- **Dashboard**: **"Deployments"** → **"View Logs"**
- **CLI**: `railway logs`

### Métricas

- Railway mostra CPU, RAM e Network automaticamente
- Acesse **"Metrics"** no dashboard

### Health Check

O app tem um endpoint de health check em `/api/health`

---

## 💰 Custos

- Railway oferece **$5 grátis por mês**
- PostgreSQL: ~$5/mês (plano básico)
- Redis: ~$5/mês (se usar, opcional)
- App: Grátis até certo limite de uso

---

## ✅ Checklist Final

- [ ] Repositório GitHub criado e código commitado
- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado e PostGIS habilitado
- [ ] Variáveis de ambiente configuradas
- [ ] Primeiro deploy executado
- [ ] Migrações executadas
- [ ] Usuário admin criado
- [ ] App funcionando
- [ ] Domínio configurado (opcional)

---

## 🚀 Próximos Passos

1. **Backup do banco**: Configure backups automáticos no Railway
2. **Monitoramento**: Configure alertas para erros
3. **CDN**: Use Railway CDN para assets estáticos
4. **SSL**: Railway fornece SSL automático
5. **Domínio customizado**: Configure seu domínio em Settings → Domains

---

## 📝 Notas Importantes

- O Railway detecta automaticamente projetos Next.js
- As migrações são executadas automaticamente após cada deploy
- O PostGIS precisa ser habilitado manualmente após criar o PostgreSQL
- A `DATABASE_URL` é adicionada automaticamente quando você conecta o PostgreSQL
- O deploy é automático a cada push no branch principal

---

**Pronto! Seu app está no ar! 🎉**

Para suporte, consulte:
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
