'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { Calendar, Clock, User, Search, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Article {
  id: number
  title: string
  subtitle?: string
  type: string
  status: string
  slug: string
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

interface ArticlesListProps {
  articles: Article[]
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

export function ArticlesList({ articles }: ArticlesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = articles

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.subtitle && article.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article.author?.name && article.author.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (article.category?.name && article.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(article => article.type === typeFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        case 'oldest':
          return new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
        case 'popular':
          return (b.comment_count || 0) - (a.comment_count || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [articles, searchTerm, typeFilter, sortBy])

  return (
    <>
      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Makale ara..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Kategori seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              <SelectItem value="REVIEW">İncelemeler</SelectItem>
              <SelectItem value="NEWS">Haberler</SelectItem>
              <SelectItem value="GUIDE">Rehberler</SelectItem>
              <SelectItem value="BEST_LIST">En İyi Listeler</SelectItem>
              <SelectItem value="COMPARE">Karşılaştırmalar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="popular">En Popüler</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedArticles.length} makale bulundu
        </p>
      </div>

      {/* Articles Grid */}
      {filteredAndSortedArticles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Makale bulunamadı</h3>
            <p className="text-muted-foreground">
              Arama kriterlerinize uygun makale bulunamadı. Farklı anahtar kelimeler deneyin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedArticles.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={typeColors[article.type as keyof typeof typeColors] || 'default'}>
                    {typeLabels[article.type as keyof typeof typeLabels] || article.type}
                  </Badge>
                  <Badge variant="outline">
                    {article.category?.name || 'Genel'}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
                {article.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.subtitle}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {article.author?.name || 'Anonim'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(new Date(article.published_at))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {article.comment_count || 0} yorum
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={getArticleUrl(article)}>
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
    </>
  )
}
