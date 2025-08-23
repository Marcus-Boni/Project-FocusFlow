"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Brain, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toastUtils } from '@/lib/hooks/useToast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordReset, setIsPasswordReset] = useState(false)
  const [error, setError] = useState('')
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const router = useRouter()

  // Validação de senha em tempo real
  useEffect(() => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }, [password])

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      setError('Password does not meet security requirements')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
        toastUtils.auth.passwordResetError()
      } else {
        setIsPasswordReset(true)
        toastUtils.auth.passwordResetSuccess()
      }
    } catch (err) {
      console.error('Password update error:', err)
      setError('An unexpected error occurred')
      toastUtils.auth.passwordResetError()
    } finally {
      setIsLoading(false)
    }
  }

  // Página de sucesso após redefinir a senha
  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span>FocusFlow</span>
            </Link>
          </div>

          {/* Success Message */}
          <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Password updated!</h1>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 font-medium"
            >
              Continue to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-2xl font-bold mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span>FocusFlow</span>
          </Link>
          <h1 className="text-2xl font-bold">Set new password</h1>
          <p className="text-muted-foreground">
            Enter your new password below. Make sure it&apos;s strong and secure.
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-card rounded-lg border shadow-sm p-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Nova senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Validação de senha */}
              {password && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground">Password requirements:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <PasswordRule 
                      isValid={passwordValidation.minLength} 
                      text="At least 8 characters" 
                    />
                    <PasswordRule 
                      isValid={passwordValidation.hasUppercase} 
                      text="One uppercase letter" 
                    />
                    <PasswordRule 
                      isValid={passwordValidation.hasLowercase} 
                      text="One lowercase letter" 
                    />
                    <PasswordRule 
                      isValid={passwordValidation.hasNumber} 
                      text="One number" 
                    />
                    <PasswordRule 
                      isValid={passwordValidation.hasSpecialChar} 
                      text="One special character" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring pr-10 ${
                    confirmPassword && !passwordsMatch 
                      ? 'border-destructive bg-destructive/5' 
                      : 'border-input bg-background'
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
              )}
              
              {confirmPassword && passwordsMatch && (
                <p className="mt-1 text-xs text-green-600">Passwords match ✓</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para mostrar as regras de validação da senha
function PasswordRule({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-muted-foreground'}`}>
      <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-600' : 'bg-muted-foreground/30'}`} />
      <span>{text}</span>
    </div>
  )
}
