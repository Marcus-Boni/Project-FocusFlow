// Modal para criação de novas metas com templates neurocientíficos
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { X, Brain, Target, Clock, Calendar, Lightbulb, Sparkles } from 'lucide-react'
import { GOAL_CATEGORIES } from '@/constants/GoalsData'
import { useGoals } from '@/hooks/useGoals'
import type { Goal, GoalTimeframe, GoalCategory, GoalPriority, GoalStatus } from '@/types/goals'

interface GoalCreateModalProps {
  trigger?: React.ReactNode
  onGoalCreated?: (goal: Goal) => void
}

// Templates baseados em neurociência
const GOAL_TEMPLATES = [
  {
    id: 'identity-based',
    title: 'Meta Baseada em Identidade',
    description: 'Conecta com quem você quer se tornar',
    icon: <Brain className="h-5 w-5" />,
    example: 'Eu sou uma pessoa que [identidade] e por isso [ação específica]',
    neuroscience: 'Metas conectadas à identidade ativam o córtex pré-frontal medial, aumentando o comprometimento em 73%',
    template: {
      title: 'Me tornar um expert em',
      description: 'Eu sou uma pessoa que domina [área] e por isso estudo [tempo] por dia',
      category: 'learning' as GoalCategory,
      timeframe: 'quarterly' as GoalTimeframe,
      identity_connection: 'Eu sou uma pessoa que sempre busca aprender e crescer',
      motivation_reason: 'Quero me tornar um expert reconhecido na minha área'
    }
  },
  {
    id: 'habit-stacking',
    title: 'Empilhamento de Hábitos',
    description: 'Conecta nova meta a comportamento existente',
    icon: <Target className="h-5 w-5" />,
    example: 'Depois de [hábito existente], eu vou [nova ação]',
    neuroscience: 'Aproveita circuitos neurais já estabelecidos, reduzindo a carga cognitiva em 40%',
    template: {
      title: 'Estudar após',
      description: 'Depois de [café da manhã], eu vou estudar por 30 minutos',
      category: 'skill' as GoalCategory,
      timeframe: 'daily' as GoalTimeframe,
      identity_connection: 'Eu sou uma pessoa que aproveita bem o tempo',
      motivation_reason: 'Quero criar consistência nos meus estudos'
    }
  },
  {
    id: 'systems-goal',
    title: 'Meta de Sistema',
    description: 'Foca no processo, não apenas no resultado',
    icon: <Clock className="h-5 w-5" />,
    example: 'Todo dia eu vou [processo] para melhorar em [área]',
    neuroscience: 'Sistemas reduzem ansiedade de performance e aumentam dopamina contínua',
    template: {
      title: 'Sistema de estudo diário',
      description: 'Todo dia eu vou dedicar X horas para melhorar em [matéria]',
      category: 'academic' as GoalCategory,
      timeframe: 'weekly' as GoalTimeframe,
      identity_connection: 'Eu sou uma pessoa sistemática e organizada',
      motivation_reason: 'Quero criar um processo sólido de aprendizado'
    }
  },
  {
    id: 'moonshot',
    title: 'Meta Audaciosa (10x)',
    description: 'Objetivo que força pensamento inovador',
    icon: <Sparkles className="h-5 w-5" />,
    example: 'Em [prazo], eu vou alcançar [resultado 10x maior]',
    neuroscience: 'Ativa redes de criatividade e força soluções não-lineares',
    template: {
      title: 'Transformação completa em',
      description: 'Em 6 meses, eu vou dominar completamente [área] e ser reconhecido como expert',
      category: 'career' as GoalCategory,
      timeframe: 'yearly' as GoalTimeframe,
      identity_connection: 'Eu sou uma pessoa que sonha grande e executa',
      motivation_reason: 'Quero criar um impacto significativo na minha área'
    }
  }
]

export function GoalCreateModal({ trigger, onGoalCreated }: GoalCreateModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as GoalCategory,
    priority: 'medium' as const,
    timeframe: '' as GoalTimeframe,
    specific_details: '',
    target_date: '',
    motivation_reason: '',
    identity_connection: '',
    reward_description: '',
    milestones: [] as string[]
  })
  const [milestoneInput, setMilestoneInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { createGoal } = useGoals()

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedTemplate(null)
      setFormData({
        title: '',
        description: '',
        category: '' as GoalCategory,
        priority: 'medium' as const,
        timeframe: '' as GoalTimeframe,
        specific_details: '',
        target_date: '',
        motivation_reason: '',
        identity_connection: '',
        reward_description: '',
        milestones: []
      })
      setMilestoneInput('')
    }
  }, [open])

  const handleTemplateSelect = (templateId: string) => {
    const template = GOAL_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setFormData(prev => ({
        ...prev,
        title: template.template.title,
        description: template.template.description,
        category: template.template.category,
        timeframe: template.template.timeframe,
        identity_connection: template.template.identity_connection,
        motivation_reason: template.template.motivation_reason
      }))
    }
  }

  const addMilestone = () => {
    if (milestoneInput.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestoneInput.trim()]
      }))
      setMilestoneInput('')
    }
  }

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form data antes da validação:', formData)
    
    // Validação de campos obrigatórios
    const requiredFields = {
      title: formData.title.trim(),
      category: formData.category,
      timeframe: formData.timeframe,
      description: formData.description.trim(),
      motivation_reason: formData.motivation_reason.trim(),
      identity_connection: formData.identity_connection.trim()
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([field]) => field)

    if (missingFields.length > 0) {
      console.error('Campos obrigatórios não preenchidos:', missingFields)
      alert(`Por favor, preencha os seguintes campos obrigatórios:\n${missingFields.map(field => {
        switch(field) {
          case 'title': return '• Título da Meta'
          case 'category': return '• Categoria'
          case 'timeframe': return '• Prazo'
          case 'description': return '• Descrição Detalhada'
          case 'motivation_reason': return '• Por que esta meta é importante'
          case 'identity_connection': return '• Como se conecta com quem você quer ser'
          default: return `• ${field}`
        }
      }).join('\n')}`)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const goalData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: 'medium' as GoalPriority,
        timeframe: formData.timeframe,
        status: 'not_started' as GoalStatus,
        specific_details: formData.specific_details || formData.description,
        measurable_metrics: `Completar objetivo: ${formData.title}`,
        target_value: 1,
        current_value: 0,
        target_date: formData.target_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reward_description: formData.reward_description,
        motivation_reason: formData.motivation_reason || 'Crescimento pessoal e profissional',
        identity_connection: formData.identity_connection || 'Sou uma pessoa que busca crescimento contínuo',
        milestones: formData.milestones.map(title => ({
          title,
          description: '',
          target_value: 1,
          target_date: null
        }))
      }

      console.log('Goal data a ser enviado:', goalData)

      const newGoal = await createGoal(goalData)
      onGoalCreated?.(newGoal)
      setOpen(false)
    } catch (error) {
      console.error('Erro ao criar meta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTemplateData = selectedTemplate ? 
    GOAL_TEMPLATES.find(t => t.id === selectedTemplate) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Target className="h-4 w-4" />
            Nova Meta
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Criar Nova Meta Inteligente
          </DialogTitle>
          <DialogDescription>
            Use templates baseados em neurociência para criar metas mais eficazes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Template */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Escolha um Template Neurocientífico</Label>
            <div className="grid md:grid-cols-2 gap-4">
              {GOAL_TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {template.icon}
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground mb-2">
                      <strong>Exemplo:</strong> {template.example}
                    </div>
                    <div className="text-xs bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                      <strong>🧠 Neurociência:</strong> {template.neuroscience}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Insight do Template Selecionado */}
          {selectedTemplateData && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
                      Dica Científica para {selectedTemplateData.title}
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {selectedTemplateData.neuroscience}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campos do Formulário */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Meta *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Dominar React em 3 meses"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as GoalCategory }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded`} style={{ backgroundColor: category.color }} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva sua meta de forma específica e conectada à sua identidade..."
              rows={3}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeframe">Prazo *</Label>
              <Select 
                value={formData.timeframe} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value as GoalTimeframe }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Data Limite</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation_reason">Por que esta meta é importante? *</Label>
            <Textarea
              id="motivation_reason"
              value={formData.motivation_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, motivation_reason: e.target.value }))}
              placeholder="Ex: Isso me ajudará a crescer profissionalmente e realizar meus sonhos..."
              rows={2}
              required
              className="min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">
              Explique por que essa meta é importante para você. Isso aumenta o comprometimento em 73%.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="identity_connection">Como essa meta se conecta com quem você quer ser? *</Label>
            <Textarea
              id="identity_connection"
              value={formData.identity_connection}
              onChange={(e) => setFormData(prev => ({ ...prev, identity_connection: e.target.value }))}
              placeholder="Ex: Eu sou uma pessoa que sempre busca excelência e aprendizado contínuo..."
              rows={2}
              required
              className="min-h-[60px]"
            />
            <p className="text-xs text-muted-foreground">
              Conecte a meta com sua identidade. Comece com &quot;Eu sou uma pessoa que...&quot;
            </p>
          </div>

          {/* Marcos */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Marcos Intermediários (Recomendado)</Label>
            <div className="flex gap-2">
              <Input
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                placeholder="Ex: Completar módulo 1 do curso"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
              />
              <Button type="button" variant="outline" onClick={addMilestone}>
                Adicionar
              </Button>
            </div>
            
            {formData.milestones.length > 0 && (
              <div className="space-y-2">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded">
                    <span className="text-sm">{index + 1}. {milestone}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insight sobre Marcos */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Por que Marcos são Importantes?
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Marcos intermediários ativam o sistema de recompensa do cérebro mais frequentemente, 
                    mantendo a motivação alta. Estudos mostram que metas com 3-5 marcos têm 60% mais 
                    chances de serem concluídas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
