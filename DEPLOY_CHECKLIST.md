# ✅ Checklist de Deploy Railway via GitHub

## 📋 Antes do Deploy

### 1. Preparar Código
- [ ] Código commitado no GitHub
- [ ] Branch principal (main/master) atualizado
- [ ] `.env.example` atualizado com todas as variáveis necessárias
- [ ] Migrações do Prisma commitadas (se houver)
- [ ] Scripts de setup funcionando localmente

### 2. Verificar Arquivos de Configuração
- [ ] `railway.json` configurado
- [ ] `nixpacks.toml` configurado
- [ ] `package.json` com scripts corretos
- [ ] `scripts/post-deploy.sh` criado e executável
- [ ] `scripts/railway-setup.sh` criado e executável

### 3. Verificar Dependências
- [ ] Todas as dependências no `package.json`
- [ ] Sem dependências faltando
- [ ] `package-lock.json` commitado

---

## 🚀 Deploy no Railway

### 1. Criar Projeto
- [ ] Conta Railway criada
- [ ] Projeto criado no Railway
- [ ] Repositório GitHub conectado
- [ ] Branch principal selecionado

### 2. Adicionar Serviços
- [ ] PostgreSQL adicionado
- [ ] Redis adicionado (opcional)
- [ ] Web Service criado automaticamente

### 3. Configurar Variáveis de Ambiente
- [ ] `DATABASE_URL` (adicionada automaticamente)
- [ ] `NEXTAUTH_SECRET` (gerado)
- [ ] `NEXTAUTH_URL` (URL do Railway)
- [ ] `NODE_ENV=production`
- [ ] `REDIS_URL` (se usar Redis)

### 4. Primeiro Deploy
- [ ] Deploy iniciado automaticamente
- [ ] Build concluído com sucesso
- [ ] Migrações executadas
- [ ] App iniciado

---

## 🔧 Setup Inicial (Após Primeiro Deploy)

### 1. Habilitar PostGIS
- [ ] PostGIS habilitado no PostgreSQL
- [ ] Extensões criadas:
  - `CREATE EXTENSION IF NOT EXISTS postgis;`
  - `CREATE EXTENSION IF NOT EXISTS postgis_topology;`

### 2. Executar Migrações
- [ ] Migrações executadas (`npx prisma migrate deploy`)
- [ ] Ou `db push` executado (se não houver migrações)
- [ ] Prisma Client gerado

### 3. Criar Usuário Admin
- [ ] Usuário admin criado (`npm run create-admin`)
- [ ] Credenciais anotadas em local seguro

---

## 🧪 Testes Após Deploy

### 1. Verificar Aplicação
- [ ] App acessível na URL do Railway
- [ ] Página inicial carrega
- [ ] Sem erros no console
- [ ] Health check funcionando (`/api/health`)

### 2. Testar Funcionalidades
- [ ] Busca por CEP funciona
- [ ] Mapa interativo carrega
- [ ] Comparador de planos funciona
- [ ] Filtros funcionam

### 3. Testar Admin
- [ ] Login admin funciona (`/admin/login`)
- [ ] Dashboard admin carrega
- [ ] Upload de KML funciona
- [ ] Gerenciamento de operadoras funciona
- [ ] Gerenciamento de planos funciona
- [ ] Ranking funciona
- [ ] Analytics funcionam

### 4. Testar Banco de Dados
- [ ] Conexão com PostgreSQL funcionando
- [ ] PostGIS funcionando
- [ ] Queries geográficas funcionando
- [ ] Dados sendo salvos corretamente

---

## 📊 Monitoramento

### 1. Logs
- [ ] Logs acessíveis no Railway
- [ ] Sem erros críticos nos logs
- [ ] Health check retornando 200

### 2. Métricas
- [ ] CPU dentro do limite
- [ ] RAM dentro do limite
- [ ] Network funcionando

### 3. Banco de Dados
- [ ] Conexões funcionando
- [ ] Queries executando normalmente
- [ ] Sem deadlocks ou erros

---

## 🔄 Deploy Contínuo

### 1. Verificar Auto Deploy
- [ ] Auto deploy habilitado
- [ ] Push no GitHub triggera deploy
- [ ] Deploy automático funcionando

### 2. Testar Deploy Automático
- [ ] Fazer pequena alteração
- [ ] Push no GitHub
- [ ] Verificar se deploy inicia automaticamente
- [ ] Verificar se build conclui com sucesso

---

## 🐛 Troubleshooting

### Se Build Falhar
- [ ] Verificar logs do build
- [ ] Verificar dependências
- [ ] Verificar variáveis de ambiente
- [ ] Verificar scripts no `package.json`

### Se Migrações Falharem
- [ ] Verificar `DATABASE_URL`
- [ ] Verificar conexão com banco
- [ ] Executar migrações manualmente
- [ ] Verificar schema do Prisma

### Se App Não Iniciar
- [ ] Verificar logs da aplicação
- [ ] Verificar health check
- [ ] Verificar variáveis de ambiente
- [ ] Verificar porta (Railway usa PORT automático)

### Se PostGIS Não Funcionar
- [ ] Verificar se extensão foi criada
- [ ] Executar `CREATE EXTENSION postgis;` manualmente
- [ ] Verificar versão do PostgreSQL

---

## ✅ Finalização

### 1. Documentação
- [ ] README atualizado
- [ ] Guia de deploy criado
- [ ] Credenciais admin documentadas (em local seguro)

### 2. Backup
- [ ] Backup do banco configurado (se possível)
- [ ] Variáveis de ambiente documentadas

### 3. Domínio (Opcional)
- [ ] Domínio customizado configurado
- [ ] SSL funcionando
- [ ] DNS configurado

---

## 🎉 Deploy Concluído!

Se todos os itens acima estão marcados, seu app está pronto para produção! 🚀

---

## 📝 Notas Importantes

- **DATABASE_URL**: Adicionada automaticamente pelo Railway
- **PostGIS**: Precisa ser habilitado manualmente após criar PostgreSQL
- **Migrações**: Executadas automaticamente após cada deploy
- **Deploy**: Automático a cada push no branch principal
- **Health Check**: Railway usa `/api/health` para verificar status

---

**Última atualização**: Verifique sempre se há atualizações nos guias de deploy!
