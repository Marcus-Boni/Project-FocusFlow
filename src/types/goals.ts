// Tipos para o sistema de metas baseado em neurociência

export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type GoalCategory = 'learning' | 'skill' | 'project' | 'habit' | 'career'
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical'
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled'

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category: GoalCategory
  priority: GoalPriority
  timeframe: GoalTimeframe
  status: GoalStatus
  
  // Metas SMART
  specific_details: string
  measurable_metrics: string
  target_value: number
  current_value: number
  target_date: string
  
  // Subdivisão baseada em neurociência
  milestones: GoalMilestone[]
  
  // Gamificação e motivação
  reward_description?: string
  motivation_reason: string
  
  // Conexão com identidade (baseado na pesquisa)
  identity_connection: string
  
  // Metadados
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface GoalMilestone {
  id: string
  goal_id: string
  title: string
  description?: string
  target_value: number
  current_value: number
  order_index: number
  is_completed: boolean
  completed_at?: string
  created_at: string
}

export interface GoalProgress {
  goal_id: string
  progress_percentage: number
  milestones_completed: number
  total_milestones: number
  days_since_created: number
  days_until_deadline: number
  is_on_track: boolean
  completion_velocity: number // progresso por dia
}

export interface GoalCategoryConfig {
  id: GoalCategory
  name: string
  description: string
  color: string
  icon: string
}

export interface GoalInsight {
  type: 'motivation' | 'progress' | 'strategy' | 'warning'
  title: string
  description: string
  actionable_tip?: string
  neuroscience_basis?: string
}

// Tipos para análise neurocientífica
export interface NeuroGoalAnalysis {
  goal_id: string
  motivation_score: number // 1-10 baseado na conexão com identidade
  complexity_score: number // 1-10 baseado na subdivisão
  achievability_score: number // 1-10 baseado no timeframe e valor
  dopamine_potential: number // frequência de recompensas pequenas
  insights: GoalInsight[]
}
