"use client"

import { useState, useEffect } from 'react'
import { Brain, Target, Trophy, Zap } from 'lucide-react'

interface MotivationalContent {
  quote: string
  author?: string
  tip: string
  neuroscience: string
  icon: React.ElementType
  color: string
}

const motivationalContents: MotivationalContent[] = [
  {
    quote: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    tip: "Break complex topics into smaller, manageable chunks",
    neuroscience: "Chunking helps the prefrontal cortex process information more effectively",
    icon: Brain,
    color: "bg-blue-500"
  },
  {
    quote: "Progress, not perfection.",
    tip: "Focus on consistent daily practice rather than perfect sessions",
    neuroscience: "Regular practice strengthens neural pathways through repetition",
    icon: Target,
    color: "bg-green-500"
  },
  {
    quote: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci",
    tip: "Take active breaks to help consolidate what you've learned",
    neuroscience: "Rest periods allow the brain to replay and strengthen memories",
    icon: Zap,
    color: "bg-purple-500"
  },
  {
    quote: "The best time to plant a tree was 20 years ago. The second best time is now.",
    tip: "Start with just 5 minutes of focused study today",
    neuroscience: "Small wins activate the brain's reward system, building motivation",
    icon: Trophy,
    color: "bg-yellow-500"
  },
  {
    quote: "Code is poetry written in logic.",
    tip: "Connect new concepts to what you already know",
    neuroscience: "Making connections activates multiple brain regions, improving retention",
    icon: Brain,
    color: "bg-indigo-500"
  }
]

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
  const [currentContent, setCurrentContent] = useState<MotivationalContent>(motivationalContents[0])
  const [showNeuroscience, setShowNeuroscience] = useState(false)

  useEffect(() => {
    // Select content based on user progress and current state
    let contentIndex = 0
    
    if (currentSessionType === 'break') {
      // During breaks, show content about rest and consolidation
      contentIndex = 2
    } else if (studyStreak >= 7) {
      // For consistent users, show advanced motivation
      contentIndex = 4
    } else if (totalSessions >= 10) {
      // For experienced users, show progress-focused content
      contentIndex = 1
    } else if (totalSessions === 0) {
      // For beginners, show getting-started content
      contentIndex = 3
    } else {
      // For regular users, rotate based on day
      contentIndex = new Date().getDate() % motivationalContents.length
    }
    
    setCurrentContent(motivationalContents[contentIndex])
  }, [studyStreak, totalSessions, currentSessionType])

  const Icon = currentContent.icon

  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Daily Motivation</h3>
        <div className={`p-2 rounded-full ${currentContent.color} bg-opacity-20`}>
          <Icon className={`w-5 h-5 text-white`} />
        </div>
      </div>

      {/* Main Quote */}
      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
        <blockquote className="text-sm italic mb-2">
          &ldquo;{currentContent.quote}&rdquo;
        </blockquote>
        {currentContent.author && (
          <cite className="text-xs text-muted-foreground">— {currentContent.author}</cite>
        )}
      </div>

      {/* Study Tip */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-medium mb-2 flex items-center">
          <Target className="w-4 h-4 mr-2 text-primary" />
          Study Tip
        </h4>
        <p className="text-sm text-muted-foreground">
          {currentContent.tip}
        </p>
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
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              🧠 <strong>Science:</strong> {currentContent.neuroscience}
            </p>
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
