import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getScoreColor } from '@/lib/utils'
import CommentSystem from '@/components/comments/comment-system'
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper'

interface ReviewPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getReview(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}/`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch review: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Check if it's a review and published
    if (data.type !== 'REVIEW' || data.status !== 'PUBLISHED') {
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error fetching review:', error)
    return null
  }
}

export async function generateMetadata({ params }: ReviewPageProps) {
  const { slug } = await params
  const review = await getReview(slug)
  
  if (!review) {
    return {
      title: 'İnceleme Bulunamadı',
      description: 'Aradığınız inceleme bulunamadı.'
    }
  }

  return {
    title: review.meta_title || review.title,
    description: review.meta_description || review.excerpt,
    openGraph: {
      title: review.meta_title || review.title,
      description: review.meta_description || review.excerpt,
      images: review.hero_image ? [review.hero_image] : [],
    },
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { slug } = await params
  const review = await getReview(slug)

  if (!review) {
    notFound()
  }


  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={review.id} />
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link href="/reviews" className="hover:text-primary">
          İncelemeler
        </Link>
        <span>/</span>
        <span className="text-foreground">{review.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <article className="space-y-8">
            {/* Header */}
            <header className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {review.category?.name}
                </Badge>
                {review.review_extra && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className={`text-lg font-semibold ${getScoreColor(review.review_extra.total_score)}`}>
                      {review.review_extra.total_score.toFixed(1)}/10
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {review.article_tags && review.article_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.article_tags.map((tag: any) => (
                    <Badge key={tag.id} variant="outline" className="text-sm">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-4xl font-bold">{review.title}</h1>
              {review.subtitle && (
                <p className="text-xl text-muted-foreground">{review.subtitle}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{review.author?.name || 'Anonim'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(review.published_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </header>

            {/* Hero Image */}
            {review.hero_image && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img 
                  src={review.hero_image} 
                  alt={review.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {review.content && typeof review.content === 'object' ? (
                <div dangerouslySetInnerHTML={{ __html: review.content.html || '' }} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: review.content || '' }} />
              )}
            </div>

            {/* Review Scores */}
            {review.review_extra && (
              <Card>
                <CardHeader>
                  <CardTitle>Değerlendirme Skorları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {review.review_extra.performance_score || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Performans</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {review.review_extra.stability_score || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Kararlılık</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {review.review_extra.coverage_score || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Kapsama</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {review.review_extra.software_score || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Yazılım</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {review.review_extra.value_score || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Değer</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </article>

          {/* Comments */}
          <div className="mt-12">
            <CommentSystem articleId={review.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yazar Hakkında</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{review.author?.name || 'Anonim'}</div>
                    <div className="text-sm text-muted-foreground">Yazar</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">İlgili İncelemeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/reviews" className="block hover:text-primary transition-colors">
                    <div className="text-sm font-medium">Tüm İncelemeler</div>
                    <div className="text-xs text-muted-foreground">Diğer incelemeleri görüntüle</div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}