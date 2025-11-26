// src/app/best/page.tsx

"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Star, ArrowRight, Award, TrendingUp } from "lucide-react";

import {
  useListArticlesQuery,
} from "@/integrations/hardware/rtk/endpoints/articles.endpoints";
import type { ArticleListItem } from "@/integrations/hardware/rtk/types/article.types";

export default function BestPage() {
  const {
    data,
    isLoading,
    isError,
  } = useListArticlesQuery({
    type: "BEST_LIST",
    status: "PUBLISHED",
    ordering: "-published_at",
  });

  const bestLists = useMemo<ArticleListItem[]>(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results ?? [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">En iyi liste rehberleri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-semibold mb-2">
            Rehberler yüklenirken bir hata oluştu
          </h2>
          <p className="text-muted-foreground">
            Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Award className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">En İyi Ürün Rehberleri</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Farklı kategorilerde en iyi donanım seçeneklerini bulun.
          Uzman ekibimizin detaylı testleri ile hazırlanmış kapsamlı rehberler.
        </p>
      </div>

      {bestLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bestLists.map((list) => {
            const itemsCount =
              list.best_list_extra?.items && Array.isArray(list.best_list_extra.items)
                ? list.best_list_extra.items.length
                : 0;

            const publishedDate = list.published_at
              ? new Date(list.published_at).toLocaleDateString("tr-TR")
              : "";

            return (
              <Card
                key={list.id}
                className="group hover:shadow-lg transition-all duration-200"
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {list.hero_image ? (
                        <Image
                          src={list.hero_image}
                          alt={list.title}
                          width={640}
                          height={360}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">Görsel</span>
                      )}
                    </div>
                    {list.category && (
                      <Badge className="absolute top-4 left-4">
                        {list.category.name}
                      </Badge>
                    )}
                    {itemsCount > 0 && (
                      <Badge
                        variant="outline"
                        className="absolute top-4 right-4 bg-background/90 backdrop-blur text-blue-600 border-blue-600"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {itemsCount} Ürün
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <CardTitle className="mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {list.title}
                  </CardTitle>

                  {list.subtitle && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {list.subtitle}
                    </p>
                  )}

                  {list.excerpt && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {list.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-4">
                      {publishedDate && <span>{publishedDate}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {list.author.first_name} {list.author.last_name}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/best/${list.slug}`}>
                        Rehberi İncele
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            Henüz En İyi Liste Bulunmuyor
          </h3>
          <p className="text-muted-foreground">
            Yakında farklı kategorilerde en iyi ürün rehberleri yayınlanacak.
          </p>
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="bg-muted/50 rounded-lg p-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-semibold mb-2">
            Sürekli Güncellenen İçerik
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Yeni ürünler çıktıkça rehberlerimizi güncelliyoruz.
            En güncel öneriler için bizi takip etmeye devam edin.
          </p>
        </div>
      </div>
    </div>
  );
}
