/**
 * Modelo padronizado para todos os artigos, independente da fonte
 */
export interface StandardizedArticle {
  /** O ID único do artigo na plataforma de origem */
  id: string | number
  /** O título do artigo */
  title: string
  /** A URL direta para ler o artigo completo */
  url: string
  /** O nome do autor ou do usuário que postou */
  author: string
  /** O nome da fonte (ex: 'Dev.to', 'Hacker News') */
  source: string
  /** A data de publicação do artigo */
  publishedAt: Date
  /** (Opcional) Uma lista de tags ou categorias */
  tags?: string[]
  /** (Opcional) Resumo ou descrição do artigo */
  description?: string
}

// Interfaces para APIs externas
interface DevToArticle {
  id: number
  title: string
  url: string
  user: { name: string }
  published_at: string
  tag_list: string[]
  description: string
}


/**
 * Busca artigos da API pública da Dev.to e os converte para StandardizedArticle
 */
export async function fetchDevToArticles(options: {
  tag?: string
  limit?: number
} = {}): Promise<StandardizedArticle[]> {
  const { tag, limit = 20 } = options

  try {
    const baseUrl = 'https://dev.to/api'
    const endpoint = tag ? `/articles?tag=${tag}` : '/articles/latest'
    const url = `${baseUrl}${endpoint}&per_page=${limit}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FocusFlow-App'
      }
    })

    if (!response.ok) {
      throw new Error(`Dev.to API error: ${response.status}`)
    }

    const articles: DevToArticle[] = await response.json()

    return articles.map((article): StandardizedArticle => ({
      id: article.id,
      title: article.title,
      url: article.url,
      author: article.user?.name || 'Unknown Author',
      source: 'Dev.to',
      publishedAt: new Date(article.published_at),
      tags: article.tag_list || [],
      description: article.description || article.title
    }))
  } catch (error) {
    console.error('Error fetching Dev.to articles:', error)
    return []
  }
}

/**
 * Busca as principais histórias da API do Hacker News e as converte para StandardizedArticle
 */
export async function fetchHackerNewsStories(options: {
  limit?: number
} = {}): Promise<StandardizedArticle[]> {
  const { limit = 20 } = options

  try {
    const baseUrl = 'https://hacker-news.firebaseio.com/v0'
    
    // Passo 1: Buscar lista de IDs das top stories
    const topStoriesResponse = await fetch(`${baseUrl}/topstories.json`)
    if (!topStoriesResponse.ok) {
      throw new Error(`Hacker News API error: ${topStoriesResponse.status}`)
    }
    
    const topStoryIds = await topStoriesResponse.json()
    const limitedIds = topStoryIds.slice(0, limit)

    // Passo 2: Buscar detalhes de cada story em paralelo
    const storyPromises = limitedIds.map(async (id: number) => {
      try {
        const storyResponse = await fetch(`${baseUrl}/item/${id}.json`)
        if (!storyResponse.ok) return null
        return await storyResponse.json()
      } catch {
        return null
      }
    })

    const stories = await Promise.all(storyPromises)
    const validStories = stories.filter(story => story && story.url) // Apenas stories com URL externa

    return validStories.map((story): StandardizedArticle => ({
      id: story.id,
      title: story.title,
      url: story.url,
      author: story.by || 'Anonymous',
      source: 'Hacker News',
      publishedAt: new Date(story.time * 1000), // Converte timestamp Unix para milissegundos
      tags: story.type ? [story.type] : [],
      description: story.title
    }))
  } catch (error) {
    console.error('Error fetching Hacker News stories:', error)
    return []
  }
}

/**
 * Função genérica que busca e analisa qualquer feed RSS
 */
export async function fetchArticlesFromRss(feedUrl: string): Promise<StandardizedArticle[]> {
  try {
    // Para RSS, usaremos uma abordagem mais simples usando fetch e parsing manual
    // Em um ambiente real, você poderia usar bibliotecas como 'rss-parser'
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`
    
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error(`RSS fetch error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.status !== 'ok') {
      throw new Error(`RSS parsing error: ${data.message}`)
    }

    const feedTitle = data.feed?.title || 'RSS Feed'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.items.map((item: any, index: number): StandardizedArticle => ({
      id: item.guid || item.link || `rss-${index}`,
      title: item.title,
      url: item.link,
      author: item.author || data.feed?.title || 'RSS Author',
      source: feedTitle,
      publishedAt: new Date(item.pubDate),
      tags: item.categories || [],
      description: item.description ? 
        item.description.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
        item.title
    }))
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

/**
 * Função principal que busca conteúdo de todas as fontes em paralelo,
 * junta os resultados e os ordena por data de publicação
 */
export async function fetchAllArticles(): Promise<StandardizedArticle[]> {
  try {
    // Lista de chamadas para todas as fontes
    const fetchPromises = [
      fetchDevToArticles({ tag: 'javascript', limit: 10 }),
      fetchDevToArticles({ tag: 'typescript', limit: 10 }),
      fetchDevToArticles({ tag: 'react', limit: 10 }),
      fetchHackerNewsStories({ limit: 15 }),
      fetchArticlesFromRss('https://medium.com/feed/tag/programming'),
      fetchArticlesFromRss('https://blog.stackoverfolw.com/feed'),
      fetchArticlesFromRss('https://github.blog/feed/'),
    ]

    // Executa todas as chamadas concorrentemente usando Promise.allSettled
    // Isso garante que mesmo que uma fonte falhe, as outras não sejam afetadas
    const results = await Promise.allSettled(fetchPromises)

    // Processa os resultados, juntando todas as listas de artigos
    const allArticles: StandardizedArticle[] = []
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allArticles.push(...result.value)
      }
    })

    // Remove duplicatas baseado na URL
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    )

    // Ordena por data de publicação (do mais novo para o mais antigo)
    return uniqueArticles.sort((a, b) => 
      b.publishedAt.getTime() - a.publishedAt.getTime()
    )

  } catch (error) {
    console.error('Error fetching all articles:', error)
    return []
  }
}

/**
 * Busca artigos filtrados por tags específicas para engenheiros de software
 */
export async function fetchArticlesForDevelopers(): Promise<StandardizedArticle[]> {
  const developmentTags = [
    'javascript', 'typescript', 'react', 'nextjs', 'nodejs',
    'python', 'webdev', 'programming', 'tutorial', 'beginners',
    'aws', 'docker', 'devops', 'database', 'api',
    'ai', 'machinelearning', 'artificialintelligence', 'ml', 'chatgpt'
  ]

  try {
    // Aumentamos para 8 tags e 8 artigos por tag para ter mais conteúdo
    const fetchPromises = developmentTags.slice(0, 8).map(tag => 
      fetchDevToArticles({ tag, limit: 8 })
    )

    const results = await Promise.allSettled([
      ...fetchPromises,
      fetchHackerNewsStories({ limit: 15 }), // Aumentado de 10 para 15
      fetchArticlesFromRss('https://medium.com/feed/tag/software-engineering'),
      fetchArticlesFromRss('https://medium.com/feed/tag/artificial-intelligence'), // RSS adicional para AI
    ])

    const allArticles: StandardizedArticle[] = []
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allArticles.push(...result.value)
      }
    })

    // Remove duplicatas e ordena
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    )

    return uniqueArticles
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 100) 
      
  } catch (error) {
    console.error('Error fetching articles for developers:', error)
    return []
  }
}

/**
 * Formata a data de publicação de forma amigável
 */
export function formatPublishedDate(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Agora mesmo'
  } else if (diffInHours < 24) {
    return `${diffInHours}h atrás`
  } else if (diffInHours < 48) {
    return 'Ontem'
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} dias atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }
}

/**
 * Filtra artigos por palavras-chave relevantes para engenheiros de software
 */
export function filterRelevantArticles(articles: StandardizedArticle[]): StandardizedArticle[] {
  const relevantKeywords = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'nodejs', 'python',
    'java', 'kotlin', 'swift', 'rust', 'go', 'docker', 'kubernetes', 'aws',
    'azure', 'gcp', 'api', 'database', 'sql', 'mongodb', 'redis', 'microservices',
    'devops', 'ci/cd', 'git', 'github', 'testing', 'performance', 'security',
    'architecture', 'design patterns', 'algorithms', 'data structures',
    'machine learning', 'ai', 'blockchain', 'web3', 'frontend', 'backend',
    'fullstack', 'mobile', 'ios', 'android', 'flutter', 'react native'
  ]

  return articles.filter(article => {
    const textToSearch = `${article.title} ${article.description} ${article.tags?.join(' ')}`.toLowerCase()
    return relevantKeywords.some(keyword => textToSearch.includes(keyword.toLowerCase()))
  })
}
