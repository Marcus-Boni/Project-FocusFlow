import Link from "next/link";
import { Timer, Brain, Target, BarChart3, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">FocusFlow</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Login
          </Link>
          <Link href="/auth/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
          Built for Engineers & Tech Students
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Master Your Learning with
          <br />
          <span className="text-primary">FocusFlow</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A modern study tracker that combines neuroscience-based techniques with 
          gamification to help you build consistent study habits and maximize retention.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
            Start Studying Smarter
          </Link>
          <Link href="/demo" className="px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors font-medium">
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why FocusFlow?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for developers and tech students who need a structured, 
            science-backed approach to learning complex topics efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Timer className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Pomodoro Timer</h3>
            <p className="text-sm text-muted-foreground">
              Built-in focus/break cycles optimized for deep learning and retention
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Brain className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Neuroscience-Based</h3>
            <p className="text-sm text-muted-foreground">
              Incorporates spaced repetition and active recall techniques for maximum retention
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Target className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Goal Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Set and track study goals across different subjects and technologies
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <BarChart3 className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Progress Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Visual insights into your study patterns and progress over time
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Users className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Study Communities</h3>
            <p className="text-sm text-muted-foreground">
              Connect with other developers and share your learning journey
            </p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <Zap className="w-8 h-8 text-primary mb-2" />
            <h3 className="text-lg font-semibold mb-2">Motivation System</h3>
            <p className="text-sm text-muted-foreground">
              Gamified experience with streaks, achievements, and daily motivation
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-lg border bg-primary text-primary-foreground shadow-sm p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h3>
          <p className="mb-6 opacity-90">
            Join thousands of developers who have already improved their study habits with FocusFlow.
          </p>
          <Link href="/auth/register" className="inline-flex px-6 py-3 bg-background text-foreground rounded-md hover:bg-background/90 transition-colors font-medium">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 FocusFlow. Built for the developer community.</p>
        </div>
      </footer>
    </div>
  );
}
