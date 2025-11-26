// src/app/admin/products/edit/[id]/page.tsx

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Save, ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  useGetProductByIdQuery,
  useUpdateProductByIdMutation,
} from "@/integrations/hardware/rtk/endpoints/products.endpoints";
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";

import type { ProductDto } from "@/integrations/hardware/rtk/types/product.types";
import type { Category } from "@/integrations/hardware/rtk/types/category.types";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";

// UI tarafında kullandığımız basit spec tipi
interface ProductSpecForm {
  id?: number;
  name: string;
  value: string;
}

type FormState = {
  brand: string;
  model: string;
  description: string;
  categoryId: string;
  price: string;
  releaseYear: string;
  imageUrl: string;
};

export default function AdminProductsEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const productId = Number(params?.id ?? NaN);

  const [formData, setFormData] = useState<FormState>({
    brand: "",
    model: "",
    description: "",
    categoryId: "",
    price: "",
    releaseYear: "",
    imageUrl: "",
  });

  const [specs, setSpecs] = useState<ProductSpecForm[]>([
    { name: "", value: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ---- RTK Query: Product ----
  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
  } = useGetProductByIdQuery(productId, {
    skip: Number.isNaN(productId),
  });

  // ---- RTK Query: Categories ----
  const {
    data: categoriesResult,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useListCategoriesQuery(undefined);

  const [updateProductById] = useUpdateProductByIdMutation();

  // categoriesResult hem dizi hem PaginatedResult olabildiği için flatten
  const categories: Category[] = Array.isArray(categoriesResult)
    ? categoriesResult
    : ((categoriesResult as PaginatedResult<Category> | undefined)?.results ??
      []);

  // Backend’ten gelen ProductDto’yu forma hydrate et
  useEffect(() => {
    if (!product || initialized) return;

    hydrateFormFromProduct(product);
    setInitialized(true);
  }, [product, initialized]);

  const hydrateFormFromProduct = (p: ProductDto) => {
    setFormData({
      brand: p.brand ?? "",
      model: p.model ?? "",
      description: p.description ?? "",
      categoryId: p.category ? String(p.category.id) : "",
      price:
        p.price !== null && p.price !== undefined ? String(p.price) : "",
      releaseYear:
        p.release_year !== null && p.release_year !== undefined
          ? String(p.release_year)
          : "",
      imageUrl: p.cover_image ?? "",
    });

    if (Array.isArray(p.product_specs) && p.product_specs.length > 0) {
      setSpecs(
        p.product_specs.map((spec) => ({
          id: spec.id,
          name: spec.name ?? "",
          value: spec.value ?? "",
        })),
      );
    } else {
      setSpecs([{ name: "", value: "" }]);
    }
  };

  const addSpec = () => {
    setSpecs((prev) => [...prev, { name: "", value: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const updateSpec = (
    index: number,
    field: keyof ProductSpecForm,
    value: string,
  ) => {
    setSpecs((prev) =>
      prev.map((spec, i) =>
        i === index
          ? {
              ...spec,
              [field]: value,
            }
          : spec,
      ),
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.brand || !formData.model || !formData.categoryId) {
      toast.error("Marka, model ve kategori alanları zorunludur");
      return;
    }

    if (!product) {
      toast.error("Ürün bilgisi yüklenemedi");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("brand", formData.brand);
      fd.append("model", formData.model);
      fd.append("description", formData.description);
      fd.append("category_id", formData.categoryId);

      if (formData.price) {
        fd.append("price", formData.price);
      }
      if (formData.releaseYear) {
        fd.append("release_year", formData.releaseYear);
      }
      if (formData.imageUrl) {
        fd.append("cover_image", formData.imageUrl);
      }

      const validSpecs = specs.filter((s) => s.name && s.value);
      validSpecs.forEach((spec, index) => {
        fd.append(`specs[${index}][name]`, spec.name);
        fd.append(`specs[${index}][value]`, spec.value);
        fd.append(`specs[${index}][sort_order]`, String(index));
      });

      await updateProductById({
        id: product.id,
        data: fd,
      }).unwrap();

      toast.success("Ürün başarıyla güncellendi");
      router.push("/admin/products/manage");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Ürün güncellenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (Number.isNaN(productId)) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Geçersiz ürün ID parametresi.
          </p>
          <Button asChild>
            <Link href="/admin/products/manage">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ürün listesine dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (productLoading || categoriesLoading || !initialized) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Ürün yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Ürün yüklenirken bir hata oluştu veya ürün bulunamadı.
          </p>
          <Button asChild>
            <Link href="/admin/products/manage">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ürün listesine dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Kategoriler yüklenirken bir hata oluştu.
          </p>
          <Button asChild>
            <Link href="/admin/products/manage">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ürün listesine dön
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products/manage">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ürün Düzenle</h1>
            <p className="text-muted-foreground">
              Ürün bilgilerini güncelleyin
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marka *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    placeholder="Örn: ASUS"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    placeholder="Örn: RT-AX88U Pro"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={String(category.id)}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Ürün hakkında kısa açıklama..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Fiyat (₺)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="releaseYear">Çıkış Yılı</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        releaseYear: e.target.value,
                      }))
                    }
                    placeholder="2024"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Görsel URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ürün Özellikleri */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ürün Özellikleri</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpec}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Özellik Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={spec.name}
                      onChange={(e) =>
                        updateSpec(index, "name", e.target.value)
                      }
                      placeholder="Özellik adı (örn: RAM)"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={spec.value}
                      onChange={(e) =>
                        updateSpec(index, "value", e.target.value)
                      }
                      placeholder="Özellik değeri (örn: 16GB)"
                    />
                  </div>
                  {specs.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpec(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products/manage">İptal</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
