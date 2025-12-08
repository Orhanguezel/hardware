// src/components/sections/latest-articles.tsx

import Link from "next/link";
import { Calendar, ArrowRight, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Article {
  id: number;
  title: string;
  slug: string;
  subtitle?: string;
  type: string;
  status: string;
  author?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  published_at: string;
  created_at: string;
  comment_count?: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:8000/api";

async function getLatestArticles(): Promise<Article[]> {
  try {
    const url = `${API_BASE}/articles/?status=PUBLISHED&limit=4`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(
        "[LatestArticles] Failed to fetch articles:",
        response.status,
        text,
      );
      return [];
    }

    const data = await response.json();

    // Hem plain array hem de { results, count } yapısını destekle
    const results: unknown = Array.isArray(data)
      ? data
      : (data as { results?: unknown }).results ?? [];

    if (!Array.isArray(results)) {
      console.error(
        "[LatestArticles] Unexpected response shape, expected array or { results: [] }",
      );
      return [];
    }

    return results as Article[];
  } catch (error) {
    console.error("[LatestArticles] Error fetching articles:", error);
    return [];
  }
}

const typeColors = {
  REVIEW: "default",
  NEWS: "secondary",
  GUIDE: "outline",
  BEST_LIST: "success",
  COMPARE: "destructive",
} as const;

const typeLabels = {
  REVIEW: "İnceleme",
  NEWS: "Haber",
  GUIDE: "Rehber",
  BEST_LIST: "En İyi Listeler",
  COMPARE: "Karşılaştırma",
} as const;

function getArticleUrl(article: Article): string {
  switch (article.type) {
    case "REVIEW":
      return `/reviews/${article.slug}`;
    case "BEST_LIST":
      return `/best/${article.slug}`;
    case "COMPARE":
      return `/compare-articles/${article.slug}`;
    case "GUIDE":
      return `/guides/${article.slug}`;
    case "NEWS":
      return `/news/${article.slug}`;
    default:
      return `/reviews/${article.slug}`;
  }
}

export async function LatestArticles() {
  const articles = await getLatestArticles();

  return (
    <section className="bg-muted/30 py-16">
      <div className="container">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Son Yazılar
            </h2>
            <p className="text-muted-foreground">
              En güncel donanım haberleri, incelemeler ve rehberler
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/articles">
              Tümünü Gör
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {articles.length === 0 ? (
            <div className="col-span-2 py-12 text-center">
              <p className="text-muted-foreground">
                Henüz yayınlanmış makale bulunmuyor.
              </p>
            </div>
          ) : (
            articles.map((article) => (
              <Card
                key={article.id}
                className="group flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <div className="flex aspect-video items-center justify-center rounded-l-lg bg-muted md:aspect-square">
                      <span className="text-muted-foreground">Görsel</span>
                    </div>
                  </div>

                  <CardContent className="flex-1 p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge
                        variant={
                          typeColors[
                          article.type as keyof typeof typeColors
                          ] || "default"
                        }
                      >
                        {typeLabels[
                          article.type as keyof typeof typeLabels
                        ] || article.type}
                      </Badge>
                      <Badge variant="outline">
                        {article.category?.name || "Genel"}
                      </Badge>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-xl font-semibold transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {article.subtitle || "Makale içeriği..."}
                    </p>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(new Date(article.published_at))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{article.author?.name || "Anonim"}</span>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" asChild>
                        <Link href={getArticleUrl(article)}>
                          Oku
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
