// src/app/category/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Filter,
  Star,
  Calendar,
  MessageSquare,
  ChevronRight,
  Home,
  Package,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate, getScoreColor } from '@/lib/utils'

const DJANGO_API_URL =
  process.env.DJANGO_API_URL || 'http://localhost:8000/api'

/* ---------- Tipler ---------- */

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

interface ApiListResponse<T> {
  results?: T[]
  count?: number
}

interface ApiCategoryRaw {
  id: number
  name: string
  slug: string
  parent: number | null
  article_count?: number
  product_count?: number
}

interface CategoryWithRelations extends ApiCategoryRaw {
  children: ApiCategoryRaw[]
  parentCategory: ApiCategoryRaw | null
}

type ArticleType =
  | 'REVIEW'
  | 'NEWS'
  | 'GUIDE'
  | 'BEST_LIST'
  | 'COMPARE'
  | string

interface ReviewExtra {
  score_numeric?: number | null
}

interface Author {
  first_name?: string | null
}

interface Tag {
  id: number
  name: string
  slug: string
}

interface Article {
  id: number
  slug: string
  title: string
  excerpt?: string | null
  type: ArticleType
  hero_image?: string | null
  published_at?: string | null
  comment_count?: number
  review_extra?: ReviewExtra | null
  tags?: Tag[]
  author?: Author | null
}

interface Product {
  id: number
  slug: string
  brand: string
  model: string
  description?: string | null
  cover_image?: string | null
  review_count?: number
}

interface ArticleListResult {
  results: Article[]
  count: number
}

interface CategoryArticlesParams {
  type?: string
  tag?: string
  sort?: string
  page?: string
  view?: 'products' | 'articles' | string
}

/* ---------- Helper: DRF list / array normalize ---------- */

function ensureList<T>(data: unknown): { results: T[]; count: number } {
  if (Array.isArray(data)) {
    const arr = data as T[]
    return { results: arr, count: arr.length }
  }

  if (data && typeof data === 'object') {
    const obj = data as ApiListResponse<T>
    const results = Array.isArray(obj.results) ? obj.results : []
    const count =
      typeof obj.count === 'number' ? obj.count : results.length

    return { results, count }
  }

  return { results: [], count: 0 }
}

/* ---------- Category fetch ---------- */

async function getCategory(slug: string): Promise<CategoryWithRelations | null> {
  try {
    const response = await fetch(`${DJANGO_API_URL}/categories/`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    const data = (await response.json()) as unknown
    const normalized = ensureList<ApiCategoryRaw>(data)
    const categories = normalized.results

    const category = categories.find((cat) => cat.slug === slug)

    if (!category) {
      return null
    }

    return organizeCategoryWithChildren(category, categories)
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

function organizeCategoryWithChildren(
  category: ApiCategoryRaw,
  allCategories: ApiCategoryRaw[],
): CategoryWithRelations {
  const children = allCategories.filter((cat) => cat.parent === category.id)
  const parentCategory =
    category.parent !== null
      ? allCategories.find((cat) => cat.id === category.parent) ?? null
      : null

  return {
    ...category,
    children,
    parentCategory,
  }
}

/* ---------- Articles fetch ---------- */

async function getCategoryArticles(
  categoryId: number,
  params: CategoryArticlesParams,
): Promise<ArticleListResult> {
  try {
    const search = new URLSearchParams()
    search.append('category', categoryId.toString())
    search.append('status', 'PUBLISHED')

    if (params.type) {
      search.append('type', params.type)
    }

    if (params.tag) {
      search.append('tags__slug', params.tag)
    }

    if (params.sort === 'score') {
      search.append('ordering', '-review_extra__score_numeric')
    } else if (params.sort === 'comments') {
      search.append('ordering', '-comment_count')
    } else {
      search.append('ordering', '-published_at')
    }

    search.append('page', params.page ?? '1')
    search.append('limit', '12')

    const response = await fetch(
      `${DJANGO_API_URL}/articles/?${search.toString()}`,
      {
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`)
    }

    const data = (await response.json()) as unknown
    const normalized = ensureList<Article>(data)
    const results = normalized.results
    const count = normalized.count

    if (params.view === 'products') {
      const filteredArticles = results.filter((article) =>
        ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE'].includes(article.type),
      )
      return {
        results: filteredArticles,
        count: filteredArticles.length,
      }
    }

    return { results, count }
  } catch (error) {
    console.error('Error fetching articles:', error)
    return { results: [], count: 0 }
  }
}

/* ---------- Products fetch ---------- */

async function getCategoryProducts(categoryId: number): Promise<Product[]> {
  try {
    const url = `${DJANGO_API_URL}/products/?category=${categoryId}`
    const response = await fetch(url, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }

    const data = (await response.json()) as unknown
    const normalized = ensureList<Product>(data)
    const products = normalized.results

    console.log(
      '[CategoryPage] getCategoryProducts',
      url,
      '→',
      products.length,
      'adet',
    )

    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

/* ---------- Article count helpers ---------- */

async function getCategoryArticleCount(
  categoryId: number,
  view: 'products' | 'articles',
): Promise<number> {
  try {
    const search = new URLSearchParams()
    search.append('category', categoryId.toString())
    search.append('status', 'PUBLISHED')

    if (view === 'products') {
      search.append('limit', '1000')
    } else {
      search.append('limit', '1')
    }

    const response = await fetch(
      `${DJANGO_API_URL}/articles/?${search.toString()}`,
      {
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch article count: ${response.status}`)
    }

    const data = (await response.json()) as unknown
    const normalized = ensureList<Article>(data)
    const results = normalized.results
    const count = normalized.count

    if (view === 'products') {
      const filtered = results.filter((article) =>
        ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE'].includes(article.type),
      )
      return filtered.length
    }

    return count
  } catch (error) {
    console.error('Error fetching article count:', error)
    return 0
  }
}

async function getReviewCount(categoryId: number): Promise<number> {
  try {
    const search = new URLSearchParams()
    search.append('category', categoryId.toString())
    search.append('status', 'PUBLISHED')
    search.append('limit', '1000')

    const response = await fetch(
      `${DJANGO_API_URL}/articles/?${search.toString()}`,
      {
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch review count: ${response.status}`)
    }

    const data = (await response.json()) as unknown
    const normalized = ensureList<Article>(data)
    const articles = normalized.results

    const reviewArticles = articles.filter((article) =>
      ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE'].includes(article.type),
    )

    return reviewArticles.length
  } catch (error) {
    console.error('Error fetching review count:', error)
    return 0
  }
}

/* ---------- Page Component ---------- */

export default async function CategoryPage(props: CategoryPageProps) {
  const resolvedParams = await props.params
  const resolvedSearchParams = await props.searchParams

  const slug = resolvedParams.slug
  const rawView = resolvedSearchParams.view
  const view: 'products' | 'articles' =
    rawView === 'articles' ? 'articles' : 'products'

  const page = Number.parseInt(resolvedSearchParams.page ?? '1', 10)

  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const [
    articlesData,
    products,
    articleCount,
    totalArticleCount,
  ] = await Promise.all([
    getCategoryArticles(category.id, { ...resolvedSearchParams, view }),
    getCategoryProducts(category.id),
    getCategoryArticleCount(category.id, view),
    getReviewCount(category.id),
    getCategoryArticleCount(category.id, 'articles'),
  ])

  const articles = articlesData.results
  const totalArticles =
    view === 'articles' ? articlesData.count : articleCount

  // Tag’leri unique id’ye göre çıkar
  const tagMap = new Map<number, Tag>()
  for (const article of articles) {
    for (const tag of article.tags ?? []) {
      tagMap.set(tag.id, tag)
    }
  }
  const allTags = Array.from(tagMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  const availableTypes: ArticleType[] =
    view === 'products'
      ? ['REVIEW', 'BEST_LIST', 'COMPARE', 'GUIDE']
      : ['REVIEW', 'NEWS', 'GUIDE', 'BEST_LIST', 'COMPARE']

  const articleTypes: ArticleType[] = Array.from(
    new Set<ArticleType>(articles.map((article) => article.type)),
  ).filter((type) => availableTypes.includes(type))

  const totalPages = Math.ceil(totalArticles / 12)

  return (
    <div className="container py-8">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-primary">
          <Home className="h-4 w-4" />
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        {category.parentCategory && (
          <>
            <Link
              href={`/category/${category.parentCategory.slug}`}
              className="hover:text-primary"
            >
              {category.parentCategory.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* SOL PANEL - filtreler */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alt kategoriler */}
              {category.children.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">Alt Kategoriler</h3>
                  <div className="space-y-2">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        className="block rounded p-2 transition-colors hover:bg-muted"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{child.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(child.article_count ?? 0) +
                              (child.product_count ?? 0)}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* İçerik türü */}
              {articleTypes.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">İçerik Türü</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/category/${slug}?view=${view}`}
                      className="block rounded p-2 transition-colors hover:bg-muted"
                    >
                      <span className="text-sm">Tümü</span>
                    </Link>
                    {articleTypes.map((type) => {
                      const typeLabels: Record<string, string> = {
                        REVIEW: 'İnceleme',
                        NEWS: 'Haber',
                        GUIDE: 'Rehber',
                        BEST_LIST: 'En İyi Listeler',
                        COMPARE: 'Karşılaştırma',
                      }
                      return (
                        <Link
                          key={type}
                          href={`/category/${slug}?view=${view}&type=${type}`}
                          className="block rounded p-2 transition-colors hover:bg-muted"
                        >
                          <span className="text-sm">
                            {typeLabels[type] ?? type}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Etiketler */}
              {allTags.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">Etiketler</h3>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {allTags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/category/${slug}?view=${view}&tag=${tag.slug}`}
                        className="block rounded p-2 transition-colors hover:bg-muted"
                      >
                        <span className="text-sm">{tag.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sıralama */}
              <div>
                <h3 className="mb-3 font-semibold">Sıralama</h3>
                <div className="space-y-2">
                  <Link
                    href={`/category/${slug}?view=${view}`}
                    className="block rounded p-2 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm">En Yeni</span>
                  </Link>
                  <Link
                    href={`/category/${slug}?view=${view}&sort=score`}
                    className="block rounded p-2 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm">En Yüksek Puan</span>
                  </Link>
                  <Link
                    href={`/category/${slug}?view=${view}&sort=comments`}
                    className="block rounded p-2 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm">En Çok Yorum</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SAĞ PANEL - içerik */}
        <div className="lg:w-3/4">
          {/* Kategori başlığı */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold">{category.name}</h1>
            <p className="mb-4 text-muted-foreground">
              {view === 'products'
                ? `${products.length} ürün bulundu`
                : `${totalArticles} makale bulundu`}
              {resolvedSearchParams.type &&
                ` - ${resolvedSearchParams.type} türünde`}
              {resolvedSearchParams.tag &&
                ` - ${resolvedSearchParams.tag} etiketi`}
            </p>

            {/* Görünüm seçici */}
            <div className="mb-4 flex gap-2">
              <Button
                variant={view === 'products' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={`/category/${slug}?view=products`}>
                  <Package className="mr-2 h-4 w-4" />
                  Ürünler ({products.length})
                </Link>
              </Button>
              <Button
                variant={view === 'articles' ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={`/category/${slug}?view=articles`}>
                  <FileText className="mr-2 h-4 w-4" />
                  İncelemeler ({totalArticleCount})
                </Link>
              </Button>
            </div>

            {/* Aktif filtreler */}
            <div className="flex flex-wrap gap-2">
              {resolvedSearchParams.type && (
                <Badge variant="secondary" className="gap-1">
                  {resolvedSearchParams.type}
                  <Link
                    href={`/category/${slug}?view=${view}`}
                    className="ml-1"
                  >
                    ×
                  </Link>
                </Badge>
              )}
              {resolvedSearchParams.tag && (
                <Badge variant="secondary" className="gap-1">
                  {resolvedSearchParams.tag}
                  <Link
                    href={`/category/${slug}?view=${view}`}
                    className="ml-1"
                  >
                    ×
                  </Link>
                </Badge>
              )}
            </div>
          </div>

          {/* ÜRÜNLER */}
          {view === 'products' && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">
                Ürünler ({products.length})
              </h2>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="group transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="p-0">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                          {product.cover_image ? (
                            <Image
                              src={product.cover_image}
                              alt={`${product.brand} ${product.model}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted-foreground/20">
                              <span className="text-2xl">📦</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                            {product.brand} {product.model}
                          </h3>

                          {product.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">
                                {product.review_count ?? 0} değerlendirme
                              </span>
                            </div>
                            <Button size="sm" asChild>
                              <Link
                                href={`/products/by-slug/${product.slug}`}
                              >
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
                <div className="py-8 text-center text-muted-foreground">
                  <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Bu kategoride ürün bulunamadı.</p>
                </div>
              )}
            </div>
          )}

          {/* MAKALELER */}
          {view === 'articles' && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">
                İncelemeler ({totalArticles})
              </h2>
              {articles.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {articles.map((article) => (
                    <Card
                      key={article.id}
                      className="group transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="relative p-0">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                          {article.hero_image ? (
                            <Image
                              src={article.hero_image}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center">
                              <Calendar className="mb-2 h-12 w-12 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Görsel
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="absolute left-4 top-4">
                          <Badge variant="secondary">
                            {(() => {
                              const typeLabels: Record<string, string> = {
                                REVIEW: 'İnceleme',
                                NEWS: 'Haber',
                                GUIDE: 'Rehber',
                                BEST_LIST: 'En İyi Listeler',
                                COMPARE: 'Karşılaştırma',
                              }
                              return typeLabels[article.type] ?? article.type
                            })()}
                          </Badge>
                        </div>
                        {article.review_extra?.score_numeric != null && (
                          <div className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 backdrop-blur">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span
                                className={`text-sm font-semibold ${getScoreColor(
                                  article.review_extra.score_numeric,
                                )}`}
                              >
                                {article.review_extra.score_numeric.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="line-clamp-2 text-xl font-semibold transition-colors group-hover:text-primary">
                            {article.title}
                          </h3>

                          {article.excerpt && (
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                              {article.excerpt}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {article.published_at
                                    ? formatDate(article.published_at)
                                    : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{article.comment_count ?? 0}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                <span className="text-xs font-medium">
                                  {article.author?.first_name
                                    ?.charAt(0)
                                    .toUpperCase() ?? 'A'}
                                </span>
                              </div>
                              <span className="text-sm">
                                {article.author?.first_name ?? 'Anonim'}
                              </span>
                            </div>

                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={(() => {
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
                                })()}
                              >
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
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Bu kategoride inceleme bulunamadı.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        asChild
                      >
                        <Link
                          href={`/category/${slug}?view=articles&page=${pageNum}${
                            resolvedSearchParams.type
                              ? `&type=${resolvedSearchParams.type}`
                              : ''
                          }${
                            resolvedSearchParams.tag
                              ? `&tag=${resolvedSearchParams.tag}`
                              : ''
                          }${
                            resolvedSearchParams.sort
                              ? `&sort=${resolvedSearchParams.sort}`
                              : ''
                          }`}
                        >
                          {pageNum}
                        </Link>
                      </Button>
                    ),
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Metadata ---------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Kategori Bulunamadı',
      description: 'Aradığınız kategori bulunamadı.',
    }
  }

  const title = category.parentCategory
    ? `${category.name} - ${category.parentCategory.name} | Hardware Review`
    : `${category.name} | Hardware Review`

  return {
    title,
    description: `${category.name} kategorisinde ${
      category.article_count ?? 0
    } makale ve ${category.product_count ?? 0} ürün bulunmaktadır. En güncel donanım incelemeleri, karşılaştırmalar ve rehberler.`,
    keywords: `${category.name}, donanım, inceleme, karşılaştırma, rehber`,
    openGraph: {
      title,
      description: `${category.name} kategorisindeki tüm içerikler`,
    },
  }
}
