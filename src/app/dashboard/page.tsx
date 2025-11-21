'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Heart, 
  BookOpen, 
  MessageSquare, 
  Settings,
  Star,
  Eye,
  TrendingUp,
  Edit,
  Shield,
  Package
} from 'lucide-react'

interface UserStats {
  favorites_count: number
  reviews_count: number
  comments_count: number
  authoredArticles?: number
}

interface RecentActivity {
  type: string
  action: string
  item: string
  date: string
}

interface FavoriteProduct {
  id: number
  product: {
    id: number
    brand: string
    model: string
    slug: string
    category: {
      name: string
    }
  }
  created_at: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats>({
    favorites_count: 0,
    reviews_count: 0,
    comments_count: 0,
    authoredArticles: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      
      // Kullanıcı istatistikleri
      const statsResponse = await fetch('/api/user/stats')
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setUserStats(stats.data)
      }

      // Son aktiviteler
      const activityResponse = await fetch('/api/user/activity')
      if (activityResponse.ok) {
        const activity = await activityResponse.json()
        setRecentActivity(activity.data)
      }

      // Favori ürünler
      const favoritesResponse = await fetch('/api/user/favorites')
      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json()
        setFavoriteProducts(favorites.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchUserData()
  }, [session, status, router, fetchUserData])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-500" />
      case 'AUTHOR':
        return <Edit className="w-4 h-4 text-blue-500" />
      case 'EDITOR':
        return <BookOpen className="w-4 h-4 text-green-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Yönetici'
      case 'AUTHOR':
        return 'Yazar'
      case 'EDITOR':
        return 'Editör'
      default:
        return 'Kullanıcı'
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz, {session.user?.name}!</h1>
            <p className="text-muted-foreground">
              Kişisel dashboard'unuzda aktivitelerinizi takip edin
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getRoleIcon(session.user?.role || 'USER')}
            <Badge variant="secondary">
              {getRoleLabel(session.user?.role || 'USER')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favori Ürünler</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.favorites_count}</div>
            <p className="text-xs text-muted-foreground">
              Favoriye eklenen ürünler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yorumlar</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.comments_count}</div>
            <p className="text-xs text-muted-foreground">
              Toplam yorum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Değerlendirmeler</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.reviews_count}</div>
            <p className="text-xs text-muted-foreground">
              Yazdığım değerlendirmeler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific stats */}
      {(session.user?.role === 'AUTHOR' || session.user?.role === 'ADMIN') && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yazdığım Makaleler</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.authoredArticles || 0}</div>
              <p className="text-xs text-muted-foreground">
                Toplam makale
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Son Aktiviteler ({recentActivity.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const getIcon = (type: string) => {
                    switch (type) {
                      case 'favorite':
                        return <Heart className="h-4 w-4" />
                      case 'comment':
                        return <MessageSquare className="h-4 w-4" />
                      case 'review':
                        return <Star className="h-4 w-4" />
                      default:
                        return <Eye className="h-4 w-4" />
                    }
                  }
                  
                  return (
                    <div key={`${activity.type}-${activity.date}-${index}`} className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.action === 'added' ? 'Eklendi' : 
                           activity.action === 'created' ? 'Oluşturuldu' : 
                           activity.action}
                          : {activity.item}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Henüz aktivite bulunmuyor
              </p>
            )}
          </CardContent>
        </Card>

        {/* Favorite Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Favori Ürünler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteProducts.length > 0 ? (
              <div className="space-y-4">
                {favoriteProducts.slice(0, 3).map((favorite) => (
                  <div key={favorite.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <Link 
                        href={`/products/${favorite.product.slug}`}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        {favorite.product.brand} {favorite.product.model}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {favorite.product.category.name}
                      </p>
                    </div>
                  </div>
                ))}
                {favoriteProducts.length > 3 && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="/favorites">
                      Tümünü Gör ({favoriteProducts.length})
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-2">Henüz favori ürün yok</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products">Ürünleri Keşfet</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Hızlı İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild>
              <Link href="/favorites">
                <Heart className="w-4 h-4 mr-2" />
                Favorilerim
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Link>
            </Button>
            {(session.user?.role === 'AUTHOR' || session.user?.role === 'ADMIN' || session.user?.role === 'EDITOR') && (
              <Button variant="outline" asChild>
                <Link href="/admin/articles/new">
                  <Edit className="w-4 h-4 mr-2" />
                  Makale Yaz
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}