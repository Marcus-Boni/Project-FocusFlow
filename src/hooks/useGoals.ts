// Hook para gerenciamento de metas baseado em neurociência
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import type { Goal, GoalMilestone, GoalProgress, NeuroGoalAnalysis, GoalInsight, GoalTimeframe, GoalStatus } from '@/types/goals'

interface CreateGoalData extends Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'milestones'> {
  milestones?: Omit<GoalMilestone, 'id' | 'goal_id' | 'order_index' | 'current_value' | 'is_completed' | 'completed_at' | 'created_at'>[]
}

export const useGoals = () => {
  const { user } = useUserStore()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar metas do usuário
  const fetchGoals = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Primeiro buscar as metas
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (goalsError) throw goalsError

      // Depois buscar os milestones para cada meta
      const goalsWithMilestones = await Promise.all(
        (goalsData || []).map(async (goal) => {
          const { data: milestonesData } = await supabase
            .from('goal_milestones')
            .select('*')
            .eq('goal_id', goal.id)
            .order('order_index', { ascending: true })

          return {
            ...goal,
            milestones: milestonesData || []
          }
        })
      )

      setGoals(goalsWithMilestones)
    } catch (err) {
      console.error('Error fetching goals:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar metas')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Criar nova meta
  const createGoal = useCallback(async (goalData: CreateGoalData) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      console.log('Tentando criar meta com dados:', goalData)
      
      // Separar milestones dos dados da meta
      const { milestones, ...goalDataWithoutMilestones } = goalData
      
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalDataWithoutMilestones,
          user_id: user.id,
          current_value: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Erro do Supabase ao criar meta:', error)
        
        // Verificar tipos específicos de erro
        if (error.code === '42P01') {
          throw new Error('Tabela "goals" não existe. Execute o schema SQL no Supabase primeiro.')
        }
        
        if (error.code === '23505') {
          throw new Error('Já existe uma meta com essas características.')
        }
        
        if (error.code === '23502') {
          throw new Error(`Campo obrigatório não preenchido: ${error.details || error.message}`)
        }
        
        throw new Error(`Erro ao criar meta: ${error.message}`)
      }

      // Criar marcos se fornecidos
      if (milestones && milestones.length > 0) {
        const milestonesData = milestones.map((milestone, index) => ({
          ...milestone,
          goal_id: data.id,
          order_index: index,
          current_value: 0,
          is_completed: false
        }))

        const { error: milestonesError } = await supabase
          .from('goal_milestones')
          .insert(milestonesData)

        if (milestonesError) {
          console.error('Erro ao criar marcos:', milestonesError)
          throw new Error(`Erro ao criar marcos: ${milestonesError.message}`)
        }
      }

      await fetchGoals()
      return data
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
    }
  }, [user, fetchGoals])

  // Atualizar meta
  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id)

      if (error) throw error

      // Atualiza o estado local imediatamente
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId 
            ? { ...goal, ...updates, updated_at: new Date().toISOString() }
            : goal
        )
      )

      // Força uma nova busca para garantir consistência
      await fetchGoals()
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }, [user, fetchGoals])

  // Atualizar progresso da meta
  const updateGoalProgress = useCallback(async (goalId: string, newValue: number) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) throw new Error('Meta não encontrada')

      const isCompleted = newValue >= goal.target_value
      const updates: Partial<Goal> = {
        current_value: newValue,
        updated_at: new Date().toISOString()
      }

      if (isCompleted && goal.status !== 'completed') {
        updates.status = 'completed'
        updates.completed_at = new Date().toISOString()
      } else if (!isCompleted && goal.status === 'completed') {
        updates.status = 'in_progress'
        updates.completed_at = undefined
      }

      await updateGoal(goalId, updates)
    } catch (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
  }, [user, goals, updateGoal])

  // Atualizar marco
  const updateMilestone = useCallback(async (milestoneId: string, updates: Partial<GoalMilestone>) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      const { error } = await supabase
        .from('goal_milestones')
        .update(updates)
        .eq('id', milestoneId)

      if (error) throw error

      await fetchGoals()
    } catch (error) {
      console.error('Error updating milestone:', error)
      throw error
    }
  }, [user, fetchGoals])

  // Completar marco
  const completeMilestone = useCallback(async (milestoneId: string) => {
    await updateMilestone(milestoneId, {
      is_completed: true,
      completed_at: new Date().toISOString()
    })
  }, [updateMilestone])

  // Deletar meta
  const deleteGoal = useCallback(async (goalId: string) => {
    if (!user) throw new Error('Usuário não autenticado')

    try {
      // Deletar marcos primeiro (devido à foreign key)
      await supabase
        .from('goal_milestones')
        .delete()
        .eq('goal_id', goalId)

      // Deletar meta
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id)

      if (error) throw error

      // Remove do estado local imediatamente
      setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId))

      // Força nova busca para garantir consistência
      await fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }, [user, fetchGoals])

  // Calcular progresso de uma meta
  const calculateGoalProgress = useCallback((goal: Goal): GoalProgress => {
    // Se a meta está completada, progresso é sempre 100%
    if (goal.status === 'completed') {
      const progressPercentage = 100
      
      const milestonesCompleted = goal.milestones?.filter(m => m.is_completed).length || 0
      const totalMilestones = goal.milestones?.length || 0

      const now = new Date()
      const createdAt = new Date(goal.created_at)
      const targetDate = new Date(goal.target_date)
      
      const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const daysUntilDeadline = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      const completionVelocity = daysSinceCreated > 0 ? progressPercentage / daysSinceCreated : 0

      return {
        goal_id: goal.id,
        progress_percentage: progressPercentage,
        milestones_completed: milestonesCompleted,
        total_milestones: totalMilestones,
        days_since_created: daysSinceCreated,
        days_until_deadline: daysUntilDeadline,
        is_on_track: true, // Meta completada está sempre "on track"
        completion_velocity: completionVelocity
      }
    }

    // Para metas não completadas, calcula baseado apenas nos marcos
    const milestonesCompleted = goal.milestones?.filter(m => m.is_completed).length || 0
    const totalMilestones = goal.milestones?.length || 0
    const progressPercentage = totalMilestones > 0 
      ? (milestonesCompleted / totalMilestones) * 100 
      : 0

    const now = new Date()
    const createdAt = new Date(goal.created_at)
    const targetDate = new Date(goal.target_date)
    
    const daysSinceCreated = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const daysUntilDeadline = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    const completionVelocity = daysSinceCreated > 0 ? progressPercentage / daysSinceCreated : 0
    const daysRemaining = Math.max(daysUntilDeadline, 1)
    const requiredVelocity = (100 - progressPercentage) / daysRemaining
    
    const isOnTrack = completionVelocity >= requiredVelocity * 0.8 // 80% da velocidade necessária

    return {
      goal_id: goal.id,
      progress_percentage: progressPercentage,
      milestones_completed: milestonesCompleted,
      total_milestones: totalMilestones,
      days_since_created: daysSinceCreated,
      days_until_deadline: daysUntilDeadline,
      is_on_track: isOnTrack,
      completion_velocity: completionVelocity
    }
  }, [])

  // Análise neurocientífica da meta
  const analyzeGoalNeuroscience = useCallback((goal: Goal): NeuroGoalAnalysis => {
    const insights: GoalInsight[] = []

    // Score de motivação baseado na conexão com identidade
    const motivationScore = goal.identity_connection.length > 20 ? 
      Math.min(10, goal.identity_connection.length / 20 * 10) : 5

    // Score de complexidade baseado na subdivisão
    const complexityScore = goal.milestones && goal.milestones.length > 0 ? 
      Math.min(10, goal.milestones.length * 2) : 3

    // Score de alcançabilidade baseado no timeframe
    const timeframeMultiplier = {
      daily: 8,
      weekly: 7,
      monthly: 6,
      quarterly: 5,
      yearly: 4
    }
    const achievabilityScore = timeframeMultiplier[goal.timeframe] || 5

    // Potencial de dopamina baseado na frequência de marcos
    const milestonesCount = goal.milestones?.length || 0
    const dopaminePotential = milestonesCount > 0 ? Math.min(10, milestonesCount * 1.5) : 2

    // Gerar insights baseados na pesquisa neurocientífica
    if (motivationScore < 6) {
      insights.push({
        type: 'motivation',
        title: 'Conexão com Identidade Fraca',
        description: 'Sua meta precisa estar mais conectada com quem você quer se tornar.',
        actionable_tip: 'Reescreva a razão da meta focando em como ela define sua identidade.',
        neuroscience_basis: 'O córtex pré-frontal ventromedial conecta valor subjetivo com identidade, aumentando a motivação.'
      })
    }

    if (complexityScore < 5) {
      insights.push({
        type: 'strategy',
        title: 'Meta Muito Ampla',
        description: 'Divida sua meta em marcos menores para facilitar o progresso.',
        actionable_tip: 'Crie 3-5 marcos intermediários para esta meta.',
        neuroscience_basis: 'Metas pequenas geram liberação frequente de dopamina, sustentando a motivação.'
      })
    }

    if (dopaminePotential < 5) {
      insights.push({
        type: 'motivation',
        title: 'Baixo Potencial de Recompensa',
        description: 'Adicione mais marcos e recompensas intermediárias.',
        actionable_tip: 'Defina uma recompensa pequena para cada marco alcançado.',
        neuroscience_basis: 'Sistemas de recompensa frequentes mantêm o circuito dopaminérgico ativo.'
      })
    }

    const progress = calculateGoalProgress(goal)
    if (!progress.is_on_track && progress.days_until_deadline < 30) {
      insights.push({
        type: 'warning',
        title: 'Meta Fora do Cronograma',
        description: 'Você precisa acelerar o progresso ou ajustar a data limite.',
        actionable_tip: 'Considere reduzir o escopo ou estender o prazo.',
        neuroscience_basis: 'Metas irrealistas ativam sistemas de stress que prejudicam o desempenho.'
      })
    }

    return {
      goal_id: goal.id,
      motivation_score: motivationScore,
      complexity_score: complexityScore,
      achievability_score: achievabilityScore,
      dopamine_potential: dopaminePotential,
      insights
    }
  }, [calculateGoalProgress])

  // Obter metas por timeframe
  const getGoalsByTimeframe = useCallback((timeframe: GoalTimeframe) => {
    return goals.filter(goal => goal.timeframe === timeframe)
  }, [goals])

  // Obter metas por status
  const getGoalsByStatus = useCallback((status: GoalStatus) => {
    return goals.filter(goal => goal.status === status)
  }, [goals])

  // Estatísticas gerais
  const getGoalStats = useCallback(() => {
    const total = goals.length
    const completed = goals.filter(g => g.status === 'completed').length
    const inProgress = goals.filter(g => g.status === 'in_progress').length
    const notStarted = goals.filter(g => g.status === 'not_started').length

    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate
    }
  }, [goals])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return {
    goals,
    isLoading,
    error,
    
    // Ações CRUD
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
    updateMilestone,
    completeMilestone,
    
    // Análises
    calculateGoalProgress,
    analyzeGoalNeuroscience,
    
    // Filtros
    getGoalsByTimeframe,
    getGoalsByStatus,
    getGoalStats,
    
    // Recarregar
    refetch: fetchGoals
  }
}
