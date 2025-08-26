"use client"

import { useState, useEffect } from 'react'
import { Timer, Brain, Target, BarChart3, Zap, ArrowRight, Play, CheckCircle, Clock, TrendingUp, BookOpen, X, Calendar, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DemoOnboarding } from '@/components/shared/demo-onboarding'
import Link from 'next/link'

// Mock data para demonstração
const mockStats = {
  totalTime: 1240, // em minutos
  focusTime: 980,
  sessions: 47,
  studyDays: 12,
  currentStreak: 5,
  averageSession: 26
}

const mockGoals = [
  {
    id: '1',
    title: 'Master React Hooks',
    description: 'Deep dive into useState, useEffect, useContext and custom hooks',
    progress: 75,
    category: 'Frontend',
    deadline: '2025-09-15',
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'Learn TypeScript Advanced',
    description: 'Generic types, conditional types, and utility types',
    progress: 45,
    category: 'Language',
    deadline: '2025-09-30',
    color: '#10b981'
  }
]

const mockStudyAreas = [
  { id: '1', name: 'React & Frontend', color: '#3b82f6', description: 'Modern frontend development' },
  { id: '2', name: 'TypeScript', color: '#10b981', description: 'Type-safe JavaScript' },
  { id: '3', name: 'Node.js & Backend', color: '#f59e0b', description: 'Server-side development' }
]

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const formatTimerTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

interface DemoTimerProps {
  isActive: boolean
  timeRemaining: number
  sessionType: 'focus' | 'break'
  onStart: () => void
  onPause: () => void
  onStop: () => void
}

function DemoTimer({ isActive, timeRemaining, sessionType, onStart, onPause, onStop }: DemoTimerProps) {
  const totalTime = sessionType === 'focus' ? 25 * 60 : 5 * 60
  const progress = ((totalTime - timeRemaining) / totalTime) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          {sessionType === 'focus' ? '🎯 Focus Session' : '☕ Break Time'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="text-6xl font-mono font-bold">
          {formatTimerTime(timeRemaining)}
        </div>
        
        <div className="w-full bg-muted rounded-full h-2 max-w-md mx-auto">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center gap-3">
          {!isActive ? (
            <Button onClick={onStart} className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Start</span>
            </Button>
          ) : (
            <>
              <Button onClick={onPause} variant="outline" className="flex items-center space-x-2">
                <Timer className="w-4 h-4" />
                <span>Pause</span>
              </Button>
              <Button onClick={onStop} variant="outline" className="flex items-center space-x-2">
                <X className="w-4 h-4" />
                <span>Stop</span>
              </Button>
            </>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Study Area: <Badge variant="secondary">React & Frontend</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DemoPage() {
  const [currentTab, setCurrentTab] = useState('timer')
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(25 * 60) // 25 minutos
  const [sessionType] = useState<'focus' | 'break'>('focus')
  const [showOnboarding, setShowOnboarding] = useState(true)

  // Simulação do timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsTimerActive(false)
            return sessionType === 'focus' ? 5 * 60 : 25 * 60 // Switch to break or focus
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerActive, timeRemaining, sessionType])

  const handleTimerStart = () => {
    setIsTimerActive(true)
  }

  const handleTimerPause = () => {
    setIsTimerActive(false)
  }

  const handleTimerStop = () => {
    setIsTimerActive(false)
    setTimeRemaining(sessionType === 'focus' ? 25 * 60 : 5 * 60)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FocusFlow Demo</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setShowOnboarding(true)}
              className="flex items-center space-x-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            🚀 Interactive Demo - Try it yourself!
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Experience FocusFlow in Action
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore all the features that make FocusFlow the perfect study companion for developers and tech students.
          </p>
        </div>

        {/* Interactive Demo Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timer" className="flex items-center space-x-2">
              <Timer className="w-4 h-4" />
              <span>Timer</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Goals</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Features</span>
            </TabsTrigger>
          </TabsList>

          {/* Timer Demo */}
          <TabsContent value="timer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Pomodoro Timer</h2>
                <p className="text-muted-foreground mb-6">
                  Experience our neuroscience-based timer with focus/break cycles optimized for maximum retention.
                </p>
                
                <DemoTimer
                  isActive={isTimerActive}
                  timeRemaining={timeRemaining}
                  sessionType={sessionType}
                  onStart={handleTimerStart}
                  onPause={handleTimerPause}
                  onStop={handleTimerStop}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Study Areas</h3>
                <div className="space-y-2">
                  {mockStudyAreas.map((area) => (
                    <Card key={area.id} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <div>
                          <p className="font-medium">{area.name}</p>
                          <p className="text-sm text-muted-foreground">{area.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Session Notes</h4>
                  <div className="bg-muted p-3 rounded text-sm">
                    <p>Learning about React hooks - useState and useEffect patterns...</p>
                    <p className="text-muted-foreground mt-2">Auto-saved during session</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Demo */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Progress Analytics</h2>
              <p className="text-muted-foreground mb-6">
                Track your learning patterns and optimize your study habits with detailed insights.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                    <p className="text-2xl font-bold">{formatTime(mockStats.totalTime)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Focus Sessions</p>
                    <p className="text-2xl font-bold">{mockStats.sessions}</p>
                  </div>
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Study Streak</p>
                    <p className="text-2xl font-bold">{mockStats.currentStreak} days</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                    <p className="text-2xl font-bold">{formatTime(mockStats.averageSession)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
              </Card>
            </div>

            {/* Charts Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="w-8 text-sm">{day}</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${Math.random() * 80 + 20}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {Math.floor(Math.random() * 4 + 1)}h
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Study Areas Distribution</h3>
                <div className="space-y-4">
                  {mockStudyAreas.map((area) => (
                    <div key={area.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: area.color }}
                          />
                          <span className="text-sm font-medium">{area.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(Math.floor(Math.random() * 300 + 100))}
                        </span>
                      </div>
                      <Progress value={Math.random() * 60 + 20} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Demo */}
          <TabsContent value="goals" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Goal Tracking</h2>
              <p className="text-muted-foreground mb-6">
                Set specific learning objectives and track your progress with milestones and deadlines.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockGoals.map((goal) => (
                <Card key={goal.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge 
                        variant="secondary"
                        style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                      >
                        {goal.category}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">On Track</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Milestones: 3/4 completed • Next: Practice custom hooks
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Goal Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">85%</div>
                  <div className="text-sm text-muted-foreground">Goals on track</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">12</div>
                  <div className="text-sm text-muted-foreground">Completed this month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">4.2h</div>
                  <div className="text-sm text-muted-foreground">Avg time per goal</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Features Demo */}
          <TabsContent value="features" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Complete Feature Set</h2>
              <p className="text-muted-foreground mb-6">
                Discover all the tools designed to help you become a more effective learner.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Cards */}
              <Card className="p-6">
                <Timer className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Smart Timer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adaptive Pomodoro technique with customizable focus/break intervals
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Customizable intervals</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Auto-session tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Background notifications</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Brain className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Neuroscience-Based</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Methods backed by cognitive science research for optimal learning
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Spaced repetition</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Active recall techniques</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Interleaving practice</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <BookOpen className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Smart Notes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Integrated note-taking with automatic session linking
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Session-linked notes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Auto-save functionality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Study area organization</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <BarChart3 className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Detailed insights into your learning patterns and productivity
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Time tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Progress visualization</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Performance trends</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Target className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Goal Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Set, track, and achieve your learning objectives systematically
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Milestone tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Deadline management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Progress insights</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Zap className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Motivation System</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gamified experience to maintain consistent study habits
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Study streaks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Achievement badges</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>Daily motivation</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Card className="bg-primary text-primary-foreground p-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="mb-6 opacity-90 max-w-2xl mx-auto">
              Join thousands of developers who have already improved their study habits and accelerated their learning with FocusFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register" className="flex items-center space-x-2">
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/">Learn More</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Demo Onboarding */}
      <DemoOnboarding
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  )
}
