# 🚀 Guia de Deploy no Railway

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Código commitado e pushado

---

## 🎯 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que tudo está commitado:

```bash
git add .
git commit -m "Preparar para deploy Railway"
git push
```

### 2. Criar Novo Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"** (ou GitLab/Bitbucket)
4. Escolha seu repositório
5. Railway detectará automaticamente que é um projeto Next.js

### 3. Configurar Banco de Dados PostgreSQL

#### 3.1. Adicionar PostgreSQL

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. Railway criará automaticamente um PostgreSQL

#### 3.2. Habilitar PostGIS (Importante!)

O Railway não habilita PostGIS por padrão. Você precisa executar:

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

#### 3.3. Configurar Variável de Ambiente

1. Vá em **"Variables"** do serviço PostgreSQL
2. Copie a variável `DATABASE_URL`
3. Vá no serviço da aplicação e adicione como variável de ambiente

### 4. Configurar Redis (Opcional)

Se quiser usar Redis para cache:

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"Add Redis"**
3. Railway criará automaticamente um Redis
4. Copie a variável `REDIS_URL` e adicione no serviço da aplicação

### 5. Configurar Variáveis de Ambiente

No serviço da aplicação, vá em **"Variables"** e adicione:

#### Obrigatórias:

```env
DATABASE_URL=<copiado do PostgreSQL>
NEXTAUTH_SECRET=<gerar um secret seguro>
NEXTAUTH_URL=<URL do seu app no Railway>
NODE_ENV=production
```

#### Opcionais:

```env
REDIS_URL=<copiado do Redis, se usar>
```

#### Gerar NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

Ou use este gerador online: https://generate-secret.vercel.app/32

#### NEXTAUTH_URL:

Será algo como: `https://seu-app.up.railway.app`

### 6. Configurar Build e Deploy

O `railway.json` já está configurado, mas você pode verificar:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 7. Executar Migrações do Banco

Após o primeiro deploy, você precisa rodar as migrações:

#### Opção 1: Via Railway Dashboard

1. Vá em **"Deployments"**
2. Clique nos **"..."** do último deploy
3. Selecione **"Open Shell"**
4. Execute:

```bash
npx prisma migrate deploy
npx prisma generate
```

#### Opção 2: Via Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Executar migrações
railway run npx prisma migrate deploy
railway run npx prisma generate
```

### 8. Criar Usuário Admin

Após as migrações, crie um usuário admin:

```bash
railway run npm run create-admin
```

Ou via shell do Railway:

```bash
railway run tsx scripts/create-admin.ts
```

### 9. Configurar Domínio (Opcional)

1. No serviço da aplicação, vá em **"Settings"**
2. Em **"Domains"**, clique em **"Generate Domain"**
3. Ou adicione seu domínio customizado

### 10. Verificar Deploy

1. Acesse a URL do seu app
2. Verifique se está funcionando
3. Acesse `/admin/login` e faça login
4. Teste upload de KML
5. Teste busca de cobertura

---

## 🔧 Troubleshooting

### Erro: "PostGIS extension not found"

Execute no banco:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Erro: "Prisma Client not generated"

Execute:
```bash
railway run npx prisma generate
```

### Erro: "Migration not applied"

Execute:
```bash
railway run npx prisma migrate deploy
```

### Build falha

Verifique os logs em **"Deployments"** → **"View Logs"**

### Variáveis de ambiente não funcionam

- Certifique-se de que estão no serviço correto (não no PostgreSQL)
- Reinicie o serviço após adicionar variáveis

---

## 📊 Monitoramento

### Logs

- Acesse **"Deployments"** → **"View Logs"**
- Ou use Railway CLI: `railway logs`

### Métricas

- Railway mostra CPU, RAM e Network automaticamente
- Acesse **"Metrics"** no dashboard

---

## 🔄 Deploy Contínuo

O Railway faz deploy automático a cada push no branch principal.

Para desabilitar:
1. Vá em **"Settings"**
2. Desabilite **"Auto Deploy"**

---

## 💰 Custos

- Railway oferece $5 grátis por mês
- PostgreSQL: ~$5/mês (plano básico)
- Redis: ~$5/mês (se usar)
- App: Grátis até certo limite de uso

---

## ✅ Checklist Final

- [ ] Projeto criado no Railway
- [ ] PostgreSQL adicionado e PostGIS habilitado
- [ ] Redis adicionado (opcional)
- [ ] Variáveis de ambiente configuradas
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

---

**Pronto! Seu app está no ar! 🎉**
