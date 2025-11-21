'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  Star,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  Trash2
} from 'lucide-react'

interface Review {
  id: number
  rating: number
  title?: string
  content: string
  pros: string[]
  cons: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isVerified: boolean
  isHelpful: number
  createdAt: string
  product: {
    id: number
    brand: string
    model: string
    slug: string
  }
  user: {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
    avatar?: string
  }
}

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (ratingFilter) params.append('rating', ratingFilter)

      const response = await fetch(`/api/admin/reviews?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setReviews(result.data)
      } else {
        setError(result.error || 'Yorumlar yüklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Yorumlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm || statusFilter || ratingFilter) {
      fetchReviews()
    }
  }, [searchTerm, statusFilter, ratingFilter])

  const updateReviewStatus = async (reviewId: number, status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    try {
      setError(null)
      setSuccess(null)
      
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
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
        await fetchReviews()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Yorum güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error updating review status:', error)
      setError('Yorum güncellenirken hata oluştu')
    }
  }

  const deleteReview = async (reviewId: number) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return
    }

    try {
      setError(null)
      setSuccess(null)
      
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess('Yorum başarıyla silindi')
        await fetchReviews()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Yorum silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
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

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
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
          <h1 className="text-3xl font-bold">Ürün Yorumları</h1>
          <p className="text-muted-foreground">Ürünlere gelen kullanıcı yorumlarını yönetin ve onaylayın</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Arama</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ürün veya kullanıcı ara..."
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

            <div>
              <label className="text-sm font-medium">Puan</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
              >
                <option value="">Tüm Puanlar</option>
                <option value="5">5 Yıldız</option>
                <option value="4">4 Yıldız</option>
                <option value="3">3 Yıldız</option>
                <option value="2">2 Yıldız</option>
                <option value="1">1 Yıldız</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setRatingFilter('')
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
        {reviews.map((review) => {
          const displayName = `${review.user.firstName} ${review.user.lastName}`.trim() || review.user.username
          
          return (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Kullanıcı Avatarı */}
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    {review.user.avatar ? (
                      <img 
                        src={review.user.avatar} 
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
                          <div className="flex items-center gap-1">
                            {getRatingStars(review.rating)}
                          </div>
                          {getStatusBadge(review.status)}
                          {review.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Doğrulanmış
                            </Badge>
                          )}
                          <Badge className="bg-purple-100 text-purple-800">
                            Ürün Yorumu
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{review.product.brand} {review.product.model}</span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {review.status !== 'PENDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReviewStatus(review.id, 'PENDING')}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Beklemeye Çek
                          </Button>
                        )}
                        {review.status !== 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Onayla
                          </Button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reddet
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReview(review.id)}
                          className="border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-medium mb-2">{review.title}</h4>
                    )}

                    <p className="text-sm text-muted-foreground mb-3">{review.content}</p>

                    {/* Artıları ve Eksileri */}
                    {(review.pros.length > 0 || review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-green-600 mb-1">Artıları:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {review.pros.map((pro: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-1">•</span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-red-600 mb-1">Eksileri:</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {review.cons.map((con: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-red-500 mt-1">•</span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ürün Linki */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Bu yorum şu ürüne yazıldı:</span>
                        <a 
                          href={`/products/by-slug/${review.product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {review.product.brand} {review.product.model}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Yorum bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun ürün yorumu bulunamadı.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
