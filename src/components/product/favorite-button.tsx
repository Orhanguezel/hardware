'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

// made by byiyuel

interface FavoriteButtonProps {
  productId: string
  className?: string
}

export function FavoriteButton({ productId, className = '' }: FavoriteButtonProps) {
  const { data: session } = useSession()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if product is in favorites
  useEffect(() => {
    if (session?.user?.id) {
      checkFavoriteStatus()
    }
  }, [session?.user?.id, productId])

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/check?productId=${productId}`)
      
      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isFavorite)
      } else if (response.status === 401) {
        // User not logged in, that's fine
        setIsFavorite(false)
      } else {
        setIsFavorite(false)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
      setIsFavorite(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!session?.user?.id) {
      toast.error('Favori eklemek için giriş yapmanız gerekiyor')
      return
    }

    setIsLoading(true)
    
    try {
      const action = isFavorite ? 'remove' : 'add'
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          action
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.isFavorite)
        toast.success(data.message)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  // Show button for all users, but handle login requirement in click handler

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`${className} transition-all duration-200 ${
        isFavorite 
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
          : 'hover:bg-red-50 hover:border-red-300'
      }`}
    >
      <Heart 
        className={`w-4 h-4 ${
          isFavorite ? 'fill-current' : ''
        } ${isLoading ? 'animate-pulse' : ''}`} 
      />
    </Button>
  )
}
