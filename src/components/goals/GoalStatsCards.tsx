// Componente para exibir estatísticas das metas
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react'

interface GoalStats {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  completionRate: number
}

interface GoalStatsCardsProps {
  stats: GoalStats
}

export function GoalStatsCards({ stats }: GoalStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Metas',
      value: stats.total,
      icon: Target,
      color: 'text-blue-600',
      description: 'Metas criadas'
    },
    {
      title: 'Concluídas',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      description: 'Metas finalizadas'
    },
    {
      title: 'Em Progresso',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-yellow-600',
      description: 'Metas ativas'
    },
    {
      title: 'Taxa de Conclusão',
      value: `${Math.round(stats.completionRate)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      description: 'Eficiência geral'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
