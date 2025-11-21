'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, BookOpen, Clock, Calendar, User } from 'lucide-react'

interface Guide {
  id: number
  title: string
  subtitle?: string
  excerpt: string
  slug: string
  type: string
  status: string
  published_at: string
  author: {
    first_name: string
    last_name: string
  }
  category: {
    name: string
  }
  hero_image?: string
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/?type=GUIDE&status=PUBLISHED`)
      const result = await response.json()
      
      if (result.results) {
        setGuides(result.results)
      } else if (Array.isArray(result)) {
        setGuides(result)
      }
    } catch (error) {
      console.error('Error fetching guides:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay':
        return 'bg-green-500'
      case 'Orta':
        return 'bg-yellow-500'
      case 'İleri':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Rehberler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="w-8 h-8 text-green-500" />
          <h1 className="text-4xl font-bold">Rehberler</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Donanım kurulumu, optimizasyon ve sorun giderme konularında detaylı rehberler. 
          Adım adım talimatlar ile her şeyi kolayca öğrenin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {guides.map((guide) => (
          <Card key={guide.id} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {guide.hero_image ? (
                    <img 
                      src={guide.hero_image} 
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">Görsel</span>
                  )}
                </div>
                <Badge className="absolute top-4 left-4">
                  {guide.category.name}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <CardTitle className="mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {guide.title}
              </CardTitle>
              
              {guide.subtitle && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {guide.subtitle}
                </p>
              )}
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                {guide.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(guide.published_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{guide.author.first_name} {guide.author.last_name}</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/guides/${guide.slug}`}>
                    Rehberi Oku
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {guides.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Henüz rehber yok</h3>
              <p className="text-muted-foreground">
                Yakında detaylı rehberler yayınlanacak.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-12">
        <div className="bg-muted/50 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Kapsamlı Rehberler</h3>
              <p className="text-sm text-muted-foreground">
                Her konuda detaylı, adım adım talimatlar
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Güncel İçerik</h3>
              <p className="text-sm text-muted-foreground">
                Teknoloji değiştikçe güncellenen rehberler
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Uzman İçerik</h3>
              <p className="text-sm text-muted-foreground">
                Alanında uzman yazarlar tarafından hazırlanmış
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
