"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BuscaCobertura } from "@/components/public/BuscaCobertura";

const LERP_FACTOR = 0.22; // Resposta mais rápida ao scroll = efeito some mais rápido

/** Posições fixas de estrelas (determinísticas para evitar hidratação) */
const STARS_BANNER = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: ((i * 17 + 7) % 97) + 1,
  top: ((i * 23 + 11) % 94) + 2,
  size: (i % 3) * 0.6 + 1,
  opacity: (i % 5) * 0.1 + 0.3,
}));

/** Formata número para path SVG (0–1 para objectBoundingBox) */
function n(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function RocketBanner() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const targetProgressRef = useRef(0);

  // Alvo do scroll (atualizado no scroll)
  useEffect(() => {
    // ~10% do viewport de scroll = zipper já dissipado (efeito some bem rápido)
    const zipperScrollHeight = () => window.innerHeight * 0.1;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      targetProgressRef.current = Math.min(scrollY / zipperScrollHeight(), 1);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Interpolação suave (lerp): progresso visual segue o alvo em 60fps = 100% fluido
  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const target = targetProgressRef.current;
      setScrollProgress((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.0005) return target;
        return prev + diff * LERP_FACTOR;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // === ZIPPER REVEAL EFFECT ===
  // Easing ease-out quad: resposta rápida no início, suave no fim (transição mais rápida)
  const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
  const p = easeOutQuad(scrollProgress);

  // Ponta do zipper: sobe da base em direção ao topo
  const zipperTipY = 100 - (p * 150);

  // Largura da abertura na base (em %)
  const zipperWidthAtBottom = p * 200;
  const leftEdge = Math.max(0, 50 - zipperWidthAtBottom);
  const rightEdge = Math.min(100, 50 + zipperWidthAtBottom);

  // Faixas inferior esquerda e direita LEVANTAM junto com a abertura (efeito zipper real)
  const liftY = p * 32;
  const bottomLeftY = 100 - liftY;
  const bottomRightY = 100 - liftY;
  const tipY = Math.max(-50, zipperTipY);

  // === REFEITO: clip-path via SVG path() com curvas Bézier reais (Q) ===
  // Coordenadas em 0–1 para objectBoundingBox; curvas nativas = transição fluida, sem “quadrado”
  const rx = n(rightEdge / 100);
  const ry = n(bottomRightY / 100);
  const lx = n(leftEdge / 100);
  const ly = n(bottomLeftY / 100);
  const tipYNorm = n((tipY + 50) / 150); // tipY % (-50..100) → 0..1

  // Controles das bordas da abertura (Bézier suave em direção à ponta)
  const crx = n(rx * 0.75 + 0.12);
  const cry = n(ry * 0.6 + tipYNorm * 0.4);
  const clx = n(lx * 0.75 + 0.13);
  const cly = n(ly * 0.6 + tipYNorm * 0.4);

  // Cantos: controles para curvas que “levantam” suavemente da borda da tela
  const rightCornerCy = n(0.38 + ry * 0.62);
  const leftCornerCy = n(0.38 + ly * 0.62);

  // Path em coordenadas 0–1 (objectBoundingBox): retângulo menos abertura em U
  const pathD =
    scrollProgress === 0
      ? "M 0 0 L 1 0 L 1 1 L 0 1 Z"
      : [
          "M 0 0 L 1 0 L 1 1",
          `Q 1 ${rightCornerCy} ${rx} ${ry}`,
          `Q ${crx} ${cry} 0.5 ${tipYNorm}`,
          `Q ${clx} ${cly} ${lx} ${ly}`,
          `Q 0 ${leftCornerCy} 0 1`,
          "L 0 0 Z",
        ].join(" ");

  const useSvgClip = scrollProgress > 0;
  
  // Rocket position (usa p para ficar em sync com o zipper suavizado)
  const rocketY = scrollProgress === 0 ? 75 : Math.max(5, Math.min(90, zipperTipY));
  const rocketScale = 1 + (p * 0.3);
  const headerOpacity = Math.max(0, 1 - p * 2);
  
  // Banner visibility (hides completely when zipper is fully open)
  const bannerVisible = scrollProgress < 1;

  // Quando o foguete chega a 50% da tela, banner e foguete somem juntos, gradativamente e rápido
  const fadeStartY = 50;  // foguete no meio da tela = começa a sumir
  const fadeEndY = 28;    // um pouco acima = já sumiu (faixa curta = sumir mais rápido)
  const unifiedFadeOpacity =
    rocketY >= fadeStartY ? 1 : rocketY <= fadeEndY ? 0 : (rocketY - fadeEndY) / (fadeStartY - fadeEndY);

  const bannerOpacity = unifiedFadeOpacity;
  // Foguete: no estado inicial (bounce) fica 1; ao rolar, usa o mesmo fade que o banner
  const rocketOpacity = scrollProgress === 0 ? 1 : unifiedFadeOpacity;

  // Show bounce animation and arrow only when not scrolling
  const showInitialState = scrollProgress === 0;

  // Estrelas determinísticas (evita erro de hidratação: mesmo resultado no servidor e no cliente)
  const stars = STARS_BANNER;

  return (
    <>
      {/* SVG clipPath com curvas Bézier reais (Q) — curvas nativas, sem “quadrado” */}
      {useSvgClip && (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <defs>
            <clipPath id="zipperClip" clipPathUnits="objectBoundingBox">
              <path d={pathD} />
            </clipPath>
          </defs>
        </svg>
      )}

      {/* Spacer curto — pouco scroll e o efeito já termina */}
      <div style={{ minHeight: '15vh' }} aria-hidden="true" />

      {/* LAYER 1: Banner com clip-path via SVG path (curvas fluidas) */}
      {bannerVisible && (
        <div 
          className="fixed top-0 left-0 w-full h-screen bg-[#1A2C59] overflow-hidden transition-opacity duration-150"
          style={{ 
            zIndex: 10,
            clipPath: useSvgClip ? "url(#zipperClip)" : "none",
            WebkitClipPath: useSvgClip ? "url(#zipperClip)" : "none",
            opacity: bannerOpacity,
          }}
        >
          {/* Stars background */}
          <div className="absolute inset-0">
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

          {/* Title and Search - fades out as user scrolls */}
          <div 
            className="absolute left-1/2 w-full max-w-3xl px-4"
            style={{
              zIndex: 5,
              top: '35%',
              transform: 'translate(-50%, -50%)',
              opacity: headerOpacity,
              pointerEvents: headerOpacity < 0.1 ? 'none' : 'auto',
            }}
          >
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-center mb-6 drop-shadow-lg tracking-tight leading-tight">
              Procure o melhor preço<br />
              disponível na sua região.
            </h1>
            <BuscaCobertura hideTitle />
          </div>
        </div>
      )}

      {/* LAYER 2: Rocket - ao rolar, posição livre; clicável para ir à home */}
      {!showInitialState && rocketOpacity > 0 && (
        <div
          className="fixed pointer-events-none z-[11]"
          style={{
            left: '50%',
            top: `${rocketY}%`,
            transform: `translate(-50%, -50%) rotate(-20deg) scale(${rocketScale})`,
            opacity: rocketOpacity,
            willChange: 'transform, top, opacity',
          }}
        >
          <Link
            href="/"
            className="pointer-events-auto block rounded-lg transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Ir para a página inicial"
          >
            <Image
              src="/rocket.webp"
              alt="Foguete"
              width={200}
              height={200}
              className="drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))' }}
              priority
            />
          </Link>
        </div>
      )}

      {/* Estado inicial: foguete e seta no MESMO container; foguete clicável para ir à home */}
      {showInitialState && (
        <div
          className="fixed bottom-8 left-1/2 z-20 pointer-events-none"
          style={{
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {/* Foguete: centralizado, clicável */}
          <Link
            href="/"
            className={`pointer-events-auto block rounded-lg transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/50 ${showInitialState ? 'animate-bounce' : ''}`}
            style={{
              animationDuration: '2s',
              opacity: rocketOpacity,
              transform: 'rotate(-20deg)',
              lineHeight: 0,
            }}
            aria-label="Ir para a página inicial"
          >
            <Image
              src="/rocket.webp"
              alt="Foguete"
              width={200}
              height={200}
              className="drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))', display: 'block' }}
              priority
            />
          </Link>
          {/* Seta: logo abaixo do foguete, mesmo eixo central */}
          <div
            className="animate-bounce -mt-2"
            style={{ animationDuration: '1.5s' }}
          >
            <svg
              className="w-10 h-10 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
