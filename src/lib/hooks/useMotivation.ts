/**
 * Hook personalizado para gerenciar conteúdo motivacional
 * Integra com o serviço de motivação e fornece state management
 */

import { useState, useEffect, useCallback } from "react";
import {
  getMotivationalWidgetContent,
  getStudyTip,
  getNeuroscienceInsight,
} from "@/lib/motivation-service";
import type { MotivationalQuote, NeuroscienceInsight, StudyTip } from "@/constants/MotivationData";

export interface UseMotivationOptions {
  sessionType?: "focus" | "break" | "idle";
  userLevel?: "beginner" | "intermediate" | "advanced";
  studyStreak?: number;
  totalSessions?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // em minutos
}

export interface MotivationContent {
  quote: MotivationalQuote | null;
  tip: StudyTip | null;
  insight: NeuroscienceInsight | null;
}

export interface UseMotivationReturn {
  content: MotivationContent;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  refreshQuote: () => Promise<void>;
  refreshTip: () => Promise<void>;
  refreshInsight: () => Promise<void>;
}

/**
 * Hook principal para conteúdo motivacional completo
 */
export function useMotivation(
  options: UseMotivationOptions = {}
): UseMotivationReturn {
  const {
    sessionType = "idle",
    userLevel = "beginner",
    studyStreak = 0,
    totalSessions = 0,
    autoRefresh = false,
    refreshInterval = 30,
  } = options;

  const [content, setContent] = useState<MotivationContent>({
    quote: null,
    tip: null,
    insight: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAllContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getMotivationalWidgetContent({
        sessionType,
        userLevel,
        studyStreak,
        totalSessions,
      });

      setContent({
        quote: result.quote,
        tip: result.tip,
        insight: result.insight,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load content")
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionType, userLevel, studyStreak, totalSessions]);

  const refreshQuote = useCallback(async () => {
    try {
      const tags =
        sessionType === "break"
          ? ["peace", "mindfulness"]
          : studyStreak >= 7
          ? ["success", "perseverance"]
          : ["motivational", "wisdom"];

      // Força refresh sem cache adicionando timestamp
      const timestamp = Date.now()
      const currentQuoteId = content.quote?.id
      let attempts = 0
      let newQuote = null
      
      // Tenta até 3 vezes para garantir uma citação diferente da atual
      while (attempts < 3 && (!newQuote || newQuote.id === currentQuoteId)) {
        const response = await fetch(`/api/quotes/random?tags=${tags.join('|')}&_t=${timestamp + attempts}`, {
          cache: 'no-store', // Força nova requisição
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          newQuote = await response.json()
        }
        attempts++
      }
      
      if (newQuote) {
        console.log('Hook - Refreshed quote:', newQuote.content.substring(0, 50) + '...')
        setContent((prev) => ({ ...prev, quote: newQuote }))
      }
    } catch (err) {
      console.error("Error refreshing quote:", err);
    }
  }, [sessionType, studyStreak, content.quote?.id]);

  const refreshTip = useCallback(async () => {
    try {
      const newTip = getStudyTip({ sessionType, userLevel });
      setContent((prev) => ({ ...prev, tip: newTip }));
    } catch (err) {
      console.error("Error refreshing tip:", err);
    }
  }, [sessionType, userLevel]);

  const refreshInsight = useCallback(async () => {
    try {
      const category =
        sessionType === "break"
          ? "memory"
          : sessionType === "focus"
          ? "attention"
          : "learning";
      const newInsight = getNeuroscienceInsight(category);
      setContent((prev) => ({ ...prev, insight: newInsight }));
    } catch (err) {
      console.error("Error refreshing insight:", err);
    }
  }, [sessionType]);

  const refresh = useCallback(async () => {
    await loadAllContent();
  }, [loadAllContent]);

  // Carrega conteúdo inicial
  useEffect(() => {
    loadAllContent();
  }, [loadAllContent]);

  // Auto-refresh opcional
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAllContent();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadAllContent]);

  return {
    content,
    isLoading,
    error,
    refresh,
    refreshQuote,
    refreshTip,
    refreshInsight,
  };
}

/**
 * Hook simplificado apenas para citações
 */
export function useMotivationalQuote(tags?: string[]): {
  quote: MotivationalQuote | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuote = useCallback(async (forceNew = false) => {
    try {
      setIsLoading(true);
      // Força refresh sem cache
      const timestamp = Date.now()
      const tagsParam = tags ? `tags=${tags.join('|')}&` : ''
      const currentQuoteId = quote?.id
      let attempts = 0
      let newQuote = null
      
      // Se forceNew = true, tenta garantir uma citação diferente
      while (attempts < (forceNew ? 3 : 1) && (!newQuote || (forceNew && newQuote.id === currentQuoteId))) {
        const response = await fetch(`/api/quotes/random?${tagsParam}_t=${timestamp + attempts}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          newQuote = await response.json()
        }
        attempts++
      }
      
      if (newQuote) {
        setQuote(newQuote)
      }
    } catch (error) {
      console.error("Error loading quote:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tags, quote?.id]);

  const refresh = useCallback(async () => {
    await loadQuote(true); // Força nova citação
  }, [loadQuote]);

  useEffect(() => {
    const initialLoad = async () => {
      try {
        setIsLoading(true);
        const timestamp = Date.now()
        const tagsParam = tags ? `tags=${tags.join('|')}&` : ''
        const response = await fetch(`/api/quotes/random?${tagsParam}_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (response.ok) {
          const newQuote = await response.json()
          setQuote(newQuote)
        }
      } catch (error) {
        console.error("Error loading initial quote:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initialLoad()
  }, [tags]);

  return { quote, isLoading, refresh };
}

/**
 * Hook para dicas de estudo contextuais
 */
export function useStudyTips(context: {
  sessionType?: "focus" | "break" | "idle";
  userLevel?: "beginner" | "intermediate" | "advanced";
  category?: StudyTip["category"];
}): {
  tip: StudyTip;
  refresh: () => void;
} {
  const [tip, setTip] = useState<StudyTip>(() => getStudyTip(context));

  const refresh = useCallback(() => {
    const newTip = getStudyTip(context);
    setTip(newTip);
  }, [context]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tip, refresh };
}

/**
 * Hook para insights de neurociência
 */
export function useNeuroscienceInsights(
  category?: NeuroscienceInsight["category"]
): {
  insight: NeuroscienceInsight;
  refresh: () => void;
} {
  const [insight, setInsight] = useState<NeuroscienceInsight>(() =>
    getNeuroscienceInsight(category)
  );

  const refresh = useCallback(() => {
    const newInsight = getNeuroscienceInsight(category);
    setInsight(newInsight);
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { insight, refresh };
}

/**
 * Hook para estatísticas de uso do sistema motivacional
 */
export function useMotivationStats(): {
  quotesViewed: number;
  tipsViewed: number;
  insightsViewed: number;
  incrementQuotes: () => void;
  incrementTips: () => void;
  incrementInsights: () => void;
  reset: () => void;
} {
  const [stats, setStats] = useState(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("focusflow-motivation-stats")
        : null;
    return saved
      ? JSON.parse(saved)
      : {
          quotesViewed: 0,
          tipsViewed: 0,
          insightsViewed: 0,
        };
  });

  const saveStats = useCallback((newStats: typeof stats) => {
    setStats(newStats);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "focusflow-motivation-stats",
        JSON.stringify(newStats)
      );
    }
  }, []);

  const incrementQuotes = useCallback(() => {
    saveStats({ ...stats, quotesViewed: stats.quotesViewed + 1 });
  }, [stats, saveStats]);

  const incrementTips = useCallback(() => {
    saveStats({ ...stats, tipsViewed: stats.tipsViewed + 1 });
  }, [stats, saveStats]);

  const incrementInsights = useCallback(() => {
    saveStats({ ...stats, insightsViewed: stats.insightsViewed + 1 });
  }, [stats, saveStats]);

  const reset = useCallback(() => {
    saveStats({ quotesViewed: 0, tipsViewed: 0, insightsViewed: 0 });
  }, [saveStats]);

  return {
    ...stats,
    incrementQuotes,
    incrementTips,
    incrementInsights,
    reset,
  };
}
