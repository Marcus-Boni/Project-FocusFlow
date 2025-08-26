import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Demo utilities
export const demoUtils = {
  formatTime: (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  },

  formatTimerTime: (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  generateRandomProgress: () => Math.floor(Math.random() * 60 + 20),
  
  generateRandomTime: () => Math.floor(Math.random() * 300 + 100),

  getProgressColor: (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-blue-600'
    if (progress >= 40) return 'text-yellow-600'
    return 'text-gray-600'
  },

  getProgressBgColor: (progress: number) => {
    if (progress >= 80) return 'bg-green-100'
    if (progress >= 60) return 'bg-blue-100'
    if (progress >= 40) return 'bg-yellow-100'
    return 'bg-gray-100'
  }
}

// Demo constants
export const DEMO_CONSTANTS = {
  TIMER: {
    FOCUS_TIME: 25 * 60, // 25 minutes in seconds
    BREAK_TIME: 5 * 60,  // 5 minutes in seconds
    LONG_BREAK_TIME: 15 * 60 // 15 minutes in seconds
  },
  
  ONBOARDING: {
    TOTAL_STEPS: 5,
    AUTO_ADVANCE_DELAY: 5000 // 5 seconds
  },

  ANALYTICS: {
    DAYS_OF_WEEK: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    CHART_COLORS: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b'
    }
  }
}
