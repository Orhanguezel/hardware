// src/app/compare-articles/page.tsx

"use client";

import { Scale, Calendar, Clock, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { QueryParams } from "@/lib/api-config";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";
import type { ArticleListItem } from "@/integrations/hardware/rtk/types/article.types";
import { useListArticlesQuery } from "@/integrations/hardware/rtk/endpoints/articles.endpoints";

/* ---------- Helper: PaginatedResult normalize ---------- */

function normalizePaginated<T>(
  data?: PaginatedResult<T> | T[]
): { items: T[]; count: number } {
  if (!data) {
    return { items: [], count: 0 };
  }

  if (Array.isArray(data)) {
    return { items: data, count: data.length };
  }

  const results = Array.isArray(data.results) ? data.results : [];
  const count =
    typeof data.count === "number" ? data.count : results.length;

  return { items: results, count };
}

export default function CompareArticlesPage() {
  const queryParams: QueryParams = {
    type: "COMPARE",
    status: "PUBLISHED",
    ordering: "-published_at",
    // İstersen page/limit ekleyebilirsin
    // page: 1,
    // limit: 24,
  };

  const {
    data,
    isLoading,
    isError,
  } = useListArticlesQuery(queryParams);

  const { items: articles } = normalizePaginated<ArticleListItem>(
    data as PaginatedResult<ArticleListItem> | ArticleListItem[] | undefined
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Karşılaştırma Makaleleri</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Ürünler arası detaylı karşılaştırmalar ve analizler
        </p>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">
              Karşılaştırma makaleleri yükleniyor...
            </p>
          </CardContent>
        </Card>
      )}

      {isError && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              Karşılaştırma makaleleri yüklenirken bir hata oluştu
            </h3>
            <p className="text-muted-foreground">
              Lütfen sayfayı yenileyerek tekrar deneyin.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && articles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Scale className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              Henüz karşılaştırma makalesi yok
            </h3>
            <p className="text-muted-foreground">
              Yakında detaylı karşılaştırma makaleleri eklenecek.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && articles.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="group transition-shadow hover:shadow-lg"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <div className="flex aspect-video items-center justify-center bg-muted">
                    {article.hero_image ? (
                      <Image
                        src={article.hero_image}
                        alt={article.title}
                        className="h-full w-full object-cover"
                        width={640}
                        height={360}
                      />
                    ) : (
                      <span className="text-muted-foreground">Görsel</span>
                    )}
                  </div>
                  <Badge className="absolute left-4 top-4">
                    Karşılaştırma
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CardTitle className="mb-2 line-clamp-2 transition-colors group-hover:text-primary">
                  {article.title}
                </CardTitle>

                {article.subtitle && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {article.subtitle}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {article.author?.name ||
                        `${article.author?.first_name ?? ""} ${
                          article.author?.last_name ?? ""
                        }`.trim() ||
                        "Anonim"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {article.published_at
                        ? new Date(
                            article.published_at
                          ).toLocaleDateString("tr-TR")
                        : "-"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {article.published_at
                        ? new Date(article.published_at).toLocaleTimeString(
                            "tr-TR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/compare-articles/${article.slug}`}>
                        Oku
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
