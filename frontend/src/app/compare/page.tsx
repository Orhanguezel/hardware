// src/app/compare/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Scale,
  Search,
  Plus,
  X,
  Star,
  Calendar,
  Zap,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";
import type { ProductDto } from "@/integrations/hardware/rtk/types/product.types";
import type { Category as CategoryDto } from "@/integrations/hardware/rtk/types/category.types";
import { useListProductsQuery } from "@/integrations/hardware/rtk/endpoints/products.endpoints";
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";

/* ---------- Helpers ---------- */

function normalizePaginated<T>(
  data?: PaginatedResult<T> | T[]
): { items: T[]; count: number } {
  if (!data) return { items: [], count: 0 };

  if (Array.isArray(data)) {
    return { items: data, count: data.length };
  }

  const results = Array.isArray(data.results) ? data.results : [];
  const count =
    typeof data.count === "number" ? data.count : results.length;

  return { items: results, count };
}

type Product = ProductDto;
type Category = CategoryDto;

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName?.toLowerCase()) {
    case "ekran kartı":
    case "gpu":
      return <Monitor className="w-4 h-4" />;
    case "işlemci":
    case "cpu":
      return <Cpu className="w-4 h-4" />;
    case "ram":
      return <Zap className="w-4 h-4" />;
    case "depolama":
      return <HardDrive className="w-4 h-4" />;
    case "router":
    case "modem":
      return <Wifi className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

export default function ComparePage() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDifferences, setShowDifferences] = useState(false);

  // URL'den ?add=ID parametresi için
  const [addProductId, setAddProductId] = useState<number | null>(null);

  // Kategori filtreleri (string ids)
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // ---------- RTK: Products ----------
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useListProductsQuery({ limit: 1000 });

  const {
    items: allProducts,
  } = normalizePaginated<Product>(
    productsData as PaginatedResult<Product> | Product[] | undefined
  );

  // ---------- RTK: Categories ----------
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useListCategoriesQuery();

  const {
    items: categories,
  } = normalizePaginated<Category>(
    categoriesData as PaginatedResult<Category> | Category[] | undefined
  );

  const loading = productsLoading || categoriesLoading;

  const getMainCategories = () =>
    categories.filter((cat) => !cat.parent);

  const getSubCategories = (mainCategoryId: string) => {
    const idNum = parseInt(mainCategoryId, 10);
    if (Number.isNaN(idNum)) return [];
    return categories.filter((cat) => cat.parent === idNum);
  };

  // ---------- URL'den ?add=ID yakala ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const addParam = urlParams.get("add");
    if (addParam) {
      const id = parseInt(addParam, 10);
      if (!Number.isNaN(id)) {
        setAddProductId(id);
      }

      // URL'den parametreyi temizle
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // ---------- URL'den gelen ürün ID'sini liste yüklendikten sonra ekle ----------
  useEffect(() => {
    if (!addProductId || allProducts.length === 0) return;

    const product = allProducts.find((p) => p.id === addProductId);
    if (!product) return;

    // Var olan addToComparison mantığını burada uygula (state-safe)
    setSelectedProducts((prev) => {
      if (prev.length >= 4) {
        toast.error("Maksimum 4 ürün karşılaştırabilirsiniz");
        return prev;
      }

      if (prev.find((p) => p.id === product.id)) {
        toast.error("Bu ürün zaten karşılaştırmada");
        return prev;
      }

      if (prev.length === 0) {
        setSelectedCategory(product.category?.id?.toString() || "");
        toast.success(
          `${product.brand} ${product.model} karşılaştırmaya eklendi`
        );
        return [...prev, product];
      }

      const firstProductCategory = prev[0].category?.id;
      const currentProductCategory = product.category?.id;

      if (firstProductCategory !== currentProductCategory) {
        toast.error(
          "Sadece aynı kategorideki ürünleri karşılaştırabilirsiniz"
        );
        return prev;
      }

      toast.success(
        `${product.brand} ${product.model} karşılaştırmaya eklendi`
      );
      return [...prev, product];
    });

    setAddProductId(null);
  }, [addProductId, allProducts]);

  // ---------- Karşılaştırma işlemleri ----------

  const addToComparison = (product: Product) => {
    setSelectedProducts((prev) => {
      if (prev.length >= 4) {
        toast.error("Maksimum 4 ürün karşılaştırabilirsiniz");
        return prev;
      }

      if (prev.find((p) => p.id === product.id)) {
        toast.error("Bu ürün zaten karşılaştırmada");
        return prev;
      }

      if (prev.length === 0) {
        setSelectedCategory(product.category?.id?.toString() || "");
        toast.success(
          `${product.brand} ${product.model} karşılaştırmaya eklendi`
        );
        return [...prev, product];
      }

      const firstProductCategory = prev[0].category?.id;
      const currentProductCategory = product.category?.id;

      if (firstProductCategory !== currentProductCategory) {
        toast.error(
          "Sadece aynı kategorideki ürünleri karşılaştırabilirsiniz"
        );
        return prev;
      }

      toast.success(
        `${product.brand} ${product.model} karşılaştırmaya eklendi`
      );
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setSelectedProducts([]);
    setShowDifferences(false);
  };

  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory("all");
  };

  const handleSubCategoryChange = (categoryId: string) => {
    setSelectedSubCategory(categoryId);
  };

  const getAverageRating = (product: Product) => {
    const reviews =
      ((product as any).user_reviews as Array<{ rating: number }> | undefined) ??
      [];
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    return (
      reviews.reduce((sum, review) => sum + review.rating, 0) /
      reviews.length
    );
  };

  const getAllSpecs = () => {
    const allSpecNames = new Set<string>();
    selectedProducts.forEach((product: any) => {
      if (product.product_specs) {
        product.product_specs.forEach((spec: any) => {
          allSpecNames.add(spec.name);
        });
      }
    });
    return Array.from(allSpecNames).sort();
  };

  const getProductSpecValue = (product: any, specName: string) => {
    if (!product.product_specs) return "-";
    const spec = product.product_specs.find(
      (s: any) => s.name === specName
    );
    return spec
      ? `${spec.value}${spec.unit ? ` ${spec.unit}` : ""}`
      : "-";
  };

  const isDifferentValue = (specName: string) => {
    if (selectedProducts.length < 2) return false;

    const values = selectedProducts.map((product) =>
      getProductSpecValue(product, specName)
    );
    return new Set(values).size > 1;
  };

  const productMatchesCategory = (product: Product) => {
    if (selectedMainCategory === "all") {
      return true;
    }

    const mainIdNum = parseInt(selectedMainCategory, 10);
    if (!product.category) return false;

    // Alt kategori seçiliyse sadece o kategoriyi al
    if (selectedSubCategory !== "all") {
      const subIdNum = parseInt(selectedSubCategory, 10);
      return product.category.id === subIdNum;
    }

    // Ana kategori seçili, alt kategori "all"
    // -> ana kategori + bütün alt kategoriler
    const subCategories = getSubCategories(selectedMainCategory);
    const subIds = subCategories.map((c) => c.id);
    const validIds = [mainIdNum, ...subIds];

    return validIds.includes(product.category.id);
  };

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.brand
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.model
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.category?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory = productMatchesCategory(product);

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (productsError || categoriesError) {
    return (
      <div className="container py-8 text-center">
        <p className="text-red-600">
          Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar
          deneyin.
        </p>
      </div>
    );
  }

  const totalSelected = selectedProducts.length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Ürün Karşılaştırma</h1>
        <p className="text-muted-foreground">
          Ürünleri karşılaştırın ve farkları görün
        </p>
      </div>

      {/* Ürün Arama ve Seçim */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ürün Ara ve Karşılaştırmaya Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Arama + filtreler */}
            <div className="flex flex-col gap-4 lg:flex-row">
              <Input
                placeholder="Marka, model veya kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* Ana Kategori */}
                <Select
                  value={selectedMainCategory}
                  onValueChange={handleMainCategoryChange}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Ana Kategori Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      Tüm Ana Kategoriler
                    </SelectItem>
                    {getMainCategories().map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Alt Kategori */}
                {selectedMainCategory !== "all" && (
                  <Select
                    value={selectedSubCategory}
                    onValueChange={handleSubCategoryChange}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Alt Kategori Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Tüm Alt Kategoriler
                      </SelectItem>
                      {getSubCategories(selectedMainCategory).map(
                        (category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Filtre temizleme & etiket */}
            {(selectedMainCategory !== "all" ||
              selectedSubCategory !== "all") && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMainCategory("all");
                    setSelectedSubCategory("all");
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Filtreleri Temizle
                </Button>
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedMainCategory !== "all" &&
                    (() => {
                      const idNum = parseInt(
                        selectedMainCategory,
                        10
                      );
                      const main = getMainCategories().find(
                        (c) => c.id === idNum
                      );
                      return main?.name || "";
                    })()}
                  {selectedSubCategory !== "all" &&
                    (() => {
                      const subIdNum = parseInt(
                        selectedSubCategory,
                        10
                      );
                      const sub = getSubCategories(
                        selectedMainCategory
                      ).find((c) => c.id === subIdNum);
                      return sub ? ` > ${sub.name}` : "";
                    })()}
                </Badge>
              </div>
            )}

            {/* Ürün listesi */}
            {filteredProducts.length > 0 ? (
              <div className="grid max-h-96 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-shrink-0">
                      {(product as any).cover_image ? (
                        <img
                          src={(product as any).cover_image}
                          alt={`${product.brand} ${product.model}`}
                          className="h-12 w-12 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                          {getCategoryIcon(
                            product.category?.name || ""
                          )}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">
                        {product.brand} {product.model}
                      </h3>
                      {product.category && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToComparison(product)}
                      disabled={
                        selectedProducts.find(
                          (p) => p.id === product.id
                        ) !== undefined
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Bu kategoride ürün bulunamadı.</p>
                <p className="text-sm">
                  Farklı bir kategori seçmeyi deneyin.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Karşılaştırma kontrolleri */}
      {totalSelected > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Karşılaştırma ({totalSelected}/4)
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-differences"
                    checked={showDifferences}
                    onCheckedChange={(checked) =>
                      setShowDifferences(!!checked)
                    }
                  />
                  <Label htmlFor="show-differences">
                    Sadece farkları göster
                  </Label>
                </div>
                <Button variant="outline" onClick={clearComparison}>
                  <X className="mr-2 h-4 w-4" />
                  Temizle
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Karşılaştırma tablosu */}
      {totalSelected > 0 && (
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">
                      Özellik
                    </th>
                    {selectedProducts.map((product) => (
                      <th
                        key={product.id}
                        className="min-w-48 p-4 text-center"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-center">
                            {(product as any).cover_image ? (
                              <img
                                src={(product as any).cover_image}
                                alt={`${product.brand} ${product.model}`}
                                className="h-16 w-16 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                                {getCategoryIcon(
                                  product.category?.name || ""
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">
                              {product.brand}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {product.model}
                            </p>
                            {product.category && (
                              <Badge
                                variant="secondary"
                                className="mt-1 text-xs"
                              >
                                {product.category.name}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeFromComparison(product.id)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Temel bilgiler */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Marka</td>
                    {selectedProducts.map((product) => (
                      <td
                        key={product.id}
                        className="p-4 text-center"
                      >
                        {product.brand}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Model</td>
                    {selectedProducts.map((product) => (
                      <td
                        key={product.id}
                        className="p-4 text-center"
                      >
                        {product.model}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Kategori</td>
                    {selectedProducts.map((product) => (
                      <td
                        key={product.id}
                        className="p-4 text-center"
                      >
                        {product.category?.name || "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Çıkış Yılı</td>
                    {selectedProducts.map((product: any) => (
                      <td
                        key={product.id}
                        className="p-4 text-center"
                      >
                        {product.release_year || "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Ortalama Puan</td>
                    {selectedProducts.map((product) => {
                      const avgRating = getAverageRating(product);
                      const reviewCount =
                        ((product as any).review_count as
                          | number
                          | undefined) ?? 0;

                      return (
                        <td
                          key={product.id}
                          className="p-4 text-center"
                        >
                          {avgRating > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">
                                {avgRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({reviewCount})
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              -
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Teknik Özellikler */}
                  {getAllSpecs().map((specName) => {
                    const different = isDifferentValue(specName);
                    const shouldShow =
                      !showDifferences || different;

                    if (!shouldShow) return null;

                    return (
                      <tr
                        key={specName}
                        className={`border-b ${
                          different && showDifferences
                            ? "bg-yellow-50 dark:bg-yellow-900/20"
                            : ""
                        }`}
                      >
                        <td
                          className={`p-4 font-medium ${
                            different && showDifferences
                              ? "font-bold"
                              : ""
                          }`}
                        >
                          {specName}
                        </td>
                        {selectedProducts.map((product) => (
                          <td
                            key={product.id}
                            className={`p-4 text-center ${
                              different && showDifferences
                                ? "font-bold"
                                : ""
                            }`}
                          >
                            {getProductSpecValue(product, specName)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
