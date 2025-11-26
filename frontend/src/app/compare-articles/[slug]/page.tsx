// src/app/compare-articles/[slug]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scale,
  Calendar,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import CommentSystem from "@/components/comments/comment-system";
import ArticleViewTrackerWrapper from "@/components/tracking/ArticleViewTrackerWrapper";

import {
  useGetArticleBySlugQuery,
} from "@/integrations/hardware/rtk/endpoints/articles.endpoints";
import type { ArticleDto } from "@/integrations/hardware/rtk/types/article.types";

export default function CompareArticlePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const {
    data,
    isLoading,
    isError,
  } = useGetArticleBySlugQuery(slug ?? "", {
    skip: !slug,
  });

  // RTK'dan gelen article'ı ArticleDto olarak kabul ediyoruz
  const article = data as ArticleDto | undefined;

  // Geçersiz durumlar: slug yok, isError, data yok veya COMPARE/PUBLISHED değil
  const isInvalid =
    !slug ||
    isError ||
    !article ||
    article.type !== "COMPARE" ||
    article.status !== "PUBLISHED";

  if (isInvalid) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/compare-articles")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Karşılaştırma Makalelerine Dön
          </Button>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h1 className="mb-2 text-2xl font-bold">Makale Bulunamadı</h1>
            <p className="text-muted-foreground">
              Aradığınız karşılaştırma makalesi bulunamadı veya yayınlanmamış.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/compare-articles")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Karşılaştırma Makalelerine Dön
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">
              Karşılaştırma makalesi yükleniyor...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Buraya geldiğimizde article garanti var & COMPARE + PUBLISHED
  const contentHtml = article.content ?? "";

  const authorName =
    article.author?.name ||
    `${article.author?.first_name ?? ""} ${
      article.author?.last_name ?? ""
    }`.trim() ||
    "Anonim";

  const publishedDate = article.published_at
    ? new Date(article.published_at)
    : null;

  return (
    <div className="container py-8">
      {/* Görüntü takibi */}
      <ArticleViewTrackerWrapper articleId={article.id} />

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/compare-articles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Karşılaştırma Makalelerine Dön
            </Link>
          </Button>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <Badge variant="secondary">Karşılaştırma</Badge>
        </div>

        <h1 className="mb-2 text-3xl font-bold">{article.title}</h1>
        {article.subtitle && (
          <p className="mb-4 text-lg text-muted-foreground">
            {article.subtitle}
          </p>
        )}

        {/* Tags */}
        {article.article_tags && article.article_tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {article.article_tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-sm">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {authorName}
          </div>
          {publishedDate && (
            <>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {publishedDate.toLocaleDateString("tr-TR")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {publishedDate.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Karşılaştırma Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{
                  __html: contentHtml,
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Article Info */}
          <Card>
            <CardHeader>
              <CardTitle>Makale Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Kategori:
                </span>
                <p>{article.category?.name ?? "Genel"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Yazar:
                </span>
                <p>{authorName}</p>
              </div>
              {publishedDate && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Yayın Tarihi:
                  </span>
                  <p>{publishedDate.toLocaleDateString("tr-TR")}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Yorum Sayısı:
                </span>
                <p>{article.comment_count ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags (yan panelde tekrar göstermek istersen) */}
          {article.article_tags && article.article_tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Etiketler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {article.article_tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="mt-12">
        <CommentSystem articleId={article.id} articleTitle={article.title} />
      </div>
    </div>
  );
}
