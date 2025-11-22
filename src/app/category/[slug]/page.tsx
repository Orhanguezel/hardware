import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Filter, 
  Star, 
  Calendar, 
  Clock,
  MessageSquare,
  ChevronRight,
  Home,
  Package,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, getScoreColor } from '@/lib/utils'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    type?: string
    tag?: string
    sort?: string
    page?: string
    view?: string
  }>
}

async function getCategory(slug: string) {
  try {
    // First try to get all categories and find by slug
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }
    
    const data = await response.json()
    const categories = data.results || data
    
    // Find category by slug
    const category = categories.find((cat: any) => cat.slug === slug)
    
    if (!category) {
      return null
    }
    
    // Organize categories into hierarchical structure
    const organizedCategory = organizeCategoryWithChildren(category, categories)
    
    return organizedCategory
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

function organizeCategoryWithChildren(category: any, allCategories: any[]) {
  // Find children categories
  const children = allCategories.filter(cat => cat.parent === category.id)
  
  // Find parent category if exists
  const parent = category.parent ? allCategories.find(cat => cat.id === category.parent) : null
  
  return {
    ...category,
    children: children.length > 0 ? children : undefined,
    parent: parent || undefined
  }
}

async function getCategoryArticles(categoryId: number, params: any) {
  try {
    const searchParams = new URLSearchParams()
    searchParams.append('category', categoryId.toString())
    searchParams.append('status', 'PUBLISHED')
    
    // Handle type filtering
    if (params.type) {
      searchParams.append('type', params.type)
    }
    
    if (params.tag) searchParams.append('tags__slug', params.tag)
    if (params.sort) searchParams.append('ordering', params.sort === 'score' ? '-review_extra__score_numeric' : params.sort === 'comments' ? '-comment_count' : '-published_at')
    searchParams.append('page', params.page || '1')
    searchParams.append('limit', '12')

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?${searchParams.toString()}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`)
    }
    
    const data = await response.json()
    const articles = data.results || []
    
    // Filter articles based on view
    if (params.view === 'products') {
      const filteredArticles = articles.filter((article: any) => 
        ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE'].includes(article.type)
      )
      return {
        results: filteredArticles,
        count: filteredArticles.length
      }
    }
    
    // For articles view, return all articles
    return data
  } catch (error) {
    console.error('Error fetching articles:', error)
    return { results: [], count: 0 }
  }
}

async function getCategoryProducts(categoryId: number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/?category=${categoryId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getCategoryArticleCount(categoryId: number, view: string) {
  try {
    const searchParams = new URLSearchParams()
    searchParams.append('category', categoryId.toString())
    searchParams.append('status', 'PUBLISHED')
    
    // Exclude NEWS type articles from product view
    if (view === 'products') {
      // Django REST Framework doesn't support comma-separated values for type
      // We'll fetch all articles and filter on the frontend
      searchParams.append('limit', '1000') // Get more articles to filter
    } else {
      searchParams.append('limit', '1') // Just get count for articles view
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?${searchParams.toString()}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch article count: ${response.status}`)
    }
    
    const data = await response.json()
    const articles = data.results || []
    
    // Filter articles based on view
    if (view === 'products') {
      const filteredArticles = articles.filter((article: any) => 
        ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE'].includes(article.type)
      )
      return filteredArticles.length
    }
    
    return data.count || 0
  } catch (error) {
    console.error('Error fetching article count:', error)
    return 0
  }
}

async function getReviewCount(categoryId: number) {
  try {
    const searchParams = new URLSearchParams()
    searchParams.append('category', categoryId.toString())
    searchParams.append('status', 'PUBLISHED')
    searchParams.append('limit', '1000') // Get all articles to filter

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?${searchParams.toString()}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch review count: ${response.status}`)
    }
    
    const data = await response.json()
    const articles = data.results || []
    
    // Always filter to get only review-type articles (exclude NEWS)
    const reviewArticles = articles.filter((article: any) => 
      ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE'].includes(article.type)
    )
    
    return reviewArticles.length
  } catch (error) {
    console.error('Error fetching review count:', error)
    return 0
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const page = parseInt(searchParamsResolved.page || '1')
  const view = searchParamsResolved.view || 'products' // Default to products
  

  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  // Fetch articles, products, and counts based on view
  const [articlesData, products, articleCount, reviewCount, totalArticleCount] = await Promise.all([
    getCategoryArticles(category.id, { ...searchParamsResolved, view }),
    getCategoryProducts(category.id), // Always fetch products to get correct count
    getCategoryArticleCount(category.id, view),
    getReviewCount(category.id), // Always get review count (excludes NEWS)
    getCategoryArticleCount(category.id, 'articles') // Always get total article count for consistency
  ])

  const articles = articlesData.results || []
  const totalArticles = view === 'articles' ? articlesData.count || 0 : articleCount

  // Get all tags and article types for filtering
  const allTags = Array.from(
    new Set(
      articles.flatMap((article: any) => 
        article.tags || []
      )
    )
  ).sort((a: any, b: any) => a.name.localeCompare(b.name))

  // Filter article types based on view
  const availableTypes = view === 'products' 
    ? ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE'] 
    : ['REVIEW', 'NEWS', 'GUIDE', 'BEST_LIST', 'COMPARE']
  
  const articleTypes = Array.from(
    new Set(articles.map((article: any) => article.type))
  ).filter((type: any) => availableTypes.includes(type)).sort()

  const totalPages = Math.ceil(totalArticles / 12)

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary flex items-center gap-1">
          <Home className="w-4 h-4" />
          Ana Sayfa
        </Link>
        <ChevronRight className="w-4 h-4" />
        {category.parent && (
          <>
            <Link href={`/category/${category.parent.slug}`} className="hover:text-primary">
              {category.parent.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
          </>
        )}
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sol Panel - Filtreler */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alt Kategoriler */}
              {category.children && category.children.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Alt Kategoriler</h3>
                  <div className="space-y-2">
                    {category.children.map((child: any) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        className="block p-2 rounded hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{child.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(child.article_count || 0) + (child.product_count || 0)}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Makale Türleri - Her iki görünümde de */}
              {articleTypes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">İçerik Türü</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/category/${slug}?view=${view}`}
                      className="block p-2 rounded hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">Tümü</span>
                    </Link>
                    {articleTypes.map((type: any) => {
                      const typeLabels = {
                        'REVIEW': 'İnceleme',
                        'NEWS': 'Haber',
                        'GUIDE': 'Rehber',
                        'BEST_LIST': 'En İyi Listeler',
                        'COMPARE': 'Karşılaştırma'
                      }
                      return (
                        <Link
                          key={type}
                          href={`/category/${slug}?view=${view}&type=${type}`}
                          className="block p-2 rounded hover:bg-muted transition-colors"
                        >
                          <span className="text-sm">{typeLabels[type as keyof typeof typeLabels] || type}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Etiketler - Her iki görünümde de */}
              {allTags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Etiketler</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allTags.map((tag: any) => (
                      <Link
                        key={tag.id}
                        href={`/category/${slug}?view=${view}&tag=${tag.slug}`}
                        className="block p-2 rounded hover:bg-muted transition-colors"
                      >
                        <span className="text-sm">{tag.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sıralama - Her iki görünümde de */}
              {(
                <div>
                  <h3 className="font-semibold mb-3">Sıralama</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/category/${slug}?view=${view}`}
                      className="block p-2 rounded hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">En Yeni</span>
                    </Link>
                    <Link
                      href={`/category/${slug}?view=${view}&sort=score`}
                      className="block p-2 rounded hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">En Yüksek Puan</span>
                    </Link>
                    <Link
                      href={`/category/${slug}?view=${view}&sort=comments`}
                      className="block p-2 rounded hover:bg-muted transition-colors"
                    >
                      <span className="text-sm">En Çok Yorum</span>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ana İçerik */}
        <div className="lg:w-3/4">
          {/* Kategori Başlığı */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
            <p className="text-muted-foreground mb-4">
              {view === 'products' 
                ? `${products.length} ürün bulundu`
                : `${totalArticles} makale bulundu`
              }
              {searchParamsResolved.type && ` - ${searchParamsResolved.type} türünde`}
              {searchParamsResolved.tag && ` - ${searchParamsResolved.tag} etiketi`}
            </p>
            
            {/* Görünüm Seçici */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={view === 'products' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={`/category/${slug}?view=products`}>
                  <Package className="w-4 h-4 mr-2" />
                  Ürünler ({products.length})
                </Link>
              </Button>
              <Button
                variant={view === 'articles' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={`/category/${slug}?view=articles`}>
                  <FileText className="w-4 h-4 mr-2" />
                  İncelemeler ({totalArticleCount})
                </Link>
              </Button>
            </div>
            
            {/* Aktif Filtreler */}
            <div className="flex flex-wrap gap-2">
              {searchParamsResolved.type && (
                <Badge variant="secondary" className="gap-1">
                  {searchParamsResolved.type}
                  <Link href={`/category/${slug}?view=${view}`} className="ml-1">×</Link>
                </Badge>
              )}
              {searchParamsResolved.tag && (
                <Badge variant="secondary" className="gap-1">
                  {searchParamsResolved.tag}
                  <Link href={`/category/${slug}?view=${view}`} className="ml-1">×</Link>
                </Badge>
              )}
            </div>
          </div>

          {/* Ürünler */}
          {view === 'products' && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Ürünler ({products.length})</h2>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product: any) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                          {product.cover_image ? (
                            <img 
                              src={product.cover_image} 
                              alt={`${product.brand} ${product.model}`}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted-foreground/20 rounded flex items-center justify-center">
                              <span className="text-2xl">📦</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {product.brand} {product.model}
                          </h3>
                          
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {product.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">
                                {product.review_count || 0} değerlendirme
                              </span>
                            </div>
                            <Button size="sm" asChild>
                              <Link href={`/products/by-slug/${product.slug}`}>
                                Detayları Gör
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Bu kategoride ürün bulunamadı.</p>
                </div>
              )}
            </div>
          )}

          {/* Makaleler */}
          {view === 'articles' && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">İncelemeler ({totalArticles})</h2>
              {articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((article: any) => (
                    <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="p-0">
                        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                          {article.hero_image ? (
                            <img 
                              src={article.hero_image} 
                              alt={article.title}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground text-sm">Görsel</p>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary">
                            {(() => {
                              const typeLabels = {
                                'REVIEW': 'İnceleme',
                                'NEWS': 'Haber',
                                'GUIDE': 'Rehber',
                                'BEST_LIST': 'En İyi Listeler',
                                'COMPARE': 'Karşılaştırma'
                              }
                              return typeLabels[article.type as keyof typeof typeLabels] || article.type
                            })()}
                          </Badge>
                        </div>
                        {article.review_extra && article.review_extra.score_numeric && (
                          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur rounded-full px-3 py-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className={`text-sm font-semibold ${getScoreColor(article.review_extra.score_numeric)}`}>
                                {article.review_extra.score_numeric.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          
                          {article.excerpt && (
                            <p className="text-muted-foreground text-sm line-clamp-3">
                              {article.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(article.published_at)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{article.comment_count || 0}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium">
                                  {article.author?.first_name?.charAt(0).toUpperCase() || 'A'}
                                </span>
                              </div>
                              <span className="text-sm">{article.author?.first_name || 'Anonim'}</span>
                            </div>
                            
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={(() => {
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
                              })()}>
                                Devamını Oku
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Bu kategoride inceleme bulunamadı.</p>
                </div>
              )}

              {/* Pagination - Sadece incelemeler için */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      asChild
                    >
                      <Link href={`/category/${slug}?view=articles&page=${pageNum}${searchParamsResolved.type ? `&type=${searchParamsResolved.type}` : ''}${searchParamsResolved.tag ? `&tag=${searchParamsResolved.tag}` : ''}${searchParamsResolved.sort ? `&sort=${searchParamsResolved.sort}` : ''}`}>
                        {pageNum}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Metadata oluşturma
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Kategori Bulunamadı',
      description: 'Aradığınız kategori bulunamadı.'
    }
  }

  const title = category.parent 
    ? `${category.name} - ${category.parent.name} | Hardware Review`
    : `${category.name} | Hardware Review`

  return {
    title,
    description: `${category.name} kategorisinde ${category.article_count || 0} makale ve ${category.product_count || 0} ürün bulunmaktadır. En güncel donanım incelemeleri, karşılaştırmalar ve rehberler.`,
    keywords: `${category.name}, donanım, inceleme, karşılaştırma, rehber`,
    openGraph: {
      title,
      description: `${category.name} kategorisindeki tüm içerikler`,
    }
  }
}