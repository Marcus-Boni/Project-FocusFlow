"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase'
import { MotivationWidget } from '@/components/shared/motivation-widget'
import { RSSFeedWidget } from '@/components/shared/rss-feed-widget'
import { Timer, BookOpen, BarChart3, Trophy, Clock, Target } from 'lucide-react'

interface DashboardStats {
  totalStudyTime: number
  sessionCount: number
  studyAreas: number
  currentStreak: number
}

export default function DashboardPage() {
  const { user } = useUserStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudyTime: 0,
    sessionCount: 0,
    studyAreas: 0,
    currentStreak: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        // Fetch study sessions
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)

        // Fetch study areas
        const { data: areas } = await supabase
          .from('study_areas')
          .select('id')
          .eq('user_id', user.id)

        const totalStudyTime = sessions?.reduce((total, session) => total + session.duration, 0) || 0
        const sessionCount = sessions?.length || 0
        const studyAreas = areas?.length || 0

        setStats({
          totalStudyTime,
          sessionCount,
          studyAreas,
          currentStreak: 0 // We'll implement streak calculation later
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
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{stats.currentStreak} days</p>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
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

        {/* RSS Feed Widget */}
        <div>
          <RSSFeedWidget />
        </div>
      </div>
    </div>
  )
}
