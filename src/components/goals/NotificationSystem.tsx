// Sistema de notificações para feedback visual
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, X, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])

    // Remove automaticamente após o tempo especificado
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration || 3000)
  }, [removeNotification])

  useEffect(() => {
    const handleGoalDeleted = (event: CustomEvent) => {
      const { goalTitle } = event.detail
      addNotification({
        type: 'success',
        title: 'Meta deletada com sucesso!',
        description: `"${goalTitle}" foi removida do seu sistema.`,
        duration: 4000
      })
    }

    const handleGoalDeleteError = (event: CustomEvent) => {
      const { goalTitle } = event.detail
      addNotification({
        type: 'error',
        title: 'Erro ao deletar meta',
        description: `Não foi possível remover "${goalTitle}". Tente novamente.`,
        duration: 5000
      })
    }

    const handleGoalUpdated = (event: CustomEvent) => {
      const { goalTitle, newStatus } = event.detail
      const statusMessages: Record<string, string> = {
        'in_progress': 'iniciada',
        'paused': 'pausada',
        'completed': 'concluída',
        'not_started': 'resetada'
      }
      
      addNotification({
        type: 'success',
        title: 'Meta atualizada!',
        description: `"${goalTitle}" foi ${statusMessages[newStatus] || 'atualizada'}.`,
        duration: 3000
      })
    }

    window.addEventListener('goalDeleted', handleGoalDeleted as EventListener)
    window.addEventListener('goalDeleteError', handleGoalDeleteError as EventListener)
    window.addEventListener('goalUpdated', handleGoalUpdated as EventListener)

    return () => {
      window.removeEventListener('goalDeleted', handleGoalDeleted as EventListener)
      window.removeEventListener('goalDeleteError', handleGoalDeleteError as EventListener)
      window.removeEventListener('goalUpdated', handleGoalUpdated as EventListener)
    }
  }, [addNotification])

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <Info className="h-4 w-4" />
    }
  }

  const getStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-green-200 dark:border-green-800 bg-green-50/90 dark:bg-green-950/90 text-green-800 dark:text-green-200'
      case 'error': return 'border-red-200 dark:border-red-800 bg-red-50/90 dark:bg-red-950/90 text-red-800 dark:text-red-200'
      case 'warning': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50/90 dark:bg-yellow-950/90 text-yellow-800 dark:text-yellow-200'
      case 'info': return 'border-blue-200 dark:border-blue-800 bg-blue-50/90 dark:bg-blue-950/90 text-blue-800 dark:text-blue-200'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          className={cn(
            "shadow-lg border backdrop-blur-sm animate-in slide-in-from-right-full duration-300",
            getStyles(notification.type)
          )}
        >
          <div className="flex items-start gap-2">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <AlertDescription>
                <div className="font-medium">{notification.title}</div>
                {notification.description && (
                  <div className="text-xs mt-1 opacity-90">
                    {notification.description}
                  </div>
                )}
              </AlertDescription>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-current hover:opacity-70 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </Alert>
      ))}
    </div>
  )
}
