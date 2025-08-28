"use client"

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/useUserStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'

interface AvatarUploadProps {
  currentAvatarUrl?: string
  onAvatarUpdate?: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'navigation' | 'settings' | 'compact'
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarUpdate, 
  size = 'md',
  className,
  variant = 'compact'
}: AvatarUploadProps) {
  const { user, updateUser } = useUserStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || 'User'
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return 'Apenas arquivos JPG, PNG e WebP são permitidos.'
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'O arquivo deve ter no máximo 5MB.'
    }

    return null
  }

  const compressImage = (file: File, maxWidth: number = 400): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, file.type, 0.8)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setIsUploading(true)

      // Compress image
      const compressedFile = await compressImage(file)

      // Create preview
      const preview = URL.createObjectURL(compressedFile)
      setPreviewUrl(preview)

      // Generate unique filename with user folder structure
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldFileName = currentAvatarUrl.split('/').pop()
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldFileName}`])
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: publicUrl 
        }
      })

      if (updateError) {
        throw updateError
      }

      // Update local user store
      updateUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          avatar_url: publicUrl
        }
      })

      // Call callback if provided
      onAvatarUpdate?.(publicUrl)

      toast.success('Foto de perfil atualizada com sucesso.')

      setIsDialogOpen(false)

    } catch (err: unknown) {
      console.error('Error uploading avatar:', err)
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao fazer upload da imagem."
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user || !currentAvatarUrl) return

    try {
      setIsUploading(true)

      // Delete from storage with correct path
      const fileName = currentAvatarUrl.split('/').pop()
      if (fileName) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${fileName}`])
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: null 
        }
      })

      if (updateError) {
        throw updateError
      }

      // Update local user store
      updateUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          avatar_url: undefined
        }
      })

      onAvatarUpdate?.('')

      toast.success('Foto de perfil removida com sucesso.')

      setIsDialogOpen(false)

    } catch (err: unknown) {
      console.error('Error removing avatar:', err)
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro ao remover a imagem."
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Renderização baseada na variante
  if (variant === 'navigation') {
    return (
      <div className={cn("relative inline-block", className)}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="group relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
              <Avatar className={cn(
                sizeClasses[size], 
                "ring-2 ring-background overflow-clip transition-all duration-200",
                "group-hover:ring-primary/50 group-hover:scale-105",
                "[&_img]:object-cover [&_img]:object-center [&_img]:w-full [&_img]:h-full [&_img]:block"
              )}>
                <AvatarImage 
                  src={previewUrl || currentAvatarUrl || user?.user_metadata?.avatar_url} 
                  alt="Profile picture"
                  className="!object-cover !object-center !w-full !h-full !block !rounded-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%'
                  }}
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Alterar foto de perfil</DialogTitle>
              <DialogDescription>
                Escolha uma nova foto de perfil. Formatos aceitos: JPG, PNG, WebP (máx. 5MB).
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center space-y-6 py-4">
              <Avatar className="w-24 h-24 ring-2 ring-border overflow-clip">
                <AvatarImage 
                  src={previewUrl || currentAvatarUrl || user?.user_metadata?.avatar_url} 
                  alt="Preview"
                  className="!object-cover !object-center !w-full !h-full !block !rounded-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%'
                  }}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex space-x-2">
                <Button
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Escolher arquivo</span>
                </Button>

                {(currentAvatarUrl || user?.user_metadata?.avatar_url) && (
                  <Button
                    variant="outline"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                    className="flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Remover</span>
                  </Button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (variant === 'settings') {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className="relative">
          <Avatar className={cn(
            "w-32 h-32 ring-4 ring-border overflow-clip",
            "[&_img]:object-cover [&_img]:object-center [&_img]:w-full [&_img]:h-full [&_img]:block"
          )}>
            <AvatarImage 
              src={previewUrl || currentAvatarUrl || user?.user_metadata?.avatar_url} 
              alt="Profile picture"
              className="!object-cover !object-center !w-full !h-full !block !rounded-full"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                width: '100%',
                height: '100%',
                borderRadius: '50%'
              }}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="flex items-center space-x-2"
            size="sm"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Alterar foto</span>
          </Button>

          {(currentAvatarUrl || user?.user_metadata?.avatar_url) && (
            <Button
              variant="outline"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="flex items-center space-x-2"
              size="sm"
            >
              <X className="w-4 h-4" />
              <span>Remover</span>
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  // Variante 'compact' (padrão) - avatar simples e limpo
  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={cn(
        sizeClasses[size], 
        "ring-2 ring-background overflow-clip",
        "[&_img]:object-cover [&_img]:object-center [&_img]:w-full [&_img]:h-full [&_img]:block"
      )}>
        <AvatarImage 
          src={previewUrl || currentAvatarUrl || user?.user_metadata?.avatar_url} 
          alt="Profile picture"
          className="!object-cover !object-center !w-full !h-full !block !rounded-full"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            width: '100%',
            height: '100%',
            borderRadius: '50%'
          }}
        />
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {getUserInitials()}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
