// Componente para exibir insights neurocientíficos das metas
import { Card, CardContent } from '@/components/ui/card'
import { Brain } from 'lucide-react'
import type { Goal, NeuroGoalAnalysis, GoalProgress } from '@/types/goals'

interface GoalInsightsPanelProps {
  insights: Array<{
    goal: Goal
    analysis: NeuroGoalAnalysis
    progress: GoalProgress
  }>
}

export function GoalInsightsPanel({ insights }: GoalInsightsPanelProps) {
  // Calcular médias das pontuações neurocientíficas
  const averageScores = insights.reduce((acc, item) => {
    acc.motivation += item.analysis.motivation_score
    acc.dopamine += item.analysis.dopamine_potential
    acc.achievability += item.analysis.achievability_score
    acc.complexity += item.analysis.complexity_score
    return acc
  }, { motivation: 0, dopamine: 0, achievability: 0, complexity: 0 })

  const goalsCount = insights.length
  if (goalsCount > 0) {
    Object.keys(averageScores).forEach(key => {
      averageScores[key as keyof typeof averageScores] /= goalsCount
    })
  }


  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excelente'
    if (score >= 6) return 'Bom'
    if (score >= 4) return 'Regular'
    return 'Precisa melhorar'
  }

  return (
    <div className="space-y-6">
      {/* Pontuações Médias */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${getScoreColor(averageScores.motivation).split(' ')[0]}`}>
            {averageScores.motivation.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Motivação</div>
          <div className="text-xs text-muted-foreground">
            {getScoreLabel(averageScores.motivation)}
          </div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${getScoreColor(averageScores.dopamine).split(' ')[0]}`}>
            {averageScores.dopamine.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Dopamina</div>
          <div className="text-xs text-muted-foreground">
            {getScoreLabel(averageScores.dopamine)}
          </div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${getScoreColor(averageScores.achievability).split(' ')[0]}`}>
            {averageScores.achievability.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Alcançabilidade</div>
          <div className="text-xs text-muted-foreground">
            {getScoreLabel(averageScores.achievability)}
          </div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${getScoreColor(averageScores.complexity).split(' ')[0]}`}>
            {averageScores.complexity.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Subdivisão</div>
          <div className="text-xs text-muted-foreground">
            {getScoreLabel(averageScores.complexity)}
          </div>
        </div>
      </div>

    

      {/* Resumo Geral */}
      {insights.length > 0 && (
        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-600 mt-1" />
              <div className="space-y-2">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">
                  Análise Neurocientífica Geral
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {averageScores.motivation >= 7 
                    ? "Suas metas estão bem conectadas com sua identidade, o que aumenta significativamente a motivação intrínseca."
                    : "Considere repensar como suas metas se conectam com quem você quer se tornar. Metas ligadas à identidade são mais poderosas."
                  }
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {averageScores.dopamine >= 6
                    ? "Boa estrutura de recompensas! Seus marcos geram dopamina suficiente para manter a motivação."
                    : "Adicione mais marcos intermediários às suas metas para aumentar a frequência de recompensas e manter o sistema dopaminérgico ativo."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
