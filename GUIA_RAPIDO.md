# Guia Rápido - MelhorPreço.net

## 🚀 Primeiros Passos

### 1. Configuração Inicial

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Configurar banco de dados
npx prisma db push

# Criar primeiro usuário admin
npm run create-admin admin@example.com senha123
```

### 2. Iniciar o Servidor

```bash
npm run dev
```

Acesse:
- **Site público**: http://localhost:3000
- **Painel admin**: http://localhost:3000/admin
- **Login admin**: http://localhost:3000/admin/login

## 📝 Como Usar o Sistema

### Painel Administrativo

1. **Login**: Acesse `/admin/login` e faça login com suas credenciais

2. **Cadastrar Operadoras**:
   - Vá em "Operadoras" → "Nova Operadora"
   - Preencha: Nome, Slug, Logo (URL), Site, etc.
   - Defina a ordem de recomendação (quanto menor, mais destaque)

3. **Cadastrar Planos**:
   - Vá em "Planos" → "Novo Plano"
   - Selecione a operadora
   - Preencha: Nome, Velocidades (download/upload), Preço, Descrição

4. **Upload de KMLs (Cobertura)**:
   - Vá em "Cobertura (KMLs)"
   - Selecione a operadora
   - Digite o nome da área (ex: "Região Metropolitana de São Paulo")
   - Faça upload do arquivo KML do Google Earth
   - O sistema processará e salvará a área de cobertura

### Site Público

1. **Buscar Planos**:
   - Na homepage, digite um CEP
   - O sistema verificará quais operadoras têm cobertura naquele CEP
   - Mostrará todos os planos disponíveis

2. **Filtrar Planos**:
   - Use os filtros para velocidade mínima, preço máximo e operadora
   - Os planos são ordenados por preço (menor primeiro)

## 🗺️ Como Criar KMLs no Google Earth

1. Abra o Google Earth
2. Use a ferramenta de desenho para criar polígonos das áreas de cobertura
3. Clique com botão direito no polígono → "Salvar como" → Escolha formato KML
4. Faça upload do arquivo KML no painel admin

## 🔧 Comandos Úteis

```bash
# Ver banco de dados no Prisma Studio
npm run db:studio

# Criar migration
npm run db:migrate

# Aplicar mudanças do schema
npm run db:push

# Build para produção
npm run build

# Iniciar produção
npm start
```

## 📊 Estrutura de Dados

### Operadoras
- Nome, Slug, Logo, Site, Telefone, Email
- Status (ativo/inativo)
- Ordem de recomendação

### Planos
- Vinculado a uma operadora
- Nome, Velocidades (download/upload), Preço
- Descrição e Benefícios (array)
- Status (ativo/inativo)

### Cobertura
- Vinculado a uma operadora
- Nome da área
- Geometria (GeoJSON processado do KML)
- KML original (texto)

## 🔐 Segurança

- Senhas são hasheadas com bcrypt (10 rounds)
- Rotas admin protegidas com NextAuth
- Validação de dados com Zod
- Sanitização de uploads KML

## 🚢 Deploy no Railway

1. Conecte seu repositório ao Railway
2. Adicione PostgreSQL e Redis (opcional)
3. Configure as variáveis de ambiente:
   - `DATABASE_URL`
   - `REDIS_URL` (opcional)
   - `NEXTAUTH_SECRET` (gere com: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (URL do seu site)
4. O Railway fará o build automaticamente

## 🐛 Troubleshooting

### Erro ao conectar no banco
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`

### Erro ao processar KML
- Verifique se o arquivo é um KML válido
- Confirme que contém polígonos (não apenas pontos)
- Tamanho máximo: 10MB

### Cache não funciona
- Redis é opcional - o sistema funciona sem ele
- Se usar Redis, verifique a `REDIS_URL`

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.

