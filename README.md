# MelhorPreço.net

Sistema completo de comparação de planos de internet com sistema de cobertura geográfica baseado em KMLs.

## 🚀 Tecnologias

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL**
- **Redis** (Cache)
- **NextAuth.js** (Autenticação)
- **Leaflet** (Mapas)
- **Turf.js** (Geometria)

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Redis (opcional, mas recomendado)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd MelhorPreçoNet
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/melhorpreco"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. Configure o banco de dados:
```bash
npx prisma db push
# ou
npx prisma migrate dev
```

5. Gere o cliente Prisma:
```bash
npx prisma generate
```

6. Crie um usuário admin (opcional):
```bash
# Use o Prisma Studio ou crie manualmente no banco
npx prisma studio
```

7. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── app/              # Next.js App Router
│   ├── (public)/     # Rotas públicas
│   ├── (admin)/      # Rotas administrativas
│   └── api/          # API Routes
├── components/       # Componentes React
│   ├── ui/           # Componentes base
│   ├── public/       # Componentes públicos
│   └── admin/        # Componentes admin
├── modules/          # Módulos independentes
│   ├── operadoras/
│   ├── planos/
│   ├── cobertura/
│   └── shared/
├── lib/              # Bibliotecas/configurações
│   ├── db/
│   ├── auth/
│   └── utils/
└── types/            # Tipos TypeScript
```

## 🗄️ Banco de Dados

O projeto usa Prisma ORM. Para fazer alterações no schema:

1. Edite `prisma/schema.prisma`
2. Execute `npx prisma db push` ou `npx prisma migrate dev`
3. Gere o cliente: `npx prisma generate`

## 🚢 Deploy no Railway via GitHub

### Deploy Automático

1. Conecte seu repositório GitHub ao Railway
2. Adicione os serviços:
   - PostgreSQL (Database)
   - Redis (Cache - opcional)
   - Web Service (Next.js App)
3. Configure as variáveis de ambiente no Railway
4. O Railway detectará automaticamente o Next.js e fará o build
5. **Deploy automático a cada push no GitHub!**

### Guia Completo

Consulte [DEPLOY_GITHUB.md](./DEPLOY_GITHUB.md) para instruções detalhadas.

### Setup Inicial

Após o primeiro deploy:

```bash
# Habilitar PostGIS
railway run psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Executar migrações
railway run npx prisma migrate deploy

# Criar usuário admin
railway run npm run create-admin
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:push` - Aplica mudanças do schema ao banco
- `npm run db:migrate` - Cria nova migration
- `npm run db:studio` - Abre Prisma Studio

## 🔐 Autenticação Admin

Para criar um usuário admin, use o Prisma Studio ou crie manualmente:

```sql
INSERT INTO admin_users (id, email, senha_hash, role)
VALUES (
  'cuid-here',
  'admin@example.com',
  '$2a$10$hashedpassword', -- Use bcrypt para hash
  'admin'
);
```

## 📄 Licença

Este projeto é privado.


