"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, Target, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressAnimationProps {
  current: number
  target: number
  status: string
  className?: string
}

export function ProgressAnimation({ current, target, status, className }: ProgressAnimationProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const actualProgress = Math.min(100, (current / target) * 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(actualProgress)
    }, 100)
    return () => clearTimeout(timer)
  }, [actualProgress])

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Target className="h-5 w-5 text-gray-400" />
    }
  }

  const getProgressColor = () => {
    if (status === 'completed') return 'bg-green-600'
    if (actualProgress >= 75) return 'bg-green-500'
    if (actualProgress >= 50) return 'bg-yellow-500'
    if (actualProgress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Status Icon e Percentage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {status === 'completed' ? 'Concluída' : 
             status === 'in_progress' ? 'Em Progresso' : 
             'Não Iniciada'}
          </span>
        </div>
        <span className="text-sm font-bold">
          {actualProgress.toFixed(0)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-out rounded-full",
            getProgressColor()
          )}
          style={{ width: `${animatedProgress}%` }}
        />
        
        {/* Pulse effect for active progress */}
        {status === 'in_progress' && actualProgress > 0 && (
          <div 
            className={cn(
              "absolute top-0 h-full rounded-full opacity-30 animate-pulse",
              getProgressColor()
            )}
            style={{ width: `${animatedProgress}%` }}
          />
        )}
      </div>

      {/* Current vs Target */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Atual: {current}</span>
        <span>Meta: {target}</span>
      </div>
    </div>
  )
}
