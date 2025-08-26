// Página principal do sistema de metas baseado em neurociência
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, Brain, TrendingUp, Clock } from 'lucide-react'
import { useGoals } from '@/hooks/useGoals'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalCreateModal } from '@/components/goals/GoalCreateModal'
import { GoalInsightsPanel } from '@/components/goals/GoalInsightsPanel'
import { GoalStats } from '@/components/goals/GoalStats'
import { NotificationSystem } from '@/components/goals/NotificationSystem'
import type { Goal, GoalTimeframe, NeuroGoalAnalysis, GoalProgress } from '@/types/goals'

export default function GoalsPage() {
  const { goals, isLoading, refetch, analyzeGoalNeuroscience, calculateGoalProgress } = useGoals()
  const [analysisData, setAnalysisData] = useState<Array<{
    goal: Goal
    analysis: NeuroGoalAnalysis
    progress: GoalProgress
  }>>([])
  const [activeTab, setActiveTab] = useState<GoalTimeframe | 'all'>('all')
  const [refreshKey, setRefreshKey] = useState(0) // Força re-render

  // Carregar dados iniciais
  useEffect(() => {
    refetch()
  }, [refetch])

  // Sistema de eventos para atualização em tempo real
  useEffect(() => {
    const handleGoalUpdate = () => {
      setRefreshKey(prev => prev + 1)
      refetch()
    }

    const handleGoalDeleted = () => {
      setRefreshKey(prev => prev + 1)
      refetch()
    }

    // Escuta eventos customizados
    window.addEventListener('goalUpdated', handleGoalUpdate)
    window.addEventListener('goalDeleted', handleGoalDeleted)

    return () => {
      window.removeEventListener('goalUpdated', handleGoalUpdate)
      window.removeEventListener('goalDeleted', handleGoalDeleted)
    }
  }, [refetch])

  // Análise neurocientífica das metas
  useEffect(() => {
    const loadAnalysis = async () => {
      if (goals.length > 0) {
        const analysisPromises = goals.map(async (goal) => {
          const analysis = await analyzeGoalNeuroscience(goal)
          const progress = calculateGoalProgress(goal)
          return { goal, analysis, progress }
        })
        
        const results = await Promise.all(analysisPromises)
        setAnalysisData(results)
      }
    }

    loadAnalysis()
  }, [goals, analyzeGoalNeuroscience, calculateGoalProgress])

  // Filtrar metas por timeframe
  const filteredGoals = activeTab === 'all' 
    ? goals 
    : goals.filter(goal => goal.timeframe === activeTab)

  // Separar metas por status
  const activeGoals = filteredGoals.filter(goal => goal.status !== 'completed')
  const completedGoals = filteredGoals.filter(goal => goal.status === 'completed')

  const filteredAnalysisData = activeTab === 'all'
    ? analysisData
    : analysisData.filter(data => data.goal.timeframe === activeTab)

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-muted-foreground">Carregando suas metas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-purple-600" />
            Mural de Metas Inteligentes
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema baseado em neurociência para maximizar seu potencial de conquista
          </p>
        </div>
        
        <GoalCreateModal 
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          }
          onGoalCreated={() => refetch()}
        />
      </div>

      {/* Estatísticas */}
      {goals.length > 0 && (
        <GoalStats goals={goals} />
      )}

      {goals.length === 0 ? (
        // Estado vazio
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma meta criada ainda</h3>
              <p className="text-muted-foreground mb-6">
                Comece criando sua primeira meta usando templates baseados em neurociência 
                para maximizar suas chances de sucesso.
              </p>
              <GoalCreateModal 
                trigger={
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Primeira Meta
                  </Button>
                }
                onGoalCreated={() => refetch()}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        // Conteúdo principal
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GoalTimeframe | 'all')}>
          {/* Navegação por timeframe */}
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Todas
              <Badge variant="outline" className="ml-1">
                {goals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Diário
              <Badge variant="outline" className="ml-1">
                {goals.filter(g => g.timeframe === 'daily').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="weekly">
              Semanal
              <Badge variant="outline" className="ml-1">
                {goals.filter(g => g.timeframe === 'weekly').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="monthly">
              Mensal
              <Badge variant="outline" className="ml-1">
                {goals.filter(g => g.timeframe === 'monthly').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="quarterly">
              Trimestral
              <Badge variant="outline" className="ml-1">
                {goals.filter(g => g.timeframe === 'quarterly').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="yearly">
              Anual
              <Badge variant="outline" className="ml-1">
                {goals.filter(g => g.timeframe === 'yearly').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das abas */}
          {(['all', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map((timeframe) => (
            <TabsContent key={timeframe} value={timeframe} className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Lista de Metas */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Metas Ativas */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Metas Ativas</h3>
                      <Badge variant="outline">
                        {activeGoals.length} {activeGoals.length === 1 ? 'meta' : 'metas'}
                      </Badge>
                    </div>
                    
                    {activeGoals.length === 0 ? (
                      <Card className="text-center py-8">
                        <CardContent>
                          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            Nenhuma meta ativa {timeframe === 'all' ? '' : 
                              timeframe === 'daily' ? 'diária ' :
                              timeframe === 'weekly' ? 'semanal ' :
                              timeframe === 'monthly' ? 'mensal ' :
                              timeframe === 'quarterly' ? 'trimestral ' : 'anual '} 
                            encontrada
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      activeGoals.map((goal) => (
                        <GoalCard
                          key={`${goal.id}-${refreshKey}`}
                          goal={goal}
                        />
                      ))
                    )}
                  </div>

                  {/* Metas Concluídas */}
                  {completedGoals.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                          ✅ Metas Concluídas
                        </h3>
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
                          {completedGoals.length} {completedGoals.length === 1 ? 'concluída' : 'concluídas'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {completedGoals.map((goal) => (
                          <GoalCard
                            key={`${goal.id}-${refreshKey}`}
                            goal={goal}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Painel de Insights */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Insights Neurocientíficos
                      </CardTitle>
                      <CardDescription>
                        Análise baseada em pesquisas sobre motivação e conquista de objetivos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredAnalysisData.length > 0 ? (
                        <GoalInsightsPanel insights={filteredAnalysisData} />
                      ) : (
                        <div className="text-center py-4">
                          <Brain className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Crie metas para ver insights personalizados
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Sistema de Notificações */}
      <NotificationSystem />
    </div>
  )
}
