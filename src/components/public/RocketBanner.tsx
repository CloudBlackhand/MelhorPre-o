"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { BuscaCobertura } from "@/components/public/BuscaCobertura";

export function RocketBanner() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Zipper animation completes in 1 viewport height
          const zipperScrollHeight = window.innerHeight;
          const scrollY = window.scrollY;
          const progress = Math.min(scrollY / zipperScrollHeight, 1); // 0 to 1
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // === ZIPPER REVEAL EFFECT ===
  // Banner starts CLOSED (covering everything)
  // When user scrolls, zipper opens from bottom-center upward
  // Content is FIXED behind and REVEALED through the opening
  
  // Zipper tip Y position (percentage from top)
  // Starts at 100% (bottom - CLOSED), moves up to -50% (off screen) as user scrolls
  const zipperTipY = 100 - (scrollProgress * 150);
  
  // Zipper width at the bottom (percentage)
  // Starts at 0% (CLOSED), grows to 200% (beyond screen edges)
  const zipperWidthAtBottom = scrollProgress * 200;
  
  // Calculate clip-path points
  const leftEdge = Math.max(0, 50 - zipperWidthAtBottom);
  const rightEdge = Math.min(100, 50 + zipperWidthAtBottom);
  
  // Clip-path polygon: covers entire screen except the zipper triangle hole
  // When scrollProgress=0: no hole (banner covers everything)
  // As scrollProgress increases: hole grows from bottom center
  const clipPath = scrollProgress === 0 
    ? 'none' // No clip = banner covers everything
    : `polygon(
        0% 0%,
        100% 0%,
        100% 100%,
        ${rightEdge}% 100%,
        50% ${Math.max(-50, zipperTipY)}%,
        ${leftEdge}% 100%,
        0% 100%
      )`;
  
  // Rocket position
  // Starts at 75% (lower part of screen) when not scrolling
  // Follows the zipper tip when scrolling
  const rocketY = scrollProgress === 0 ? 75 : Math.max(5, Math.min(90, zipperTipY));
  const rocketX = 50;
  
  // Rocket scale (gets slightly larger as it moves up)
  const rocketScale = 1 + (scrollProgress * 0.3);
  
  // Rocket opacity (fades out when approaching top)
  const rocketOpacity = scrollProgress > 0.7 ? Math.max(0, 1 - (scrollProgress - 0.7) * 3.33) : 1;
  
  // Header opacity (fades out as user scrolls)
  const headerOpacity = Math.max(0, 1 - scrollProgress * 2);
  
  // Banner visibility (hides completely when zipper is fully open)
  const bannerVisible = scrollProgress < 1;
  
  // Show bounce animation and arrow only when not scrolling
  const showInitialState = scrollProgress === 0;

  // Generate stars for background
  const stars = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
    }))
  ).current;

  return (
    <>
      {/* Spacer: first 100vh of scroll drives the zipper; content below is in document flow (single scrollbar) */}
      <div style={{ minHeight: '100vh' }} aria-hidden="true" />

      {/* LAYER 1: Banner with clip-path hole - FIXED; content behind is in flow, revealed through hole */}
      {bannerVisible && (
        <div 
          className="fixed top-0 left-0 w-full h-screen bg-[#1A2C59] overflow-hidden"
          style={{ 
            zIndex: 10,
            clipPath: clipPath,
            WebkitClipPath: clipPath,
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

      {/* LAYER 2: Rocket - FIXED */}
      {rocketOpacity > 0 && (
        <div 
          className={`fixed pointer-events-none ${showInitialState ? 'animate-bounce' : ''}`}
          style={{
            zIndex: 11,
            left: `${rocketX}%`,
            top: `${rocketY}%`,
            transform: `translate(-50%, -50%) rotate(-20deg) scale(${rocketScale})`,
            opacity: rocketOpacity,
            willChange: 'transform, top, opacity',
            animationDuration: showInitialState ? '2s' : undefined,
          }}
        >
          <Image
            src="/rocket.webp"
            alt="Foguete"
            width={200}
            height={200}
            className="drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))',
            }}
            priority
          />
        </div>
      )}

      {/* LAYER 3: Arrow pointing down - only visible in initial state */}
      {showInitialState && (
        <div 
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20"
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
      )}
    </>
  );
}
