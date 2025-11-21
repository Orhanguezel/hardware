'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Calendar, 
  MessageCircle, 
  Heart,
  Star,
  FileText,
  Package,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  role: string
  created_at: string
  email_visible: boolean
  profile_visible: boolean
  stats: {
    articles_count: number
    comments_count: number
    reviews_count: number
    favorites_count: number
  }
  recent_articles?: Array<{
    id: string
    title: string
    slug: string
    type: string
    published_at: string
    category: {
      name: string
      slug: string
    }
  }>
  recent_comments?: Array<{
    id: string
    content: string
    created_at: string
    article: {
      title: string
      slug: string
      type: string
    }
  }>
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchUserProfile(params.id as string)
    }
  }, [params.id])

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
        } else {
          setError(data.error || 'Kullanıcı bulunamadı')
        }
      } else if (response.status === 404) {
        setError('Kullanıcı bulunamadı')
      } else {
        setError('Kullanıcı bilgileri alınırken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError('Kullanıcı bilgileri alınırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getArticleUrl = (article: any) => {
    switch (article.type) {
      case 'REVIEW':
        return `/reviews/${article.slug}`
      case 'BEST_LIST':
        return `/best/${article.slug}`
      case 'COMPARE':
        return `/compare-articles/${article.slug}`
      case 'GUIDE':
        return `/guides/${article.slug}`
      case 'NEWS':
        return `/news/${article.slug}`
      default:
        return `/reviews/${article.slug}`
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Kullanıcı bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Kullanıcı Bulunamadı</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'Aradığınız kullanıcı bulunamadı.'}
          </p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={`http://localhost:8000${user.avatar}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)} tarihinde katıldı
                    </span>
                  </div>
                  {user.bio && (
                    <p className="text-muted-foreground mb-4">{user.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{user.stats.articles_count}</div>
              <div className="text-sm text-muted-foreground">Makale</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{user.stats.comments_count}</div>
              <div className="text-sm text-muted-foreground">Yorum</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{user.stats.reviews_count}</div>
              <div className="text-sm text-muted-foreground">İnceleme</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{user.stats.favorites_count}</div>
              <div className="text-sm text-muted-foreground">Favori</div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info - Only show if email is visible */}
        {user.email_visible && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Articles */}
        {user.recent_articles && user.recent_articles.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Son Makaleler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.recent_articles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{article.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{article.category.name}</Badge>
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={getArticleUrl(article)}>
                        Oku
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Comments */}
        {user.recent_comments && user.recent_comments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Son Yorumlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.recent_comments.map((comment) => (
                  <div key={comment.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="text-sm mb-2 line-clamp-2">{comment.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{comment.article.title}</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="mt-2">
                      <Link href={getArticleUrl(comment.article)}>
                        Makaleye Git
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        {!user.profile_visible && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Bu kullanıcı profilini gizli olarak ayarlamış
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
