"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSessionStore } from '@/stores/useSessionStore'
import { useUserStore } from '@/stores/useUserStore'
import { supabase, StudyArea } from '@/lib/supabase'
import { Play, Pause, Square, SkipForward, Settings, BookOpen, CheckCircle, X, Save } from 'lucide-react'
import { toastUtils } from '@/lib/hooks/useToast'

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
    setSelectedStudyArea,
    updateSettings
  } = useSessionStore()

  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([])
  const [showAreaSelector, setShowAreaSelector] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  
  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    focusTime: focusTime,
    shortBreakTime: shortBreakTime,
    longBreakTime: longBreakTime
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sync settings form with store when settings change
  useEffect(() => {
    setSettingsForm({
      focusTime,
      shortBreakTime,
      longBreakTime
    })
  }, [focusTime, shortBreakTime, longBreakTime])

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
        toastUtils.data.error()
      } else {
        console.log('Session saved successfully')
        toastUtils.timer.sessionSaved()
      }
    } catch (error) {
      console.error('Error saving session:', error)
      toastUtils.data.error()
    }
  }, [user, selectedStudyArea, sessionStartTime, focusTime, timeRemaining, currentNotes, sessionType, currentCycle])

  const handleCompleteSession = useCallback(async () => {
    if (sessionType === 'focus' && selectedStudyArea && sessionStartTime) {
      await saveSession()
      stopTimer()
      setSessionStartTime(null)
      toastUtils.timer.completed('focus')
    }
  }, [sessionType, selectedStudyArea, sessionStartTime, saveSession, stopTimer])

  const handleFinishSession = useCallback(async () => {
    if (sessionType === 'focus' && selectedStudyArea && sessionStartTime) {
      // Show confirmation if there are notes
      if (currentNotes.length > 0) {
        const shouldFinish = confirm(
          `Finalizar sessão de estudo para "${selectedStudyArea.name}"?\n\n` +
          `Suas notas (${currentNotes.length} caracteres) serão salvas automaticamente.`
        )
        if (!shouldFinish) return
      }

      await saveSession()
      stopTimer()
      setSessionStartTime(null)
      setCurrentNotes('') // Clear notes after saving
      
      // Show success message
      toastUtils.timer.sessionSaved()
      
      // Optional: Ask if user wants to start a break after a short delay
      setTimeout(() => {
        const shouldStartBreak = confirm('Sessão finalizada com sucesso! 🎉\n\nDeseja iniciar uma pausa agora?')
        if (shouldStartBreak) {
          switchSession()
          startTimer()
        }
      }, 1500)
    }
  }, [sessionType, selectedStudyArea, sessionStartTime, currentNotes, saveSession, stopTimer, setCurrentNotes, switchSession, startTimer])

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(settingsForm)
    setShowSettings(false)
    toastUtils.settings.saved()
  }

  const resetSettingsForm = () => {
    setSettingsForm({
      focusTime: focusTime,
      shortBreakTime: shortBreakTime,
      longBreakTime: longBreakTime
    })
  }

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
    
    // Show toast notification
    toastUtils.timer.completed(sessionType)
    
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
    
    // Show toast notification
    toastUtils.timer.started(selectedStudyArea?.name)
  }

  const handleStop = async () => {
    if (sessionType === 'focus' && selectedStudyArea && sessionStartTime) {
      // Save partial session
      await saveSession()
    }
    stopTimer()
    setSessionStartTime(null)
    
    // Show toast notification
    toastUtils.timer.stopped()
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Timer Settings</h2>
              <button
                onClick={() => {
                  setShowSettings(false)
                  resetSettingsForm()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Focus Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settingsForm.focusTime}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    focusTime: parseInt(e.target.value) || 25
                  }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settingsForm.shortBreakTime}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    shortBreakTime: parseInt(e.target.value) || 5
                  }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settingsForm.longBreakTime}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    longBreakTime: parseInt(e.target.value) || 15
                  }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false)
                    resetSettingsForm()
                  }}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          <div className="space-y-4">
            {/* Main Control Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
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
                  onClick={() => {
                    startTimer()
                    toastUtils.timer.resumed()
                  }}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    pauseTimer()
                    toastUtils.timer.paused()
                  }}
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

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 border px-6 py-3 rounded-lg hover:bg-accent transition-colors"
                disabled={isActive && !isPaused}
                title={isActive && !isPaused ? "Pause timer to change settings" : "Timer Settings"}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>

            {/* Session Action Buttons - Only show during focus sessions */}
            {sessionType === 'focus' && selectedStudyArea && sessionStartTime && (
              <div className="flex flex-wrap justify-center gap-3 pt-2 border-t">
                <div className="text-center w-full mb-2">
                  <p className="text-sm text-muted-foreground">Session Actions</p>
                </div>
                
                {/* Complete Session Button - Only during active sessions */}
                {isActive && (
                  <button
                    onClick={handleCompleteSession}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    title="Complete full pomodoro session (wait for timer to finish)"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Session</span>
                  </button>
                )}

                {/* Finish Session Button - Available anytime during focus session */}
                <button
                  onClick={handleFinishSession}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  title="Finish and save current session now"
                >
                  <Save className="w-4 h-4" />
                  <span>Finish & Save Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session Statistics */}
      {sessionType === 'focus' && sessionStartTime && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Session Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Study Area</p>
              <div className="flex items-center space-x-2 mt-1">
                {selectedStudyArea && (
                  <>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedStudyArea.color }}
                    />
                    <span>{selectedStudyArea.name}</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Time Studied</p>
              <p className="text-lg font-mono">
                {formatTime((focusTime * 60) - timeRemaining)}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Session Type</p>
              <p className="capitalize">{sessionType}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Cycle</p>
              <p>{currentCycle}</p>
            </div>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {sessionType === 'focus' && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Session Notes</h3>
            {selectedStudyArea && sessionStartTime && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Auto-save on finish</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <textarea
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder="Take notes about what you're learning or working on..."
            className="w-full h-32 px-3 py-2 border rounded-md bg-background resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              {selectedStudyArea && sessionStartTime 
                ? "Notes will be saved when you complete or finish the session."
                : "Select a study area and start the timer to save notes."
              }
            </p>
            {currentNotes.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {currentNotes.length} characters
              </span>
            )}
          </div>
          
          {/* Quick save button for notes during active session */}
          {selectedStudyArea && sessionStartTime && currentNotes.length > 10 && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Want to save your progress now?
                </p>
                <button
                  onClick={handleFinishSession}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  Finish & Save Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Settings Display */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Current Timer Settings</h3>
          <button 
            onClick={() => setShowSettings(true)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">Focus Time</p>
            <p className="text-lg font-mono mt-1">{focusTime}m</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">Short Break</p>
            <p className="text-lg font-mono mt-1">{shortBreakTime}m</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">Long Break</p>
            <p className="text-lg font-mono mt-1">{longBreakTime}m</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Click the settings icon to customize these values
        </p>
      </div>
    </div>
  )
}
