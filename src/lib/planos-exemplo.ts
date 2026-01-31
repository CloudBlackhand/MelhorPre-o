/**
 * Fonte única de planos de exemplo/placeholder.
 * Operadoras têm apenas id, nome, slug; logo é resolvido por getLogoUrl no CardPlano.
 */

export interface PlanoExemplo {
  id: string;
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao?: string | null;
  beneficios?: string[] | null;
  operadora: {
    id: string;
    nome: string;
    slug: string;
  };
}

/** Planos placeholder para a home (Planos em Destaque) quando não há dados da API. */
export const PLANOS_PLACEHOLDER: PlanoExemplo[] = [
  {
    id: "placeholder-1",
    nome: "Internet Fibra 100 Mbps",
    velocidadeDownload: 100,
    velocidadeUpload: 50,
    preco: 89.9,
    descricao: "Plano ideal para uso doméstico",
    beneficios: ["Wi-Fi Grátis", "Instalação Grátis", "Sem Fidelidade"],
    operadora: { id: "op-1", nome: "Vivo", slug: "vivo" },
  },
  {
    id: "placeholder-2",
    nome: "Internet Fibra 200 Mbps",
    velocidadeDownload: 200,
    velocidadeUpload: 100,
    preco: 119.9,
    descricao: "Perfeito para famílias",
    beneficios: ["Wi-Fi Grátis", "Instalação Grátis", "Suporte 24/7"],
    operadora: { id: "op-2", nome: "Claro", slug: "claro" },
  },
  {
    id: "placeholder-3",
    nome: "Internet Fibra 300 Mbps",
    velocidadeDownload: 300,
    velocidadeUpload: 150,
    preco: 149.9,
    descricao: "Alta velocidade para trabalhar e estudar",
    beneficios: ["Wi-Fi Grátis", "Instalação Grátis", "Sem Fidelidade"],
    operadora: { id: "op-3", nome: "Oi", slug: "oi" },
  },
  {
    id: "placeholder-4",
    nome: "Internet Fibra 500 Mbps",
    velocidadeDownload: 500,
    velocidadeUpload: 250,
    preco: 199.9,
    descricao: "Ultra velocidade para múltiplos dispositivos",
    beneficios: ["Wi-Fi 6 Grátis", "Instalação Grátis", "Suporte Premium"],
    operadora: { id: "op-4", nome: "TIM", slug: "tim" },
  },
  {
    id: "placeholder-5",
    nome: "Internet Fibra 1 Gbps",
    velocidadeDownload: 1000,
    velocidadeUpload: 500,
    preco: 299.9,
    descricao: "Máxima velocidade disponível",
    beneficios: ["Wi-Fi 6 Grátis", "Instalação Grátis", "Suporte Premium 24/7"],
    operadora: { id: "op-5", nome: "NET/Claro", slug: "net-claro" },
  },
  {
    id: "placeholder-6",
    nome: "Internet Fibra 250 Mbps",
    velocidadeDownload: 250,
    velocidadeUpload: 125,
    preco: 139.9,
    descricao: "Equilíbrio perfeito entre velocidade e preço",
    beneficios: ["Wi-Fi Grátis", "Instalação Grátis", "Sem Fidelidade"],
    operadora: { id: "op-6", nome: "Copel", slug: "copel" },
  },
];

/** Planos de exemplo no comparador quando não há cobertura para o CEP. */
export const PLANOS_EXEMPLO_COMPARADOR: PlanoExemplo[] = [
  {
    id: "exemplo-1",
    nome: "Internet Fibra 100 Mbps",
    velocidadeDownload: 100,
    velocidadeUpload: 50,
    preco: 99.9,
    descricao: "Fibra óptica com Wi-Fi grátis",
    beneficios: ["Instalação grátis", "Wi-Fi 5", "Suporte 24h", "Sem fidelidade"],
    operadora: { id: "op-ex-1", nome: "Vivo", slug: "vivo" },
  },
  {
    id: "exemplo-2",
    nome: "Internet Fibra 300 Mbps",
    velocidadeDownload: 300,
    velocidadeUpload: 150,
    preco: 149.9,
    descricao: "Ideal para home office e streaming",
    beneficios: ["Wi-Fi 6", "Modem incluso", "HBO Max 3 meses", "Fidelidade 12 meses"],
    operadora: { id: "op-ex-2", nome: "Claro", slug: "claro" },
  },
  {
    id: "exemplo-3",
    nome: "Internet Fibra 500 Mbps",
    velocidadeDownload: 500,
    velocidadeUpload: 250,
    preco: 199.9,
    descricao: "Máxima velocidade para toda a família",
    beneficios: ["Wi-Fi 6", "Antivírus", "TV por streaming", "Sem fidelidade"],
    operadora: { id: "op-ex-3", nome: "Oi Fibra", slug: "oi-fibra" },
  },
  {
    id: "exemplo-4",
    nome: "Vero Fibra 200 Mbps",
    velocidadeDownload: 200,
    velocidadeUpload: 100,
    preco: 119.9,
    descricao: "Internet estável com atendimento regional",
    beneficios: ["Wi-Fi 5", "Instalação grátis", "Suporte local", "Sem fidelidade"],
    operadora: { id: "op-ex-4", nome: "Vero", slug: "vero" },
  },
  {
    id: "exemplo-5",
    nome: "Desktop Fibra 250 Mbps",
    velocidadeDownload: 250,
    velocidadeUpload: 125,
    preco: 129.9,
    descricao: "Fibra óptica com foco em qualidade",
    beneficios: ["Wi-Fi 6", "Modem incluso", "Suporte 24h", "Fidelidade 12 meses"],
    operadora: { id: "op-ex-5", nome: "Desktop Fibra", slug: "desktop-fibra" },
  },
];
