import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Scale, Calendar, Clock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function getCompareArticles() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?type=COMPARE&status=PUBLISHED`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`)
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching compare articles:', error)
    return []
  }
}

export default async function CompareArticlesPage() {
  const articles = await getCompareArticles()

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Karşılaştırma Makaleleri</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Ürünler arası detaylı karşılaştırmalar ve analizler
        </p>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Henüz karşılaştırma makalesi yok</h3>
            <p className="text-muted-foreground">
              Yakında detaylı karşılaştırma makaleleri eklenecek.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <Card key={article.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {article.hero_image ? (
                      <img 
                        src={article.hero_image} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground">Görsel</span>
                    )}
                  </div>
                  <Badge className="absolute top-4 left-4">
                    Karşılaştırma
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
                
                {article.subtitle && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {article.subtitle}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {article.author?.name || 'Anonim'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.published_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(article.published_at).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/compare-articles/${article.slug}`}>
                        Oku
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
