# ⚡ Deploy Rápido - Railway via GitHub

## 🎯 5 Minutos para Deploy

### 1. Push no GitHub
```bash
git add .
git commit -m "Preparar deploy Railway"
git push origin main
```

### 2. Criar Projeto no Railway
1. Acesse [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Selecione seu repositório

### 3. Adicionar PostgreSQL
1. **+ New** → **Database** → **Add PostgreSQL**
2. PostGIS será habilitado automaticamente pelo script

### 4. Configurar Variáveis
No serviço da aplicação, adicione:

```env
NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>
NEXTAUTH_URL=https://seu-app.up.railway.app
NODE_ENV=production
```

**Nota**: `DATABASE_URL` é adicionada automaticamente!

### 5. Aguardar Deploy
O Railway fará deploy automático! ✅

### 6. Setup Inicial (Após primeiro deploy)
```bash
railway run bash scripts/railway-setup.sh
```

Ou manualmente:
```bash
railway run psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
railway run npm run create-admin
```

## ✅ Pronto!

Acesse: `https://seu-app.up.railway.app`

---

**Problemas?** Consulte [DEPLOY_GITHUB.md](./DEPLOY_GITHUB.md)
