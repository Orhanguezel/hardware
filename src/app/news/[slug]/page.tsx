import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Clock, Newspaper } from 'lucide-react'
import Link from 'next/link'
import CommentSystem from '@/components/comments/comment-system'
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper'
import { DJANGO_API_URL } from '@/lib/api'

interface NewsDetail {
  id: number
  title: string
  subtitle?: string
  excerpt?: string
  slug: string
  type: string
  status: string
  published_at: string
  author: {
    id: number
    first_name: string
    last_name: string
    username: string
    email: string
  }
  category: {
    id: number
    name: string
    slug: string
  }
  article_tags?: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  hero_image?: string
  content: string | {
    html: string
  }
  comment_count: number
  created_at: string
}

async function getNews(slug: string): Promise<NewsDetail | null> {
  try {
    const url = `http://localhost:8000/api/articles/${slug}/`
    console.log('Fetching news from Django API:', url)
    
    const response = await fetch(url, {
      cache: 'no-store',
    })

    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch news: ${response.status} ${response.statusText}`)
      console.error('Error response:', errorText)
      return null
    }

    const data = await response.json()
    console.log('News data:', data)
    
    // Check if it's a NEWS type article
    if (data.type === 'NEWS') {
      return data as NewsDetail
    }
    return null
  } catch (error) {
    console.error('Error fetching news:', error)
    return null
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetch(`http://localhost:8000/api/articles/?type=NEWS&status=PUBLISHED`, {
      cache: 'no-store',
    })
    
    if (!response.ok) {
      console.error('Failed to fetch news for static params:', response.status)
      return []
    }
    
    const result = await response.json()
    const news = result.results || result

    return news.map((newsItem: NewsDetail) => ({
      slug: newsItem.slug,
    }))
  } catch (error) {
    console.error('Error generating static params for news:', error)
    return []
  }
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const news = await getNews(slug)

  if (!news || news.type !== 'NEWS') {
    notFound()
  }

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={news.id} />
      <div className="max-w-4xl mx-auto">
        <Link href="/news" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Tüm Haberler
        </Link>

        <Card className="mb-8">
          {news.hero_image && (
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img
                src={news.hero_image}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="w-fit">
                {news.category?.name || 'Genel'}
              </Badge>
              <Badge variant="outline">
                <Newspaper className="w-3 h-3 mr-1" />
                Haber
              </Badge>
            </div>
            
            <CardTitle className="text-4xl font-extrabold leading-tight mb-2">
              {news.title}
            </CardTitle>
            
            {news.subtitle && (
              <p className="text-xl text-muted-foreground mb-4">{news.subtitle}</p>
            )}

            {/* Tags */}
            {news.article_tags && news.article_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {news.article_tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline" className="text-sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{news.author.first_name} {news.author.last_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(news.published_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="prose dark:prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: typeof news.content === 'string' 
                  ? news.content 
                  : news.content?.html || '' 
              }}
            />
          </CardContent>
        </Card>

        {/* Comment System */}
        <CommentSystem articleId={news.id} />
      </div>
    </div>
  )
}
