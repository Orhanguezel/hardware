// src/app/admin/products/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Link as LinkIcon,
  Calendar,
  Star,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  useListProductsQuery,
  useDeleteProductByIdMutation,
} from "@/integrations/hardware/rtk/endpoints/products.endpoints";
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";

import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";
import type {
  ProductDto,
  ProductTag,
  AffiliateLink,
} from "@/integrations/hardware/rtk/types/product.types";
import type { Category } from "@/integrations/hardware/rtk/types/category.types";
import type { QueryParams } from "@/lib/api-config";

/* ----------------------------------------
 * View model tipleri
 * --------------------------------------*/

interface CategorySummary {
  id: number;
  name: string;
  slug: string;
}

interface ProductCardView {
  id: number;
  brand: string;
  model: string;
  slug: string;
  description?: string;
  releaseYear?: number | null;
  coverImage?: string | null;
  category?: CategorySummary | null;
  productTags: ProductTag[];
  affiliateLinks: AffiliateLink[];
  reviewCount: number;
  averageRating?: number | null;
  specsCount: number;
  affiliateLinksCount: number;
  createdAt: string;
}

/* ----------------------------------------
 * Helpers: DTO → ViewModel map
 * --------------------------------------*/

const mapCategory = (category: Category | null): CategorySummary | null => {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
};

const mapProductDtoToCard = (p: ProductDto): ProductCardView => {
  return {
    id: p.id,
    brand: p.brand,
    model: p.model,
    slug: p.slug,
    description: p.description,
    releaseYear: p.release_year,
    coverImage: p.cover_image,
    category: mapCategory(p.category),
    productTags: p.product_tags,
    affiliateLinks: p.affiliate_links,
    reviewCount: p.review_count,
    averageRating: p.average_rating,
    specsCount: p.product_specs.length,
    affiliateLinksCount: p.affiliate_links.length,
    createdAt: p.created_at,
  };
};

/* ----------------------------------------
 * Admin Products Page
 * --------------------------------------*/

type ProductListQueryParams = QueryParams & {
  category?: number;
  search?: string;
};

export default function ProductsPage() {
  // Arama input + gerçek sorgu
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Kategori filtresi
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Sayfalama
  const [page, setPage] = useState(1);
  const limit = 12;

  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Query paramları
  const listParams: ProductListQueryParams = {
    page,
    page_size: limit,
    ...(searchTerm ? { search: searchTerm } : {}),
    ...(categoryFilter !== "all"
      ? { category: Number(categoryFilter) || undefined }
      : {}),
  };

  // Ürün listesi
  const {
    data: productsResult,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useListProductsQuery(listParams);

  // Kategoriler (filtre için)
  const {
    data: categoriesResult,
    isLoading: categoriesLoading,
  } = useListCategoriesQuery(undefined);

  const [deleteProductMutation] = useDeleteProductByIdMutation();

  // Ürün datasını normalize et
  let rawProducts: ProductDto[] = [];
  let total = 0;

  if (Array.isArray(productsResult)) {
    rawProducts = productsResult;
    total = productsResult.length;
  } else if (productsResult && "results" in productsResult) {
    const paginated = productsResult as PaginatedResult<ProductDto>;
    rawProducts = paginated.results;
    total = paginated.count;
  }

  const products: ProductCardView[] = rawProducts.map(mapProductDtoToCard);

  const totalPages =
    total > 0 && !Array.isArray(productsResult)
      ? Math.ceil(total / limit)
      : total > 0
      ? 1
      : 0;

  const busy = isLoading || isFetching;

  // Kategori listesini normalize et
  let categories: Category[] = [];
  if (Array.isArray(categoriesResult)) {
    categories = categoriesResult;
  } else if (categoriesResult && "results" in categoriesResult) {
    const paginated = categoriesResult as PaginatedResult<Category>;
    categories = paginated.results;
  }

  const globalError =
    error ||
    (queryError ? "Ürünler yüklenirken bir hata oluştu." : null);

  /* ---------- Handlers ---------- */

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleDeleteProduct = async (
    productId: number,
    productName: string,
  ) => {
    const confirmDelete = window.confirm(
      `"${productName}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
    );
    if (!confirmDelete) return;

    try {
      setError(null);
      setDeletingId(productId);

      await deleteProductMutation(productId).unwrap();

      toast.success("Ürün başarıyla silindi");
      await refetch();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting product:", err);
      setError("Ürün silinirken hata oluştu");
      toast.error("Ürün silinirken hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Render ---------- */

  if (busy && products.length === 0) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Ürün Yönetimi</h1>
              <p className="text-muted-foreground">
                Tüm ürünleri yönetin ve affiliate linklerini düzenleyin
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Ürün
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Ürünler yükleniyor...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ürün Yönetimi</h1>
            <p className="text-muted-foreground">
              Tüm ürünleri yönetin ve affiliate linklerini düzenleyin
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün
            </Link>
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <span>{globalError}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Marka, model veya kategori ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
                disabled={categoriesLoading}
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={busy}>
                {busy && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Ara
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products List */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {product.brand} {product.model}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {product.category && (
                        <Badge variant="outline">
                          {product.category.name}
                        </Badge>
                      )}
                      {product.releaseYear && (
                        <Badge variant="secondary">
                          {product.releaseYear}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {typeof product.averageRating === "number" && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">
                        {product.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Description */}
                  {product.description && (
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-2">Etiketler</h4>
                    {product.productTags && product.productTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.productTags.slice(0, 5).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {product.productTags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.productTags.length - 5}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Henüz etiket eklenmemiş
                      </p>
                    )}
                  </div>

                  {/* Affiliate Links */}
                  <div>
                    <h4 className="font-medium mb-2">Affiliate Linkler</h4>
                    {product.affiliateLinks.length > 0 ? (
                      <div className="space-y-2">
                        {product.affiliateLinks.map((link, index) => (
                          <div
                            key={link.id || `link-${index}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  link.active ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {link.merchant}
                              </Badge>
                              <LinkIcon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Henüz affiliate link eklenmemiş
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{product.reviewCount} inceleme</span>
                      <span>{product.specsCount} özellik</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(
                          product.createdAt,
                        ).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/admin/products/manage/${product.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() =>
                        handleDeleteProduct(
                          product.id,
                          `${product.brand} ${product.model}`,
                        )
                      }
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!busy && products.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ürün Bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== "all"
                  ? "Arama kriterlerinize uygun ürün bulunamadı."
                  : "Henüz hiç ürün eklenmemiş."}
              </p>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ürün Ekle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination (sadece backend gerçekten sayfalı dönerse) */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Toplam {total} üründen{" "}
                {total === 0
                  ? "0-0"
                  : `${(page - 1) * limit + 1}-${Math.min(
                      page * limit,
                      total,
                    )}`}{" "}
                arası gösteriliyor
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  Önceki
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    },
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
