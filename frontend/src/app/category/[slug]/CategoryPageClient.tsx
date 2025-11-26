// src/app/category/[slug]/CategoryPageClient.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Filter,
  Star,
  Calendar,
  MessageSquare,
  ChevronRight,
  Home,
  Package,
  FileText,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { formatDate, getScoreColor } from "@/lib/utils";

import type { QueryParams } from "@/lib/api-config";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";
import type { Category as CategoryDto } from "@/integrations/hardware/rtk/types/category.types";
import type {
  ArticleListItem,
  ArticleType,
  ArticleTagSummary,
} from "@/integrations/hardware/rtk/types/article.types";

import {
  useGetCategoryBySlugQuery,
  useGetCategoryByIdQuery,
} from "@/integrations/hardware/rtk/endpoints/categories.endpoints";
import { useListArticlesQuery } from "@/integrations/hardware/rtk/endpoints/articles.endpoints";
import { useListProductsQuery } from "@/integrations/hardware/rtk/endpoints/products.endpoints";

type CategoryViewMode = "products" | "articles";

export interface CategoryPageClientProps {
  slug: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

/* ---------- Helpers ---------- */

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

interface CategoryProductCard {
  id: number;
  slug: string;
  brand: string;
  model: string;
  description: string;
  cover_image: string;
  review_count: number;
}

function mapProductToCard(raw: unknown): CategoryProductCard | null {
  const obj = raw as Record<string, unknown>;

  const idRaw = obj.id;
  const id =
    typeof idRaw === "number"
      ? idRaw
      : typeof idRaw === "string"
      ? Number(idRaw)
      : NaN;

  if (!Number.isFinite(id)) {
    return null;
  }

  const slug = typeof obj.slug === "string" ? obj.slug : "";
  const brand = typeof obj.brand === "string" ? obj.brand : "";
  const model = typeof obj.model === "string" ? obj.model : "";
  const description =
    typeof obj.description === "string" ? obj.description : "";
  const cover_image =
    typeof obj.cover_image === "string" ? obj.cover_image : "";

  const reviewCountRaw = obj.review_count;
  const review_count =
    typeof reviewCountRaw === "number"
      ? reviewCountRaw
      : typeof reviewCountRaw === "string"
      ? Number(reviewCountRaw)
      : 0;

  return {
    id,
    slug,
    brand,
    model,
    description,
    cover_image,
    review_count,
  };
}

/* ---------- Component ---------- */

export function CategoryPageClient({
  slug,
  searchParams,
}: CategoryPageClientProps) {
  // ---- URL paramları normalize et ----
  const rawView = searchParams.view;
  const viewParam = Array.isArray(rawView) ? rawView[0] : rawView;
  const view: CategoryViewMode =
    viewParam === "articles" ? "articles" : "products";

  const rawPage = searchParams.page;
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = Number.parseInt(pageParam ?? "1", 10) || 1;

  const rawType = searchParams.type;
  const typeParam = Array.isArray(rawType) ? rawType[0] : rawType;
  const typeFilter = typeParam as ArticleType | undefined;

  const rawTag = searchParams.tag;
  const tagParam = Array.isArray(rawTag) ? rawTag[0] : rawTag;
  const tagFilter = tagParam;

  const rawSort = searchParams.sort;
  const sortParam = Array.isArray(rawSort) ? rawSort[0] : rawSort;
  const sort = sortParam;

  // ---- Kategori ----
  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useGetCategoryBySlugQuery(slug);

  const parentId = category?.parent ?? null;

  const { data: parentCategory } = useGetCategoryByIdQuery(
    parentId ?? 0,
    {
      skip: !parentId,
    }
  );

  // ---- Makaleler ----
  const articleQueryParams: QueryParams | undefined = category
    ? {
        category: category.id,
        status: "PUBLISHED",
        page,
        limit: 12,
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(tagFilter ? { "tags__slug": tagFilter } : {}),
        ...(sort === "score"
          ? { ordering: "-review_extra__score_numeric" }
          : sort === "comments"
          ? { ordering: "-comment_count" }
          : { ordering: "-published_at" }),
      }
    : undefined;

  const {
    data: articlesData,
    isLoading: articlesLoading,
    isError: articlesError,
  } = useListArticlesQuery(articleQueryParams as QueryParams, {
    skip: !articleQueryParams,
  });

  const {
    items: articles,
    count: articlesCount,
  } = normalizePaginated<ArticleListItem>(
    articlesData as
      | PaginatedResult<ArticleListItem>
      | ArticleListItem[]
      | undefined
  );

  // ---- Ürünler ----
  const productQueryParams: QueryParams | undefined = category
    ? { category: category.id }
    : undefined;

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useListProductsQuery(productQueryParams as QueryParams, {
    skip: !productQueryParams,
  });

  const { items: productsRaw } = normalizePaginated<unknown>(
    productsData as PaginatedResult<unknown> | unknown[] | undefined
  );

  const products: CategoryProductCard[] = productsRaw
    .map((p) => mapProductToCard(p))
    .filter(
      (p): p is CategoryProductCard => p !== null
    );

  // ---- Tag listesi (unique) ----
  const tagMap = new Map<number, ArticleTagSummary>();
  for (const article of articles) {
    const tags = article.article_tags ?? [];
    for (const tag of tags) {
      tagMap.set(tag.id, tag);
    }
  }
  const allTags = Array.from(tagMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // ---- Kullanılabilir içerik türleri ----
  const availableTypes: ArticleType[] =
    view === "products"
      ? ["REVIEW", "BEST_LIST", "COMPARE", "GUIDE"]
      : ["REVIEW", "NEWS", "GUIDE", "BEST_LIST", "COMPARE"];

  const articleTypes: ArticleType[] = Array.from(
    new Set<ArticleType>(
      articles.map((article) => article.type as ArticleType)
    )
  ).filter((type) => availableTypes.includes(type));

  const totalArticles = articlesCount;
  const totalPages = Math.ceil(totalArticles / 12);

  const productsCountLabel =
    category?.product_count ?? products.length;
  const articleCountLabel =
    category?.article_count ?? totalArticles;

  // ---- Loading / Error ----
  if (categoryLoading) {
    return (
      <div className="container py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">
              Kategori yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="container py-16">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">
            Kategori bulunamadı
          </h1>
          <p className="text-muted-foreground">
            Aradığınız kategori yayında olmayabilir veya kaldırılmış
            olabilir.
          </p>
        </div>
      </div>
    );
  }

  const resolvedSearchParams = {
    type: typeFilter,
    tag: tagFilter,
    sort,
  };

  /* ---------- JSX ---------- */

  return (
    <div className="container py-8">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-1 hover:text-primary">
          <Home className="h-4 w-4" />
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        {parentCategory && (
          <>
            <Link
              href={`/category/${parentCategory.slug}`}
              className="hover:text-primary"
            >
              {parentCategory.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* SOL PANEL - filtreler */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alt kategoriler */}
              {(category.children ?? []).length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">Alt Kategoriler</h3>
                  <div className="space-y-2">
                    {(category.children ?? []).map(
                      (child: CategoryDto) => (
                        <Link
                          key={child.id}
                          href={`/category/${child.slug}`}
                          className="block rounded p-2 transition-colors hover:bg-muted"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{child.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(child.article_count ?? 0) +
                                (child.product_count ?? 0)}
                            </Badge>
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* İçerik türü */}
              {articleTypes.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">İçerik Türü</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/category/${slug}?view=${view}`}
                      className="block rounded p-2 transition-colors hover:bg-muted"
                    >
                      <span className="text-sm">Tümü</span>
                    </Link>
                    {articleTypes.map((type) => {
                      const typeLabels: Record<string, string> = {
                        REVIEW: "İnceleme",
                        NEWS: "Haber",
                        GUIDE: "Rehber",
                        BEST_LIST: "En İyi Listeler",
                        COMPARE: "Karşılaştırma",
                      };
                      return (
                        <Link
                          key={type}
                          href={`/category/${slug}?view=${view}&type=${type}`}
                          className="block rounded p-2 transition-colors hover:bg-muted"
                        >
                          <span className="text-sm">
                            {typeLabels[type] ?? type}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Etiketler */}
              {allTags.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">Etiketler</h3>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {allTags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/category/${slug}?view=${view}&tag=${tag.slug}`}
                        className="block rounded p-2 transition-colors hover:bg-muted"
                      >
                        <span className="text-sm">{tag.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sıralama */}
              <div>
                <h3 className="mb-3 font-semibold">Sıralama</h3>
                <div className="space-y-2">
                  <Link
                    href={`/category/${slug}?view=${view}`}
                    className="block rounded p-2 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm">En Yeni</span>
                  </Link>
                  <Link
                    href={`/category/${slug}?view=${view}&sort=score`}
                    className="block rounded p-2 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm">En Yüksek Puan</span>
                  </Link>
                  <Link
                    href={`/category/${slug}?view=${view}&sort=comments`}
                    className="block rounded p-2 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm">En Çok Yorum</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SAĞ PANEL - içerik */}
        <div className="lg:w-3/4">
          {/* Kategori başlığı */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold">{category.name}</h1>
            <p className="mb-4 text-muted-foreground">
              {view === "products"
                ? `${products.length} ürün bulundu`
                : `${totalArticles} makale bulundu`}
              {resolvedSearchParams.type &&
                ` - ${resolvedSearchParams.type} türünde`}
              {resolvedSearchParams.tag &&
                ` - ${resolvedSearchParams.tag} etiketi`}
            </p>

            {/* Görünüm seçici */}
            <div className="mb-4 flex gap-2">
              <Button
                variant={view === "products" ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/category/${slug}?view=products`}>
                  <Package className="mr-2 h-4 w-4" />
                  Ürünler ({productsCountLabel})
                </Link>
              </Button>
              <Button
                variant={view === "articles" ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href={`/category/${slug}?view=articles`}>
                  <FileText className="mr-2 h-4 w-4" />
                  İncelemeler ({articleCountLabel})
                </Link>
              </Button>
            </div>

            {/* Aktif filtreler */}
            <div className="flex flex-wrap gap-2">
              {resolvedSearchParams.type && (
                <Badge variant="secondary" className="gap-1">
                  {resolvedSearchParams.type}
                  <Link
                    href={`/category/${slug}?view=${view}`}
                    className="ml-1"
                  >
                    ×
                  </Link>
                </Badge>
              )}
              {resolvedSearchParams.tag && (
                <Badge variant="secondary" className="gap-1">
                  {resolvedSearchParams.tag}
                  <Link
                    href={`/category/${slug}?view=${view}`}
                    className="ml-1"
                  >
                    ×
                  </Link>
                </Badge>
              )}
            </div>
          </div>

          {/* ÜRÜNLER */}
          {view === "products" && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">
                Ürünler ({products.length})
              </h2>

              {productsLoading && (
                <div className="py-8 text-center text-muted-foreground">
                  Ürünler yükleniyor...
                </div>
              )}

              {!productsLoading && products.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="group transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="p-0">
                        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                          {product.cover_image ? (
                            <Image
                              src={product.cover_image}
                              alt={`${product.brand} ${product.model}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted-foreground/20">
                              <span className="text-2xl">📦</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                            {product.brand} {product.model}
                          </h3>

                          {product.description && (
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-muted-foreground">
                                {product.review_count ?? 0} değerlendirme
                              </span>
                            </div>
                            <Button size="sm" asChild>
                              <Link
                                href={`/products/by-slug/${product.slug}`}
                              >
                                Detayları Gör
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}

              {!productsLoading && products.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Bu kategoride ürün bulunamadı.</p>
                </div>
              )}

              {productsError && (
                <div className="mt-4 text-center text-sm text-red-600">
                  Ürünler yüklenirken bir hata oluştu.
                </div>
              )}
            </div>
          )}

          {/* MAKALELER */}
          {view === "articles" && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">
                İncelemeler ({totalArticles})
              </h2>

              {articlesLoading && (
                <div className="py-8 text-center text-muted-foreground">
                  Makaleler yükleniyor...
                </div>
              )}

              {!articlesLoading && articles.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {articles.map((article) => (
                    <Card
                      key={article.id}
                      className="group transition-shadow hover:shadow-lg"
                    >
                      <CardHeader className="relative p-0">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                          {article.hero_image ? (
                            <Image
                              src={article.hero_image}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center">
                              <Calendar className="mb-2 h-12 w-12 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Görsel
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="absolute left-4 top-4">
                          <Badge variant="secondary">
                            {(() => {
                              const typeLabels: Record<string, string> = {
                                REVIEW: "İnceleme",
                                NEWS: "Haber",
                                GUIDE: "Rehber",
                                BEST_LIST: "En İyi Listeler",
                                COMPARE: "Karşılaştırma",
                              };
                              return (
                                typeLabels[article.type] ??
                                article.type
                              );
                            })()}
                          </Badge>
                        </div>
                        {article.review_extra?.score_numeric != null && (
                          <div className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 backdrop-blur">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span
                                className={`text-sm font-semibold ${getScoreColor(
                                  article.review_extra.score_numeric
                                )}`}
                              >
                                {article.review_extra.score_numeric.toFixed(
                                  1
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="line-clamp-2 text-xl font-semibold transition-colors group-hover:text-primary">
                            {article.title}
                          </h3>

                          {article.excerpt && (
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                              {article.excerpt}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {article.published_at
                                    ? formatDate(article.published_at)
                                    : ""}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>
                                {article.comment_count ?? 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                <span className="text-xs font-medium">
                                  {article.author?.first_name
                                    ?.charAt(0)
                                    .toUpperCase() ?? "A"}
                                </span>
                              </div>
                              <span className="text-sm">
                                {article.author?.first_name ??
                                  "Anonim"}
                              </span>
                            </div>

                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={(() => {
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
                                })()}
                              >
                                Devamını Oku
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}

              {!articlesLoading && articles.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Bu kategoride inceleme bulunamadı.</p>
                </div>
              )}

              {articlesError && (
                <div className="mt-4 text-center text-sm text-red-600">
                  İncelemeler yüklenirken bir hata oluştu.
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === page ? "default" : "outline"
                      }
                      size="sm"
                      asChild
                    >
                      <Link
                        href={`/category/${slug}?view=articles&page=${pageNum}${
                          resolvedSearchParams.type
                            ? `&type=${resolvedSearchParams.type}`
                            : ""
                        }${
                          resolvedSearchParams.tag
                            ? `&tag=${resolvedSearchParams.tag}`
                            : ""
                        }${
                          sort ? `&sort=${sort}` : ""
                        }`}
                      >
                        {pageNum}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
