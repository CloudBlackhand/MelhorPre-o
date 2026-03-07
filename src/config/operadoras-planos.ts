/**
 * Fonte única de operadoras e planos (definidos no código).
 * Usado pelo seed para popular o banco e pelo seed-kml para resolver operadora por nome do KML.
 */

export interface PlanoConfig {
  nome: string;
  velocidadeDownload: number;
  velocidadeUpload: number;
  preco: number;
  descricao?: string | null;
  beneficios?: string[] | null;
}

export interface OperadoraConfig {
  slug: string;
  nome: string;
  logoUrl?: string | null;
  siteUrl?: string | null;
  telefone?: string | null;
  email?: string | null;
  ordemRecomendacao?: number | null;
  /** Nomes que aparecem nos KMLs e mapeiam para esta operadora (ex: "Desktop", "VERO CONEXÃO CERRADO") */
  kmlNames: string[];
  planos: PlanoConfig[];
}

export const OPERADORAS_PLANOS: OperadoraConfig[] = [
  {
    slug: "desktop",
    nome: "Desktop Fibra",
    logoUrl: "https://desktopfibra.com.br/wp-content/uploads/2024/01/logo-desktop-512x512-1-e1712845028629.png",
    siteUrl: "https://desktopfibra.com.br",
    ordemRecomendacao: 1,
    kmlNames: ["Desktop"],
    planos: [
      { nome: "Internet Fibra 100 Mbps", velocidadeDownload: 100, velocidadeUpload: 50, preco: 89.9, descricao: "Fibra óptica com Wi-Fi grátis", beneficios: ["Instalação grátis", "Wi-Fi 5", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Internet Fibra 200 Mbps", velocidadeDownload: 200, velocidadeUpload: 100, preco: 119.9, descricao: "Ideal para famílias", beneficios: ["Wi-Fi 5", "Instalação grátis", "Suporte local", "Sem fidelidade"] },
      { nome: "Internet Fibra 250 Mbps", velocidadeDownload: 250, velocidadeUpload: 125, preco: 129.9, descricao: "Alta velocidade", beneficios: ["Wi-Fi 6", "Modem incluso", "Suporte 24h"] },
    ],
  },
  {
    slug: "vero",
    nome: "Vero",
    logoUrl: "https://verovideo.com.br/images/vero/logo-sem-slogan.png",
    siteUrl: "https://verovideo.com.br",
    ordemRecomendacao: 2,
    kmlNames: ["VERO", "VERO CONEXÃO CERRADO", "VERO CONEXÃO DO SUL"],
    planos: [
      { nome: "Internet Fibra 100 Mbps", velocidadeDownload: 100, velocidadeUpload: 50, preco: 99.9, descricao: "Fibra óptica com Wi-Fi grátis", beneficios: ["Instalação grátis", "Wi-Fi 5", "Suporte 24h", "Sem fidelidade"] },
      { nome: "Internet Fibra 200 Mbps", velocidadeDownload: 200, velocidadeUpload: 100, preco: 119.9, descricao: "Internet estável com atendimento regional", beneficios: ["Wi-Fi 5", "Instalação grátis", "Suporte local", "Sem fidelidade"] },
    ],
  },
  {
    slug: "amnet",
    nome: "AmNET",
    ordemRecomendacao: 3,
    kmlNames: ["AmNET rede Corp", "AmNET Varejo e Corp", "GRUPO AMERICANET"],
    planos: [
      { nome: "Internet Fibra 100 Mbps", velocidadeDownload: 100, velocidadeUpload: 50, preco: 94.9, descricao: "Fibra óptica corporativa e varejo", beneficios: ["Instalação grátis", "Suporte dedicado", "Sem fidelidade"] },
    ],
  },
];

/**
 * Mapa nome do KML → slug da operadora (derivado de OPERADORAS_PLANOS).
 * Permite match exato ou por prefixo (ex: "VERO ..." → vero).
 */
export function buildKmlNameToSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const op of OPERADORAS_PLANOS) {
    for (const name of op.kmlNames) {
      map.set(name.trim().toLowerCase(), op.slug);
    }
    // Também registrar o nome exato (case-sensitive) para match exato
    for (const name of op.kmlNames) {
      map.set(name.trim(), op.slug);
    }
  }
  return map;
}

/**
 * Resolve o slug da operadora a partir do nome retornado pelo parser do KML.
 * Tenta match exato em kmlNames; depois prefixo (ex: "VERO CONEXÃO X" → vero).
 */
export function resolveSlugByKmlOperatorName(operatorName: string): string | null {
  const trimmed = operatorName.trim();
  const lower = trimmed.toLowerCase();
  for (const op of OPERADORAS_PLANOS) {
    for (const name of op.kmlNames) {
      if (name.trim() === trimmed || name.trim().toLowerCase() === lower) return op.slug;
      if (trimmed.toUpperCase().startsWith(name.trim().toUpperCase())) return op.slug;
    }
    // Prefixo pelo nome da operadora (ex: "VERO" no nome do KML)
    if (lower.startsWith(op.nome.toLowerCase().split(" ")[0])) return op.slug;
  }
  return null;
}
