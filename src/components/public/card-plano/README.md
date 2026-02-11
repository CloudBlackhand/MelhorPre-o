# CardPlano - Componentes Modulares

Esta pasta contém os componentes modulares do `CardPlano`, organizados para facilitar customização e manutenção.

## Estrutura

```
card-plano/
├── CardPlanoBadge.tsx      # Badge de destaque (Mais Popular, etc)
├── CardPlanoLogo.tsx       # Logo da operadora
├── CardPlanoPreco.tsx      # Exibição do preço formatado
├── CardPlanoVelocidade.tsx # Velocidades download/upload
├── CardPlanoBeneficios.tsx # Lista de benefícios
├── CardPlanoButton.tsx     # Botão de ação (WhatsApp)
├── utils.ts                # Funções auxiliares (getBadgePorPreco, formatarPreco)
├── index.ts                # Exportações centralizadas
└── README.md               # Esta documentação
```

## Componentes

### CardPlanoBadge
Badge de destaque que aparece no canto superior direito do card.

**Props:**
- `texto: string` - Texto do badge
- `cor: string` - Classe CSS da cor (ex: "bg-green-500")
- `className?: string` - Classes CSS adicionais

**Exemplo de customização:**
```tsx
<CardPlanoBadge 
  texto="Mais Popular" 
  cor="bg-green-500"
  className="top-2 right-2" // Posição customizada
/>
```

### CardPlanoLogo
Exibe o logo da operadora ou o nome como fallback.

**Props:**
- `operadora: { nome, slug, logoUrl? }`
- `className?: string`

**Customização:** Edite a lógica de fallback ou estilos em `CardPlanoLogo.tsx`

### CardPlanoPreco
Formata e exibe o preço do plano em R$.

**Props:**
- `preco: number | string`
- `className?: string`

**Customização:** Altere a formatação em `CardPlanoPreco.tsx`

### CardPlanoVelocidade
Exibe velocidades de download (destaque) e upload (secundário).

**Props:**
- `velocidadeDownload: number`
- `velocidadeUpload: number`
- `className?: string`

### CardPlanoBeneficios
Lista de benefícios com ícones de check.

**Props:**
- `beneficios: string[]`
- `limite?: number` - Quantidade máxima a exibir (padrão: 4)
- `className?: string`

### CardPlanoButton
Botão de ação que abre WhatsApp com mensagem pré-preenchida.

**Props:**
- `plano: { nome, velocidadeDownload, velocidadeUpload, preco, operadora }`
- `texto?: string` - Texto do botão (padrão: "Contratar")
- `className?: string`

**Customização:** 
- Altere o texto padrão ou mensagem do WhatsApp em `CardPlanoButton.tsx`
- O número do WhatsApp é buscado da API `/api/configs?chave=whatsapp_number`

## Utilitários

### getBadgePorPreco(preco: number | string)
Determina o badge baseado no preço do plano.

**Retorna:** `{ text: string, color: string }`

**Customização:** Edite os valores de preço em `utils.ts`:
```ts
if (precoNum < 100) return { text: "Mais Popular", color: "bg-green-500" };
if (precoNum < 150) return { text: "Melhor Custo-Benefício", color: "bg-blue-500" };
// ...
```

### formatarPreco(preco: number | string)
Formata o preço em inteiro e decimal.

**Retorna:** `{ precoInteiro: number, precoDecimal: string }`

## Como Customizar

1. **Cores e estilos:** Edite os componentes individuais
2. **Lógica de badges:** Modifique `getBadgePorPreco()` em `utils.ts`
3. **Mensagem WhatsApp:** Edite `CardPlanoButton.tsx`
4. **Layout geral:** Edite `CardPlano.tsx` (componente principal)

## Exemplo de Uso

```tsx
import { CardPlano } from "@/components/public/CardPlano";

<CardPlano plano={plano} />
```

O componente principal (`CardPlano.tsx`) já compõe todos os sub-componentes automaticamente.
