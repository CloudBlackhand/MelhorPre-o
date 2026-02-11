# 📊 Sistema de Tracking e Analytics

## ✅ Implementado

Sistema completo de tracking leve e modular para registrar visitantes, origem dos cliques e áreas mais buscadas.

---

## 🗄️ Modelos de Banco de Dados

### Visitante
- Registra cada visitante único (por sessionId)
- Armazena: IP, User Agent, Referer, UTM params
- Conta visitas (novos vs recorrentes)
- Detecta cidade/estado

### Evento
- Registra todos os eventos (cliques, views, etc)
- Tipos: `click`, `view`, `search`, `download`, etc
- Armazena ação, elemento clicado, URL, metadata

### BuscaCobertura
- Registra cada busca de cobertura (CEP ou coordenadas)
- Armazena: CEP, coordenadas, cidade, estado
- Indica se encontrou cobertura
- Lista operadoras encontradas

---

## 🔌 APIs Criadas

### `POST /api/tracking/event`
Registra um evento de tracking.

**Body:**
```json
{
  "tipo": "click",
  "acao": "click_plano",
  "elemento": "botao_contratar",
  "valor": "plano_123",
  "metadata": {}
}
```

### `GET /api/tracking/stats?periodo=mes`
Obtém estatísticas (apenas admin).

**Resposta:**
```json
{
  "visitantes": {
    "total": 1000,
    "novos": 800,
    "recorrentes": 200
  },
  "origem": {
    "origem": {
      "google": 500,
      "facebook": 200,
      "direto": 300
    },
    "medium": {
      "cpc": 400,
      "organic": 300
    }
  },
  "areasMaisBuscadas": [
    {
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310-100",
      "totalBuscas": 150
    }
  ],
  "eventosMaisComuns": [
    {
      "tipo": "click",
      "acao": "click_plano",
      "total": 500
    }
  ],
  "taxaConversao": {
    "total": 1000,
    "comCobertura": 750,
    "taxa": 75.0
  }
}
```

---

## 🎯 Funcionalidades

### 1. Tracking Automático
- ✅ Cada busca de cobertura é registrada automaticamente
- ✅ SessionId criado automaticamente (cookie)
- ✅ UTM params capturados automaticamente
- ✅ IP e User Agent registrados

### 2. Dashboard de Analytics (`/admin/analytics`)
- ✅ Total de visitantes (novos vs recorrentes)
- ✅ Origem dos visitantes (UTM sources)
- ✅ Áreas mais buscadas (top 10)
- ✅ Eventos mais comuns
- ✅ Taxa de conversão (buscas com cobertura encontrada)
- ✅ Filtro por período (dia, semana, mês, ano)

### 3. Hook React (`useTracking`)
```typescript
const { trackClick, trackView } = useTracking();

// Registrar clique
trackClick("click_plano", "botao_contratar", "plano_123");

// Registrar view
trackView("view_pagina", { pagina: "home" });
```

---

## 📈 Métricas Disponíveis

### Visitantes
- Total de visitantes únicos
- Novos visitantes
- Visitantes recorrentes

### Origem
- UTM Source (google, facebook, etc)
- UTM Medium (cpc, email, etc)
- Referer (site de origem)
- Acesso direto

### Áreas Mais Buscadas
- Cidade/Estado mais buscados
- CEPs mais buscados
- Total de buscas por área

### Eventos
- Cliques em planos
- Views de páginas
- Downloads
- Qualquer evento customizado

### Conversão
- Total de buscas
- Buscas com cobertura encontrada
- Taxa de conversão (%)

---

## 🚀 Como Usar

### 1. Migrar Banco de Dados
```bash
npx prisma migrate dev --name add_tracking_models
```

### 2. Usar Hook no Frontend
```typescript
import { useTracking } from "@/lib/hooks/useTracking";

function MeuComponente() {
  const { trackClick } = useTracking();

  return (
    <button onClick={() => trackClick("click_plano", "botao", "123")}>
      Contratar
    </button>
  );
}
```

### 3. Acessar Dashboard
- Acesse `/admin/analytics`
- Visualize todas as métricas
- Filtre por período

---

## 🔒 Privacidade

- SessionId armazenado em cookie httpOnly
- IP pode ser anonimizado se necessário
- Dados agregados (não identifica usuários individuais)
- Acesso apenas para admins

---

## 📝 Próximos Passos (Opcional)

1. **Exportar dados** para CSV/Excel
2. **Gráficos** mais detalhados (Chart.js ou Recharts)
3. **Filtros avançados** (por operadora, por cidade, etc)
4. **Alertas** quando métricas mudarem significativamente
5. **Funnels** de conversão

---

**Status**: ✅ Sistema completo e funcional!
