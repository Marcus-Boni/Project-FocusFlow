"use client"

import { useEffect, useRef } from 'react'
import { useSessionStore } from '@/stores/useSessionStore'
import { Play, Pause, Square, SkipForward, Settings } from 'lucide-react'

export default function StudyTimerPage() {
  const {
    isActive,
    isPaused,
    timeRemaining,
    sessionType,
    currentCycle,
    selectedStudyArea,
    currentNotes,
    focusTime,
    shortBreakTime,
    longBreakTime,
    startTimer,
    pauseTimer,
    stopTimer,
    switchSession,
    setTimeRemaining,
    setCurrentNotes
  } = useSessionStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Auto switch when time reaches 0
    if (timeRemaining === 0 && isActive) {
      // Play notification sound (you can add this later)
      switchSession()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, timeRemaining, setTimeRemaining, switchSession])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getSessionProgress = () => {
    const totalTime = sessionType === 'focus' 
      ? focusTime * 60 
      : (currentCycle % 4 === 0 ? longBreakTime * 60 : shortBreakTime * 60)
    return ((totalTime - timeRemaining) / totalTime) * 100
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Study Timer</h1>
        <p className="text-muted-foreground">
          {sessionType === 'focus' ? 'Time to focus!' : 'Take a break!'}
        </p>
      </div>

      {/* Main Timer Section */}
      <div className="bg-card rounded-lg border p-8">
        <div className="text-center space-y-6">
          {/* Session Type & Cycle */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold capitalize">
              {sessionType === 'focus' ? '🎯 Focus Session' : '☕ Break Time'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Cycle {currentCycle} • {sessionType === 'focus' ? 'Focus' : 'Break'}
            </p>
          </div>

          {/* Timer Display */}
          <div className="space-y-4">
            <div className="text-6xl md:text-8xl font-mono font-bold">
              {formatTime(timeRemaining)}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 max-w-md mx-auto">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getSessionProgress()}%` }}
              />
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={isActive && !isPaused ? pauseTimer : startTimer}
              disabled={!selectedStudyArea && sessionType === 'focus'}
              className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isActive && !isPaused ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <button
              onClick={stopTimer}
              className="flex items-center justify-center w-12 h-12 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <Square className="w-5 h-5" />
            </button>

            <button
              onClick={switchSession}
              className="flex items-center justify-center w-12 h-12 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button className="flex items-center justify-center w-12 h-12 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Study Area Selection */}
          {sessionType === 'focus' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Study Area
                </label>
                <select
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={selectedStudyArea?.id || ''}
                  onChange={(e) => {
                    // This will be implemented when we create study areas
                    console.log('Selected study area:', e.target.value)
                  }}
                >
                  <option value="">Select a study area...</option>
                  <option value="javascript">JavaScript</option>
                  <option value="react">React</option>
                  <option value="typescript">TypeScript</option>
                  <option value="algorithms">Algorithms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="What are you studying today?"
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Status Message */}
          {!selectedStudyArea && sessionType === 'focus' && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-md max-w-md mx-auto">
              Please select a study area before starting your focus session.
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border p-6 text-center">
          <h3 className="font-semibold mb-2">Today&apos;s Sessions</h3>
          <p className="text-2xl font-bold">0</p>
        </div>

        <div className="bg-card rounded-lg border p-6 text-center">
          <h3 className="font-semibold mb-2">Focus Time</h3>
          <p className="text-2xl font-bold">0h 0m</p>
        </div>

        <div className="bg-card rounded-lg border p-6 text-center">
          <h3 className="font-semibold mb-2">Current Streak</h3>
          <p className="text-2xl font-bold">0 days</p>
        </div>
      </div>

      {/* Pomodoro Info */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4">🍅 Pomodoro Technique</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Focus</div>
            <div className="text-muted-foreground">{focusTime} minutes</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Short Break</div>
            <div className="text-muted-foreground">{shortBreakTime} minutes</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Long Break</div>
            <div className="text-muted-foreground">{longBreakTime} minutes</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Work in focused 25-minute intervals with regular breaks to maintain high productivity and avoid burnout.
        </p>
      </div>
    </div>
  )
}
