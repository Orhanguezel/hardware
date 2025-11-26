// src/app/guides/[slug]/GuidePageClient.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Calendar,
  User,
  ArrowLeft,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import CommentSystem from '@/components/comments/comment-system';
import ArticleViewTrackerWrapper from '@/components/tracking/ArticleViewTrackerWrapper';

import {
  useGetArticleBySlugQuery,
} from '@/integrations/hardware/rtk/endpoints/articles.endpoints';
import type { ArticleDto } from '@/integrations/hardware/rtk/types/article.types';

interface GuidePageClientProps {
  slug: string;
}

export default function GuidePageClient({ slug }: GuidePageClientProps) {
  const { data, isLoading, isError } = useGetArticleBySlugQuery(slug);

  const guide = data as ArticleDto | undefined;

  const isInvalid =
    !guide ||
    guide.type !== 'GUIDE' ||
    guide.status !== 'PUBLISHED';

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Rehber yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || isInvalid || !guide) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/guides" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tüm Rehberler
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">
                Rehber bulunamadı
              </h2>
              <p className="text-muted-foreground">
                Aradığınız rehber silinmiş veya yayından kaldırılmış olabilir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const htmlContent = guide.content ?? '';

  return (
    <div className="container py-8">
      {/* View tracking */}
      <ArticleViewTrackerWrapper articleId={guide.id} />

      {/* Breadcrumb */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/guides" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Tüm Rehberler
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-green-500" />
          <Badge variant="secondary">
            {guide.category?.name ?? 'Genel'}
          </Badge>
        </div>

        <h1 className="mb-4 text-4xl font-bold">{guide.title}</h1>

        {guide.subtitle && (
          <p className="mb-4 text-xl text-muted-foreground">
            {guide.subtitle}
          </p>
        )}

        {/* Tags */}
        {guide.article_tags && guide.article_tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {guide.article_tags.map((tag) => (
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
              {guide.author?.first_name} {guide.author?.last_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {guide.published_at
                ? new Date(guide.published_at).toLocaleDateString('tr-TR')
                : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* CONTENT */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-8">
              {guide.hero_image && (
                <div className="mb-8">
                  <Image
                    src={guide.hero_image}
                    alt={guide.title}
                    width={640}
                    height={360}
                    className="h-64 w-full rounded-lg object-cover"
                  />
                </div>
              )}

              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="mt-8">
            <CommentSystem articleId={guide.id} comments={[]} />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-lg">Rehber Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Kategori</h4>
                <Badge variant="outline">
                  {guide.category?.name ?? 'Genel'}
                </Badge>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Yazar</h4>
                <p className="text-sm text-muted-foreground">
                  {guide.author?.first_name} {guide.author?.last_name}
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-medium">Yayın Tarihi</h4>
                <p className="text-sm text-muted-foreground">
                  {guide.published_at
                    ? new Date(guide.published_at).toLocaleDateString('tr-TR')
                    : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
