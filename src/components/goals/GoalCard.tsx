// Componente para exibir um card individual de meta
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  Clock,
  Pause,
  Brain,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Goal } from '@/types/goals'
import { useGoals } from '@/hooks/useGoals'
// import { GOAL_CATEGORIES } from '@/constants/goals'
// import { ProgressAnimation } from './ProgressAnimation'

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const { updateGoal, deleteGoal, completeMilestone } = useGoals()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAllMilestones, setShowAllMilestones] = useState(false)
  const [localGoal, setLocalGoal] = useState(goal)

  // Atualiza o estado local quando a prop goal muda
  useEffect(() => {
    setLocalGoal(goal)
  }, [goal])

  // Cálculo do progresso baseado nos marcos
  const progress = {
    // Progresso baseado em marcos
    percentage: localGoal.milestones && localGoal.milestones.length > 0 
      ? Math.round((localGoal.milestones.filter(m => m.is_completed).length / localGoal.milestones.length) * 100)
      : 0,
    
    milestones_completed: localGoal.milestones?.filter(m => m.is_completed).length || 0,
    total_milestones: localGoal.milestones?.length || 0,
    sessions_completed: 0, // Placeholder - pode ser implementado futuramente
    sessions_target: 0 // Placeholder - pode ser implementado futuramente
  }

  const handleStatusUpdate = async (newStatus: Goal['status']) => {
    setIsUpdating(true)
    try {
      // Atualiza estado local imediatamente para feedback visual rápido
      const updatedGoal = { ...localGoal, status: newStatus }
      
      if (newStatus === 'completed') {
        updatedGoal.completed_at = new Date().toISOString()
        // Quando uma meta é completada, definir current_value igual ao target_value
        updatedGoal.current_value = localGoal.target_value
        // Marcar todos os marcos como concluídos
        updatedGoal.milestones = localGoal.milestones?.map(m => ({
          ...m,
          is_completed: true,
          completed_at: m.completed_at || new Date().toISOString()
        }))
      }
      
      setLocalGoal(updatedGoal)

      // Então atualiza no banco
      const updateData: Partial<Goal> = { 
        status: newStatus,
        ...(newStatus === 'completed' && { 
          completed_at: new Date().toISOString(),
          current_value: localGoal.target_value
        })
      }
      
      await updateGoal(goal.id, updateData)

      // Se a meta foi completada, atualizar todos os marcos no banco
      if (newStatus === 'completed' && localGoal.milestones) {
        for (const milestone of localGoal.milestones) {
          if (!milestone.is_completed) {
            await completeMilestone(milestone.id)
          }
        }
      }
      
      // Emite evento de atualização para feedback visual
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('goalUpdated', { 
          detail: { goalTitle: localGoal.title, newStatus } 
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      // Reverte o estado local em caso de erro
      setLocalGoal(goal)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      await deleteGoal(goal.id)
      // Mostra feedback positivo
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('goalDeleted', { 
          detail: { goalTitle: localGoal.title } 
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
      // Mostra feedback de erro
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('goalDeleteError', { 
          detail: { goalTitle: localGoal.title, error } 
        })
        window.dispatchEvent(event)
      }
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleMilestoneToggle = async (milestoneId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        // Marco já está concluído, não faz nada por enquanto
        // Futuramente pode implementar "desmarcar"
        return
      }

      // Atualiza o estado local imediatamente para feedback visual
      setLocalGoal(prevGoal => ({
        ...prevGoal,
        milestones: prevGoal.milestones?.map(m => 
          m.id === milestoneId 
            ? { ...m, is_completed: true, completed_at: new Date().toISOString() }
            : m
        ) || []
      }))

      // Atualiza no banco de dados
      await completeMilestone(milestoneId)

      // Dispara evento para atualizar outros componentes
      window.dispatchEvent(new CustomEvent('goalUpdated', { 
        detail: { goalId: localGoal.id } 
      }))

    } catch (error) {
      console.error('Erro ao atualizar marco:', error)
      // Reverte o estado local em caso de erro
      setLocalGoal(goal)
    }
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400'
      case 'in_progress': return 'text-blue-600 dark:text-blue-400'
      case 'paused': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const formatStatus = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'Concluída'
      case 'in_progress': return 'Em Progresso'
      case 'paused': return 'Pausada'
      default: return 'Não Iniciada'
    }
  }

  // Cálculo real dos dias até o prazo
  const calculateDaysUntilDeadline = () => {
    const now = new Date()
    const targetDate = new Date(localGoal.target_date)
    const diffTime = targetDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDeadline = calculateDaysUntilDeadline()
  const isExpired = daysUntilDeadline < 0 && localGoal.status !== 'completed'

  return (
    <Card className={cn(
      "relative transition-all duration-300 hover:shadow-lg",
      isDeleting && "opacity-50 pointer-events-none",
      isExpired && "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"
    )}>
      {/* Confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-10 rounded-lg flex items-center justify-center">
          <Alert className="max-w-sm mx-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <p>Tem certeza que deseja deletar esta meta?</p>
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deletando...' : 'Confirmar'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg font-semibold leading-tight">
                {localGoal.title}
              </CardTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className="text-xs capitalize"
              >
                {localGoal.category.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className={cn("flex items-center gap-1", getStatusColor(localGoal.status))}>
                {getStatusIcon(localGoal.status)}
                <span className="font-medium">{formatStatus(localGoal.status)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className={isExpired ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                  {isExpired ? 'Expirou' : `${daysUntilDeadline} dias`}
                </span>
              </div>
              
              {/* {category && (
                <Badge variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              )} */}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {localGoal.description && (
          <p className="text-sm text-muted-foreground">
            {localGoal.description}
          </p>
        )}

        {/* Progresso Geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral</span>
            <span className="font-medium">{progress.percentage}%</span>
          </div>
          <div className="relative">
            <Progress value={progress.percentage} className="h-2" />
            {/* <ProgressAnimation progress={progress.percentage} status={localGoal.status} /> */}
          </div>
        </div>

        {/* Sessões */}
        {progress.sessions_target > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sessões de Estudo</span>
              <span className="font-medium">
                {progress.sessions_completed} / {progress.sessions_target}
              </span>
            </div>
            <Progress 
              value={(progress.sessions_completed / progress.sessions_target) * 100} 
              className="h-2" 
            />
          </div>
        )}

        {/* Marcos - Versão melhorada */}
        {localGoal.milestones && localGoal.milestones.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Marcos</span>
                <Badge variant="outline" className="text-xs">
                  {progress.milestones_completed} / {progress.total_milestones}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((progress.milestones_completed / progress.total_milestones) * 100)}% completo
              </div>
            </div>
            
            {/* Lista de marcos com detalhes */}
            <div className="space-y-2">
              {(showAllMilestones ? localGoal.milestones : localGoal.milestones.slice(0, 3)).map((milestone, index) => (
                <div
                  key={milestone.id}
                  onClick={() => handleMilestoneToggle(milestone.id, milestone.is_completed)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-opacity-80",
                    milestone.is_completed 
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
                      : "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  )}
                >
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all",
                    milestone.is_completed 
                      ? "bg-green-500 border-green-500" 
                      : "border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
                  )}>
                    {milestone.is_completed && (
                      <CheckCircle className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-medium truncate",
                      milestone.is_completed 
                        ? "text-green-700 dark:text-green-300 line-through" 
                        : "text-gray-700 dark:text-gray-300"
                    )}>
                      {milestone.title}
                    </p>
                    {!milestone.is_completed && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Clique para marcar como concluído
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {milestone.is_completed ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {localGoal.milestones.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAllMilestones(!showAllMilestones)
                    }}
                    className="text-xs h-7"
                  >
                    {showAllMilestones 
                      ? "Mostrar menos" 
                      : `Ver todos os ${localGoal.milestones.length} marcos`
                    }
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seção Motivacional - Por que é importante e Conexão com Identidade */}
        {(localGoal.motivation_reason || localGoal.identity_connection) && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Motivação e Propósito
              </span>
            </div>
            
            {localGoal.motivation_reason && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Por que essa meta é importante:
                </h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                  {localGoal.motivation_reason}
                </p>
              </div>
            )}
            
            {localGoal.identity_connection && (
              <div>
                <h4 className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                  Como se conecta com quem você quer ser:
                </h4>
                <p className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                  {localGoal.identity_connection}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Insights Neurocientíficos */}
        {localGoal.status === 'in_progress' && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Insight Neurocientífico
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Metas específicas e mensuráveis aumentam a ativação do córtex pré-frontal, 
              melhorando o foco e a persistência em {Math.round(progress.percentage / 10)} pontos.
            </p>
          </div>
        )}

        {/* Botões de Ação */}
        {localGoal.status === 'in_progress' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate('paused')}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Pausando...' : '⏸️ Pausar'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? 'Concluindo...' : '✅ Concluir'}
            </Button>
          </div>
        )}

        {localGoal.status === 'paused' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? 'Retomando...' : '▶️ Retomar'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? 'Concluindo...' : '✅ Concluir'}
            </Button>
          </div>
        )}

        {localGoal.status === 'not_started' && (
          <Button
            size="sm"
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Iniciando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Iniciar Meta
              </div>
            )}
          </Button>
        )}

        {localGoal.status === 'completed' && localGoal.completed_at && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">
              ✅ Meta concluída em {format(new Date(localGoal.completed_at), 'dd/MM/yyyy', { locale: ptBR })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
