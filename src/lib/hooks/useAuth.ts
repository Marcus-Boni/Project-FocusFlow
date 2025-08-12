"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/useUserStore'

export function useAuth(redirectTo: string = '/auth/login') {
  const { user, isLoading } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  return { user, isLoading }
}

export function useRequireAuth() {
  return useAuth('/auth/login')
}
