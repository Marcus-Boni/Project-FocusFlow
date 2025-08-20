import { NextRequest, NextResponse } from 'next/server'

// Base expandida de citações motivacionais para garantir variedade no refresh
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
  },
  {
    id: 'local_016',
    content: 'The best way to predict the future is to create it.',
    author: 'Peter Drucker',
    length: 51,
    tags: ['future', 'creation', 'innovation'],
    source: 'local'
  },
  {
    id: 'local_017',
    content: 'Creativity is intelligence having fun.',
    author: 'Albert Einstein',
    length: 37,
    tags: ['creativity', 'intelligence', 'fun'],
    source: 'local'
  },
  {
    id: 'local_018',
    content: 'The present moment is the only time over which we have dominion.',
    author: 'Thich Nhat Hanh',
    length: 64,
    tags: ['mindfulness', 'present', 'focus'],
    source: 'local'
  },
  {
    id: 'local_019',
    content: 'Concentration is the secret of strength.',
    author: 'Ralph Waldo Emerson',
    length: 39,
    tags: ['concentration', 'strength', 'focus'],
    source: 'local'
  },
  {
    id: 'local_020',
    content: 'Where attention goes, energy flows and results show.',
    author: 'T. Harv Eker',
    length: 50,
    tags: ['attention', 'energy', 'results'],
    source: 'local'
  },
  {
    id: 'local_021',
    content: 'Knowledge is power.',
    author: 'Francis Bacon',
    length: 18,
    tags: ['knowledge', 'power', 'wisdom'],
    source: 'local'
  },
  {
    id: 'local_022',
    content: 'An investment in knowledge pays the best interest.',
    author: 'Benjamin Franklin',
    length: 49,
    tags: ['investment', 'knowledge', 'wisdom'],
    source: 'local'
  },
  {
    id: 'local_023',
    content: 'Artificial intelligence is the new electricity.',
    author: 'Andrew Ng',
    length: 44,
    tags: ['ai', 'technology', 'future'],
    source: 'local'
  },
  {
    id: 'local_024',
    content: 'Mistakes are proof that you are trying.',
    author: 'Unknown',
    length: 38,
    tags: ['mistakes', 'learning', 'effort'],
    source: 'local'
  },
  {
    id: 'local_025',
    content: 'The only real mistake is the one from which we learn nothing.',
    author: 'Henry Ford',
    length: 61,
    tags: ['mistakes', 'learning', 'wisdom'],
    source: 'local'
  }
]

// Fallback quotes caso a API externa falhe (mantido para compatibilidade)
const FALLBACK_QUOTES = MOTIVATIONAL_QUOTES.slice(0, 3)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tags = searchParams.get('tags')
    const minLength = parseInt(searchParams.get('minLength') || '40')
    const maxLength = parseInt(searchParams.get('maxLength') || '300')
    const forceLocal = searchParams.get('forceLocal') === 'true'
    
    console.log('API Route - Fetching quote with params:', { tags, minLength, maxLength, forceLocal })
    
    // Sistema híbrido: 40% chance de FavQs, 60% chance de base local para garantir variedade
    const useFavQs = !forceLocal && Math.random() < 0.4
    
    if (useFavQs) {
      try {
        // Tenta buscar do FavQs primeiro
        const apiUrl = 'https://favqs.com/api/qotd'
        console.log('API Route - Trying FavQs API:', apiUrl)
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FocusFlow-App'
          },
          next: { revalidate: 0 } // Sem cache para permitir refresh
        })

        if (response.ok) {
          const data = await response.json()
          const quote = data.quote
          
          if (quote && quote.body) {
            const quoteLength = quote.body.length
            
            // Verifica se a citação do FavQs atende aos critérios
            if (quoteLength >= minLength && quoteLength <= maxLength) {
              console.log('API Route - Successfully fetched quote from FavQs:', quote.body.substring(0, 50) + '...')
              
              return NextResponse.json({
                id: `favqs_${quote.id}`,
                content: quote.body,
                author: quote.author,
                length: quoteLength,
                tags: quote.tags || ['daily'],
                source: 'favqs'
              })
            } else {
              console.log(`API Route - FavQs quote length ${quoteLength} outside range, using local`)
            }
          }
        }
      } catch (error) {
        console.log('API Route - FavQs failed, falling back to local:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
    
    // Usa base local (ou fallback do FavQs)
    console.log('API Route - Using local quote database')
    
    let filteredQuotes = MOTIVATIONAL_QUOTES
    
    // Filtra por tags se especificadas
    if (tags) {
      const tagArray = tags.split('|').map(tag => tag.toLowerCase())
      filteredQuotes = MOTIVATIONAL_QUOTES.filter(quote => 
        quote.tags.some(tag => tagArray.includes(tag.toLowerCase()))
      )
      
      // Se não encontrar nenhuma com as tags específicas, usa todas
      if (filteredQuotes.length === 0) {
        filteredQuotes = MOTIVATIONAL_QUOTES
      }
    }
    
    // Filtra por comprimento
    filteredQuotes = filteredQuotes.filter(quote => 
      quote.length >= minLength && quote.length <= maxLength
    )
    
    // Se não restou nenhuma após filtros, usa todas
    if (filteredQuotes.length === 0) {
      filteredQuotes = MOTIVATIONAL_QUOTES
    }
    
    // Seleciona uma aleatória garantindo variedade
    const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)]
    
    console.log('API Route - Selected local quote:', randomQuote.content.substring(0, 50) + '...')
    
    return NextResponse.json(randomQuote)

  } catch (error) {
    console.error('API Route - Error:', error)
    
    // Fallback absoluto
    const randomQuote = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
    return NextResponse.json(randomQuote)
  }
}
