'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Star, ArrowRight, Calendar, Clock } from 'lucide-react'
import { formatDate, getScoreColor } from '@/lib/utils'

interface Review {
  id: number
  title: string
  subtitle?: string
  excerpt: string
  slug: string
  type: string
  status: string
  published_at: string
  author: {
    name: string
  }
  category: {
    name: string
  }
  review_extra?: {
    total_score: number
  }
  hero_image?: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?type=REVIEW&status=PUBLISHED')
      const result = await response.json()
      
      if (result.success) {
        setReviews(result.data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
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
            <p>İncelemeler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Donanım İncelemeleri</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          En güncel router, modem ve ağ ekipmanları hakkında detaylı incelemelerimizi keşfedin. 
          Objektif testler ve uzman analizleri ile doğru seçimi yapın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <Card key={review.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {review.hero_image ? (
                    <img 
                      src={review.hero_image} 
                      alt={review.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">Görsel</span>
                  )}
                </div>
                <Badge className="absolute top-4 left-4">
                  {review.category.name}
                </Badge>
                {review.review_extra && review.review_extra.total_score && (
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-full px-3 py-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className={`text-sm font-semibold ${getScoreColor(review.review_extra.total_score)}`}>
                        {review.review_extra.total_score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <CardTitle className="mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {review.title}
              </CardTitle>
              
              {review.subtitle && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {review.subtitle}
                </p>
              )}
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {review.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(new Date(review.published_at))}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {review.author.name}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/reviews/${review.slug}`}>
                    Devamını Oku
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Henüz inceleme yok</h3>
              <p className="text-muted-foreground">
                Yakında detaylı donanım incelemeleri yayınlanacak.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
