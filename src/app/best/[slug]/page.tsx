import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ExternalLink, Check, X, Award } from 'lucide-react'
import CommentSystem from '@/components/comments/comment-system'
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper'

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
  article_tags?: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
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

async function getBestList(slug: string): Promise<BestList | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}/`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch best list')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching best list:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bestList = await getBestList(slug)
  
  if (!bestList || bestList.type !== 'BEST_LIST') {
    return {
      title: 'En İyi Liste Bulunamadı',
      description: 'Aradığınız en iyi liste bulunamadı.'
    }
  }

  return {
    title: bestList.meta_title || bestList.title,
    description: bestList.meta_description || bestList.excerpt,
    openGraph: {
      title: bestList.meta_title || bestList.title,
      description: bestList.meta_description || bestList.excerpt,
      images: bestList.hero_image ? [bestList.hero_image] : [],
    },
  }
}

export default async function BestListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bestList = await getBestList(slug)

  if (!bestList || bestList.type !== 'BEST_LIST') {
    notFound()
  }

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Best List Data:', bestList)
    if (bestList.best_list_extra?.items) {
      console.log('Best List Items:', bestList.best_list_extra.items)
      bestList.best_list_extra.items.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          title: item.title,
          image: item.image,
          hasImage: !!item.image
        })
      })
    }
  }

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={bestList.id} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{bestList.category.name}</Badge>
          {bestList.best_list_extra?.items && bestList.best_list_extra.items.length > 0 && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Award className="w-3 h-3 mr-1" />
              {bestList.best_list_extra.items.length} Ürün
            </Badge>
          )}
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{bestList.title}</h1>
        {bestList.subtitle && (
          <p className="text-xl text-muted-foreground mb-4">{bestList.subtitle}</p>
        )}
        
        {/* Tags */}
        {bestList.article_tags && bestList.article_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {bestList.article_tags.map((tag: any) => (
              <Badge key={tag.id} variant="outline" className="text-sm">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        
        <p className="text-lg text-muted-foreground mb-6">{bestList.excerpt}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{bestList.author.first_name} {bestList.author.last_name}</span>
          <span>•</span>
          <span>{new Date(bestList.published_at).toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      {/* Hero Image */}
      {bestList.hero_image && (
        <div className="mb-8">
          <img 
            src={bestList.hero_image} 
            alt={bestList.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Best List Items */}
      {bestList.best_list_extra?.items && bestList.best_list_extra.items.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">En İyi Seçenekler</h2>
          
          {bestList.best_list_extra.items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-primary border-primary">
                        #{index + 1}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}/10</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    {item.price && (
                      <p className="text-lg font-semibold text-primary mt-1">{item.price}</p>
                    )}
                  </div>
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {item.description && (
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Pros */}
                  {item.pros && item.pros.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Artılar
                      </h4>
                      <ul className="space-y-1">
                        {item.pros.map((pro, proIndex) => (
                          <li key={proIndex} className="text-sm text-green-700 flex items-start gap-2">
                            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Cons */}
                  {item.cons && item.cons.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-1">
                        <X className="w-4 h-4" />
                        Eksiler
                      </h4>
                      <ul className="space-y-1">
                        {item.cons.map((con, conIndex) => (
                          <li key={conIndex} className="text-sm text-red-700 flex items-start gap-2">
                            <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {item.link && (
                  <Button asChild className="w-full">
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Satın Al
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Liste Öğeleri Bulunamadı</h3>
          <p className="text-muted-foreground">
            Bu liste henüz öğe içermiyor.
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="mt-12">
        <CommentSystem articleId={bestList.id.toString()} />
      </div>
    </div>
  )
}
