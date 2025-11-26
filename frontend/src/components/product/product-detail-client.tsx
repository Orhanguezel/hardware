// src/components/product/product-detail-client.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Star,
  ExternalLink,
  Calendar,
  Settings,
  Eye,
  EyeOff,
  ShoppingCart,
  BarChart3,
  DollarSign,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { UserReviewForm } from '@/components/product/user-review-form'
import { ShareButton } from '@/components/product/share-button'
import { FavoriteButton } from '@/components/product/favorite-button'
import AffiliateButton from '@/components/tracking/AffiliateButton'
import { useSession } from 'next-auth/react'
import { useSettings } from '@/contexts/SettingsContext'

interface ProductTag {
  id: number
  name: string
  slug: string
  type: string
}

interface ProductCategory {
  // ❗ RTK ProductDto.Category.id => number, o yüzden union yapıyoruz
  id: string | number
  name: string
  slug: string
}

interface ProductSpec {
  name: string
  value: string
  unit: string
  sort_order: number
}

interface AffiliateLink {
  id: string
  merchant: string
  url_template: string
  active: boolean
}

interface PriceHistoryItem {
  id: number
  price: number
  currency: string
  source: string
  url: string | null
  // API'den hem recorded_at hem date gelebilir diye ikisini de opsiyonel tanımlıyoruz
  recorded_at?: string
  date?: string
}

interface ReviewUser {
  id: string
  name: string | null
  avatar: string | null
}

interface ProductReview {
  id: string | number
  rating: number
  title: string | null
  content: string
  // API string, string[] veya null dönebilir diye geniş tuttuk
  pros: string[] | string | null
  cons: string[] | string | null
  is_verified?: boolean
  isVerified?: boolean
  created_at?: string
  createdAt?: string | Date
  user: ReviewUser
}

/**
 * Bu Product interface'ini RTK ProductDto ile uyumlu hale getiriyoruz:
 * - id: number | string
 * - category.id: number | string
 * - _count opsiyonel
 */
interface Product {
  id: number | string
  brand: string
  model: string
  slug: string
  average_rating: number | null
  review_count: number | null
  description: string | null
  price: number | null
  release_year: number | null
  cover_image: string | null
  category: ProductCategory | null
  product_tags: ProductTag[]
  specs: ProductSpec[]
  affiliate_links: AffiliateLink[]
  price_history: PriceHistoryItem[]
  _count?: {
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
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const { data: session } = useSession()
  const { isAffiliateTrackingEnabled } = useSettings()

  // Get current URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

  // Fetch reviews when component mounts
  useEffect(() => {
    const fetchReviews = async () => {
      if (product.review_count && product.review_count > 0) {
        setReviewsLoading(true)
        try {
          const url = `/api/products/${product.slug}/reviews`
          const response = await fetch(url)

          if (response.ok) {
            const data: { success: boolean; data?: ProductReview[] } = await response.json()
            if (data.success && Array.isArray(data.data)) {
              setReviews(data.data)
            } else {
              setReviews([])
            }
          } else {
            // Hata durumunda boş bırak
            setReviews([])
          }
        } catch (error) {
          console.error('Network error fetching reviews:', error)
          setReviews([])
        } finally {
          setReviewsLoading(false)
        }
      }
    }

    fetchReviews()
  }, [product.slug, product.review_count])

  // Ortalama kullanıcı puanı
  const averageRating = product.average_rating || 0

  // Görünür özellikler - specs field'ını kullan
  const specsArray: ProductSpec[] = Array.isArray(product.specs) ? product.specs : []
  const visibleSpecs = specsArray.filter(
    (spec) => spec && spec.name && spec.value
  )
  const displayedSpecs = showAllSpecs ? visibleSpecs : visibleSpecs.slice(0, 6)

  const affiliateEnabled = isAffiliateTrackingEnabled()

  const getReviewDate = (review: ProductReview): string => {
    const created = review.created_at ?? review.createdAt
    if (!created) return ''
    const dateObj = created instanceof Date ? created : new Date(created)
    if (Number.isNaN(dateObj.getTime())) return ''
    return dateObj.toLocaleDateString('tr-TR')
  }

  const normalizeProsCons = (value: string[] | string | null | undefined): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const isReviewVerified = (review: ProductReview): boolean =>
    Boolean(review.is_verified ?? review.isVerified)

  const getPriceItemDate = (item: PriceHistoryItem): string => {
    const raw = item.recorded_at ?? item.date
    if (!raw) return ''
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleDateString('tr-TR')
  }

  const reviewCount = product.review_count ?? 0

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">
            Ürünler
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-foreground"
              >
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">
            {product.brand} {product.model}
          </span>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Sol Panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ürün Başlığı */}
          <div className="mb-8">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {product.category && (
                <Badge variant="outline">{product.category.name}</Badge>
              )}
              {product.product_tags?.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {product.release_year && (
                <span className="text-sm text-muted-foreground">
                  #{product.release_year}
                </span>
              )}
            </div>
            <h1 className="mb-4 text-4xl font-bold">
              {product.brand} {product.model}
            </h1>
            {product.price != null && (
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">
                  ₺{product.price.toLocaleString('tr-TR')}
                </span>
              </div>
            )}
            {product.description && (
              <p className="text-lg text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>

          {/* Kapak Resmi */}
          {product.cover_image && (
            <Card>
              <CardContent className="p-6">
                <Image
                  src={product.cover_image}
                  alt={`${product.brand} ${product.model}`}
                  width={800}
                  height={400}
                  className="h-64 w-full rounded-lg object-contain"
                />
              </CardContent>
            </Card>
          )}

          {/* Ürün Özellikleri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Teknik Özellikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {displayedSpecs.map((spec, index) => (
                  <div
                    key={`${spec.name}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                  >
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
                        <EyeOff className="h-4 w-4" />
                        Daha Az Göster
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
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
                  <DollarSign className="h-5 w-5" />
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
                {Array.isArray(product.price_history) &&
                product.price_history.length > 0 ? (
                  <div className="space-y-3">
                    {product.price_history.slice(0, 5).map((priceItem) => (
                      <div
                        key={priceItem.id}
                        className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                      >
                        <div className="flex items-center gap-4">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {affiliateEnabled ? (
                            <span className="font-medium">
                              {priceItem.source}
                            </span>
                          ) : (
                            <span className="font-medium text-muted-foreground">
                              Satıcı
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {getPriceItemDate(priceItem)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {priceItem.currency}{' '}
                            {priceItem.price.toLocaleString('tr-TR')}
                          </span>
                          {priceItem.url && affiliateEnabled && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={priceItem.url} target="_blank">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {product.price_history.length > 5 && (
                      <div className="pt-4 text-center">
                        <Button variant="outline" asChild>
                          <Link
                            href={`/products/by-slug/${product.slug}/price-history`}
                          >
                            Tüm Fiyat Geçmişini Görüntüle (
                            {product.price_history.length - 5} daha)
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <DollarSign className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Henüz fiyat geçmişi bulunmuyor</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link
                        href={`/products/by-slug/${product.slug}/price-history`}
                      >
                        Fiyat Geçmişi Sayfasına Git
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Affiliate Linkler */}
          {Array.isArray(product.affiliate_links) &&
            product.affiliate_links.length > 0 &&
            affiliateEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Satın Al
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {product.affiliate_links
                      .filter((link) => link.active)
                      .map((link) => (
                        <AffiliateButton
                          key={link.id}
                          productId={
                            typeof product.id === 'number'
                              ? product.id
                              : parseInt(product.id, 10)
                          }
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
            productId={String(product.id)}
            onReviewSubmitted={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
          />

          {/* Kullanıcı Yorumları */}
          {reviewCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Kullanıcı Yorumları ({reviewCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="py-4 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Yorumlar yükleniyor...
                      </p>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => {
                      const pros = normalizeProsCons(review.pros)
                      const cons = normalizeProsCons(review.cons)

                      return (
                        <div
                          key={review.id}
                          className="rounded-lg border p-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                              {review.user.avatar ? (
                                <Image
                                  src={review.user.avatar}
                                  alt={review.user.name || 'User'}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="font-semibold">
                                  {review.user.name?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="font-medium">
                                  {review.user.name || 'Anonymous'}
                                </span>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {getReviewDate(review)}
                                </span>
                                {isReviewVerified(review) && (
                                  <Badge className="flex items-center bg-blue-100 text-xs text-blue-800">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Doğrulanmış
                                  </Badge>
                                )}
                              </div>
                              {review.title && (
                                <h5 className="mb-2 font-medium">
                                  {review.title}
                                </h5>
                              )}
                              <p className="mb-3 text-sm text-muted-foreground">
                                {review.content}
                              </p>

                              {/* Artıları ve Eksileri */}
                              {(pros.length > 0 || cons.length > 0) && (
                                <div className="grid gap-4 md:grid-cols-2">
                                  {pros.length > 0 && (
                                    <div>
                                      <h6 className="mb-1 text-sm font-medium text-green-600">
                                        Artıları:
                                      </h6>
                                      <ul className="space-y-1 text-sm text-muted-foreground">
                                        {pros.map((pro, index) => (
                                          <li
                                            key={index}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="mt-1 text-green-500">
                                              •
                                            </span>
                                            <span>{pro}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {cons.length > 0 && (
                                    <div>
                                      <h6 className="mb-1 text-sm font-medium text-red-600">
                                        Eksileri:
                                      </h6>
                                      <ul className="space-y-1 text-sm text-muted-foreground">
                                        {cons.map((con, index) => (
                                          <li
                                            key={index}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="mt-1 text-red-500">
                                              •
                                            </span>
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
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground">
                        Henüz yorum bulunmuyor.
                      </p>
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
                <Star className="h-5 w-5" />
                Kullanıcı Değerlendirmesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold">
                  {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                </div>
                <div className="mb-2 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reviewCount} değerlendirme
                </p>
              </div>
            </CardContent>
          </Card>

          {/* En Son Fiyat */}
          {Array.isArray(product.price_history) &&
            product.price_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Güncel Fiyat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold">
                      {product.price_history[0].currency}{' '}
                      {product.price_history[0].price.toLocaleString('tr-TR')}
                    </div>
                    {affiliateEnabled && (
                      <p className="mb-4 text-sm text-muted-foreground">
                        {product.price_history[0].source}
                      </p>
                    )}
                    {product.price_history[0].url && affiliateEnabled && (
                      <Button asChild className="mb-2 w-full">
                        <Link
                          href={product.price_history[0].url}
                          target="_blank"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Satın Al
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      asChild
                      className="mt-2 w-full"
                    >
                      <Link
                        href={`/products/by-slug/${product.slug}/price-history`}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
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
                  <FavoriteButton
                    productId={String(product.id)}
                    className="w-full justify-start"
                  />
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
                      if (typeof window !== 'undefined') {
                        window.location.href = `/compare?add=${product.id}`
                      }
                    }}
                  >
                    <span className="mr-2">+</span>
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
                      if (typeof window !== 'undefined') {
                        window.location.href = `/compare?add=${product.id}`
                      }
                    }}
                  >
                    <span className="mr-2">+</span>
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
