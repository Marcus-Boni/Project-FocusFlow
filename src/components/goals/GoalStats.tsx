// Componente de estatísticas das metas
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Brain,
  TrendingUp,
  Zap,
  Award
} from 'lucide-react'
import { Goal } from '@/types/goals'

interface GoalStatsProps {
  goals: Goal[]
}

export function GoalStats({ goals }: GoalStatsProps) {
  // Cálculos das estatísticas
  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    in_progress: goals.filter(g => g.status === 'in_progress').length,
    // Progresso médio baseado apenas em marcos
    average_progress: goals.length > 0 
      ? Math.round(goals.reduce((acc, goal) => {
          // Progresso baseado em marcos
          const milestoneProgress = goal.milestones && goal.milestones.length > 0
            ? (goal.milestones.filter(m => m.is_completed).length / goal.milestones.length) * 100
            : 0

          return acc + milestoneProgress
        }, 0) / goals.length)
      : 0,
    total_milestones: goals.reduce((acc, goal) => acc + (goal.milestones?.length || 0), 0),
    completed_milestones: goals.reduce((acc, goal) => 
      acc + (goal.milestones?.filter(m => m.is_completed).length || 0), 0
    ),
    completion_rate: goals.length > 0 
      ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
      : 0
  }

  // Insights neurocientíficos baseados nos dados
  const getProductivityInsight = () => {
    if (stats.in_progress > 3) {
      return {
        title: "Atenção à Sobrecarga Cognitiva",
        description: "Mais de 3 metas simultâneas podem reduzir a eficácia. O córtex pré-frontal trabalha melhor com foco limitado.",
        color: "yellow",
        icon: Brain
      }
    }
    
    if (stats.completion_rate > 70) {
      return {
        title: "Excelente Performance Neurológica",
        description: "Alta taxa de conclusão indica forte ativação dos circuitos de recompensa e motivação.",
        color: "green",
        icon: Award
      }
    }
    
    if (stats.average_progress < 30) {
      return {
        title: "Otimize a Neuroplasticidade",
        description: "Progresso gradual e consistente fortalece as conexões neurais relacionadas à persistência.",
        color: "blue",
        icon: TrendingUp
      }
    }
    
    return {
      title: "Padrão Cognitivo Equilibrado",
      description: "Seu perfil indica boa regulação entre desafio e capacidade, ideal para aprendizado sustentável.",
      color: "purple",
      icon: Zap
    }
  }

  const insight = getProductivityInsight()

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais - Grid Responsivo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                <p className="text-lg md:text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Concluídas</p>
                <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.in_progress}
                </p>
              </div>
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-lg md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.completion_rate}%
                </p>
              </div>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas - Layout Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Progresso Médio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Target className="h-4 w-4 md:h-5 md:w-5" />
              Progresso Médio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Progresso Geral</span>
              <Badge variant="outline" className="text-xs md:text-sm">
                {stats.average_progress}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.average_progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.average_progress >= 70 ? '🚀 Excelente ritmo!' : 
               stats.average_progress >= 40 ? '📈 Progresso consistente' : 
               '🎯 Continue focado!'}
            </p>
          </CardContent>
        </Card>

        {/* Marcos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
              Marcos Alcançados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Marcos Concluídos</span>
              <Badge variant="outline" className="text-xs md:text-sm">
                {stats.completed_milestones} / {stats.total_milestones}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.total_milestones > 0 ? (stats.completed_milestones / stats.total_milestones) * 100 : 0}%` 
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total_milestones === 0 ? '📝 Adicione marcos às suas metas' :
               (stats.completed_milestones / stats.total_milestones) >= 0.7 ? '🏆 Ótimo desempenho!' :
               '⭐ Continue progredindo!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insight Neurocientífico - Card Destacado e Responsivo */}
      <Card className={`border-2 transition-all duration-300 ${
        insight.color === 'green' ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20' :
        insight.color === 'yellow' ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20' :
        insight.color === 'blue' ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20' :
        'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <insight.icon className={`h-4 w-4 md:h-5 md:w-5 ${
              insight.color === 'green' ? 'text-green-600 dark:text-green-400' :
              insight.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
              insight.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              'text-purple-600 dark:text-purple-400'
            }`} />
            <span className={
              insight.color === 'green' ? 'text-green-700 dark:text-green-300' :
              insight.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
              insight.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
              'text-purple-700 dark:text-purple-300'
            }>
              {insight.title}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-sm md:text-base ${
            insight.color === 'green' ? 'text-green-600 dark:text-green-400' :
            insight.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
            insight.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            'text-purple-600 dark:text-purple-400'
          }`}>
            {insight.description}
          </p>
          
          {/* Dicas específicas baseadas no insight */}
          <div className="mt-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/50">
            <p className="text-xs text-muted-foreground font-medium mb-1">💡 Dica Científica:</p>
            <p className="text-xs text-muted-foreground">
              {insight.color === 'yellow' && "Reduza para 2-3 metas ativas. A pesquisa mostra que o foco dividido reduz a performance em até 40%."}
              {insight.color === 'green' && "Sua dopamina está em níveis ótimos! Continue celebrando pequenas vitórias para manter a motivação."}
              {insight.color === 'blue' && "Estabeleça marcos menores. O cérebro libera dopamina a cada 10-15% de progresso."}
              {insight.color === 'purple' && "Você está na 'zona de desenvolvimento proximal' - perfeito para crescimento sustentável."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
