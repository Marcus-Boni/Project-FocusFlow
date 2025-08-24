import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface StudyArea {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
}

export interface StudySession {
  id: string
  user_id: string
  study_area_id: string
  duration: number // in minutes
  notes?: string
  created_at: string
  session_type: 'focus' | 'break'
  pomodoro_cycle: number
}

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  avatar_url?: string
  full_name?: string
}

// Re-export enhanced note types
export type { 
  StudyNote, 
  NoteCategory, 
  NoteBlock, 
  NoteRelationship, 
  ReviewAnalytics, 
  StudyGoal,
  StudyNoteWithRelations,
  NoteTakingTemplate
} from '@/types/notes'
