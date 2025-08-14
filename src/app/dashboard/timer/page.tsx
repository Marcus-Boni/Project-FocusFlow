"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSessionStore } from '@/stores/useSessionStore'
import { useUserStore } from '@/stores/useUserStore'
import { supabase, StudyArea } from '@/lib/supabase'
import { Play, Pause, Square, SkipForward, Settings, BookOpen } from 'lucide-react'

export default function StudyTimerPage() {
  const { user } = useUserStore()
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
    setCurrentNotes,
    setSelectedStudyArea
  } = useSessionStore()

  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([])
  const [showAreaSelector, setShowAreaSelector] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch study areas
  useEffect(() => {
    const fetchStudyAreas = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('study_areas')
          .select('*')
          .eq('user_id', user.id)
          .order('name')

        if (error) throw error
        setStudyAreas(data || [])
      } catch (error) {
        console.error('Error fetching study areas:', error)
      }
    }

    fetchStudyAreas()
  }, [user])

  const saveSession = useCallback(async () => {
    if (!user || !selectedStudyArea || !sessionStartTime) return

    try {
      const sessionDuration = Math.floor((focusTime * 60 - timeRemaining) / 60) // in minutes
      
      const { error } = await supabase
        .from('study_sessions')
        .insert([{
          user_id: user.id,
          study_area_id: selectedStudyArea.id,
          duration: sessionDuration,
          notes: currentNotes || null,
          session_type: sessionType,
          pomodoro_cycle: currentCycle
        }])

      if (error) {
        console.error('Error saving session:', error)
      } else {
        console.log('Session saved successfully')
      }
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }, [user, selectedStudyArea, sessionStartTime, focusTime, timeRemaining, currentNotes, sessionType, currentCycle])

  const handleSessionComplete = useCallback(async () => {
    if (sessionType === 'focus' && selectedStudyArea && sessionStartTime) {
      // Save the completed focus session
      await saveSession()
    }
    
    // Play notification sound
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${sessionType === 'focus' ? 'Focus' : 'Break'} session completed!`, {
        body: sessionType === 'focus' ? 'Time for a break!' : 'Ready for another focus session?',
        icon: '/favicon.ico'
      })
    }
    
    switchSession()
    setSessionStartTime(null)
  }, [sessionType, selectedStudyArea, sessionStartTime, saveSession, switchSession])

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
      handleSessionComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, timeRemaining, setTimeRemaining, handleSessionComplete])

  const handleStart = () => {
    if (sessionType === 'focus' && !selectedStudyArea) {
      setShowAreaSelector(true)
      return
    }
    
    startTimer()
    if (!sessionStartTime) {
      setSessionStartTime(new Date())
    }
  }

  const handleStop = async () => {
    if (sessionType === 'focus' && selectedStudyArea && sessionStartTime) {
      // Save partial session
      await saveSession()
    }
    stopTimer()
    setSessionStartTime(null)
  }

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

      {/* Study Area Selector Modal */}
      {showAreaSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Select Study Area</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose what you&apos;ll be studying in this focus session:
            </p>
            
            {studyAreas.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No study areas found</p>
                <button
                  onClick={() => setShowAreaSelector(false)}
                  className="text-primary hover:underline"
                >
                  Create one first →
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {studyAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => {
                      setSelectedStudyArea(area)
                      setShowAreaSelector(false)
                      startTimer()
                      setSessionStartTime(new Date())
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: area.color }}
                    />
                    <div>
                      <p className="font-medium">{area.name}</p>
                      {area.description && (
                        <p className="text-sm text-muted-foreground">{area.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowAreaSelector(false)}
              className="w-full px-4 py-2 border rounded-md hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
            {selectedStudyArea && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedStudyArea.color }}
                />
                <span>{selectedStudyArea.name}</span>
              </div>
            )}
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

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Start</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={startTimer}
                className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center space-x-2 bg-secondary px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStop}
              className="flex items-center space-x-2 border px-6 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </button>

            <button
              onClick={() => {
                switchSession()
                setSessionStartTime(null)
              }}
              className="flex items-center space-x-2 border px-6 py-3 rounded-lg hover:bg-accent transition-colors"
            >
              <SkipForward className="w-5 h-5" />
              <span>Skip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {sessionType === 'focus' && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Session Notes</h3>
          <textarea
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="Take notes about what you're learning or working on..."
            className="w-full h-32 px-3 py-2 border rounded-md bg-background resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            These notes will be saved with your session when it completes.
          </p>
        </div>
      )}

      {/* Settings Info */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Timer Settings</h3>
          <Settings className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="font-medium">Focus Time</p>
            <p className="text-muted-foreground">{focusTime} minutes</p>
          </div>
          <div className="text-center">
            <p className="font-medium">Short Break</p>
            <p className="text-muted-foreground">{shortBreakTime} minutes</p>
          </div>
          <div className="text-center">
            <p className="font-medium">Long Break</p>
            <p className="text-muted-foreground">{longBreakTime} minutes</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Customize these settings in your preferences
        </p>
      </div>
    </div>
  )
}
