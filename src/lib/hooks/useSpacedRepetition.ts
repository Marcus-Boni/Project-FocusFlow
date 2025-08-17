"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import { toastUtils } from './useToast'

// Spaced Repetition intervals (in days) - based on SuperMemo SM-2 algorithm
const REPETITION_INTERVALS = [1, 3, 7, 14, 30, 90, 180, 365]

export interface StudyNote {
  id: string
  user_id: string
  study_area_id: string
  title: string
  content: string
  difficulty: 1 | 2 | 3 | 4 | 5 // 1 = very easy, 5 = very hard
  repetition_count: number
  next_review_date: string
  last_reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface ReviewSession {
  id: string
  user_id: string
  note_id: string
  difficulty_rating: 1 | 2 | 3 | 4 | 5
  time_spent: number // in seconds
  created_at: string
}

export function useSpacedRepetition() {
  const { user } = useUserStore()
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [dueNotes, setDueNotes] = useState<StudyNote[]>([])
  const [isLoading, setIsLoading] = useState(true)

  
  const fetchNotes = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
      .from('study_notes')
      .select(`
          *,
          study_areas(name, color)
        `)
        .eq('user_id', user.id)
        .order('next_review_date', { ascending: true })

        if (error) {
        console.error('Error fetching notes:', error)
      } else {
        setNotes(data || [])
        
        // Filter notes that are due for review
        const now = new Date().toISOString()
        const due = (data || []).filter(note => note.next_review_date <= now)
        setDueNotes(due)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [fetchNotes, user])

  const createNote = async (noteData: Omit<StudyNote, 'id' | 'user_id' | 'repetition_count' | 'next_review_date' | 'created_at' | 'updated_at'>) => {
    if (!user) return null

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + REPETITION_INTERVALS[0])

    try {
      const { data, error } = await supabase
        .from('study_notes')
        .insert([{
          ...noteData,
          user_id: user.id,
          repetition_count: 0,
          next_review_date: nextReviewDate.toISOString()
        }])
        .select()

      if (!error && data) {
        const newNote = data[0]
        setNotes(prev => [newNote, ...prev])
        toastUtils.spacedRepetition.noteCreated()
        return newNote
      } else {
        toastUtils.data.error()
      }
    } catch (error) {
      console.error('Error creating note:', error)
      toastUtils.data.error()
    }
    return null
  }

  const reviewNote = async (noteId: string, difficultyRating: 1 | 2 | 3 | 4 | 5, timeSpent: number) => {
    if (!user) return

    const note = notes.find(n => n.id === noteId)
    if (!note) return

    try {
      // Calculate next review date based on difficulty and repetition count
      const nextInterval = calculateNextInterval(note.repetition_count, difficultyRating)
      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval)

      // Update note
      const { error: noteError } = await supabase
        .from('study_notes')
        .update({
          repetition_count: note.repetition_count + 1,
          next_review_date: nextReviewDate.toISOString(),
          last_reviewed_at: new Date().toISOString(),
          difficulty: difficultyRating
        })
        .eq('id', noteId)

      // Record review session
      const { error: sessionError } = await supabase
        .from('review_sessions')
        .insert([{
          user_id: user.id,
          note_id: noteId,
          difficulty_rating: difficultyRating,
          time_spent: timeSpent
        }])

      if (!noteError && !sessionError) {
        // Update local state
        setNotes(prev => prev.map(n => 
          n.id === noteId 
            ? {
                ...n,
                repetition_count: n.repetition_count + 1,
                next_review_date: nextReviewDate.toISOString(),
                last_reviewed_at: new Date().toISOString(),
                difficulty: difficultyRating
              }
            : n
        ))

        // Remove from due notes
        setDueNotes(prev => prev.filter(n => n.id !== noteId))
      }
    } catch (error) {
      console.error('Error reviewing note:', error)
    }
  }

  const calculateNextInterval = (repetitionCount: number, difficulty: 1 | 2 | 3 | 4 | 5): number => {
    // If the note was difficult (4-5), reduce the interval
    if (difficulty >= 4) {
      return Math.max(1, Math.floor(REPETITION_INTERVALS[Math.min(repetitionCount, REPETITION_INTERVALS.length - 1)] * 0.5))
    }
    
    // If the note was easy (1-2), increase the interval
    if (difficulty <= 2) {
      return Math.floor(REPETITION_INTERVALS[Math.min(repetitionCount + 1, REPETITION_INTERVALS.length - 1)] * 1.3)
    }
    
    // Normal difficulty (3), use standard interval
    return REPETITION_INTERVALS[Math.min(repetitionCount, REPETITION_INTERVALS.length - 1)]
  }

  const getReviewStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const dueToday = dueNotes.filter(note => 
      note.next_review_date.split('T')[0] <= today
    ).length

    const totalNotes = notes.length
    const reviewedCount = notes.filter(note => note.repetition_count > 0).length
    const averageDifficulty = notes.length > 0 
      ? notes.reduce((sum, note) => sum + note.difficulty, 0) / notes.length 
      : 0

    return {
      dueToday,
      totalNotes,
      reviewedCount,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      retentionRate: totalNotes > 0 ? Math.round((reviewedCount / totalNotes) * 100) : 0
    }
  }

  return {
    notes,
    dueNotes,
    isLoading,
    createNote,
    reviewNote,
    getReviewStats,
    refreshNotes: fetchNotes
  }
}

// Helper hook for active recall practice
export function useActiveRecall() {
  const [isRevealed, setIsRevealed] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startRecall = () => {
    setIsRevealed(false)
    setStartTime(Date.now())
  }

  const revealAnswer = () => {
    setIsRevealed(true)
  }

  const getTimeSpent = (): number => {
    return startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  }

  const reset = () => {
    setIsRevealed(false)
    setStartTime(null)
  }

  return {
    isRevealed,
    timeSpent: getTimeSpent(),
    startRecall,
    revealAnswer,
    reset
  }
}
