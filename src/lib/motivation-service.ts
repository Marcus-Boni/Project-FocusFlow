/**
 * Serviço de Motivação e Citações
 * Integra com a API FavQs.com e mantém uma base de dados local
 * para frases motivadoras, insights de neurociência e dicas de estudo
 */

import { LOCAL_MOTIVATIONAL_QUOTES, MotivationalQuote, NEUROSCIENCE_INSIGHTS, NeuroscienceInsight, STUDY_TIPS, StudyTip } from "@/constants/MotivationData"
/**
 * Busca citações motivacionais da API FavQs.com via API route interna
 */
export async function fetchQuotableQuotes(options: {
  minLength?: number
  maxLength?: number
  tags?: string[]
  limit?: number
} = {}): Promise<MotivationalQuote[]> {
  const { minLength = 50, maxLength = 200, tags = [], limit = 10 } = options

  try {
    const params = new URLSearchParams({
      minLength: minLength.toString(),
      maxLength: maxLength.toString(),
      limit: limit.toString()
    })

    if (tags.length > 0) {
      params.append('tags', tags.join('|'))
    }

    console.log('Motivation Service - Fetching quotes from FavQs API with options:', options)

    const response = await fetch(`/api/quotes?${params}`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Motivation Service - API response not ok:', response.status, response.statusText)
      throw new Error(`API error: ${response.status}`)
    }

    const quotes: MotivationalQuote[] = await response.json()
    console.log(`Motivation Service - Successfully got ${quotes.length} quotes from FavQs + local mix`)
    return quotes

  } catch (error) {
    console.error('Motivation Service - Error fetching quotes via API route:', error)
    
    // Fallback para citações locais
    const fallbackQuotes = LOCAL_MOTIVATIONAL_QUOTES
      .slice(0, Math.min(limit, LOCAL_MOTIVATIONAL_QUOTES.length))
      .map((quote, index) => ({
        id: `local_fallback_${index}`,
        ...quote
      }))
    
    console.log(`Motivation Service - Using ${fallbackQuotes.length} local fallback quotes`)
    return fallbackQuotes
  }
}

/**
 * Busca citação motivacional única da API FavQs.com via API route interna
 */
export async function fetchRandomQuote(tags?: string[]): Promise<MotivationalQuote | null> {
  try {
    const params = new URLSearchParams({
      minLength: '40',
      maxLength: '300'
    })

    if (tags && tags.length > 0) {
      params.append('tags', tags.join('|'))
    }

    console.log('Motivation Service - Fetching random quote from FavQs API with tags:', tags)

    const response = await fetch(`/api/quotes/random?${params}`, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Motivation Service - API response not ok:', response.status, response.statusText)
      throw new Error(`API error: ${response.status}`)
    }

    const quote: MotivationalQuote = await response.json()
    console.log('Motivation Service - Successfully got quote from FavQs:', quote.content.substring(0, 50) + '...')
    return quote

  } catch (error) {
    console.error('Motivation Service - Error fetching random quote via API route:', error)
    
    // Fallback para citação local
    const fallbackQuotes = LOCAL_MOTIVATIONAL_QUOTES
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
    const fallbackQuote = fallbackQuotes[randomIndex]
    
    console.log('Motivation Service - Using local fallback quote')
    return {
      id: `local_fallback_${randomIndex}`,
      ...fallbackQuote
    }
  }
}

/**
 * Combina citações da API FavQs com base local
 */
export async function getMixedMotivationalContent(limit: number = 5): Promise<MotivationalQuote[]> {
  try {
    // Busca da API FavQs + base local com tags relevantes para desenvolvedores e aprendizado
    const apiQuotes = await fetchQuotableQuotes({
      tags: ['motivational', 'wisdom', 'success', 'technology', 'inspirational'],
      limit: Math.ceil(limit * 0.6), // 60% da API
      minLength: 30,
      maxLength: 250
    })

    // Adiciona citações locais
    const localQuotes: MotivationalQuote[] = LOCAL_MOTIVATIONAL_QUOTES
      .slice(0, Math.floor(limit * 0.4)) // 40% local
      .map((quote, index) => ({
        id: `local_${index}`,
        ...quote
      }))

    // Combina e embaralha
    const allQuotes = [...apiQuotes, ...localQuotes]
    return shuffleArray(allQuotes).slice(0, limit)

  } catch (error) {
    console.error('Error fetching mixed motivational content:', error)
    // Fallback para citações locais
    return LOCAL_MOTIVATIONAL_QUOTES
      .slice(0, limit)
      .map((quote, index) => ({
        id: `local_fallback_${index}`,
        ...quote
      }))
  }
}

/**
 * Retorna dica de estudo baseada no contexto
 */
export function getStudyTip(context: {
  sessionType?: 'focus' | 'break' | 'idle'
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  category?: StudyTip['category']
}): StudyTip {
  const { sessionType = 'idle', userLevel = 'beginner', category } = context

  let filteredTips = STUDY_TIPS

  // Filtra por categoria se especificada
  if (category) {
    filteredTips = filteredTips.filter(tip => tip.category === category)
  }

  // Filtra por nível do usuário
  filteredTips = filteredTips.filter(tip => 
    tip.difficulty === userLevel || tip.difficulty === 'beginner'
  )

  // Contexto da sessão
  if (sessionType === 'break') {
    const breakTips = filteredTips.filter(tip => tip.category === 'break')
    if (breakTips.length > 0) filteredTips = breakTips
  } else if (sessionType === 'focus') {
    const focusTips = filteredTips.filter(tip => 
      tip.category === 'focus' || tip.category === 'productivity'
    )
    if (focusTips.length > 0) filteredTips = focusTips
  }

  // Retorna dica aleatória do filtro
  const randomIndex = Math.floor(Math.random() * filteredTips.length)
  return filteredTips[randomIndex] || STUDY_TIPS[0]
}

/**
 * Retorna insight de neurociência baseado na categoria
 */
export function getNeuroscienceInsight(category?: NeuroscienceInsight['category']): NeuroscienceInsight {
  let insights = NEUROSCIENCE_INSIGHTS

  if (category) {
    insights = insights.filter(insight => insight.category === category)
  }

  const randomIndex = Math.floor(Math.random() * insights.length)
  return insights[randomIndex] || NEUROSCIENCE_INSIGHTS[0]
}

/**
 * Retorna conteúdo motivacional completo para o widget
 */
export async function getMotivationalWidgetContent(context: {
  sessionType?: 'focus' | 'break' | 'idle'
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  studyStreak?: number
  totalSessions?: number
}): Promise<{
  quote: MotivationalQuote
  tip: StudyTip
  insight: NeuroscienceInsight
}> {
  const { sessionType, userLevel, studyStreak = 0, totalSessions = 0 } = context

  console.log('Getting motivational content for context:', context)

  // Seleciona tags para citação baseado no contexto
  const quoteTags: string[] = ['motivational', 'wisdom']
  
  if (sessionType === 'break') {
    quoteTags.push('peace', 'mindfulness')
  } else if (studyStreak >= 7) {
    quoteTags.push('success', 'perseverance')
  } else if (totalSessions === 0) {
    quoteTags.push('inspirational', 'beginning')
  }

  // Busca citação com fallback garantido
  let quote: MotivationalQuote
  try {
    const fetchedQuote = await fetchRandomQuote(quoteTags)
    quote = fetchedQuote || {
      id: 'guaranteed_fallback_001',
      content: LOCAL_MOTIVATIONAL_QUOTES[0].content,
      author: LOCAL_MOTIVATIONAL_QUOTES[0].author,
      length: LOCAL_MOTIVATIONAL_QUOTES[0].length,
      tags: LOCAL_MOTIVATIONAL_QUOTES[0].tags,
      source: 'local' as const
    }
  } catch (error) {
    console.error('Fallback to guaranteed quote due to error:', error)
    quote = {
      id: 'guaranteed_fallback_001',
      content: LOCAL_MOTIVATIONAL_QUOTES[0].content,
      author: LOCAL_MOTIVATIONAL_QUOTES[0].author,
      length: LOCAL_MOTIVATIONAL_QUOTES[0].length,
      tags: LOCAL_MOTIVATIONAL_QUOTES[0].tags,
      source: 'local' as const
    }
  }

  // Seleciona dica e insight
  const tip = getStudyTip({ sessionType, userLevel })
  const insight = getNeuroscienceInsight(
    sessionType === 'break' ? 'memory' : 
    sessionType === 'focus' ? 'attention' : 'learning'
  )

  return { quote, tip, insight }
}

/**
 * Utilitário para embaralhar array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Cache para evitar muitas chamadas à API
 */
type CacheData = MotivationalQuote | MotivationalQuote[] | StudyTip | NeuroscienceInsight

class MotivationCache {
  private cache = new Map<string, { data: CacheData; timestamp: number }>()
  private readonly TTL = 1000 * 60 * 30 // 30 minutos

  set(key: string, data: CacheData): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  get(key: string): CacheData | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }
}

export const motivationCache = new MotivationCache()
