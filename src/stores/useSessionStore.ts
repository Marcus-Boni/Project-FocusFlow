import { create } from 'zustand'
import { StudyArea, StudySession } from '@/lib/supabase'

interface SessionState {
  // Timer state
  isActive: boolean
  isPaused: boolean
  timeRemaining: number // in seconds
  sessionType: 'focus' | 'break'
  currentCycle: number
  
  // Session data
  selectedStudyArea: StudyArea | null
  currentNotes: string
  sessions: StudySession[]
  
  // Settings
  focusTime: number // in minutes
  shortBreakTime: number // in minutes
  longBreakTime: number // in minutes
  cyclesUntilLongBreak: number
  
  // Actions
  startTimer: () => void
  pauseTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  switchSession: () => void
  setTimeRemaining: (time: number) => void
  setSelectedStudyArea: (area: StudyArea | null) => void
  setCurrentNotes: (notes: string) => void
  setSessions: (sessions: StudySession[]) => void
  addSession: (session: StudySession) => void
  updateSettings: (settings: Partial<{
    focusTime: number
    shortBreakTime: number
    longBreakTime: number
    cyclesUntilLongBreak: number
  }>) => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  isActive: false,
  isPaused: false,
  timeRemaining: 25 * 60, // 25 minutes in seconds
  sessionType: 'focus',
  currentCycle: 1,
  
  selectedStudyArea: null,
  currentNotes: '',
  sessions: [],
  
  // Default Pomodoro settings
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  cyclesUntilLongBreak: 4,
  
  // Actions
  startTimer: () => set({ isActive: true, isPaused: false }),
  
  pauseTimer: () => set({ isPaused: true }),
  
  stopTimer: () => set({ 
    isActive: false, 
    isPaused: false,
    timeRemaining: get().sessionType === 'focus' ? get().focusTime * 60 : get().shortBreakTime * 60
  }),
  
  resetTimer: () => {
    const state = get()
    set({ 
      isActive: false, 
      isPaused: false,
      timeRemaining: state.sessionType === 'focus' ? state.focusTime * 60 : state.shortBreakTime * 60
    })
  },
  
  switchSession: () => {
    const state = get()
    const newSessionType = state.sessionType === 'focus' ? 'break' : 'focus'
    let newTimeRemaining: number
    
    if (newSessionType === 'focus') {
      newTimeRemaining = state.focusTime * 60
    } else {
      // Check if it's time for a long break
      const isLongBreak = state.currentCycle % state.cyclesUntilLongBreak === 0
      newTimeRemaining = isLongBreak ? state.longBreakTime * 60 : state.shortBreakTime * 60
    }
    
    set({
      sessionType: newSessionType,
      timeRemaining: newTimeRemaining,
      currentCycle: newSessionType === 'focus' ? state.currentCycle + 1 : state.currentCycle,
      isActive: false,
      isPaused: false
    })
  },
  
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  
  setSelectedStudyArea: (area) => set({ selectedStudyArea: area }),
  
  setCurrentNotes: (notes) => set({ currentNotes: notes }),
  
  setSessions: (sessions) => set({ sessions }),
  
  addSession: (session) => set((state) => ({ 
    sessions: [session, ...state.sessions] 
  })),
  
  updateSettings: (settings) => set((state) => ({
    ...state,
    ...settings,
    // Reset timer if not active and session type matches
    timeRemaining: !state.isActive ? 
      (state.sessionType === 'focus' ? 
        (settings.focusTime || state.focusTime) * 60 : 
        (settings.shortBreakTime || state.shortBreakTime) * 60
      ) : state.timeRemaining
  }))
}))
