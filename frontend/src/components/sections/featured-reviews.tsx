// src/components/sections/featured-reviews.tsx

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatScore, getScoreColor } from "@/lib/utils";

interface FeaturedReview {
  id: number;
  title: string;
  subtitle?: string;
  excerpt: string;
  slug: string;
  hero_image?: string;
  published_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
  category: {
    name: string;
  };
  review_extra?: {
    total_score: number;
  };
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:8000/api";

async function getFeaturedReviews(): Promise<FeaturedReview[]> {
  try {
    const url = `${API_BASE}/articles/?type=REVIEW&status=PUBLISHED&ordering=-review_extra__total_score&limit=3`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(
        "[FeaturedReviews] API error status:",
        response.status,
        "body:",
        text,
      );
      // Eğer ordering backend’de desteklenmiyorsa 400 alırsın.
      // O durumda, en azından fallback olarak yayın tarihine göre sırala:
      if (response.status === 400) {
        try {
          const fallbackUrl = `${API_BASE}/articles/?type=REVIEW&status=PUBLISHED&ordering=-published_at&limit=3`;
          const fallbackRes = await fetch(fallbackUrl, {
            cache: "no-store",
          });
          if (!fallbackRes.ok) {
            const fbText = await fallbackRes.text().catch(() => "");
            console.error(
              "[FeaturedReviews] Fallback API error:",
              fallbackRes.status,
              fbText,
            );
            return [];
          }
          const fbData = await fallbackRes.json();
          const fbResults: unknown = Array.isArray(fbData)
            ? fbData
            : (fbData as { results?: unknown }).results ?? [];
          if (!Array.isArray(fbResults)) {
            return [];
          }
          return fbResults as FeaturedReview[];
        } catch (fbErr) {
          console.error("[FeaturedReviews] Fallback fetch error:", fbErr);
          return [];
        }
      }

      return [];
    }

    const data = await response.json();

    const results: unknown = Array.isArray(data)
      ? data
      : (data as { results?: unknown }).results ?? [];

    if (!Array.isArray(results)) {
      console.error(
        "[FeaturedReviews] Unexpected response shape, expected array or { results: [] }",
      );
      return [];
    }

    return results as FeaturedReview[];
  } catch (error) {
    console.error("[FeaturedReviews] Error fetching featured reviews:", error);
    return [];
  }
}

export async function FeaturedReviews() {
  const featuredReviews = await getFeaturedReviews();

  return (
    <section className="bg-background py-16">
      <div className="container">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">
            Öne Çıkan İçerikler
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            En Popüler İncelemeler
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Uzman ekibimizin detaylı testleri ile hazırladığı en güncel donanım
            incelemeleri
          </p>
        </div>

        {featuredReviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredReviews.map((review) => (
              <Card
                key={review.id}
                className="group transition-shadow hover:shadow-lg"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {review.hero_image ? (
                      <Image
                        src={review.hero_image}
                        alt={review.title}
                        width={640}
                        height={360}
                        className="aspect-video w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted">
                        <span className="text-muted-foreground">Görsel</span>
                      </div>
                    )}

                    <Badge className="absolute left-4 top-4">
                      {review.category?.name ?? "Genel"}
                    </Badge>

                    {typeof review.review_extra?.total_score === "number" && (
                      <div className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 backdrop-blur">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span
                            className={`text-sm font-semibold ${getScoreColor(
                              review.review_extra.total_score,
                            )}`}
                          >
                            {formatScore(review.review_extra.total_score)}
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

                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {review.excerpt}
                  </p>

                  <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {new Date(review.published_at).toLocaleDateString(
                        "tr-TR",
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {review.author?.first_name} {review.author?.last_name}
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
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Henüz öne çıkan inceleme bulunmuyor.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/reviews">
              Tüm İncelemeleri Gör
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
