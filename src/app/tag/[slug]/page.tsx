'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tag, 
  Star, 
  Calendar, 
  Eye, 
  TrendingUp,
  Filter,
  SortAsc,
  Grid,
  List
} from 'lucide-react'

// Mock data - gerçek uygulamada API'den gelecek
const tagData = {
  'wifi-6': {
    name: 'Wi-Fi 6',
    description: 'Wi-Fi 6 teknolojisi ile ilgili tüm içerikler',
    articles: [
      {
        id: '1',
        title: 'ASUS RT-AX88U Pro Wi-Fi 6 İncelemesi',
        excerpt: 'En güncel Wi-Fi 6 teknolojisinin detaylı analizi',
        image: '/images/asus-rt-ax88u-pro.jpg',
        category: 'Router',
        type: 'Review',
        score: 9.2,
        views: 1250,
        publishedAt: '2024-01-15',
        readTime: '8 dk'
      },
      {
        id: '2',
        title: 'Wi-Fi 6 vs Wi-Fi 5 Karşılaştırması',
        excerpt: 'Yeni nesil Wi-Fi teknolojisinin avantajları',
        image: '/images/wifi6-comparison.jpg',
        category: 'Router',
        type: 'Compare',
        score: 8.7,
        views: 890,
        publishedAt: '2024-01-12',
        readTime: '6 dk'
      }
    ]
  },
  'gaming': {
    name: 'Gaming',
    description: 'Oyun odaklı router ve ağ ekipmanları',
    articles: [
      {
        id: '3',
        title: 'En İyi Gaming Router Rehberi 2024',
        excerpt: 'Düşük ping ve yüksek performans için router seçimi',
        image: '/images/gaming-routers.jpg',
        category: 'Router',
        type: 'Best List',
        score: 9.5,
        views: 2100,
        publishedAt: '2024-01-10',
        readTime: '12 dk'
      }
    ]
  }
}

export default function TagPage() {
  const params = useParams()
  const slug = params.slug as string
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState('all')

  const tag = tagData[slug as keyof typeof tagData]

  if (!tag) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
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

  const sortedArticles = [...tag.articles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case 'oldest':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      case 'rating':
        return b.score - a.score
      case 'views':
        return b.views - a.views
      default:
        return 0
    }
  })

  const filteredArticles = filterType === 'all' 
    ? sortedArticles 
    : sortedArticles.filter(article => article.type.toLowerCase() === filterType.toLowerCase())

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Tag className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{tag.name}</h1>
            <p className="text-muted-foreground">{tag.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{filteredArticles.length} İçerik</Badge>
          <Badge variant="outline">
            Ortalama Puan: {(filteredArticles.reduce((sum, a) => sum + a.score, 0) / filteredArticles.length).toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
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
                onChange={(e) => setSortBy(e.target.value)}
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
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{article.category}</Badge>
                  <Badge variant="secondary">{article.type}</Badge>
                </div>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="font-medium">{article.score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                  <Link href={`/reviews/${article.id}`}>
                    İncelemeyi Oku
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-32 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{article.category}</Badge>
                      <Badge variant="secondary">{article.type}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{article.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          <span className="font-medium">{article.score}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{article.publishedAt}</span>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/reviews/${article.id}`}>
                          Oku
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">İçerik Bulunamadı</h3>
              <p className="text-muted-foreground">
                Bu etiket için henüz içerik bulunmuyor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Tags */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>İlgili Etiketler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
              Wi-Fi 6E
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
              Mesh
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
              Gaming
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
              Router
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white">
              Teknoloji
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
