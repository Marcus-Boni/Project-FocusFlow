// Configurações das categorias de metas baseadas em neurociência
import { GoalCategoryConfig, GoalCategory } from '@/types/goals'

export const GOAL_CATEGORIES: GoalCategoryConfig[] = [
  {
    id: 'learning' as GoalCategory,
    name: 'Aprendizado',
    description: 'Metas de aquisição de conhecimento e novas habilidades',
    color: '#3B82F6', // blue-500
    icon: 'BookOpen'
  },
  {
    id: 'skill' as GoalCategory,
    name: 'Habilidade',
    description: 'Desenvolvimento de competências técnicas específicas',
    color: '#10B981', // green-500
    icon: 'Target'
  },
  {
    id: 'project' as GoalCategory,
    name: 'Projeto',
    description: 'Conclusão de projetos pessoais ou profissionais',
    color: '#F59E0B', // yellow-500
    icon: 'Code'
  },
  {
    id: 'habit' as GoalCategory,
    name: 'Hábito',
    description: 'Formação de novos hábitos ou quebra de hábitos ruins',
    color: '#8B5CF6', // purple-500
    icon: 'TrendingUp'
  },
  {
    id: 'career' as GoalCategory,
    name: 'Carreira',
    description: 'Objetivos relacionados ao crescimento profissional',
    color: '#EF4444', // red-500
    icon: 'Trophy'
  }
]

export const GOAL_PRIORITIES = [
  { value: 'low', label: 'Baixa', color: '#6B7280' },
  { value: 'medium', label: 'Média', color: '#F59E0B' },
  { value: 'high', label: 'Alta', color: '#EF4444' },
  { value: 'critical', label: 'Crítica', color: '#DC2626' }
]

export const GOAL_TIMEFRAMES = [
  { value: 'daily', label: 'Diária', description: 'Para completar hoje' },
  { value: 'weekly', label: 'Semanal', description: 'Para completar nesta semana' },
  { value: 'monthly', label: 'Mensal', description: 'Para completar neste mês' },
  { value: 'quarterly', label: 'Trimestral', description: 'Para completar em 3 meses' },
  { value: 'yearly', label: 'Anual', description: 'Para completar neste ano' }
]

export const GOAL_STATUSES = [
  { value: 'not_started', label: 'Não Iniciada', color: '#6B7280' },
  { value: 'in_progress', label: 'Em Progresso', color: '#3B82F6' },
  { value: 'completed', label: 'Concluída', color: '#10B981' },
  { value: 'paused', label: 'Pausada', color: '#F59E0B' },
  { value: 'cancelled', label: 'Cancelada', color: '#EF4444' }
]

// Frases motivacionais baseadas em neurociência para criação de metas
export const MOTIVATION_PROMPTS = [
  {
    category: 'identity',
    prompt: 'Como esta meta me ajudará a me tornar quem quero ser?',
    explanation: 'Conectar metas com identidade aumenta a motivação intrínseca'
  },
  {
    category: 'value',
    prompt: 'Por que esta meta é importante para mim pessoalmente?',
    explanation: 'Valores pessoais ativam o sistema de recompensa do cérebro'
  },
  {
    category: 'impact',
    prompt: 'Como alcançar esta meta impactará positivamente minha vida?',
    explanation: 'Visualizar benefícios futuros fortalece a motivação'
  },
  {
    category: 'growth',
    prompt: 'Que tipo de pessoa eu me tornarei ao alcançar esta meta?',
    explanation: 'Crescimento pessoal é um motivador poderoso e duradouro'
  }
]

// Templates de metas comuns para desenvolvedores
export const GOAL_TEMPLATES = [
  {
    title: 'Aprender uma nova linguagem de programação',
    category: 'learning' as GoalCategory,
    description: 'Dominar os fundamentos de uma nova linguagem em 3 meses',
    timeframe: 'quarterly',
    milestones: [
      { title: 'Completar curso introdutório', target_value: 1 },
      { title: 'Construir primeiro projeto prático', target_value: 1 },
      { title: 'Contribuir para projeto open source', target_value: 1 },
      { title: 'Criar projeto pessoal completo', target_value: 1 }
    ]
  },
  {
    title: 'Melhorar consistência de estudos',
    category: 'habit' as GoalCategory,
    description: 'Estudar programação por 30 dias consecutivos',
    timeframe: 'monthly',
    milestones: [
      { title: 'Estudar por 7 dias seguidos', target_value: 7 },
      { title: 'Estudar por 14 dias seguidos', target_value: 14 },
      { title: 'Estudar por 21 dias seguidos', target_value: 21 },
      { title: 'Estudar por 30 dias seguidos', target_value: 30 }
    ]
  },
  {
    title: 'Construir um projeto full-stack',
    category: 'project' as GoalCategory,
    description: 'Desenvolver aplicação completa com frontend e backend',
    timeframe: 'quarterly',
    milestones: [
      { title: 'Definir arquitetura e tecnologias', target_value: 1 },
      { title: 'Implementar backend com API', target_value: 1 },
      { title: 'Criar interface do usuário', target_value: 1 },
      { title: 'Deploy e documentação completa', target_value: 1 }
    ]
  },
  {
    title: 'Obter certificação técnica',
    category: 'career' as GoalCategory,
    description: 'Conquistar certificação relevante para carreira',
    timeframe: 'quarterly',
    milestones: [
      { title: 'Estudar material oficial', target_value: 100 },
      { title: 'Fazer simulados (>80% acerto)', target_value: 5 },
      { title: 'Agendar e realizar prova', target_value: 1 },
      { title: 'Obter certificação', target_value: 1 }
    ]
  }
]

// Insights neurocientíficos para diferentes situações
export const NEUROSCIENCE_INSIGHTS = {
  motivation_low: {
    title: 'Como aumentar a motivação',
    tips: [
      'Conecte a meta com sua identidade pessoal',
      'Divida em marcos menores para dopamina frequente',
      'Visualize o "eu futuro" que alcançou a meta',
      'Encontre um accountability partner'
    ],
    science: 'O córtex pré-frontal ventromedial processa valor subjetivo. Metas conectadas à identidade ativam mais essa região.'
  },
  
  procrastination: {
    title: 'Vencendo a procrastinação',
    tips: [
      'Use a regra dos 2 minutos para começar',
      'Elimine distrações do ambiente',
      'Pratique implementation intentions ("Se X, então Y")',
      'Recompense pequenos progressos'
    ],
    science: 'A procrastinação ativa o sistema límbico. Estratégias de implementação reforçam o controle executivo pré-frontal.'
  },
  
  habit_formation: {
    title: 'Formação de hábitos eficaz',
    tips: [
      'Comece com mudanças mínimas (1% melhor)',
      'Use stacking de hábitos (após X, farei Y)',
      'Crie recompensas imediatas',
      'Seja consistente com horário e local'
    ],
    science: 'Hábitos se formam nos gânglios da base. Repetição consistente fortalece circuitos neurais automatizados.'
  }
}
