// src/app/admin/products/manage/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

import { useListProductsQuery, useDeleteProductByIdMutation } from "@/integrations/hardware/rtk/endpoints/products.endpoints";
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";

import type { QueryParams } from "@/lib/api-config";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";
import type { ProductDto } from "@/integrations/hardware/rtk/types/product.types";
import type { Category } from "@/integrations/hardware/rtk/types/category.types";

export default function AdminProductsManagePage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const pageSize = 20;

  /* -------------------- Kategoriler -------------------- */

  const {
    data: categoriesResult,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useListCategoriesQuery(undefined);

  let categories: Category[] = [];
  if (Array.isArray(categoriesResult)) {
    categories = categoriesResult;
  } else if (categoriesResult && "results" in categoriesResult) {
    categories = (categoriesResult as PaginatedResult<Category>).results;
  }

  /* -------------------- Ürün Listesi -------------------- */

  const productQueryParams: QueryParams = {
    page,
    limit: pageSize,
    search: searchTerm.trim() || undefined,
    // Backend tarafında kategori filtresi slug ile çalışıyor varsayımı:
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  };

  const {
    data: productsResult,
    isLoading: productsInitialLoading,
    isFetching: productsFetching,
  } = useListProductsQuery(productQueryParams);

  let products: ProductDto[] = [];
  let totalPages = 1;

  if (Array.isArray(productsResult)) {
    products = productsResult;
    totalPages = 1;
  } else if (productsResult) {
    const paged = productsResult as PaginatedResult<ProductDto>;
    products = paged.results;
    const count = paged.count ?? paged.results.length;
    totalPages = count && pageSize ? Math.max(1, Math.ceil(count / pageSize)) : 1;
  }

  const loading = productsInitialLoading || productsFetching;
  const hasGlobalError = categoriesError;

  /* -------------------- Delete Mutation -------------------- */

  const [deleteProductById] = useDeleteProductByIdMutation();

  const handleDelete = async (product: ProductDto) => {
    if (!confirm(`"${product.brand} ${product.model}" ürününü silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      setDeletingId(product.id);
      await deleteProductById(product.id).unwrap();
      toast.success("Ürün başarıyla silindi");
      // RTK Query cache invalidation ile liste otomatik güncellenecek
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting product:", err);
      toast.error("Ürün silinirken bir hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  /* -------------------- Render -------------------- */

  if (loading && !productsResult) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Ürünler yükleniyor...</p>
          </div>
        </div>
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
              Ürünleri yönetin, düzenleyin ve silin
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün
            </Link>
          </Button>
        </div>

        {hasGlobalError && (
          <div className="mt-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            Kategori bilgileri yüklenirken bir hata oluştu.
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ürünlerde ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setPage(1);
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setPage(1);
                  setCategoryFilter(e.target.value);
                }}
                className="px-3 py-2 border rounded-md bg-background"
                disabled={categoriesLoading}
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const reviewCount = product.review_count;
            const specsCount = product.product_specs.length;
            const affiliateLinksCount = product.affiliate_links.length;

            return (
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
                      {product.category && (
                        <Badge variant="secondary" className="mt-1">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" asChild>
                        {/* Public ürün detay sayfanın route'u slug tabanlıysa onu kullan */}
                        <Link href={`/products/by-slug/${product.slug}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/products/manage/${product.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deletingId === product.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{reviewCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Yorum
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{specsCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Özellik
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {affiliateLinksCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Link
                      </div>
                    </div>
                  </div>

                  {product.price !== null && product.price !== undefined && (
                    <div className="mt-4 text-center">
                      <span className="text-lg font-bold text-primary">
                        {product.price.toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-muted-foreground">
                    Oluşturulma:{" "}
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString("tr-TR")
                      : "-"}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Eğer hiç ürün yoksa */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Ürün Bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Arama kriterlerinize uygun ürün bulunamadı.
          </p>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              İlk Ürünü Ekle
            </Link>
          </Button>
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
