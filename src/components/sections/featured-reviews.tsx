import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Star, ArrowRight, ExternalLink } from 'lucide-react'
import { formatScore, getScoreColor } from '@/lib/utils'

interface FeaturedReview {
  id: number
  title: string
  subtitle?: string
  excerpt: string
  slug: string
  hero_image?: string
  published_at: string
  author: {
    first_name: string
    last_name: string
  }
  category: {
    name: string
  }
  review_extra?: {
    total_score: number
  }
}

async function getFeaturedReviews(): Promise<FeaturedReview[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?type=REVIEW&status=PUBLISHED&ordering=-review_extra__total_score&limit=3`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured reviews')
    }
    
    const data = await response.json()
    return data.results || data
  } catch (error) {
    console.error('Error fetching featured reviews:', error)
    return []
  }
}

export async function FeaturedReviews() {
  const featuredReviews = await getFeaturedReviews()

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Öne Çıkan İçerikler
          </Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            En Popüler İncelemeler
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Uzman ekibimizin detaylı testleri ile hazırladığı en güncel donanım incelemeleri
          </p>
        </div>

        {featuredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredReviews.map((review) => (
            <Card key={review.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  {review.hero_image ? (
                    <img 
                      src={review.hero_image} 
                      alt={review.title}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">Görsel</span>
                    </div>
                  )}
                  <Badge className="absolute top-4 left-4">
                    {review.category.name}
                  </Badge>
                  {review.review_extra?.total_score && (
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-full px-3 py-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className={`text-sm font-semibold ${getScoreColor(review.review_extra.total_score)}`}>
                          {formatScore(review.review_extra.total_score)}
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
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {review.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{new Date(review.published_at).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {review.author.first_name} {review.author.last_name}
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Henüz öne çıkan inceleme bulunmuyor.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/reviews">
              Tüm İncelemeleri Gör
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
