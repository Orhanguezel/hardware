'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  ExternalLink, 
  Calendar, 
  TrendingUp,
  Package,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Share2,
  BarChart3,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  LineChart
} from 'lucide-react'
import Link from 'next/link'
import { getScoreColor } from '@/lib/utils'
import { UserReviewForm } from '@/components/product/user-review-form'
import { ShareButton } from '@/components/product/share-button'
import { FavoriteButton } from '@/components/product/favorite-button'
import AffiliateButton from '@/components/tracking/AffiliateButton'
import { useSession } from 'next-auth/react'
import { useSettings } from '@/contexts/SettingsContext'

interface Product {
  id: string
  brand: string
  model: string
  slug: string
  description: string | null
  price: number | null
  release_year: number | null
  cover_image: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  product_tags: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  specs: Array<{
    name: string
    value: string
    unit: string
    sort_order: number
  }>
  affiliate_links: Array<{
    id: string
    merchant: string
    url_template: string
    active: boolean
  }>
  productSpecs: Array<{
    id: string
    name: string
    value: string
    unit: string | null
    type: string
    isVisible: boolean
    sortOrder: number
  }>
  price_history: Array<{
    id: number
    price: number
    currency: string
    source: string
    url: string | null
    date: string
  }>
  userReviews: Array<{
    id: string
    rating: number
    title: string | null
    content: string
    pros: string | null
    cons: string | null
    isVerified: boolean
    createdAt: Date
    user: {
      id: string
      name: string | null
      avatar: string | null
    }
  }>
  _count: {
    userReviews: number
  }
}

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [showAllSpecs, setShowAllSpecs] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [showPriceHistory, setShowPriceHistory] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const { data: session } = useSession()
  const { isAffiliateTrackingEnabled } = useSettings()

  // Get current URL on client side
  React.useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  // Fetch reviews when component mounts
  useEffect(() => {
    const fetchReviews = async () => {
      console.log('=== FRONTEND REVIEW FETCH DEBUG ===')
      console.log('Product slug:', product.slug)
      console.log('Product review_count:', product.review_count)
      
      if (product.review_count > 0) {
        setReviewsLoading(true)
        try {
          const url = `/api/products/${product.slug}/reviews`
          console.log('Fetching reviews from URL:', url)
          
          const response = await fetch(url)
          console.log('Reviews response status:', response.status)
          console.log('Reviews response headers:', Object.fromEntries(response.headers.entries()))
          
          if (response.ok) {
            const data = await response.json()
            console.log('Reviews data received:', data)
            setReviews(data.data || [])
          } else {
            const errorText = await response.text()
            console.error('Error response text:', errorText)
            try {
              const errorJson = JSON.parse(errorText)
              console.error('Error JSON:', errorJson)
            } catch (e) {
              console.error('Error text is not JSON:', errorText)
            }
          }
        } catch (error) {
          console.error('Network error fetching reviews:', error)
        } finally {
          setReviewsLoading(false)
        }
      } else {
        console.log('No reviews to fetch (review_count is 0)')
      }
    }

    fetchReviews()
  }, [product.slug, product.review_count])

  // Ortalama kullanıcı puanı hesaplama
  const averageRating = product.average_rating || 0

  // Görünür özellikler - specs field'ını kullan
  console.log('Product specs type:', typeof product.specs, product.specs)
  console.log('Product affiliate_links:', product.affiliate_links)
  console.log('Product cover_image:', product.cover_image)
  const specsArray = Array.isArray(product.specs) ? product.specs : []
  const visibleSpecs = specsArray.filter(spec => spec && spec.name && spec.value)
  const displayedSpecs = showAllSpecs ? visibleSpecs : visibleSpecs.slice(0, 6)

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">Ürünler</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/category/${product.category.slug}`} className="hover:text-foreground">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.brand} {product.model}</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ürün Başlığı */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {product.category && (
                <Badge variant="outline">{product.category.name}</Badge>
              )}
              {product.product_tags?.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {product.release_year && (
                <span className="text-sm text-muted-foreground">#{product.release_year}</span>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {product.brand} {product.model}
            </h1>
            {product.price && (
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">
                  ₺{product.price.toLocaleString('tr-TR')}
                </span>
              </div>
            )}
            {product.description && (
              <p className="text-lg text-muted-foreground">{product.description}</p>
            )}
          </div>

          {/* Kapak Resmi */}
          {product.cover_image && (
            <Card>
              <CardContent className="p-6">
                <img 
                  src={product.cover_image} 
                  alt={`${product.brand} ${product.model}`}
                  className="w-full h-64 object-contain rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Ürün Özellikleri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Teknik Özellikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedSpecs.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">{spec.name}</span>
                    <span className="text-muted-foreground">
                      {spec.value} {spec.unit && spec.unit}
                    </span>
                  </div>
                ))}
              </div>
              
              {visibleSpecs.length > 6 && (
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllSpecs(!showAllSpecs)}
                    className="gap-2"
                  >
                    {showAllSpecs ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Daha Az Göster
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Tümünü Göster ({visibleSpecs.length - 6} daha)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fiyat Geçmişi */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Fiyat Geçmişi
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPriceHistory(!showPriceHistory)}
                  >
                    {showPriceHistory ? 'Gizle' : 'Göster'}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/products/by-slug/${product.slug}/price-history`}>
                      Tümünü Görüntüle
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showPriceHistory && (
              <CardContent>
                {product.price_history && Array.isArray(product.price_history) && product.price_history.length > 0 ? (
                  <div className="space-y-3">
                    {product.price_history.slice(0, 5).map((price) => (
                      <div key={price.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {isAffiliateTrackingEnabled() ? (
                            <span className="font-medium">{price.source}</span>
                          ) : (
                            <span className="font-medium text-muted-foreground">Satıcı</span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {new Date(price.recorded_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">
                            {price.currency} {price.price.toLocaleString('tr-TR')}
                          </span>
                          {price.url && isAffiliateTrackingEnabled() && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={price.url} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {Array.isArray(product.price_history) && product.price_history.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" asChild>
                          <Link href={`/products/by-slug/${product.slug}/price-history`}>
                            Tüm Fiyat Geçmişini Görüntüle ({product.price_history.length - 5} daha)
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz fiyat geçmişi bulunmuyor</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href={`/products/by-slug/${product.slug}/price-history`}>
                        Fiyat Geçmişi Sayfasına Git
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Affiliate Linkler */}
          {product.affiliate_links && product.affiliate_links.length > 0 && isAffiliateTrackingEnabled() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Satın Al
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.affiliate_links
                    .filter(link => link.active)
                    .map((link) => (
                      <AffiliateButton
                        key={link.id}
                        productId={parseInt(product.id)}
                        merchant={link.merchant}
                        url={link.url_template}
                        className="w-full"
                      >
                        {link.merchant}
                      </AffiliateButton>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Kullanıcı Yorum Formu */}
          <UserReviewForm 
            productId={product.id}
            onReviewSubmitted={() => {
              // Sayfayı yenile
              window.location.reload()
            }}
          />

          {/* Kullanıcı Yorumları */}
          {product.review_count > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Yorumları ({product.review_count})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Yorumlar yükleniyor...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => {
                    const pros = review.pros || []
                    const cons = review.cons || []
                    
                    return (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            {review.user.avatar ? (
                              <img 
                                src={review.user.avatar} 
                                alt={review.user.name || 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold">{review.user.name?.charAt(0) || 'U'}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.user.name || 'Anonymous'}</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString('tr-TR')}
                              </span>
                              {review.is_verified && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Doğrulanmış
                                </Badge>
                              )}
                            </div>
                            {review.title && (
                              <h5 className="font-medium mb-2">{review.title}</h5>
                            )}
                            <p className="text-sm text-muted-foreground mb-3">{review.content}</p>
                            
                            {/* Artıları ve Eksileri */}
                            {(pros.length > 0 || cons.length > 0) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pros.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-green-600 mb-1">Artıları:</h6>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {pros.map((pro: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="text-green-500 mt-1">•</span>
                                          <span>{pro}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {cons.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-red-600 mb-1">Eksileri:</h6>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                      {cons.map((con: string, index: number) => (
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
                          </div>
                        </div>
                      </div>
                    )
                  })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Henüz yorum bulunmuyor.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">
          {/* Puan ve Değerlendirme */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Kullanıcı Değerlendirmesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(averageRating) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {product.review_count} değerlendirme
                </p>
              </div>
            </CardContent>
          </Card>

          {/* En Son Fiyat */}
          {product.price_history && product.price_history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Güncel Fiyat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {product.price_history[0].currency} {product.price_history[0].price.toLocaleString('tr-TR')}
                  </div>
                  {isAffiliateTrackingEnabled() && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {product.price_history[0].source}
                    </p>
                  )}
                  {product.price_history[0].url && isAffiliateTrackingEnabled() && (
                    <Button asChild className="w-full">
                      <Link href={product.price_history[0].url} target="_blank">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Satın Al
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild className="w-full mt-2">
                    <Link href={`/products/by-slug/${product.slug}/price-history`}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Fiyat Geçmişi
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hızlı Erişim */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {session ? (
                <>
                  <FavoriteButton productId={product.id} className="w-full justify-start" />
                  <ShareButton 
                    url={currentUrl || `/products/by-slug/${product.slug}`}
                    title={`${product.brand} ${product.model}`}
                    description={product.description || ''}
                    className="w-full justify-start"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Karşılaştırma sayfasına yönlendir
                      window.location.href = `/compare?add=${product.id}`
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Karşılaştır
                  </Button>
                </>
              ) : (
                <>
                  <ShareButton 
                    url={currentUrl || `/products/by-slug/${product.slug}`}
                    title={`${product.brand} ${product.model}`}
                    description={product.description || ''}
                    className="w-full justify-start"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Karşılaştırma sayfasına yönlendir
                      window.location.href = `/compare?add=${product.id}`
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Karşılaştır
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
