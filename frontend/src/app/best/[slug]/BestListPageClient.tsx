// src/app/best/[slug]/BestListPageClient.tsx
"use client";

import { Star, ExternalLink, Check, X, Award } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useGetArticleBySlugQuery } from "@/integrations/hardware/rtk/endpoints/articles.endpoints";
import type {
  ArticleDto,
  BestListExtraDto,
} from "@/integrations/hardware/rtk/types/article.types";

import CommentSystem from "@/components/comments/comment-system";
import ArticleViewTrackerWrapper from "@/components/tracking/ArticleViewTrackerWrapper";

interface BestListUiItem {
  id: string;
  title: string;
  description: string;
  image: string;
  pros: string[];
  cons: string[];
  price: string;
  rating: number;
  link: string;
}

const normalizeBestListItems = (
  extra: BestListExtraDto | null
): BestListUiItem[] => {
  if (!extra || !Array.isArray(extra.items)) return [];

  return extra.items.map((raw, index) => {
    const obj = raw as Record<string, unknown>;

    const id =
      typeof obj.id === "string"
        ? obj.id
        : typeof obj.id === "number"
        ? String(obj.id)
        : String(index);

    const title =
      typeof obj.title === "string" && obj.title.trim().length > 0
        ? obj.title
        : `Öğe ${index + 1}`;

    const description =
      typeof obj.description === "string" ? obj.description : "";

    const image = typeof obj.image === "string" ? obj.image : "";

    const pros = Array.isArray(obj.pros)
      ? obj.pros.filter((item): item is string => typeof item === "string")
      : [];

    const cons = Array.isArray(obj.cons)
      ? obj.cons.filter((item): item is string => typeof item === "string")
      : [];

    const price = typeof obj.price === "string" ? obj.price : "";

    const ratingValue = obj.rating;
    const rating =
      typeof ratingValue === "number"
        ? ratingValue
        : typeof ratingValue === "string"
        ? Number(ratingValue)
        : 0;

    const link = typeof obj.link === "string" ? obj.link : "";

    return {
      id,
      title,
      description,
      image,
      pros,
      cons,
      price,
      rating,
      link,
    };
  });
};

export function BestListPageClient({ slug }: { slug: string }) {
  const {
    data: article,
    isLoading,
    isError,
  } = useGetArticleBySlugQuery(slug);

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Liste rehberi yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !article || article.type !== "BEST_LIST") {
    return (
      <div className="container py-16">
        <div className="text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            En iyi liste bulunamadı
          </h3>
          <p className="text-muted-foreground">
            Aradığınız en iyi liste yayında olmayabilir veya kaldırılmış
            olabilir.
          </p>
        </div>
      </div>
    );
  }

  const bestList: ArticleDto = article;
  const items = normalizeBestListItems(bestList.best_list_extra);
  const publishedDate = bestList.published_at
    ? new Date(bestList.published_at).toLocaleDateString("tr-TR")
    : "";

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log("Best List Data:", bestList);
    if (bestList.best_list_extra?.items) {
      // eslint-disable-next-line no-console
      console.log("Best List Items:", bestList.best_list_extra.items);
    }
  }

  return (
    <div className="container py-8">
      {/* articleId number */}
      <ArticleViewTrackerWrapper articleId={bestList.id} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {bestList.category && (
            <Badge variant="secondary">{bestList.category.name}</Badge>
          )}

          {items.length > 0 && (
            <Badge
              variant="outline"
              className="text-blue-600 border-blue-600"
            >
              <Award className="w-3 h-3 mr-1" />
              {items.length} Ürün
            </Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{bestList.title}</h1>

        {bestList.subtitle && (
          <p className="text-xl text-muted-foreground mb-4">
            {bestList.subtitle}
          </p>
        )}

        {/* Tags */}
        {bestList.article_tags && bestList.article_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {bestList.article_tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-sm">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {bestList.excerpt && (
          <p className="text-lg text-muted-foreground mb-6">
            {bestList.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            {bestList.author.first_name} {bestList.author.last_name}
          </span>
          {publishedDate && (
            <>
              <span>•</span>
              <span>{publishedDate}</span>
            </>
          )}
        </div>
      </div>

      {/* Hero Image */}
      {bestList.hero_image && (
        <div className="mb-8">
          <Image
            src={bestList.hero_image}
            alt={bestList.title}
            width={640}
            height={360}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Best List Items */}
      {items.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">En İyi Seçenekler</h2>

          {items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-primary border-primary"
                      >
                        #{index + 1}
                      </Badge>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {item.rating}/10
                          </span>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    {item.price && (
                      <p className="text-lg font-semibold text-primary mt-1">
                        {item.price}
                      </p>
                    )}
                  </div>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {item.description && (
                  <p className="text-muted-foreground mb-4">
                    {item.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Pros */}
                  {item.pros.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Artılar
                      </h4>
                      <ul className="space-y-1">
                        {item.pros.map((pro, proIndex) => (
                          <li
                            key={proIndex}
                            className="text-sm text-green-700 flex items-start gap-2"
                          >
                            <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Cons */}
                  {item.cons.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-1">
                        <X className="w-4 h-4" />
                        Eksiler
                      </h4>
                      <ul className="space-y-1">
                        {item.cons.map((con, conIndex) => (
                          <li
                            key={conIndex}
                            className="text-sm text-red-700 flex items-start gap-2"
                          >
                            <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {item.link && (
                  <Button asChild className="w-full">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Satın Al
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            Liste Öğeleri Bulunamadı
          </h3>
          <p className="text-muted-foreground">
            Bu liste henüz öğe içermiyor.
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="mt-12">
        <CommentSystem articleId={bestList.id} />
      </div>
    </div>
  );
}
