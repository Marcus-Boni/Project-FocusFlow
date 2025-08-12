"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL to extract the authorization code
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        
        if (code) {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Error exchanging code for session:', error)
            router.push('/login?error=auth_callback_error')
            return
          }
          
          if (data.session) {
            console.log('Authentication successful!')
            router.push('/dashboard')
          } else {
            router.push('/login?error=no_session')
          }
        } else {
          // No code parameter, check if there's already a session
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session:', error)
            router.push('/login?error=session_error')
          } else if (data.session) {
            router.push('/dashboard')
          } else {
            router.push('/login?error=no_code')
          }
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err)
        router.push('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
