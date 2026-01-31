# MelhorPreço.net – Visão geral do frontend

Resumo do que existe no frontend para você ter uma ideia rápida.

---

## Rotas públicas (o que o usuário vê)

| URL | O que é |
|-----|--------|
| **/** | **Home** – Banner com foguete e efeito “zipper” (rolar revela a página), busca por CEP, seção “Planos em Destaque” e blocos Compare / Cobertura / Velocidade + estatísticas. |
| **/comparar** | Sem CEP: só o formulário de busca. Com **?cep=12345678**: faixa com logo (foguete + estrelas), título “Planos Disponíveis” e grid de cards de planos (ou exemplos se não houver cobertura). |

---

## Fluxo principal

1. **Home (/)**
   - Tela cheia azul escura com estrelas, título “Procure o melhor preço disponível na sua região”, campo de CEP e foguete animado.
   - Ao rolar: efeito zipper (abre de baixo para cima) e revela o conteúdo (Planos em Destaque, 3 blocos de benefícios, faixa de estatísticas).
2. **Busca por CEP**
   - Usuário digita CEP na home ou em `/comparar` → redireciona para `/comparar?cep=XXXXX`.
3. **Comparar (/comparar?cep=...)**
   - Faixa com foguete à esquerda e estrelas.
   - Lista de planos da API de cobertura (ou cards de exemplo Vivo, Claro, Oi, Vero, Desktop Fibra quando não há resultado).
   - Filtros por velocidade e preço.

---

## Componentes principais (público)

| Componente | Função |
|------------|--------|
| **RocketBanner** | Banner da home: fundo estrelado, zipper no scroll, foguete e seta, título + BuscaCobertura. |
| **BuscaCobertura** | Campo de CEP + botão; redireciona para `/comparar?cep=...`. |
| **PlanosDestaque** | Grid de planos em destaque na home (dados mock). |
| **ComparadorPlanos** | Lista de planos por CEP (API), filtros e cards; mostra exemplos quando não há cobertura. |
| **CardPlano** | Card de plano: logo da operadora, nome, velocidade, preço, benefícios, CTA. |
| **FiltrosPlanos** | Filtros de velocidade mínima e preço máximo no comparador. |
| **MapaCobertura** | Mapa (Leaflet) para visualizar áreas de cobertura (onde for usado). |

---

## Área admin (login necessário)

| URL | O que é |
|-----|--------|
| **/admin/login** | Login (usuário/senha). |
| **/admin** | Dashboard admin. |
| **/admin/operadoras** | Lista e CRUD de operadoras. |
| **/admin/operadoras/novo** | Criar operadora. |
| **/admin/planos** | Lista e CRUD de planos. |
| **/admin/planos/novo** | Criar plano. |
| **/admin/kmls** | Upload e gestão de arquivos KML/KMZ (áreas de cobertura). |

---

## Design e identidade

- **Cores:** Azul escuro do banner (#1A2C59), azul principal (#1e3a8a / #1e40af) em CTAs e faixas, fundo cinza claro (gray-50) nas páginas.
- **Logo:** Foguete (`/rocket.webp`) – usado no banner da home e na faixa da página de comparar.
- **Tipografia:** Inter (Google Font).
- **UI:** Radix UI + Tailwind; componentes em `src/components/ui/`.

---

## Como rodar e ver o frontend

```bash
npm run dev
```

Abrir no navegador: **http://localhost:3000**

- **Home:** ver banner, rolar para o zipper e o restante da página.
- **Comparar:** acessar **http://localhost:3000/comparar** (só busca) ou **http://localhost:3000/comparar?cep=01310100** (exemplo com CEP) para ver a faixa com foguete e os cards.

Se o banco e a API de cobertura estiverem ok, um CEP com cobertura cadastrada mostrará planos reais; caso contrário, aparecem os cards de exemplo (Vivo, Claro, Oi, Vero, Desktop Fibra).
