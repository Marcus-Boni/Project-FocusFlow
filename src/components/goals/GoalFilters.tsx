"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import { GoalCategory, GoalStatus, GoalTimeframe } from '@/types/goals'

interface GoalFiltersProps {
  filters: {
    category?: GoalCategory
    status?: GoalStatus
    timeframe?: GoalTimeframe
    search?: string
  }
  onFiltersChange: (filters: {
    category?: GoalCategory
    status?: GoalStatus
    timeframe?: GoalTimeframe
    search?: string
  }) => void
}

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  learning: 'Aprendizado',
  skill: 'Habilidade',
  project: 'Projeto',
  habit: 'Hábito',
  career: 'Carreira'
}

const STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Não Iniciado',
  in_progress: 'Em Progresso',
  completed: 'Concluído',
  paused: 'Pausado',
  cancelled: 'Cancelado'
}

const TIMEFRAME_LABELS: Record<GoalTimeframe, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual'
}

export function GoalFilters({ filters, onFiltersChange }: GoalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: string, value: string | undefined) => {
    const newFilters = { ...filters }
    if (value && value !== 'all') {
      if (key === 'category') {
        newFilters.category = value as GoalCategory
      } else if (key === 'status') {
        newFilters.status = value as GoalStatus
      } else if (key === 'timeframe') {
        newFilters.timeframe = value as GoalTimeframe
      } else if (key === 'search') {
        newFilters.search = value
      }
    } else {
      delete newFilters[key as keyof typeof filters]
    }
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(filters).filter(key => filters[key as keyof typeof filters]).length

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Barra de busca sempre visível */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar metas..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>

          {/* Filtros expandidos */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => updateFilter('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prazo</label>
                <Select
                  value={filters.timeframe || 'all'}
                  onValueChange={(value) => updateFilter('timeframe', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os prazos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os prazos</SelectItem>
                    {Object.entries(TIMEFRAME_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Tags de filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {CATEGORY_LABELS[filters.category]}
                  <button 
                    onClick={() => updateFilter('category', undefined)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  {STATUS_LABELS[filters.status]}
                  <button 
                    onClick={() => updateFilter('status', undefined)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.timeframe && (
                <Badge variant="secondary" className="gap-1">
                  {TIMEFRAME_LABELS[filters.timeframe]}
                  <button 
                    onClick={() => updateFilter('timeframe', undefined)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  &quot;{filters.search}&quot;
                  <button 
                    onClick={() => updateFilter('search', undefined)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
