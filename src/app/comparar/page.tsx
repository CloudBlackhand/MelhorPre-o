"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ComparadorPlanos } from "@/components/public/ComparadorPlanos";
import { BuscaCobertura } from "@/components/public/BuscaCobertura";

/** Posições fixas de estrelas (determinísticas para evitar erro de hidratação) */
const STARS_FAIXA = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: ((i * 13 + 5) % 96) + 1,
  top: ((i * 19 + 3) % 92) + 2,
  size: (i % 2) * 0.8 + 1,
  opacity: (i % 4) * 0.12 + 0.25,
}));

/** Faixa com estrelas e foguete (logo) à esquerda */
function FaixaLogo() {
  const stars = STARS_FAIXA;

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-[#1A2C59] py-4 px-4 md:py-5 md:px-6 mb-8 shadow-lg">
      {/* Estrelas de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>
      {/* Foguete à esquerda */}
      <div className="relative flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
          <Image
            src="/rocket.webp"
            alt="MelhorPreço"
            width={80}
            height={80}
            className="drop-shadow-lg object-contain"
            style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.35))", transform: "rotate(-15deg)" }}
          />
        </div>
        <div className="h-10 w-px bg-white/30 hidden sm:block" aria-hidden />
        <p className="text-white/90 text-sm md:text-base font-medium">
          Compare os melhores planos para o seu CEP
        </p>
      </div>
    </div>
  );
}

function CompararContent() {
  const searchParams = useSearchParams();
  const cep = searchParams.get("cep");

  if (!cep) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <BuscaCobertura />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <FaixaLogo />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Planos Disponíveis</h1>
          <p className="text-muted-foreground">CEP: {cep}</p>
        </div>
        <ComparadorPlanos cep={cep} />
      </div>
    </div>
  );
}

export default function CompararPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CompararContent />
    </Suspense>
  );
}
