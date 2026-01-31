/**
 * Logos das operadoras.
 *
 * Locais (public/logos/): claro, oi — baixe e coloque em public/logos/.
 * Remotos: Vivo (Wikimedia Commons), Vero, Desktop Fibra — URLs diretas.
 *
 * Referências para download (quando usar local):
 * - Claro: https://www.logopng.com.br/logo/claro-161
 * - Oi: https://www.logopng.com.br/logo/oi-102
 */
export const LOGOS_OPERADORAS_SVG = {
  vivo: "/logos/vivo.svg",
  claro: "/logos/claro.svg",
  oi: "/logos/oi.svg",
} as const;

export const LOGOS_OPERADORAS_PNG = {
  vivo: "/logos/vivo.png",
  claro: "/logos/claro.png",
  oi: "/logos/oi.png",
} as const;

/** URLs de logos remotos (Vivo, Vero, Desktop Fibra). */
export const LOGOS_OPERADORAS_REMOTOS = {
  vivo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Vivo_logo_2019.svg",
  vero: "https://verovideo.com.br/images/vero/logo-sem-slogan.png",
  desktop: "https://desktopfibra.com/static/img/logo.svg",
} as const;

/** Map de slug → URL do logo (local ou remoto) para uso em cards e exemplos. */
export const LOGOS_POR_SLUG: Record<string, string> = {
  vivo: LOGOS_OPERADORAS_REMOTOS.vivo,
  claro: LOGOS_OPERADORAS_SVG.claro,
  oi: LOGOS_OPERADORAS_SVG.oi,
  "oi-fibra": LOGOS_OPERADORAS_SVG.oi,
  vero: LOGOS_OPERADORAS_REMOTOS.vero,
  desktop: LOGOS_OPERADORAS_REMOTOS.desktop,
  "desktop-fibra": LOGOS_OPERADORAS_REMOTOS.desktop,
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
