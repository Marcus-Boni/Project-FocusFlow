"use client"

import { useState } from 'react'
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DemoOnboardingProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const onboardingSteps = [
  {
    title: "Welcome to FocusFlow Demo!",
    description: "Let's take a quick tour of the features that will transform your learning experience.",
    content: "This interactive demo shows you everything FocusFlow can do - from smart timers to progress analytics.",
    image: "🚀"
  },
  {
    title: "Smart Pomodoro Timer",
    description: "Experience our neuroscience-based timer that adapts to your learning style.",
    content: "Try the timer in the first tab - it's fully functional! Set focus sessions, take breaks, and track your progress.",
    image: "⏱️"
  },
  {
    title: "Progress Analytics",
    description: "Visualize your learning journey with comprehensive insights.",
    content: "Check out the analytics tab to see how FocusFlow tracks your study patterns and helps optimize your habits.",
    image: "📊"
  },
  {
    title: "Goal Management",
    description: "Set, track, and achieve your learning objectives systematically.",
    content: "View sample goals with progress tracking, milestones, and deadline management in the goals tab.",
    image: "🎯"
  },
  {
    title: "Complete Feature Set",
    description: "Discover all the tools designed for developers and tech students.",
    content: "Explore the features tab to see our complete toolkit including smart notes, motivation system, and more.",
    image: "⚡"
  }
]

export function DemoOnboarding({ isOpen, onClose, onComplete }: DemoOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  if (!isOpen) return null

  const step = onboardingSteps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <CardTitle className="text-center">
            <div className="text-4xl mb-2">{step.image}</div>
            <div>{step.title}</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="font-medium text-primary">{step.description}</p>
            <p className="text-sm text-muted-foreground">{step.content}</p>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip Tour
            </Button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center space-x-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="flex items-center space-x-1"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Get Started</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center text-xs text-muted-foreground">
            {currentStep + 1} of {onboardingSteps.length}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
