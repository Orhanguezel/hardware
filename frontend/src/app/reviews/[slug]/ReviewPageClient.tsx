// src/app/reviews/[slug]/ReviewPageClient.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Calendar, User, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { getScoreColor } from '@/lib/utils';
import CommentSystem from '@/components/comments/comment-system';
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper';

import { useGetArticleBySlugQuery } from '@/integrations/hardware/rtk/endpoints/articles.endpoints';

interface ReviewPageClientProps {
  slug: string;
}

export default function ReviewPageClient({ slug }: ReviewPageClientProps) {
  const {
    data: review,
    isLoading,
    isError,
  } = useGetArticleBySlugQuery(slug);

  const isInvalid =
    !review ||
    review.type !== 'REVIEW' ||
    review.status !== 'PUBLISHED';

  const authorName =
    review?.author?.name ||
    [review?.author?.first_name, review?.author?.last_name]
      .filter(Boolean)
      .join(' ') ||
    review?.author?.username ||
    'Anonim';

  const categoryName = review?.category?.name ?? 'Genel';

  const publishedAtText = review?.published_at
    ? new Date(review.published_at).toLocaleDateString('tr-TR')
    : '';

  const totalScore = review?.review_extra?.total_score ?? null;


  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>İnceleme yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || isInvalid || !review) {
    return (
      <div className="container py-8">
        <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/reviews" className="hover:text-primary">
            İncelemeler
          </Link>
          <span>/</span>
          <span className="text-foreground">İnceleme bulunamadı</span>
        </nav>

        <Card>
          <CardContent className="py-12 text-center">
            <Star className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">
              İnceleme bulunamadı
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Aradığınız inceleme silinmiş veya yayından kaldırılmış olabilir.
            </p>
            <Link
              href="/reviews"
              className="text-sm font-medium text-primary hover:underline"
            >
              Tüm incelemelere geri dön
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={review.id} />

      <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link href="/reviews" className="hover:text-primary">
          İncelemeler
        </Link>
        <span>/</span>
        <span className="text-foreground">{review.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <article className="space-y-8">
            <header className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary">{categoryName}</Badge>

                {typeof totalScore === 'number' && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span
                      className={`text-lg font-semibold ${getScoreColor(
                        totalScore,
                      )}`}
                    >
                      {totalScore.toFixed(1)}/10
                    </span>
                  </div>
                )}
              </div>

              {review.article_tags && review.article_tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {review.article_tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-sm"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-4xl font-bold">{review.title}</h1>

              {review.subtitle && (
                <p className="text-xl text-muted-foreground">
                  {review.subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{authorName}</span>
                </div>
                {publishedAtText && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{publishedAtText}</span>
                  </div>
                )}
              </div>
            </header>

            {review.hero_image && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <Image
                  src={review.hero_image}
                  alt={review.title}
                  width={1280}
                  height={720}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: review.content ?? '',
                }}
              />
            </div>

            {review.review_extra && (
              <Card>
                <CardHeader>
                  <CardTitle>Değerlendirme Skorları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <ScoreBox
                      label="Performans"
                      value={review.review_extra.performance_score ?? 0}
                      colorClass="text-blue-600"
                    />
                    <ScoreBox
                      label="Kararlılık"
                      value={review.review_extra.stability_score ?? 0}
                      colorClass="text-green-600"
                    />
                    <ScoreBox
                      label="Kapsama"
                      value={review.review_extra.coverage_score ?? 0}
                      colorClass="text-purple-600"
                    />
                    <ScoreBox
                      label="Yazılım"
                      value={review.review_extra.software_score ?? 0}
                      colorClass="text-orange-600"
                    />
                    <ScoreBox
                      label="Değer"
                      value={review.review_extra.value_score ?? 0}
                      colorClass="text-red-600"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </article>

          <div className="mt-12">
            <CommentSystem articleId={review.id} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Yazar Hakkında
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{authorName}</div>
                    <div className="text-sm text-muted-foreground">
                      Yazar
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  İlgili İncelemeler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link
                    href="/reviews"
                    className="block text-sm font-medium transition-colors hover:text-primary"
                  >
                    Tüm İncelemeler
                    <div className="text-xs text-muted-foreground">
                      Diğer incelemeleri görüntüle
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ScoreBoxProps {
  label: string;
  value: number;
  colorClass: string;
}

function ScoreBox({ label, value, colorClass }: ScoreBoxProps) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
