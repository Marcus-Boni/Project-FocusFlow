"use client"

import { useState } from 'react'
import { Brain, Target, Trophy, Zap, RefreshCw } from 'lucide-react'
import { useMotivation } from '@/lib/hooks/useMotivation'

interface MotivationWidgetProps {
  studyStreak?: number
  totalSessions?: number
  currentSessionType?: 'focus' | 'break' | 'idle'
}

export function MotivationWidget({ 
  studyStreak = 0, 
  totalSessions = 0, 
  currentSessionType = 'idle' 
}: MotivationWidgetProps) {
  const [showNeuroscience, setShowNeuroscience] = useState(false)

  const getUserLevel = () => {
    if (totalSessions >= 50) return 'advanced'
    if (totalSessions >= 10) return 'intermediate'
    return 'beginner'
  }

  const {
    content,
    isLoading,
    refresh
  } = useMotivation({
    sessionType: currentSessionType,
    userLevel: getUserLevel(),
    studyStreak,
    totalSessions
  })

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'focus':
      case 'attention':
        return Target
      case 'memory':
      case 'learning':
        return Brain
      case 'motivation':
        return Trophy
      default:
        return Zap
    }
  }

  const getColorForCategory = (category: string) => {
    switch (category) {
      case 'focus':
      case 'attention':
        return 'bg-blue-500'
      case 'memory':
      case 'learning':
        return 'bg-green-500'
      case 'motivation':
        return 'bg-yellow-500'
      case 'break':
        return 'bg-purple-500'
      default:
        return 'bg-indigo-500'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Daily Motivation</h3>
          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (!content.quote || !content.tip || !content.insight) {
    return (
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Daily Motivation</h3>
          <button
            onClick={refresh}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center text-muted-foreground py-8">
          Unable to load motivation content. Please try refreshing.
        </div>
      </div>
    )
  }

  const Icon = getIconForCategory(content.tip.category)
  const color = getColorForCategory(content.tip.category)

  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Daily Motivation</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={refresh}
            className={`p-2 rounded-full ${color} bg-opacity-20 hover:bg-opacity-30 transition-all`}
            title="Refresh content"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
          <div className={`p-2 rounded-full ${color} bg-opacity-20`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* API Quote */}
      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
        <blockquote className="text-sm italic mb-2">
          &ldquo;{content.quote.content}&rdquo;
        </blockquote>
        <div className="flex items-center justify-between">
          <cite className="text-xs text-muted-foreground">
            — {content.quote.author}
          </cite>
          {content.quote.source === 'quotable' && (
            <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs">
              via Quotable.io
            </span>
          )}
        </div>
      </div>

      {/* Study Tip */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-medium mb-2 flex items-center">
          <Target className="w-4 h-4 mr-2 text-primary" />
          {content.tip.title}
        </h4>
        <p className="text-sm text-muted-foreground mb-2">
          {content.tip.content}
        </p>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs ${
            content.tip.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
            content.tip.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
          }`}>
            {content.tip.difficulty}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded text-xs">
            {content.tip.category}
          </span>
        </div>
      </div>

      {/* Neuroscience Insight Toggle */}
      <div>
        <button
          onClick={() => setShowNeuroscience(!showNeuroscience)}
          className="flex items-center text-sm text-primary hover:underline mb-2"
        >
          <Brain className="w-4 h-4 mr-1" />
          {showNeuroscience ? 'Hide' : 'Show'} Neuroscience Insight
        </button>
        
        {showNeuroscience && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 space-y-3">
            <div>
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                🧠 {content.insight.title}
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                {content.insight.content}
              </p>
            </div>
            <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                <strong>Application:</strong> {content.insight.practical_application}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                Source: {content.insight.source}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Progress-based Encouragement */}
      {studyStreak > 0 && (
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300">
            🔥 <strong>{studyStreak} day streak!</strong> Your brain is building stronger neural pathways every day.
          </p>
        </div>
      )}

      {totalSessions >= 10 && (
        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            🏆 <strong>{totalSessions} sessions completed!</strong> You&rsquo;re building expertise through deliberate practice.
          </p>
        </div>
      )}
    </div>
  )
}

// Advanced variant with mood detection (future enhancement)
export function SmartMotivationWidget(props: MotivationWidgetProps) {
  // This could integrate with session data to detect patterns:
  // - Time of day preferences
  // - Session completion rates
  // - Break frequency
  // - Difficulty patterns
  
  return <MotivationWidget {...props} />
}
