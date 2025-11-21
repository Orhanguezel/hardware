'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Eye, 
  Edit, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react'

interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalUsers: number
  totalComments: number
  pendingComments: number
  totalProducts: number
  totalCategories: number
  views: number
  affiliateClicks: number
  newUsers: number
  newComments: number
}

interface RecentArticle {
  id: number
  title: string
  status: string
  author: {
    name: string
  }
  created_at: string
  comment_count?: number
}

interface RecentComment {
  id: number
  content: string
  status: string
  author: {
    name: string
  }
  article: {
    title: string
  }
  created_at: string
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Redirect EDITOR users to articles page
  useEffect(() => {
    if (session?.user?.role === 'EDITOR') {
      router.push('/admin/articles')
    }
  }, [session, router])
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([])
  const [recentComments, setRecentComments] = useState<RecentComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data.stats)
        setRecentArticles(result.data.recentArticles)
        setRecentComments(result.data.recentComments)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
          <p className="text-muted-foreground">
            Dashboard verileri yüklenirken bir hata oluştu.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Donanım inceleme sitesi yönetim paneli
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İçerik</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedArticles} yayında, {stats.draftArticles} taslak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Toplam kayıtlı üye
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Görüntülenme</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay toplam görüntülenme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Tıklama</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.affiliateClicks}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay toplam tıklama
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son İçerikler</CardTitle>
            <Button size="sm" asChild>
              <Link href="/admin/articles">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ekle
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{article.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{article.author.name}</span>
                      <span>•</span>
                      <span>{article.comment_count || 0} yorum</span>
                      <span>•</span>
                      <span>{new Date(article.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      article.status === 'PUBLISHED' ? 'default' : 
                      article.status === 'DRAFT' ? 'secondary' : 'outline'
                    }>
                      {article.status === 'PUBLISHED' ? 'Yayında' : 'Taslak'}
                    </Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/articles/edit/${article.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/articles">
                  Tüm İçerikleri Görüntüle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son Yorumlar</CardTitle>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {stats.pendingComments} bekliyor
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComments.map((comment) => (
                <div key={comment.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm mb-1 line-clamp-2">{comment.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{comment.author.name}</span>
                        <span>•</span>
                        <span>{comment.article.title}</span>
                        <span>•</span>
                        <span>{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <Badge variant={
                      comment.status === 'APPROVED' ? 'default' : 'secondary'
                    } className="ml-2">
                      {comment.status === 'APPROVED' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {comment.status === 'APPROVED' ? 'Onaylı' : 'Bekliyor'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/comments">
                  Tüm Yorumları Yönet
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'EDITOR') && (
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Link href="/admin/articles/new">
                  <Plus className="w-6 h-6" />
                  <span>Yeni İçerik</span>
                </Link>
              </Button>
            )}
            
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') && (
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Link href="/admin/products">
                  <Package className="w-6 h-6" />
                  <span>Ürünler</span>
                </Link>
              </Button>
            )}
            
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'EDITOR') && (
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Link href="/admin/analytics">
                  <BarChart3 className="w-6 h-6" />
                  <span>Analitikler</span>
                </Link>
              </Button>
            )}
            
            {session?.user?.role === 'SUPER_ADMIN' && (
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Link href="/admin/settings">
                  <Settings className="w-6 h-6" />
                  <span>Ayarlar</span>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
