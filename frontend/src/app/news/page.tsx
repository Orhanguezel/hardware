// src/app/news/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  TrendingUp,
  Newspaper,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface NewsArticle {
  id: number;
  title: string;
  subtitle?: string;
  excerpt?: string;
  slug: string;
  published_at: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  article_tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  hero_image?: string;
  comment_count?: number;
  created_at: string;
}

async function getNewsArticles(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/?type=NEWS&status=PUBLISHED&ordering=-published_at`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch news articles: ${response.status}`,
      );
    }

    const data = await response.json();
    return (data.results ?? data) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching news articles:", error);
    return [];
  }
}

async function getFeaturedNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/?type=NEWS&status=PUBLISHED&ordering=-published_at&limit=3`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch featured news: ${response.status}`,
      );
    }

    const data = await response.json();
    return (data.results ?? data) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching featured news:", error);
    return [];
  }
}

export default async function NewsPage() {
  const [newsArticles, featuredNews] = await Promise.all([
    getNewsArticles(),
    getFeaturedNews(),
  ]);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Haberler</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Teknoloji dünyasından en güncel haberler ve gelişmeler
        </p>
      </div>

      {/* Featured News */}
      {featuredNews.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">
              Öne Çıkan Haberler
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredNews.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                {article.hero_image && (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={article.hero_image}
                      alt={article.title}
                      className="h-full w-full object-cover"
                      width={640}
                      height={360}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary">
                      {article.category.name}
                    </Badge>
                    {article.article_tags
                      .slice(0, 2)
                      .map((tagWrapper) =>
                        tagWrapper.tag ? (
                          <Badge
                            key={tagWrapper.tag.id}
                            variant="outline"
                          >
                            {tagWrapper.tag.name}
                          </Badge>
                        ) : null,
                      )}
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link
                      href={`/news/${article.slug}`}
                      className="transition-colors hover:text-primary"
                    >
                      {article.title}
                    </Link>
                  </CardTitle>
                  {article.subtitle && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {article.subtitle}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(
                            article.published_at,
                          ).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>
                    <Link href={`/news/${article.slug}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All News */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Tüm Haberler</h2>
          <div className="flex gap-2">
            <select className="rounded-md border bg-background px-3 py-2 text-sm">
              <option value="newest">En Yeni</option>
              <option value="oldest">En Eski</option>
              <option value="popular">En Popüler</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newsArticles.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden transition-shadow hover:shadow-lg"
            >
              {article.hero_image && (
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={article.hero_image}
                    alt={article.title}
                    className="h-full w-full object-cover"
                    width={640}
                    height={360}
                  />
                </div>
              )}
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary">
                    {article.category.name}
                  </Badge>
                  {article.article_tags
                    .slice(0, 2)
                    .map((tagWrapper) =>
                      tagWrapper.tag ? (
                        <Badge
                          key={tagWrapper.tag.id}
                          variant="outline"
                        >
                          {tagWrapper.tag.name}
                        </Badge>
                      ) : null,
                    )}
                </div>
                <CardTitle className="line-clamp-2">
                  <Link
                    href={`/news/${article.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {article.title}
                  </Link>
                </CardTitle>
                {article.subtitle && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {article.subtitle}
                  </p>
                )}
                {article.excerpt && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {article.excerpt}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(
                          article.published_at,
                        ).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                  <Link href={`/news/${article.slug}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {newsArticles.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  Henüz haber yok
                </h3>
                <p className="text-muted-foreground">
                  Şu anda görüntülenecek haber bulunmuyor.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
