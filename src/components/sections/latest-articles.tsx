import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight,User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

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
  category?: {
    id: number
    name: string
    slug: string
  }
  published_at: string
  created_at: string
  comment_count?: number
}

async function getLatestArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?status=PUBLISHED&limit=4`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Failed to fetch articles:', response.status)
      return []
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

const typeColors = {
  'REVIEW': 'default',
  'NEWS': 'secondary',
  'GUIDE': 'outline',
  'BEST_LIST': 'success',
  'COMPARE': 'destructive'
} as const

const typeLabels = {
  'REVIEW': 'İnceleme',
  'NEWS': 'Haber',
  'GUIDE': 'Rehber',
  'BEST_LIST': 'En İyi Listeler',
  'COMPARE': 'Karşılaştırma'
} as const

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

export async function LatestArticles() {
  const articles = await getLatestArticles()
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Son Yazılar
            </h2>
            <p className="text-muted-foreground">
              En güncel donanım haberleri, incelemeler ve rehberler
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/articles">
              Tümünü Gör
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">Henüz yayınlanmış makale bulunmuyor.</p>
            </div>
          ) : (
            articles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <div className="aspect-video md:aspect-square bg-muted rounded-l-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Görsel</span>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={typeColors[article.type as keyof typeof typeColors] || 'default'}>
                        {typeLabels[article.type as keyof typeof typeLabels] || article.type}
                      </Badge>
                      <Badge variant="outline">
                        {article.category?.name || 'Genel'}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.subtitle || 'Makale içeriği...'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(new Date(article.published_at))}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{article.author?.name || 'Anonim'}</span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={getArticleUrl(article)}>
                          Oku
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
