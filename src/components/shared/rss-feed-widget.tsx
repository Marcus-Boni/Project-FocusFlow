"use client"

import { useState, useEffect } from 'react'
import { Rss, ExternalLink, Calendar } from 'lucide-react'

interface RSSItem {
  title: string
  link: string
  description: string
  pubDate: string
  author?: string
}

// Simulação de um feed RSS - Em produção, você usaria uma API real
const mockRSSItems: RSSItem[] = [
  {
    title: "Clean Code Principles Every Developer Should Know",
    link: "https://martinfowler.com/articles/clean-code.html",
    description: "Essential principles for writing maintainable and readable code that your future self will thank you for.",
    pubDate: "2024-08-10",
    author: "Martin Fowler"
  },
  {
    title: "The Art of Software Architecture",
    link: "https://blog.pragmaticengineer.com/software-architecture/",
    description: "Understanding the fundamentals of software architecture and how to design scalable systems.",
    pubDate: "2024-08-08",
    author: "Gergely Orosz"
  },
  {
    title: "Modern JavaScript Features You Should Use",
    link: "https://javascript.info/modern-features",
    description: "A comprehensive guide to the latest JavaScript features that can improve your development workflow.",
    pubDate: "2024-08-05",
    author: "JavaScript.info"
  },
  {
    title: "Understanding React Hooks in Depth",
    link: "https://react.dev/learn/hooks",
    description: "Deep dive into React Hooks and how they can help you write cleaner, more efficient components.",
    pubDate: "2024-08-03",
    author: "React Team"
  },
  {
    title: "TypeScript Best Practices for 2024",
    link: "https://typescript-book.com/",
    description: "Learn the best practices for using TypeScript in modern web development projects.",
    pubDate: "2024-08-01",
    author: "TypeScript Community"
  }
]

export function RSSFeedWidget() {
  const [rssItems, setRssItems] = useState<RSSItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const fetchRSSFeed = async () => {
      try {
        setIsLoading(true)
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In a real implementation, you would fetch from a RSS to JSON API
        // like rss2json.com or implement server-side RSS parsing
        setRssItems(mockRSSItems.slice(0, 3)) // Show only 3 items
      } catch {
        setError('Failed to load RSS feed')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRSSFeed()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Rss className="w-5 h-5 text-primary animate-pulse" />
          <h2 className="text-lg font-semibold">Tech News & Articles</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Rss className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Tech News & Articles</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Rss className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{error}</p>
          <p className="text-sm mt-2">Check back later for the latest articles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Rss className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Tech News & Articles</h2>
        </div>
        <a 
          href="https://martinfowler.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center space-x-1"
        >
          <span>View All</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-4">
        {rssItems.map((item, index) => (
          <article key={index} className="space-y-2">
            <h3 className="font-medium text-sm leading-tight">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors line-clamp-2"
              >
                {item.title}
              </a>
            </h3>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(item.pubDate)}</span>
              {item.author && (
                <>
                  <span>•</span>
                  <span>{item.author}</span>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Stay updated with the latest in software development
        </p>
      </div>
    </div>
  )
}
