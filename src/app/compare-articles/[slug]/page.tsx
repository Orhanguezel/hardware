import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Scale, Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CommentSystem from '@/components/comments/comment-system'
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper'

interface CompareArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

interface CompareArticle {
  id: number
  title: string
  subtitle?: string
  content: string | {
    html: string
  }
  slug: string
  type: string
  status: string
  published_at: string
  author: {
    first_name: string
    last_name: string
  }
  category: {
    name: string
  }
  article_tags?: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  hero_image?: string
  comment_count?: number
}

async function getCompareArticle(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}/`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch article: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Check if it's a COMPARE type article
    if (data.type !== 'COMPARE' || data.status !== 'PUBLISHED') {
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error fetching compare article:', error)
    return null
  }
}

export default async function CompareArticlePage({ params }: CompareArticlePageProps) {
  const { slug } = await params
  const article = await getCompareArticle(slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={article.id} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/compare-articles">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Karşılaştırma Makalelerine Dön
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-5 h-5 text-primary" />
          <Badge variant="secondary">Karşılaştırma</Badge>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        {article.subtitle && (
          <p className="text-lg text-muted-foreground mb-4">{article.subtitle}</p>
        )}

        {/* Tags */}
        {article.article_tags && article.article_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.article_tags.map((tag: any) => (
              <Badge key={tag.id} variant="outline" className="text-sm">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {article.author?.name || 'Anonim'}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(article.published_at).toLocaleDateString('tr-TR')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(article.published_at).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Karşılaştırma Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: typeof article.content === 'string' 
                    ? article.content 
                    : JSON.stringify(article.content) 
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Article Info */}
          <Card>
            <CardHeader>
              <CardTitle>Makale Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Kategori:</span>
                <p>{article.category?.name || 'Genel'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Yazar:</span>
                <p>{article.author?.name || 'Anonim'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Yayın Tarihi:</span>
                <p>{new Date(article.published_at).toLocaleDateString('tr-TR')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Yorum Sayısı:</span>
                <p>{article.comment_count || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {article.article_tags && article.article_tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Etiketler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {article.article_tags.map((tag: any) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="mt-12">
        <CommentSystem 
          articleId={article.id}
          articleTitle={article.title}
        />
      </div>
    </div>
  )
}
