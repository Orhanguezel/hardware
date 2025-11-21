'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Trash2
} from 'lucide-react'

interface Comment {
  id: number
  content: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  authorName: string
  authorEmail: string
  ipAddress: string
  article: {
    id: number
    title: string
    slug: string | null
    type: string
  } | null
  user: {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    avatar?: string
  } | null
}

// Helper function to get article URL based on type
function getArticleUrl(article: { slug: string | null; type: string }): string | null {
  // Check if slug exists and is valid
  if (!article.slug || 
      article.slug === 'undefined' || 
      article.slug === 'null' || 
      article.slug === 'None' ||
      article.slug.trim() === '') {
    console.warn('Article slug is undefined or invalid:', article)
    return null
  }

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

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/comments?${params}`)
      const result = await response.json()
      
      if (result.success) {
        // Debug logging to see what data we're receiving
        console.log('Comments data received:', result.data)
        result.data.forEach((comment: any, index: number) => {
          if (comment.article) {
            console.log(`Comment ${index + 1} article data:`, {
              id: comment.article.id,
              title: comment.article.title,
              slug: comment.article.slug,
              slugType: typeof comment.article.slug,
              type: comment.article.type
            })
          }
        })
        setComments(result.data)
      } else {
        setError(result.error || 'Yorumlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError('Yorumlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm || statusFilter) {
      fetchComments()
    }
  }, [searchTerm, statusFilter])

  const updateCommentStatus = async (commentId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      setError(null)
      setSuccess(null)
      
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()
      
      if (result.success) {
        let statusText = ''
        switch (status) {
          case 'PENDING':
            statusText = 'beklemeye çekildi'
            break
          case 'APPROVED':
            statusText = 'onaylandı'
            break
          case 'REJECTED':
            statusText = 'reddedildi'
            break
        }
        setSuccess(`Yorum ${statusText}`)
        await fetchComments()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Yorum güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error updating comment status:', error)
      setError('Yorum güncellenirken hata oluştu')
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess('Yorum başarıyla silindi')
        await fetchComments()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Yorum silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      setError('Yorum silinirken hata oluştu')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Onaylandı</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>
      case 'PENDING':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Yorumlar yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Makale Yorumları</h1>
          <p className="text-muted-foreground">Makalelere gelen yorumları yönetin ve onaylayın</p>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <span>{success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filtreler */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Arama</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Makale veya yorumcu ara..."
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
                <option value="">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="APPROVED">Onaylandı</option>
                <option value="REJECTED">Reddedildi</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                }}
                className="w-full"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yorum Listesi */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const displayName = comment.user ? 
            `${comment.user.firstName} ${comment.user.lastName}`.trim() || comment.user.username :
            comment.authorName || 'Anonim'
          
          return (
            <Card key={comment.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Kullanıcı Avatarı */}
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.user?.avatar ? (
                      <img 
                        src={comment.user.avatar} 
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Yorum İçeriği */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{displayName}</h3>
                          {getStatusBadge(comment.status)}
                          <Badge className="bg-blue-100 text-blue-800">
                            Makale Yorumu
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{comment.article?.title || 'Bilinmeyen Makale'}</span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                          {comment.user && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Kayıtlı Kullanıcı
                              </span>
                            </>
                          )}
                          {!comment.user && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                Misafir
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {comment.status !== 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCommentStatus(comment.id, 'PENDING')}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Beklemeye Çek
                          </Button>
                        )}
                        {comment.status !== 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => updateCommentStatus(comment.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Onayla
                          </Button>
                        )}
                        {comment.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCommentStatus(comment.id, 'REJECTED')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reddet
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteComment(comment.id)}
                          className="border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{comment.content}</p>

                    {/* Makale Linki */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bu yorum şu makaleye yazıldı:</span>
                        {comment.article && getArticleUrl(comment.article) ? (
                          <a 
                            href={getArticleUrl(comment.article)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {comment.article.title}
                          </a>
                        ) : (
                          <span className="text-gray-500 font-medium">
                            {comment.article?.title || 'Bilinmeyen Makale'} (Link mevcut değil)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {comments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Yorum bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun makale yorumu bulunamadı.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}