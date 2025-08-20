"use client"

import { NewsWidget } from '@/components/shared/news-widget'
import { BookOpen, Code, Lightbulb, TrendingUp } from 'lucide-react'

export default function NewsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Tech News & Articles</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest trends, best practices, and insights from the software development world
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4 text-center">
          <Code className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Programming</h3>
          <p className="text-xs text-muted-foreground">Latest tutorials & tips</p>
        </div>
        
        <div className="bg-card rounded-lg border p-4 text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Trending</h3>
          <p className="text-xs text-muted-foreground">Hot topics in tech</p>
        </div>
        
        <div className="bg-card rounded-lg border p-4 text-center">
          <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Best Practices</h3>
          <p className="text-xs text-muted-foreground">Industry standards</p>
        </div>
        
        <div className="bg-card rounded-lg border p-4 text-center">
          <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Learning</h3>
          <p className="text-xs text-muted-foreground">Educational content</p>
        </div>
      </div>

      {/* News Widget */}
      <NewsWidget maxArticles={50} showFilters={true} />

      {/* Additional Info */}
      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">📚 Curated for Software Engineers</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Our content aggregator brings you the most relevant articles from top tech sources including:
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 rounded-full">
            💻 Dev.to
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 rounded-full">
            🔥 Hacker News
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
            ⚡ GitHub Blog
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 rounded-full">
            📰 Medium
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          All articles are filtered for relevance to software engineering and development practices.
        </p>
      </div>
    </div>
  )
}
