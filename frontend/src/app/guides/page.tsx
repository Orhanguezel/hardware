// src/app/guides/page.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock, Calendar, User } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  useListArticlesQuery,
} from '@/integrations/hardware/rtk/endpoints/articles.endpoints';
import type { ArticleListItem } from '@/integrations/hardware/rtk/types/article.types';

export default function GuidesPage() {
  // Sadece GUIDE + PUBLISHED makaleleri al
  const { data, isLoading, isError } = useListArticlesQuery({
    type: 'GUIDE',
    status: 'PUBLISHED',
    ordering: '-published_at',
  });

  // DRF pagination da olabilir, düz array de olabilir → normalize et
  const guides: ArticleListItem[] = Array.isArray(data)
    ? data
    : data?.results ?? [];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Rehberler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <p className="mb-2 text-lg font-semibold">
              Rehberler yüklenirken bir hata oluştu
            </p>
            <p className="text-muted-foreground">
              Lütfen sayfayı yenileyip tekrar deneyin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-green-500" />
          <h1 className="text-4xl font-bold">Rehberler</h1>
        </div>
        <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
          Donanım kurulumu, optimizasyon ve sorun giderme konularında detaylı
          rehberler. Adım adım talimatlar ile her şeyi kolayca öğrenin.
        </p>
      </div>

      {/* Guides grid */}
      {guides.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Card
              key={guide.id}
              className="group transition-all duration-200 hover:shadow-lg"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    {guide.hero_image ? (
                      <Image
                        src={guide.hero_image}
                        alt={guide.title}
                        width={640}
                        height={360}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground">Görsel</span>
                    )}
                  </div>
                  <Badge className="absolute left-4 top-4">
                    {guide.category?.name ?? 'Genel'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CardTitle className="mb-2 line-clamp-2 transition-colors group-hover:text-primary">
                  {guide.title}
                </CardTitle>

                {guide.subtitle && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {guide.subtitle}
                  </p>
                )}

                {guide.excerpt && (
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {guide.excerpt}
                  </p>
                )}

                <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {guide.published_at
                          ? new Date(
                              guide.published_at,
                            ).toLocaleDateString('tr-TR')
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>
                      {guide.author?.first_name} {guide.author?.last_name}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/guides/${guide.slug}`}>
                      Rehberi Oku
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Boş state */}
      {guides.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Henüz rehber yok</h3>
              <p className="text-muted-foreground">
                Yakında detaylı rehberler yayınlanacak.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alt bilgi bloğu */}
      <div className="mt-12">
        <div className="rounded-lg bg-muted/50 p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold">Kapsamlı Rehberler</h3>
              <p className="text-sm text-muted-foreground">
                Her konuda detaylı, adım adım talimatlar
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold">Güncel İçerik</h3>
              <p className="text-sm text-muted-foreground">
                Teknoloji değiştikçe güncellenen rehberler
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 font-semibold">Uzman İçerik</h3>
              <p className="text-sm text-muted-foreground">
                Alanında uzman yazarlar tarafından hazırlanmış
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
