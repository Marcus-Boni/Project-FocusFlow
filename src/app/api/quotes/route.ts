import { NextRequest, NextResponse } from 'next/server'

// Base expandida de citações motivacionais para múltiplas requests
const MOTIVATIONAL_QUOTES = [
  {
    id: 'local_001',
    content: 'The expert in anything was once a beginner.',
    author: 'Helen Hayes',
    length: 44,
    tags: ['learning', 'growth', 'motivational'],
    source: 'local'
  },
  {
    id: 'local_002',
    content: 'Learning never exhausts the mind.',
    author: 'Leonardo da Vinci',
    length: 33,
    tags: ['learning', 'wisdom', 'motivational'],
    source: 'local'
  },
  {
    id: 'local_003',
    content: 'The beautiful thing about learning is that no one can take it away from you.',
    author: 'B.B. King',
    length: 75,
    tags: ['learning', 'education', 'wisdom'],
    source: 'local'
  },
  {
    id: 'local_004',
    content: 'Education is the most powerful weapon which you can use to change the world.',
    author: 'Nelson Mandela',
    length: 73,
    tags: ['education', 'inspirational', 'change'],
    source: 'local'
  },
  {
    id: 'local_005',
    content: 'Code is poetry written in logic.',
    author: 'Unknown',
    length: 32,
    tags: ['programming', 'creativity', 'technology'],
    source: 'local'
  },
  {
    id: 'local_006',
    content: 'The best error message is the one that never shows up.',
    author: 'Thomas Fuchs',
    length: 54,
    tags: ['programming', 'design', 'user-experience'],
    source: 'local'
  },
  {
    id: 'local_007',
    content: 'The only way to learn a new programming language is by writing programs in it.',
    author: 'Dennis Ritchie',
    length: 77,
    tags: ['programming', 'practice', 'learning'],
    source: 'local'
  },
  {
    id: 'local_008',
    content: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    length: 47,
    tags: ['programming', 'problem-solving', 'wisdom'],
    source: 'local'
  },
  {
    id: 'local_009',
    content: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
    length: 89,
    tags: ['programming', 'design', 'readability'],
    source: 'local'
  },
  {
    id: 'local_010',
    content: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    length: 109,
    tags: ['programming', 'clean-code', 'wisdom'],
    source: 'local'
  },
  {
    id: 'local_011',
    content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    length: 82,
    tags: ['success', 'perseverance', 'courage'],
    source: 'local'
  },
  {
    id: 'local_012',
    content: 'The only impossible journey is the one you never begin.',
    author: 'Tony Robbins',
    length: 56,
    tags: ['beginning', 'journey', 'motivational'],
    source: 'local'
  },
  {
    id: 'local_013',
    content: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    length: 63,
    tags: ['perseverance', 'progress', 'wisdom'],
    source: 'local'
  },
  {
    id: 'local_014',
    content: 'The way to get started is to quit talking and begin doing.',
    author: 'Walt Disney',
    length: 58,
    tags: ['action', 'beginning', 'motivational'],
    source: 'local'
  },
  {
    id: 'local_015',
    content: 'Innovation distinguishes between a leader and a follower.',
    author: 'Steve Jobs',
    length: 57,
    tags: ['innovation', 'leadership', 'technology'],
    source: 'local'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tags = searchParams.get('tags')
    const limit = parseInt(searchParams.get('limit') || '10')
    const minLength = parseInt(searchParams.get('minLength') || '40')
    const maxLength = parseInt(searchParams.get('maxLength') || '300')
    
    console.log('API Route - Multiple quotes with params:', { tags, limit, minLength, maxLength })
    
    // Para múltiplas citações, usamos nossa base local já que FavQs é principalmente QOTD
    // Tenta buscar uma citação do FavQs primeiro e complementa com a base local
    let quotes = [...MOTIVATIONAL_QUOTES]
    
    try {
      // Busca uma citação do FavQs para misturar com as locais
      const favqsResponse = await fetch('https://favqs.com/api/qotd', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FocusFlow-App'
        },
        next: { revalidate: 3600 }
      })
      
      if (favqsResponse.ok) {
        const favqsData = await favqsResponse.json()
        if (favqsData.quote) {
          const favqsQuote = {
            id: `favqs_${favqsData.quote.id}`,
            content: favqsData.quote.body,
            author: favqsData.quote.author,
            length: favqsData.quote.body?.length || 0,
            tags: favqsData.quote.tags || ['daily'],
            source: 'favqs'
          }
          
          // Adiciona a citação do FavQs no início da lista
          quotes = [favqsQuote, ...quotes]
          console.log('API Route - Added FavQs quote to collection')
        }
      }
    } catch (error) {
      console.log('API Route - FavQs not available, using only local quotes:', error instanceof Error ? error.message : 'Unknown error')
    }
    
    // Filtra citações por tags se especificadas
    if (tags) {
      const tagArray = tags.split('|').map(tag => tag.toLowerCase())
      quotes = quotes.filter(quote => 
        quote.tags.some(tag => tagArray.includes(tag.toLowerCase()))
      )
      
      // Se não encontrar nenhuma com as tags específicas, usa todas
      if (quotes.length === 0) {
        quotes = MOTIVATIONAL_QUOTES
      }
    }
    
    // Filtra por comprimento
    quotes = quotes.filter(quote => 
      quote.length >= minLength && quote.length <= maxLength
    )
    
    // Se não restou nenhuma após filtros, usa todas
    if (quotes.length === 0) {
      quotes = MOTIVATIONAL_QUOTES
    }
    
    // Embaralha e seleciona o número requisitado
    const shuffledQuotes = [...quotes].sort(() => Math.random() - 0.5)
    const selectedQuotes = shuffledQuotes.slice(0, Math.min(limit, shuffledQuotes.length))
    
    console.log(`API Route - Returning ${selectedQuotes.length} quotes`)
    
    return NextResponse.json({
      count: selectedQuotes.length,
      totalCount: quotes.length,
      results: selectedQuotes
    })

  } catch (error) {
    console.error('API Route - Error:', error)
    
    // Fallback absoluto
    return NextResponse.json({
      count: 1,
      totalCount: 1,
      results: [MOTIVATIONAL_QUOTES[0]]
    })
  }
}
