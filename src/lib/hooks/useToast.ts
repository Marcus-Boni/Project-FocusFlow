import toast from 'react-hot-toast'

export const useToast = () => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      iconTheme: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--primary-foreground))',
      },
    })
  }

  const showError = (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--destructive))',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      iconTheme: {
        primary: 'hsl(var(--destructive))',
        secondary: 'hsl(var(--destructive-foreground))',
      },
    })
  }

  const showLoading = (message: string) => {
    return toast.loading(message, {
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    })
  }

  const showInfo = (message: string) => {
    toast(message, {
      icon: '💡',
      duration: 3000,
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--primary))',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    })
  }

  const showWarning = (message: string) => {
    toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--warning))',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    })
  }

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId)
  }

  const dismissAll = () => {
    toast.dismiss()
  }

  const promise = <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: (data: T) => string
      error: (err: Error | unknown) => string
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    }, {
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      success: {
        duration: 3000,
        iconTheme: {
          primary: 'hsl(var(--primary))',
          secondary: 'hsl(var(--primary-foreground))',
        },
      },
      error: {
        duration: 4000,
        iconTheme: {
          primary: 'hsl(var(--destructive))',
          secondary: 'hsl(var(--destructive-foreground))',
        },
      },
    })
  }

  return {
    success: showSuccess,
    error: showError,
    loading: showLoading,
    info: showInfo,
    warning: showWarning,
    dismiss,
    dismissAll,
    promise,
  }
}

// Utility functions for common actions
export const toastUtils = {
  auth: {
    loginSuccess: () => toast.success('Login realizado com sucesso! 🎉', {
      duration: 3000,
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid hsl(var(--primary))',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
    loginError: () => toast.error('Erro ao fazer login. Verifique suas credenciais.'),
    registerSuccess: () => toast.success('Conta criada com sucesso! Bem-vindo! 🎉'),
    registerError: () => toast.error('Erro ao criar conta. Tente novamente.'),
    logoutSuccess: () => toast.success('Logout realizado com sucesso!'),
    emailSent: () => toast.success('Email de confirmação enviado! 📧'),
  },
  
  timer: {
    started: (area?: string) => toast.success(
      area ? `Timer iniciado para ${area}! 🎯` : 'Timer iniciado! 🎯',
      { duration: 2000 }
    ),
    paused: () => toast('Timer pausado ⏸️', { duration: 2000 }),
    resumed: () => toast.success('Timer retomado! ▶️', { duration: 2000 }),
    stopped: () => toast('Timer parado 🛑', { duration: 2000 }),
    completed: (type: 'focus' | 'break') => 
      toast.success(
        type === 'focus' 
          ? 'Sessão de foco completa! Hora de descansar 🎉' 
          : 'Pausa terminada! Pronto para focar novamente 💪',
        { duration: 4000 }
      ),
    sessionSaved: () => toast.success('Sessão salva com sucesso! 💾', { duration: 2000 }),
  },
  
  studyArea: {
    created: (name: string) => toast.success(`Área "${name}" criada com sucesso! 📚`),
    updated: (name: string) => toast.success(`Área "${name}" atualizada! ✏️`),
    deleted: (name: string) => toast.success(`Área "${name}" removida! 🗑️`),
    error: () => toast.error('Erro ao gerenciar área de estudo.'),
  },
  
  settings: {
    saved: () => toast.success('Configurações salvas! ⚙️'),
    themeChanged: (theme: string) => toast.success(`Tema alterado para ${theme}! 🎨`, { duration: 2000 }),
    notificationsEnabled: () => toast.success('Notificações ativadas! 🔔'),
    notificationsDisabled: () => toast.success('Notificações desativadas! 🔕'),
  },
  
  spacedRepetition: {
    noteCreated: () => toast.success('Nota criada com sucesso! 📝'),
    noteUpdated: () => toast.success('Nota atualizada! ✏️'),
    reviewCompleted: () => toast.success('Revisão concluída! 🧠'),
    difficultyUpdated: () => toast.success('Dificuldade atualizada! 📊'),
  },
  
  data: {
    loading: () => toast.loading('Carregando dados...'),
    error: () => toast.error('Erro ao carregar dados. Tente novamente.'),
    saved: () => toast.success('Dados salvos com sucesso! 💾'),
    deleted: () => toast.success('Dados removidos! 🗑️'),
  },
}
