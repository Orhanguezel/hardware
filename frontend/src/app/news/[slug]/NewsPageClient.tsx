// src/app/news/[slug]/NewsPageClient.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  User,
  Newspaper,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CommentSystem from '@/components/comments/comment-system';
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper';

import {
  useGetArticleBySlugQuery,
} from '@/integrations/hardware/rtk/endpoints/articles.endpoints';
import type { ArticleDto } from '@/integrations/hardware/rtk/types/article.types';

interface NewsPageClientProps {
  slug: string;
}

export default function NewsPageClient({ slug }: NewsPageClientProps) {
  const { data, isLoading, isError } = useGetArticleBySlugQuery(slug);
  const article = data as ArticleDto | undefined;

  const isInvalid =
    !article ||
    article.type !== 'NEWS' ||
    article.status !== 'PUBLISHED';

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Haber yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || isInvalid || !article) {
    return (
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/news"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Tüm Haberler
          </Link>

          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">Haber bulunamadı</h2>
                <p className="text-muted-foreground">
                  Aradığınız haber silinmiş veya yayından kaldırılmış olabilir.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const htmlContent = article.content ?? '';

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={article.id} />

      <div className="mx-auto max-w-4xl">
        <Link
          href="/news"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Tüm Haberler
        </Link>

        <Card className="mb-8">
          {article.hero_image && (
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <Image
                src={article.hero_image}
                alt={article.title}
                width={800}
                height={450}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <CardHeader className="pb-4">
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="w-fit">
                {article.category?.name || 'Genel'}
              </Badge>
              <Badge variant="outline">
                <Newspaper className="mr-1 h-3 w-3" />
                Haber
              </Badge>
            </div>

            <CardTitle className="mb-2 text-4xl font-extrabold leading-tight">
              {article.title}
            </CardTitle>

            {article.subtitle && (
              <p className="mb-4 text-xl text-muted-foreground">
                {article.subtitle}
              </p>
            )}

            {article.article_tags && article.article_tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {article.article_tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {article.author?.first_name} {article.author?.last_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('tr-TR')
                    : ''}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="prose max-w-none dark:prose-invert">
            <div
              dangerouslySetInnerHTML={{
                __html: htmlContent,
              }}
            />
          </CardContent>
        </Card>

        <CommentSystem articleId={article.id} />
      </div>
    </div>
  );
}
