"use client";

import { useCallback } from "react";

export interface TrackEventOptions {
  tipo: string;
  acao?: string;
  elemento?: string;
  valor?: string;
  metadata?: Record<string, any>;
}

/**
 * Hook para tracking de eventos no frontend
 */
export function useTracking() {
  const trackEvent = useCallback(async (options: TrackEventOptions) => {
    try {
      await fetch("/api/tracking/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...options,
          url: window.location.href,
        }),
      });
    } catch (error) {
      // Falha silenciosa - não quebrar a UX
      console.error("Error tracking event:", error);
    }
  }, []);

  const trackClick = useCallback(
    (acao: string, elemento?: string, valor?: string) => {
      trackEvent({
        tipo: "click",
        acao,
        elemento,
        valor,
      });
    },
    [trackEvent]
  );

  const trackView = useCallback(
    (acao: string, metadata?: Record<string, any>) => {
      trackEvent({
        tipo: "view",
        acao,
        metadata,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackClick,
    trackView,
  };
}
