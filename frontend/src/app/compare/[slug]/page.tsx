// =============================================================
// FILE: src/app/compare/[slug]/page.tsx
// =============================================================

import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Calendar,
  Clock,
  User,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import CommentSystem from "@/components/comments/comment-system";
import ArticleViewTrackerWrapper from "@/components/tracking/ArticleViewTrackerWrapper";

// Dinamik route – dış API'den no-store fetch
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

type ComparePageParams = {
  slug: string;
};

interface ComparePageProps {
  params: Promise<ComparePageParams>;
}

interface CompareTag {
  id: number;
  name: string;
  slug?: string;
}

async function getCompareArticle(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}/`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch article: ${response.status}`);
    }

    const data = await response.json();

    if (data.type !== "COMPARE" || data.status !== "PUBLISHED") {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching compare article:", error);
    return null;
  }
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;
  const article = await getCompareArticle(slug);

  if (!article) {
    notFound();
  }

  const transformedArticle = {
    id: article.id,
    title: article.title,
    subtitle: article.subtitle,
    content: article.content,
    published_at: article.published_at,
    created_at: article.created_at,
    author: {
      id: article.author.id,
      name: article.author.name,
      avatar: article.author.avatar,
    },
    category: article.category,
    article_tags: (article.article_tags || []) as CompareTag[],
    comment_count: article.comment_count || 0,
    compare_extra: article.compare_extra || {},
  };

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={transformedArticle.id} />

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/compare">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Karşılaştırmalara Dön
            </Link>
          </Button>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <Badge variant="secondary">Karşılaştırma</Badge>
        </div>

        <h1 className="mb-2 text-3xl font-bold">
          {transformedArticle.title}
        </h1>

        {transformedArticle.subtitle && (
          <p className="mb-4 text-lg text-muted-foreground">
            {transformedArticle.subtitle}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {transformedArticle.author.name}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(
              transformedArticle.published_at,
            ).toLocaleDateString("tr-TR")}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(transformedArticle.published_at).toLocaleTimeString(
              "tr-TR",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </div>
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
                  __html:
                    typeof transformedArticle.content === "string"
                      ? transformedArticle.content
                      : JSON.stringify(transformedArticle.content),
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
                <p>{transformedArticle.category?.name || "Genel"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Yazar:
                </span>
                <p>{transformedArticle.author.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Yayın Tarihi:
                </span>
                <p>
                  {new Date(
                    transformedArticle.published_at,
                  ).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Yorum Sayısı:
                </span>
                <p>{transformedArticle.comment_count}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {transformedArticle.article_tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Etiketler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {transformedArticle.article_tags.map((tag) => (
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
        <CommentSystem
          articleId={transformedArticle.id}
          articleTitle={transformedArticle.title}
        />
      </div>
    </div>
  );
}
