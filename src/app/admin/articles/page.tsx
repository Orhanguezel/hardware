'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Article {
  id: number
  title: string
  subtitle?: string
  type: string
  status: string
  author?: {
    id: number
    name: string
  }
  editor?: {
    id: number
    name: string
  }
  category?: {
    id: number
    name: string
  }
  article_tags?: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  published_at?: string
  created_at: string
  updated_at: string
  comment_count?: number
  review_extra?: {
    total_score: number
  }
}

// Helper function to get article URL based on type
function getArticleUrl(article: Article): string {
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

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/articles')
      const data = await response.json()
      
      if (data.success) {
        setArticles(data.data.articles)
      } else {
        console.error('Failed to fetch articles:', data.error)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (articleId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchArticles()
        alert('Makale durumu güncellendi')
      } else {
        alert(result.error || 'Durum güncellenemedi')
      }
    } catch (error) {
      console.error('Error updating article status:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!confirm(`"${articleTitle}" makalesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        await fetchArticles()
        alert('Makale silindi')
      } else {
        alert(result.error || 'Makale silinemedi')
      }
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('Bir hata oluştu')
    }
  }

  const filteredArticles = articles.filter(article => {
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (statusFilter !== 'all' && article.status.toLowerCase() !== statusFilter) {
      return false
    }
    if (typeFilter !== 'all' && article.type.toLowerCase() !== typeFilter) {
      return false
    }
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'archived':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Yayınlandı</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Taslak</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Arşivlendi</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Makaleler yükleniyor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Makale Yönetimi</h1>
            <p className="text-muted-foreground">
              Tüm makaleleri yönetin, yayınlayın ve düzenleyin
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Makale
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Arama</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Makale başlığı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="published">Yayınlandı</option>
                <option value="draft">Taslak</option>
                <option value="archived">Arşivlendi</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Tip</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
              >
                <option value="all">Tüm Tipler</option>
                <option value="review">İnceleme</option>
                <option value="best list">En İyi Listesi</option>
                <option value="compare">Karşılaştırma</option>
                <option value="guide">Rehber</option>
                <option value="news">Haber</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => (
          <Card key={article.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    {getStatusIcon(article.status)}
                    {getStatusBadge(article.status)}
                  </div>
                  
                  {article.subtitle && (
                    <p className="text-muted-foreground mb-3">{article.subtitle}</p>
                  )}

                  {/* Tags */}
                  {article.article_tags && article.article_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.article_tags.slice(0, 5).map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {article.article_tags.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{article.article_tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{article.author?.name || 'Bilinmiyor'}</span>
                    </div>
                    
                    {article.category && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{article.category.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {article.published_at 
                          ? new Date(article.published_at).toLocaleDateString('tr-TR')
                          : new Date(article.created_at).toLocaleDateString('tr-TR')
                        }
                      </span>
                    </div>

                    <span>{article.comment_count || 0} yorum</span>
                    
                    {article.review_extra && (
                      <span className="font-medium text-yellow-600">
                        ⭐ {article.review_extra.total_score}/10
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={getArticleUrl(article)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Görüntüle
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/articles/edit/${article.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Düzenle
                    </Link>
                  </Button>

                  {article.status.toLowerCase() !== 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(article.id, 'PUBLISHED')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Yayınla
                    </Button>
                  )}

                  {article.status.toLowerCase() === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(article.id, 'ARCHIVED')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Arşivle
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteArticle(article.id, article.title)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Makale Bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Arama kriterlerinize uygun makale bulunamadı.'
                  : 'Henüz hiç makale eklenmemiş.'
                }
              </p>
              <Button asChild>
                <Link href="/admin/articles/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Makale Ekle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}