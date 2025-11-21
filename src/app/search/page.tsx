import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Search, 
  Calendar, 
  User, 
  MessageCircle,
  Tag,
  ArrowRight,
  FileText,
  Package
} from 'lucide-react'

interface SearchResultsProps {
  searchParams: Promise<{
    q?: string
    type?: string
    category?: string
    page?: string
  }>
}

interface SearchResult {
  id: string
  title: string
  excerpt: string | null
  slug: string
  publishedAt: string | null
  type: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
  category: {
    id: string
    name: string
    slug: string
  }
  articleTags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
  _count: {
    comments: number
  }
}

interface ProductResult {
  id: string
  brand: string
  model: string
  slug: string
  _count: {
    articleProducts: number
  }
}

interface UserResult {
  id: string
  name: string
  email: string
  avatar: string | null
  role: string
}

async function getSearchResults(searchParams: any) {
  const { q, type, category, page = '1' } = searchParams
  
  if (!q || q.trim().length < 2) {
    return {
      articles: [],
      products: [],
      users: [],
      meta: { total: 0, totalPages: 0, query: q || '' }
    }
  }

  try {
    // Django API'yi doğrudan çağır
    const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'
    const response = await fetch(`${DJANGO_API_URL}/search/?q=${encodeURIComponent(q.trim())}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Django search API response not ok:', response.status, response.statusText)
      throw new Error(`Search failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      console.error('Django search API returned error:', data.error)
      throw new Error(data.error || 'Search failed')
    }

    // Frontend formatına dönüştür
    const articles = (data.data?.articles || []).map((article: any) => ({
      id: article.id.toString(),
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      publishedAt: article.published_at,
      type: article.type,
      author: {
        id: article.author?.id?.toString() || '',
        name: article.author?.name || 'Bilinmeyen',
        avatar: article.author?.avatar || null
      },
      category: {
        id: article.category?.id?.toString() || '',
        name: article.category?.name || 'Bilinmeyen',
        slug: article.category?.slug || ''
      },
      articleTags: (article.tags || []).map((tag: any) => ({
        tag: {
          id: tag.id?.toString() || '',
          name: tag.name || '',
          slug: tag.slug || ''
        }
      })),
      _count: {
        comments: article.comment_count || 0
      }
    }))

    const products = (data.data?.products || []).map((product: any) => ({
      id: product.id.toString(),
      brand: product.brand,
      model: product.model,
      slug: product.slug,
      _count: {
        articleProducts: product.article_count || 0
      }
    }))

    const users = (data.data?.users || []).map((user: any) => ({
      id: user.id.toString(),
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    }))

    return {
      articles,
      products,
      users,
      meta: { 
        total: articles.length + products.length + users.length, 
        totalPages: 1, 
        query: q 
      }
    }
  } catch (error) {
    console.error('Search error:', error)
    return {
      articles: [],
      products: [],
      users: [],
      meta: { total: 0, totalPages: 0, query: q || '' }
    }
  }
}

async function SearchResults({ searchParams }: SearchResultsProps) {
  const params = await searchParams
  
  try {
    const { articles, products, users, meta } = await getSearchResults(params)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Tarih yok'
    return new Date(dateString).toLocaleDateString('tr-TR')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'NEWS':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'REVIEW':
        return <Search className="w-4 h-4 text-green-500" />
      case 'GUIDE':
        return <Tag className="w-4 h-4 text-orange-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'NEWS':
        return 'Haber'
      case 'REVIEW':
        return 'İnceleme'
      case 'GUIDE':
        return 'Rehber'
      default:
        return 'Makale'
    }
  }

  const getArticleUrl = (article: any) => {
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

  if (!params.q || params.q.trim().length < 2) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Arama Yapın</h3>
        <p className="text-muted-foreground">
          Arama yapmak için en az 2 karakter girin.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search Info */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Arama Sonuçları</h1>
        <p className="text-muted-foreground">
          "{params.q}" için {meta?.total || 0} sonuç bulundu
        </p>
      </div>

      {/* Articles */}
      {articles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Makaleler ({articles.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: SearchResult) => (
              <Card key={article.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getTypeIcon(article.type)}
                      {getTypeLabel(article.type)}
                    </Badge>
                    <Badge variant="outline">
                      {article.category.name}
                    </Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {article.excerpt && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.articleTags.slice(0, 3).map((articleTag) => (
                      <Badge key={articleTag.tag.id} variant="outline" className="text-xs">
                        {articleTag.tag.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span>{article._count.comments} yorum</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={getArticleUrl(article)}>
                        Oku
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {products.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Ürünler ({products.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: ProductResult) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {product.brand} {product.model}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {product._count.articleProducts} makale
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/products/by-slug/${product.slug}`}>
                        İncele
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      {users.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="w-6 h-6" />
            Kullanıcılar ({users.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user: UserResult) => (
              <Card key={user.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={`http://localhost:8000${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {user.name}
                      </CardTitle>
                      {user.email && (
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/users/${user.id}`}>
                        Profil
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {articles.length === 0 && products.length === 0 && users.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Sonuç Bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            "{params.q}" için hiçbir sonuç bulunamadı.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Farklı anahtar kelimeler deneyin</p>
            <p>• Daha genel terimler kullanın</p>
            <p>• Yazım hatalarını kontrol edin</p>
          </div>
        </div>
      )}
    </div>
  )
  } catch (error) {
    console.error('Search page error:', error)
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Arama Hatası</h3>
        <p className="text-muted-foreground">
          Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.
        </p>
      </div>
    )
  }
}

export default async function SearchPage({ searchParams }: SearchResultsProps) {
  return (
    <div className="container py-8">
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Arama yapılıyor...</p>
        </div>
      }>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
