import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Star, ArrowRight, Award, TrendingUp } from 'lucide-react'

interface BestList {
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
  best_list_extra?: {
    items: Array<{
      id: string
      title: string
      description: string
      image: string
      pros: string[]
      cons: string[]
      price: string
      rating: number
      link: string
    }>
  }
}

async function getBestLists(): Promise<BestList[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?type=BEST_LIST&status=PUBLISHED&ordering=-published_at`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch best lists')
    }
    
    const data = await response.json()
    return data.results || data
  } catch (error) {
    console.error('Error fetching best lists:', error)
    return []
  }
}

export default async function BestPage() {
  const bestLists = await getBestLists()

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Award className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">En İyi Ürün Rehberleri</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Farklı kategorilerde en iyi donanım seçeneklerini bulun. 
          Uzman ekibimizin detaylı testleri ile hazırlanmış kapsamlı rehberler.
        </p>
      </div>

      {bestLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bestLists.map((list) => (
          <Card key={list.id} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {list.hero_image ? (
                    <img 
                      src={list.hero_image} 
                      alt={list.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">Görsel</span>
                  )}
                </div>
                <Badge className="absolute top-4 left-4">
                  {list.category.name}
                </Badge>
                {list.best_list_extra?.items && list.best_list_extra.items.length > 0 && (
                  <Badge variant="outline" className="absolute top-4 right-4 bg-background/90 backdrop-blur text-blue-600 border-blue-600">
                    <Star className="w-3 h-3 mr-1" />
                    {list.best_list_extra.items.length} Ürün
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <CardTitle className="mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {list.title}
              </CardTitle>
              
              {list.subtitle && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {list.subtitle}
                </p>
              )}
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {list.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <span>{new Date(list.published_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {list.author.first_name} {list.author.last_name}
                </span>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/best/${list.slug}`}>
                    Rehberi İncele
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
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Henüz En İyi Liste Bulunmuyor</h3>
          <p className="text-muted-foreground">
            Yakında farklı kategorilerde en iyi ürün rehberleri yayınlanacak.
          </p>
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-semibold mb-2">Sürekli Güncellenen İçerik</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Yeni ürünler çıktıkça rehberlerimizi güncelliyoruz. 
            En güncel öneriler için bizi takip etmeye devam edin.
          </p>
        </div>
      </div>
    </div>
  )
}
