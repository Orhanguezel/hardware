'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Heart, 
  Star, 
  ExternalLink,
  Calendar,
  ShoppingBag,
  ArrowRight
} from 'lucide-react'
import { FavoriteButton } from '@/components/product/favorite-button'

interface Favorite {
  id: number
  product: number
  created_at: string
  product: {
    id: number
    brand: string
    model: string
    slug: string
    cover_image?: string
    release_year?: number
    category?: {
      id: number
      name: string
      slug: string
    }
    review_count?: number
  }
}

export default function FavoritesPage() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchFavorites()
    }
  }, [session?.user?.id, page])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/favorites?page=${page}&limit=12`)
      console.log('Favorites page response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Favorites page data:', data)
        if (page === 1) {
          setFavorites(data.data)
        } else {
          setFavorites(prev => [...prev, ...data.data])
        }
        setHasMore(data.meta.page < data.meta.totalPages)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.log('Favorites page error:', errorData)
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromFavorites = (productId: number) => {
    setFavorites(prev => prev.filter(fav => fav.product.id !== productId))
  }

  if (!session) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Favori Listesi</h1>
          <p className="text-muted-foreground mb-4">
            Favorilerinizi görmek için giriş yapmanız gerekiyor.
          </p>
          <Button asChild>
            <Link href="/auth/signin">Giriş Yap</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (loading && favorites.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Favoriler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500" />
          Favori Listem
        </h1>
        <p className="text-muted-foreground">
          {favorites.length} ürün favorilerinizde
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Henüz favori ürününüz yok</h2>
          <p className="text-muted-foreground mb-4">
            Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
          </p>
          <Button asChild>
            <Link href="/products">Ürünleri Keşfet</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {favorite.product.category?.name || 'Kategori Yok'}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(favorite.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {favorite.product.brand} {favorite.product.model}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {favorite.product.cover_image && (
                    <div className="mb-4">
                      <img
                        src={favorite.product.cover_image}
                        alt={`${favorite.product.brand} ${favorite.product.model}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{favorite.product.release_year || 'Bilinmiyor'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{favorite.product.review_count || 0} inceleme</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/products/by-slug/${favorite.product.slug}`}>
                        Detayları Gör
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                    <FavoriteButton 
                      productId={favorite.product.id.toString()}
                      className="px-3"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button 
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
