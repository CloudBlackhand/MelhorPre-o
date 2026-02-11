/**
 * Componente modular para logo da operadora.
 * Suporta SVG, PNG e fallback para nome da operadora.
 */

import Image from "next/image";
import { getLogoUrl } from "@/lib/logo-urls";

interface CardPlanoLogoProps {
  operadora: {
    nome: string;
    slug: string;
    logoUrl?: string | null;
  };
  className?: string;
}

export function CardPlanoLogo({ operadora, className = "" }: CardPlanoLogoProps) {
  const logoUrl = getLogoUrl(operadora);
  const isDesktopLogo = operadora.slug === "desktop" || operadora.slug === "desktop-fibra";

  return (
    <div className={`mb-6 flex items-center justify-center h-16 ${className}`}>
      {logoUrl ? (
        <div
          className={
            isDesktopLogo
              ? "flex items-center justify-center rounded-lg bg-red-600 p-2"
              : "inline-flex items-center justify-center"
          }
        >
          {logoUrl.toLowerCase().endsWith(".svg") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={operadora.nome}
              className="object-contain max-h-12 w-[140px] h-12"
            />
          ) : (
            <Image
              src={logoUrl}
              alt={operadora.nome}
              width={140}
              height={50}
              className="object-contain max-h-12"
            />
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white px-6 py-2 rounded-lg font-bold text-lg">
          {operadora.nome}
        </div>
      )}
    </div>
  );
}
