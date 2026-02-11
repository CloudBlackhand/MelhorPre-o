/**
 * Logos das operadoras.
 *
 * Remotos: Claro, Vero, Desktop Fibra, Alcans.
 * Algar deve ser configurado via logoUrl no banco de dados.
 */
export const LOGOS_OPERADORAS_SVG = {
  // Local SVGs are no longer directly used for providers with remote URLs
} as const;

export const LOGOS_OPERADORAS_PNG = {
  // Local PNGs are no longer directly used for providers with remote URLs
} as const;

/** URLs de logos remotos (Claro, Vero, Desktop Fibra, Alcans). */
export const LOGOS_OPERADORAS_REMOTOS = {
  claro: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Claro.svg",
  vero: "https://verovideo.com.br/images/vero/logo-sem-slogan.png",
  desktop:
    "https://desktopfibra.com.br/wp-content/uploads/2024/01/logo-desktop-512x512-1-e1712845028629.png",
  alcans: "https://alcans.com.br/wp-content/uploads/2023/05/alcans_logo_alcans-1.svg",
} as const;

/** Map de slug → URL do logo (local ou remoto) para uso em cards e exemplos. */
export const LOGOS_POR_SLUG: Record<string, string> = {
  claro: LOGOS_OPERADORAS_REMOTOS.claro,
  vero: LOGOS_OPERADORAS_REMOTOS.vero,
  desktop: LOGOS_OPERADORAS_REMOTOS.desktop,
  "desktop-fibra": LOGOS_OPERADORAS_REMOTOS.desktop,
  alcans: LOGOS_OPERADORAS_REMOTOS.alcans,
  // Algar deve ser configurado via logoUrl no banco de dados
  algar: "", // Configurar via admin
};

/**
 * Resolve a URL do logo da operadora: prioriza logoUrl da operadora, depois LOGOS_POR_SLUG[slug].
 * Usado pelo CardPlano para exibir logo em qualquer contexto (API, placeholder, exemplo).
 */
export function getLogoUrl(operadora: {
  slug: string;
  logoUrl?: string | null;
}): string | null {
  if (operadora.logoUrl) return operadora.logoUrl;
  return LOGOS_POR_SLUG[operadora.slug] ?? null;
}
