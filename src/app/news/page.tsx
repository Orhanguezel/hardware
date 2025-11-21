import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, TrendingUp, Newspaper } from 'lucide-react'

interface NewsArticle {
  id: number
  title: string
  subtitle?: string
  excerpt?: string
  slug: string
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
  article_tags: Array<{
    tag: {
      id: number
      name: string
      slug: string
    }
  }>
  hero_image?: string
  comment_count?: number
  created_at: string
}

async function getNewsArticles() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?type=NEWS&status=PUBLISHED&ordering=-published_at`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news articles: ${response.status}`)
    }
    
    const data = await response.json()
    return data.results || data
  } catch (error) {
    console.error('Error fetching news articles:', error)
    return []
  }
}

async function getFeaturedNews() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?type=NEWS&status=PUBLISHED&ordering=-published_at&limit=3`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch featured news: ${response.status}`)
    }
    
    const data = await response.json()
    return data.results || data
  } catch (error) {
    console.error('Error fetching featured news:', error)
    return []
  }
}

export default async function NewsPage() {
  const [newsArticles, featuredNews] = await Promise.all([
    getNewsArticles(),
    getFeaturedNews()
  ])

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Haberler</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Teknoloji dünyasından en güncel haberler ve gelişmeler
        </p>
      </div>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold">Öne Çıkan Haberler</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredNews.map((article: NewsArticle) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {article.hero_image && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.hero_image} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">
                      {article.category.name}
                    </Badge>
                    {article.article_tags.slice(0, 2).map((tagWrapper) => (
                      tagWrapper.tag && (
                        <Badge key={tagWrapper.tag.id} variant="outline">
                          {tagWrapper.tag.name}
                        </Badge>
                      )
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/news/${article.slug}`} className="hover:text-primary transition-colors">
                      {article.title}
                    </Link>
                  </CardTitle>
                  {article.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.subtitle}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.published_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <Link href={`/news/${article.slug}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All News */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Tüm Haberler</h2>
          <div className="flex gap-2">
            <select className="px-3 py-2 border rounded-md bg-background text-sm">
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="popular">En Popüler</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsArticles.map((article: NewsArticle) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {article.hero_image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={article.hero_image} 
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {article.category.name}
                  </Badge>
                  {article.article_tags.slice(0, 2).map((tagWrapper) => (
                    tagWrapper.tag && (
                      <Badge key={tagWrapper.tag.id} variant="outline">
                        {tagWrapper.tag.name}
                      </Badge>
                    )
                  ))}
                </div>
                <CardTitle className="line-clamp-2">
                  <Link href={`/news/${article.slug}`} className="hover:text-primary transition-colors">
                    {article.title}
                  </Link>
                </CardTitle>
                {article.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.subtitle}
                  </p>
                )}
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.excerpt}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(article.published_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                  <Link href={`/news/${article.slug}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {newsArticles.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Henüz haber yok</h3>
                <p className="text-muted-foreground">
                  Şu anda görüntülenecek haber bulunmuyor.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}