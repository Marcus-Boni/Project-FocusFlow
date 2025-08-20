"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase'
import { MotivationWidget } from '@/components/shared/motivation-widget'
import { NewsWidget } from '@/components/shared/news-widget'
import { Timer, BookOpen, BarChart3, Clock, Target, Award, TrendingUp, Newspaper } from 'lucide-react'

interface DashboardStats {
  totalStudyTime: number
  sessionCount: number
  studyAreas: number
  currentStreak: number
  longestStreak: number
  todayStudyTime: number
}

interface StudySession {
  duration: number
  created_at: string
  session_type: 'focus' | 'break'
}

export default function DashboardPage() {
  const { user } = useUserStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudyTime: 0,
    sessionCount: 0,
    studyAreas: 0,
    currentStreak: 0,
    longestStreak: 0,
    todayStudyTime: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const calculateStreak = (sessions: StudySession[]) => {
    if (!sessions || sessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0, todayStudyTime: 0 }
    }

    // Group sessions by date (only focus sessions)
    const focusSessions = sessions.filter(session => session.session_type === 'focus')
    const sessionsByDate = new Map()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let todayStudyTime = 0

    focusSessions.forEach(session => {
      const sessionDate = new Date(session.created_at)
      sessionDate.setHours(0, 0, 0, 0)
      const dateKey = sessionDate.toISOString().split('T')[0]
      
      if (!sessionsByDate.has(dateKey)) {
        sessionsByDate.set(dateKey, 0)
      }
      sessionsByDate.set(dateKey, sessionsByDate.get(dateKey) + session.duration)
      
      // Calculate today's study time
      if (sessionDate.getTime() === today.getTime()) {
        todayStudyTime += session.duration
      }
    })

    // Sort dates descending
    const sortedDates = Array.from(sessionsByDate.keys()).sort((a, b) => b.localeCompare(a))
    
    if (sortedDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, todayStudyTime: 0 }
    }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    // Check if user studied today or yesterday to start counting
    const todayStr = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    let startCounting = false
    if (sortedDates.includes(todayStr)) {
      startCounting = true
      currentStreak = 1
    } else if (sortedDates.includes(yesterdayStr)) {
      startCounting = true
    }

    // Calculate current streak
    if (startCounting) {
      let currentDate = new Date(sortedDates.includes(todayStr) ? todayStr : yesterdayStr)
      let dateIndex = sortedDates.findIndex(date => date === (sortedDates.includes(todayStr) ? todayStr : yesterdayStr))
      
      if (sortedDates.includes(todayStr)) {
        currentStreak = 1
        dateIndex++
      }
      
      for (let i = dateIndex; i < sortedDates.length; i++) {
        const expectedDate = new Date(currentDate)
        expectedDate.setDate(expectedDate.getDate() - 1)
        const expectedDateStr = expectedDate.toISOString().split('T')[0]
        
        if (sortedDates[i] === expectedDateStr) {
          currentStreak++
          currentDate = expectedDate
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    tempStreak = 1
    longestStreak = 1
    
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = new Date(sortedDates[i])
      const nextDate = new Date(sortedDates[i + 1])
      const diffTime = currentDate.getTime() - nextDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    return {
      currentStreak,
      longestStreak,
      todayStudyTime
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        // Fetch study sessions with created_at
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('duration, created_at, session_type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        // Fetch study areas
        const { data: areas } = await supabase
          .from('study_areas')
          .select('id')
          .eq('user_id', user.id)

        const totalStudyTime = sessions?.reduce((total, session) => 
          session.session_type === 'focus' ? total + session.duration : total, 0) || 0
        const sessionCount = sessions?.filter(session => session.session_type === 'focus').length || 0
        const studyAreas = areas?.length || 0

        // Calculate streak data
        const streakData = calculateStreak(sessions || [])

        setStats({
          totalStudyTime,
          sessionCount,
          studyAreas,
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          todayStudyTime: streakData.todayStudyTime
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '😴'
    if (streak < 3) return '🌱'
    if (streak < 7) return '🔥'
    if (streak < 14) return '💪'
    if (streak < 30) return '🚀'
    if (streak < 60) return '⭐'
    return '👑'
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your journey!'
    if (streak === 1) return 'Great start!'
    if (streak < 3) return 'Building momentum!'
    if (streak < 7) return 'On fire!'
    if (streak < 14) return 'Unstoppable!'
    if (streak < 30) return 'Study champion!'
    if (streak < 60) return 'Study legend!'
    return 'Study master!'
  }

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-muted-foreground'
    if (streak < 3) return 'text-green-600'
    if (streak < 7) return 'text-orange-600'
    if (streak < 14) return 'text-red-600'
    if (streak < 30) return 'text-purple-600'
    if (streak < 60) return 'text-blue-600'
    return 'text-yellow-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.user_metadata?.full_name || 'Developer'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Study Time</p>
              <p className="text-2xl font-bold">{formatTime(stats.totalStudyTime)}</p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Study Sessions</p>
              <p className="text-2xl font-bold">{stats.sessionCount}</p>
            </div>
            <Timer className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Study Areas</p>
              <p className="text-2xl font-bold">{stats.studyAreas}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today&apos;s Study Time</p>
              <p className="text-2xl font-bold">{formatTime(stats.todayStudyTime)}</p>
              {stats.todayStudyTime > 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  Great job today! 🎯
                </p>
              )}
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/timer" className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <Timer className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">Start Study Session</p>
                <p className="text-sm text-muted-foreground">Begin a focused study session</p>
              </div>
            </Link>

            <Link href="/dashboard/study-areas" className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <BookOpen className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">Manage Study Areas</p>
                <p className="text-sm text-muted-foreground">Add or edit your subjects</p>
              </div>
            </Link>

            <Link href="/dashboard/analytics" className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">View Analytics</p>
                <p className="text-sm text-muted-foreground">Check your progress</p>
              </div>
            </Link>

            <Link href="/dashboard/spaced-repetition" className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <Target className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">Spaced Repetition</p>
                <p className="text-sm text-muted-foreground">Review your study notes</p>
              </div>
            </Link>

            <Link href="/dashboard/news" className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <Newspaper className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">Tech News</p>
                <p className="text-sm text-muted-foreground">Latest articles & insights</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Motivation Widget */}
        <div>
          <MotivationWidget 
            studyStreak={stats.currentStreak}
            totalSessions={stats.sessionCount}
            currentSessionType="idle"
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {stats.sessionCount === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No study sessions yet. Start your first session to see your activity here!</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Recent sessions will appear here...</p>
          )}
        </div>

        {/* Tech News Widget */}
        <div>
          <NewsWidget maxArticles={10} showFilters={false} />
        </div>
      </div>
       {/* Streak Section */}
      <div className="bg-gradient-to-r from-sky-200 via-emerald-100 to-amber-50 dark:from-sky-900/20 dark:via-emerald-900/20 dark:to-amber-900/20 rounded-lg border p-6">
        <div className="flex items-ce</div>nter justify-between mb-4">
          <h2 className="text-xl font-bold">Study Streak 🔥</h2>
          {stats.longestStreak > 0 && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Personal Best</p>
              <p className="text-lg font-bold text-primary">{stats.longestStreak} days</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Streak Display */}
          <div className="bg-card rounded-lg border p-6">
            <div className="text-center">
              <div className="text-6xl mb-2">{getStreakEmoji(stats.currentStreak)}</div>
              <p className={`text-4xl font-bold mb-2 ${getStreakColor(stats.currentStreak)}`}>
                {stats.currentStreak}
              </p>
              <p className="text-lg text-muted-foreground mb-1">
                {stats.currentStreak === 1 ? 'day' : 'days'}
              </p>
              <p className={`text-sm font-medium ${getStreakColor(stats.currentStreak)}`}>
                {getStreakMessage(stats.currentStreak)}
              </p>
            </div>
            
            {/* Progress to next milestone */}
            {stats.currentStreak > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Next milestone</span>
                  <span>
                    {stats.currentStreak}/{stats.currentStreak < 3 ? 3 : stats.currentStreak < 7 ? 7 : stats.currentStreak < 14 ? 14 : stats.currentStreak < 30 ? 30 : stats.currentStreak < 60 ? 60 : 100} days
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      stats.currentStreak < 3 ? 'bg-green-500' :
                      stats.currentStreak < 7 ? 'bg-orange-500' :
                      stats.currentStreak < 14 ? 'bg-red-500' :
                      stats.currentStreak < 30 ? 'bg-purple-500' :
                      stats.currentStreak < 60 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (stats.currentStreak / (
                        stats.currentStreak < 3 ? 3 :
                        stats.currentStreak < 7 ? 7 :
                        stats.currentStreak < 14 ? 14 :
                        stats.currentStreak < 30 ? 30 :
                        stats.currentStreak < 60 ? 60 : 100
                      )) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Achievements
            </h3>
            <div className="space-y-3">
              {[
                { days: 1, emoji: '🌱', name: 'First Step', achieved: stats.longestStreak >= 1 },
                { days: 3, emoji: '🔥', name: 'Getting Hot', achieved: stats.longestStreak >= 3 },
                { days: 7, emoji: '💪', name: 'Week Warrior', achieved: stats.longestStreak >= 7 },
                { days: 14, emoji: '🚀', name: 'Two Week Titan', achieved: stats.longestStreak >= 14 },
                { days: 30, emoji: '⭐', name: 'Month Master', achieved: stats.longestStreak >= 30 },
                { days: 60, emoji: '👑', name: 'Study Royalty', achieved: stats.longestStreak >= 60 }
              ].map((achievement) => (
                <div key={achievement.days} className={`flex items-center space-x-3 p-2 rounded-lg ${achievement.achieved ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'}`}>
                  <span className={`text-2xl ${achievement.achieved ? '' : 'grayscale'}`}>
                    {achievement.emoji}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${achievement.achieved ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
                      {achievement.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.days} day{achievement.days > 1 ? 's' : ''} streak
                    </p>
                  </div>
                  {achievement.achieved && (
                    <div className="text-green-600">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Motivational message */}
        {stats.currentStreak === 0 && (
          <div className="mt-6 text-center p-4 bg-card rounded-lg border border-dashed">
            <p className="text-muted-foreground">
              🚀 Start studying today to begin your streak journey! Even 5 minutes counts.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
