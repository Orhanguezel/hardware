// src/app/search/page.tsx

'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  Search as SearchIcon,
  Calendar,
  User as UserIcon,
  MessageCircle,
  Tag,
  ArrowRight,
  FileText,
  Package,
} from 'lucide-react'

import {
  useSearchQuery,
  type SearchResponse,
  type SearchResultItem,
} from '@/integrations/hardware/rtk/endpoints/misc.endpoints'

type ArticleTypeValue =
  | 'REVIEW'
  | 'NEWS'
  | 'GUIDE'
  | 'BEST_LIST'
  | 'BEST'
  | 'COMPARE'
  | string

interface ArticleResult {
  id: number
  title: string
  slug: string
  articleType: ArticleTypeValue
  excerpt: string | null
  publishedAt: string | null
  categoryName: string | null
  categorySlug: string | null
  authorName: string
  authorAvatar: string | null
  authorId: number | null
  commentCount: number
}

interface ProductResultUI {
  id: number
  brand: string
  model: string
  slug: string
  articleCount: number
}

interface UserResultUI {
  id: number
  name: string
  email: string | null
  avatar: string | null
  role: string
}

// Backend search response'unu (SearchResponse.results) UI için 3 gruba bölüyoruz
function mapSearchResults(
  data: SearchResponse | undefined,
): {
  articles: ArticleResult[]
  products: ProductResultUI[]
  users: UserResultUI[]
} {
  const articles: ArticleResult[] = []
  const products: ProductResultUI[] = []
  const users: UserResultUI[] = []

  const items = data?.results ?? []

  for (const item of items) {
    const normalizedType = (item.type || '').toUpperCase()
    const slug = item.slug ?? ''
    const baseTitle =
      (typeof item.title === 'string' && item.title) ||
      (typeof item.name === 'string' && item.name) ||
      ''

    const record = item as SearchResultItem & Record<string, unknown>

    // ARTICLE tarzı kayıtlar
    if (
      normalizedType === 'ARTICLE' ||
      normalizedType === 'REVIEW' ||
      normalizedType === 'NEWS' ||
      normalizedType === 'GUIDE' ||
      normalizedType === 'BEST' ||
      normalizedType === 'BEST_LIST' ||
      normalizedType === 'COMPARE'
    ) {
      const excerpt =
        typeof record.excerpt === 'string' ? record.excerpt : null

      const publishedAt =
        typeof record.published_at === 'string'
          ? record.published_at
          : null

      // author
      let authorName: string | null = null
      let authorAvatar: string | null = null
      let authorId: number | null = null
      const rawAuthor = record.author

      if (rawAuthor && typeof rawAuthor === 'object') {
        const a = rawAuthor as {
          id?: unknown
          name?: unknown
          avatar?: unknown
        }
        if (typeof a.id === 'number') authorId = a.id
        if (typeof a.name === 'string') authorName = a.name
        if (typeof a.avatar === 'string') authorAvatar = a.avatar
      }
      if (!authorName) {
        authorName = 'Bilinmeyen'
      }

      // category
      let categoryName: string | null = null
      let categorySlug: string | null = null
      const rawCategory = record.category

      if (rawCategory && typeof rawCategory === 'object') {
        const c = rawCategory as {
          name?: unknown
          slug?: unknown
        }
        if (typeof c.name === 'string') categoryName = c.name
        if (typeof c.slug === 'string') categorySlug = c.slug
      }

      const commentCount =
        typeof record.comment_count === 'number'
          ? record.comment_count
          : 0

      const articleType: ArticleTypeValue =
        typeof record.article_type === 'string'
          ? record.article_type
          : normalizedType

      articles.push({
        id: item.id,
        title: baseTitle,
        slug,
        articleType,
        excerpt,
        publishedAt,
        categoryName,
        categorySlug,
        authorName,
        authorAvatar,
        authorId,
        commentCount,
      })

      continue
    }

    // PRODUCT
    if (normalizedType === 'PRODUCT') {
      const brand =
        typeof record.brand === 'string' ? record.brand : ''
      const model =
        typeof record.model === 'string' ? record.model : ''
      const articleCount =
        typeof record.article_count === 'number'
          ? record.article_count
          : 0

      products.push({
        id: item.id,
        brand,
        model,
        slug,
        articleCount,
      })
      continue
    }

    // USER
    if (normalizedType === 'USER') {
      const name =
        (typeof item.name === 'string' && item.name) ||
        baseTitle ||
        'Kullanıcı'

      const email =
        typeof record.email === 'string' ? record.email : null
      const avatar =
        typeof record.avatar === 'string' ? record.avatar : null
      const role =
        typeof record.role === 'string' ? record.role : 'USER'

      users.push({
        id: item.id,
        name,
        email,
        avatar,
        role,
      })
      continue
    }
  }

  return { articles, products, users }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Tarih yok'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return 'Tarih yok'
  return d.toLocaleDateString('tr-TR')
}

function getTypeIcon(articleType: ArticleTypeValue) {
  const t = (articleType || '').toUpperCase()
  switch (t) {
    case 'NEWS':
      return <FileText className="w-4 h-4 text-blue-500" />
    case 'REVIEW':
      return <SearchIcon className="w-4 h-4 text-green-500" />
    case 'GUIDE':
      return <Tag className="w-4 h-4 text-orange-500" />
    default:
      return <FileText className="w-4 h-4 text-gray-500" />
  }
}

function getTypeLabel(articleType: ArticleTypeValue) {
  const t = (articleType || '').toUpperCase()
  switch (t) {
    case 'NEWS':
      return 'Haber'
    case 'REVIEW':
      return 'İnceleme'
    case 'GUIDE':
      return 'Rehber'
    case 'BEST':
    case 'BEST_LIST':
      return 'En İyi Liste'
    case 'COMPARE':
      return 'Karşılaştırma'
    default:
      return 'Makale'
  }
}

function getArticleUrl(article: ArticleResult): string {
  const t = (article.articleType || '').toUpperCase()
  const slug = article.slug

  switch (t) {
    case 'REVIEW':
      return `/reviews/${slug}`
    case 'BEST':
    case 'BEST_LIST':
      return `/best/${slug}`
    case 'COMPARE':
      return `/compare-articles/${slug}`
    case 'GUIDE':
      return `/guides/${slug}`
    case 'NEWS':
      return `/news/${slug}`
    default:
      return `/reviews/${slug}`
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()

  const qRaw = searchParams.get('q') ?? ''
  const q = qRaw.trim()
  const typeParam = searchParams.get('type') ?? undefined

  const shouldSkip = q.length < 2

  const { data, isLoading, isError } = useSearchQuery(
    shouldSkip ? undefined : { q, type: typeParam },
    {
      skip: shouldSkip,
    },
  )

  const { articles, products, users } = useMemo(
    () => mapSearchResults(data),
    [data],
  )

  const total = articles.length + products.length + users.length

  if (shouldSkip) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Arama Yapın</h3>
          <p className="text-muted-foreground">
            Arama yapmak için en az 2 karakter girin.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Arama yapılıyor...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Arama Hatası</h3>
          <p className="text-muted-foreground">
            Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-8">
        {/* Search Info */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Arama Sonuçları</h1>
          <p className="text-muted-foreground">
            &quot;{q}&quot; için {total} sonuç bulundu
          </p>
        </div>

        {/* Articles */}
        {articles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Makaleler ({articles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {getTypeIcon(article.articleType)}
                        {getTypeLabel(article.articleType)}
                      </Badge>
                      {article.categoryName && (
                        <Badge variant="outline">
                          {article.categoryName}
                        </Badge>
                      )}
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

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{article.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageCircle className="w-3 h-3" />
                        <span>{article.commentCount} yorum</span>
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
          </section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Ürünler ({products.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {product.brand} {product.model}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {product.articleCount} makale
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
          </section>
        )}

        {/* Users */}
        {users.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <UserIcon className="w-6 h-6" />
              Kullanıcılar ({users.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card
                  key={user.id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <UserIcon className="w-6 h-6 text-muted-foreground" />
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
          </section>
        )}

        {/* No Results */}
        {articles.length === 0 &&
          products.length === 0 &&
          users.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Sonuç Bulunamadı
              </h3>
              <p className="text-muted-foreground mb-4">
                &quot;{q}&quot; için hiçbir sonuç bulunamadı.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Farklı anahtar kelimeler deneyin</p>
                <p>• Daha genel terimler kullanın</p>
                <p>• Yazım hatalarını kontrol edin</p>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
