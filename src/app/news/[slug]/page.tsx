// src/app/news/[slug]/page.tsx

import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Newspaper } from "lucide-react";
import Link from "next/link";
import CommentSystem from "@/components/comments/comment-system";
import ArticleViewTrackerWrapper from "@/components/tracking/ArticleViewTrackerWrapper";
import { DJANGO_API_URL } from "@/lib/api";

interface NewsTag {
  id: number;
  name: string;
  slug: string;
  type: string;
}

interface NewsDetail {
  id: number;
  title: string;
  subtitle?: string;
  excerpt?: string;
  slug: string;
  type: string;
  status: string;
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
  article_tags?: NewsTag[];
  hero_image?: string;
  content:
    | string
    | {
        html: string;
      };
  comment_count: number;
  created_at: string;
}

// DJANGO_API_URL .env’de şu şekilde olmalı:
// DJANGO_API_URL=http://127.0.0.1:8001/api
const API_BASE =
  DJANGO_API_URL || process.env.DJANGO_API_URL || "http://127.0.0.1:8001/api";

async function getNews(slug: string): Promise<NewsDetail | null> {
  try {
    const url = `${API_BASE}/articles/${encodeURIComponent(slug)}/`;
    console.log("Fetching news from Django API:", url);

    const response = await fetch(url, {
      // Haber detayı her istekte taze olsun istiyorsan:
      cache: "no-store",
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch news: ${response.status} ${response.statusText}`,
      );
      console.error("Error response:", errorText);
      return null;
    }

    const data = (await response.json()) as NewsDetail;

    // NEWS tipinde değilse 404 ver
    if (data.type === "NEWS") {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const url = `${API_BASE}/articles/?type=NEWS&status=PUBLISHED`;
    const response = await fetch(url, {
      // static params için cache kullanılması daha sağlıklı
      // istersen revalidate süresi verebilirsin:
      // next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch news for static params:",
        response.status,
      );
      return [];
    }

    const result = await response.json();
    const news: NewsDetail[] = Array.isArray((result as any).results)
      ? (result as any).results
      : Array.isArray(result)
        ? (result as any)
        : [];

    return news.map((newsItem) => ({
      slug: newsItem.slug,
    }));
  } catch (error) {
    console.error("Error generating static params for news:", error);
    // Hata olsa bile boş array dönüp build'in tamamlanmasını sağla
    return [];
  }
}

// Projedeki PageProps constraint'i params'ı Promise beklediği için
// burada da Promise<{ slug: string }> kullanıyoruz.
export default async function NewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news || news.type !== "NEWS") {
    notFound();
  }

  return (
    <div className="container py-8">
      <ArticleViewTrackerWrapper articleId={news.id} />
      <div className="mx-auto max-w-4xl">
        <Link
          href="/news"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Tüm Haberler
        </Link>

      <Card className="mb-8">
        {news.hero_image && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <Image
              src={news.hero_image}
              alt={news.title}
              width={800}
              height={450}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary" className="w-fit">
              {news.category?.name || "Genel"}
            </Badge>
            <Badge variant="outline">
              <Newspaper className="mr-1 h-3 w-3" />
              Haber
            </Badge>
          </div>

          <CardTitle className="mb-2 text-4xl font-extrabold leading-tight">
            {news.title}
          </CardTitle>

          {news.subtitle && (
            <p className="mb-4 text-xl text-muted-foreground">
              {news.subtitle}
            </p>
          )}

          {news.article_tags && news.article_tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {news.article_tags.map((tag) => (
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
                {news.author.first_name} {news.author.last_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(news.published_at).toLocaleDateString("tr-TR")}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="prose max-w-none dark:prose-invert">
          <div
            dangerouslySetInnerHTML={{
              __html:
                typeof news.content === "string"
                  ? news.content
                  : news.content?.html || "",
            }}
          />
        </CardContent>
      </Card>

      <CommentSystem articleId={news.id} />
      </div>
    </div>
  );
}
