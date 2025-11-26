// src/app/tag/[slug]/page.tsx

'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tag as TagIcon,
  Star,
  Calendar,
  Eye,
  Grid,
  List,
} from 'lucide-react'
import { getScoreColor } from '@/lib/utils'

import {
  useGetTagBySlugQuery,
} from '@/integrations/hardware/rtk/endpoints/tags.endpoints'
import {
  useListArticlesQuery,
} from '@/integrations/hardware/rtk/endpoints/articles.endpoints'
import type { TagDto } from '@/integrations/hardware/rtk/types/tag.types'
import type {
  ArticleListItem,
} from '@/integrations/hardware/rtk/types/article.types'
import type { QueryParams } from '@/lib/api-config'

type ViewMode = 'grid' | 'list'
type SortBy = 'newest' | 'oldest' | 'rating' | 'views'
type FilterType = 'all' | 'review' | 'best-list' | 'compare' | 'guide'

function getArticleHref(article: ArticleListItem): string {
  const slug = article.slug
  const t = (article.type || '').toUpperCase()

  if (!slug) return '#'

  switch (t) {
    case 'REVIEW':
      return `/reviews/${slug}`
    case 'GUIDE':
      return `/guides/${slug}`
    case 'NEWS':
      return `/news/${slug}`
    default:
      return `/reviews/${slug}`
  }
}

function getArticleTypeLabel(article: ArticleListItem): string {
  const t = (article.type || '').toUpperCase()
  switch (t) {
    case 'REVIEW':
      return 'İnceleme'
    case 'BEST':
    case 'BEST_LIST':
      return 'En İyi Liste'
    case 'COMPARE':
      return 'Karşılaştırma'
    case 'GUIDE':
      return 'Rehber'
    case 'NEWS':
      return 'Haber'
    default:
      return article.type || 'İçerik'
  }
}

function normalizeTypeForFilter(article: ArticleListItem): FilterType | 'other' {
  const t = (article.type || '').toLowerCase()
  if (t === 'review') return 'review'
  if (t === 'best' || t === 'best_list' || t === 'best-list') return 'best-list'
  if (t === 'compare') return 'compare'
  if (t === 'guide') return 'guide'
  return 'other'
}

export default function TagPage() {
  const params = useParams()
  const slugParam = params.slug

  const slug =
    typeof slugParam === 'string'
      ? slugParam
      : Array.isArray(slugParam)
      ? slugParam[0]
      : ''

  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterType, setFilterType] = useState<FilterType>('all')

  // 🔹 Tag detay
  const {
    data: tag,
    isLoading: isTagLoading,
    isError: isTagError,
  } = useGetTagBySlugQuery(slug, {
    skip: !slug,
  })

  // 🔹 Tag’e bağlı makaleler
  const articleQueryParams: QueryParams = useMemo(
    () => ({
      tag: slug,
      status: 'PUBLISHED',
      page: 1,
      page_size: 24,
    }),
    [slug],
  )

  const {
    data: articlesResult,
    isLoading: isArticlesLoading,
    isError: isArticlesError,
  } = useListArticlesQuery(articleQueryParams, {
    skip: !slug,
  })

  const articles: ArticleListItem[] = useMemo(() => {
    if (!articlesResult) return []
    if (Array.isArray(articlesResult)) {
      return articlesResult
    }
    return articlesResult.results ?? []
  }, [articlesResult])

  // 🔹 Sıralama
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          const aDate = a.published_at ? new Date(a.published_at).getTime() : 0
          const bDate = b.published_at ? new Date(b.published_at).getTime() : 0
          return bDate - aDate
        }
        case 'oldest': {
          const aDate = a.published_at ? new Date(a.published_at).getTime() : 0
          const bDate = b.published_at ? new Date(b.published_at).getTime() : 0
          return aDate - bDate
        }
        case 'rating': {
          const aScore = a.review_extra?.total_score ?? 0
          const bScore = b.review_extra?.total_score ?? 0
          return bScore - aScore
        }
        case 'views': {
          const aViews = typeof a.view_count === 'number' ? a.view_count : 0
          const bViews = typeof b.view_count === 'number' ? b.view_count : 0
          return bViews - aViews
        }
        default:
          return 0
      }
    })
  }, [articles, sortBy])

  // 🔹 Filtreleme
  const filteredArticles = useMemo(
    () =>
      filterType === 'all'
        ? sortedArticles
        : sortedArticles.filter(
            (article) => normalizeTypeForFilter(article) === filterType,
          ),
    [sortedArticles, filterType],
  )

  // 🔹 Ortalama skor
  const averageScore = useMemo(() => {
    if (filteredArticles.length === 0) return null
    const total = filteredArticles.reduce((sum, article) => {
      const s = article.review_extra?.total_score
      return typeof s === 'number' ? sum + s : sum
    }, 0)
    const avg = total / filteredArticles.length
    return Number.isFinite(avg) ? avg : null
  }, [filteredArticles])

  const isLoading = isTagLoading || isArticlesLoading
  const hasError = isTagError || isArticlesError
  const tagData: TagDto | null = tag ?? null

  // 🔹 Early return’ler – TÜM hook’lardan SONRA
  if (!slug || hasError) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <TagIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Etiket Bulunamadı</h1>
          <p className="text-muted-foreground mb-4">
            Aradığınız etiket bulunamadı veya yüklenirken bir hata oluştu.
          </p>
          <Button asChild>
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!tagData && !isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <TagIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Etiket Bulunamadı</h1>
          <p className="text-muted-foreground mb-4">
            Aradığınız etiket bulunamadı veya kaldırılmış olabilir.
          </p>
          <Button asChild>
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading && !tagData) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>İçerikler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TagIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{tagData?.name}</h1>
            <p className="text-muted-foreground">
              {tagData
                ? `"${tagData.name}" etiketi ile ilişkili tüm içerikler`
                : 'Bu etiket ile ilişkili tüm içerikler'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {filteredArticles.length} içerik
          </Badge>
          {typeof tagData?.article_count === 'number' && (
            <Badge variant="outline">
              Toplam makale: {tagData.article_count}
            </Badge>
          )}
          {averageScore !== null && (
            <Badge
              variant="outline"
              className={getScoreColor(averageScore)}
            >
              Ortalama Puan: {averageScore.toFixed(1)}
            </Badge>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tüm Tipler</option>
                <option value="review">İnceleme</option>
                <option value="best-list">En İyi Listeler</option>
                <option value="compare">Karşılaştırma</option>
                <option value="guide">Rehber</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="rating">En Yüksek Puan</option>
                <option value="views">En Çok Okunan</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const score = article.review_extra?.total_score ?? 0
            const views =
              typeof article.view_count === 'number' ? article.view_count : 0
            const publishedAtLabel = article.published_at
              ? new Date(article.published_at).toLocaleDateString('tr-TR')
              : ''

            return (
              <Card
                key={article.id}
                className="hover:shadow-lg transition-shadow"
              >
                {article.hero_image && (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={article.hero_image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      width={640}
                      height={360}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {article.category?.name && (
                      <Badge variant="outline">
                        {article.category.name}
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {getArticleTypeLabel(article)}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {article.excerpt && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span
                        className={`font-medium ${getScoreColor(score)}`}
                      >
                        {score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{publishedAtLabel}</span>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={getArticleHref(article)}>
                      İncelemeyi Oku
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => {
            const score = article.review_extra?.total_score ?? 0
            const views =
              typeof article.view_count === 'number' ? article.view_count : 0
            const publishedAtLabel = article.published_at
              ? new Date(article.published_at).toLocaleDateString('tr-TR')
              : ''

            return (
              <Card
                key={article.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {article.hero_image && (
                      <Image
                        src={article.hero_image}
                        alt={article.title}
                        className="w-32 h-24 object-cover rounded"
                        width={128}
                        height={96}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {article.category?.name && (
                          <Badge variant="outline">
                            {article.category.name}
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {getArticleTypeLabel(article)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                            <span
                              className={`font-medium ${getScoreColor(
                                score,
                              )}`}
                            >
                              {score.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{publishedAtLabel}</span>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link href={getArticleHref(article)}>Oku</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && !isLoading && (
        <Card className="mt-6">
          <CardContent className="py-12">
            <div className="text-center">
              <TagIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                İçerik Bulunamadı
              </h3>
              <p className="text-muted-foreground">
                Bu etiket için henüz içerik bulunmuyor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Tags – şimdilik statik */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>İlgili Etiketler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Wi-Fi 6E
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Mesh
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Gaming
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Router
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Teknoloji
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
