// src/app/reviews/page.tsx
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ArrowRight, Calendar } from 'lucide-react';
import { formatDate, getScoreColor } from '@/lib/utils';

import { useListArticlesQuery } from '@/integrations/hardware/rtk/endpoints/articles.endpoints';
import type { ArticleListItem } from '@/integrations/hardware/rtk/types/article.types';

type ListArticlesResponse =
  | ArticleListItem[]
  | {
      results?: ArticleListItem[];
    };

export default function ReviewsPage() {
  const { data, isLoading, isError } = useListArticlesQuery({
    type: 'REVIEW',
    status: 'PUBLISHED',
    ordering: '-published_at',
  });

  const reviews: ArticleListItem[] = useMemo(() => {
    if (!data) return [];

    const typed = data as ListArticlesResponse;

    if (Array.isArray(typed)) {
      return typed;
    }

    return typed.results ?? [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>İncelemeler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-8">
        <div className="text-center text-sm text-muted-foreground">
          İncelemeler yüklenirken bir hata oluştu.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Donanım İncelemeleri</h1>
        <p className="max-w-3xl text-xl text-muted-foreground">
          En güncel router, modem ve ağ ekipmanları hakkında detaylı
          incelemelerimizi keşfedin. Objektif testler ve uzman analizleri ile
          doğru seçimi yapın.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => {
          const score = review.review_extra?.total_score ?? null;

          const authorName =
            review.author?.name ||
            [review.author?.first_name, review.author?.last_name]
              .filter(Boolean)
              .join(' ') ||
            review.author?.username ||
            'Bilinmeyen Yazar';

          const categoryName = review.category?.name ?? 'Genel';

          const publishedAtText = review.published_at
            ? formatDate(new Date(review.published_at))
            : '';

          return (
            <Card
              key={review.id}
              className="group transition-shadow hover:shadow-lg"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    {review.hero_image ? (
                      <Image
                        src={review.hero_image}
                        alt={review.title}
                        className="h-full w-full object-cover"
                        width={640}
                        height={360}
                      />
                    ) : (
                      <span className="text-muted-foreground">Görsel</span>
                    )}
                  </div>
                  <Badge className="absolute left-4 top-4">
                    {categoryName}
                  </Badge>

                  {typeof score === 'number' && (
                    <div className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 backdrop-blur">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span
                          className={`text-sm font-semibold ${getScoreColor(
                            score,
                          )}`}
                        >
                          {score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CardTitle className="mb-2 line-clamp-2 transition-colors group-hover:text-primary">
                  {review.title}
                </CardTitle>

                {review.subtitle && (
                  <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                    {review.subtitle}
                  </p>
                )}

                {review.excerpt && (
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {review.excerpt}
                  </p>
                )}

                <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{publishedAtText}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {authorName}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/reviews/${review.slug}`}>
                      Devamını Oku
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reviews.length === 0 && (
        <Card className="mt-8">
          <CardContent className="py-12">
            <div className="text-center">
              <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                Henüz inceleme yok
              </h3>
              <p className="text-muted-foreground">
                Yakında detaylı donanım incelemeleri yayınlanacak.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
