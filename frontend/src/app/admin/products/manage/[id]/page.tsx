// src/app/admin/products/manage/[id]/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Loader2,
  Package,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetProductByIdQuery,
  useUpdateProductByIdMutation,
} from "@/integrations/hardware/rtk/endpoints/products.endpoints";
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";
import { useListTagsQuery } from "@/integrations/hardware/rtk/endpoints/tags.endpoints";

import type {
  ProductTag,
  ProductSpec as ApiProductSpec,
  AffiliateLink as ApiAffiliateLink,
} from "@/integrations/hardware/rtk/types/product.types";
import type { Category } from "@/integrations/hardware/rtk/types/category.types";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";

/* ------------ Local UI Types ------------ */

type ProductFormState = {
  brand: string;
  model: string;
  description: string;
  releaseYear: string;
  categoryId: string;
  coverImage: string; // URL veya "REMOVE_IMAGE" sinyali
  price: string;
};

type UiProductSpec = {
  id?: number;
  name: string;
  value: string;
  unit: string;
  isVisible: boolean;
  sortOrder: number;
};

type UiAffiliateLink = {
  id?: string;
  merchant: string;
  urlTemplate: string;
  active: boolean;
};

export default function ManageProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const productIdParam = params?.id;
  const productId = Number(productIdParam);

  const [formData, setFormData] = useState<ProductFormState>({
    brand: "",
    model: "",
    description: "",
    releaseYear: "",
    categoryId: "",
    coverImage: "",
    price: "",
  });

  const [productSpecs, setProductSpecs] = useState<UiProductSpec[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<UiAffiliateLink[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ------------ RTK Queries ------------ */

  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
  } = useGetProductByIdQuery(productId, {
    skip: Number.isNaN(productId),
  });

  const {
    data: categoriesResult,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useListCategoriesQuery(undefined);

  const {
    data: tagsResult,
    isLoading: tagsLoading,
    isError: tagsError,
  } = useListTagsQuery(undefined);

  const [updateProductById] = useUpdateProductByIdMutation();

  /* ------------ Flatten categories & tags ------------ */

  const categories: Category[] = Array.isArray(categoriesResult)
    ? categoriesResult
    : (categoriesResult as PaginatedResult<Category> | undefined)?.results ?? [];

  const tags: ProductTag[] = Array.isArray(tagsResult)
    ? (tagsResult as ProductTag[])
    : ((tagsResult as PaginatedResult<ProductTag> | undefined)?.results ??
      []);

  const loading =
    productLoading || Number.isNaN(productId) || (!product && !productError);

  /* ------------ Sync product -> local form state ------------ */

  useEffect(() => {
    if (!product) return;

    setErrorMsg(null);

    setFormData({
      brand: product.brand ?? "",
      model: product.model ?? "",
      description: product.description ?? "",
      releaseYear: product.release_year ? String(product.release_year) : "",
      categoryId: product.category ? String(product.category.id) : "",
      coverImage: "",
      price:
        product.price !== null && product.price !== undefined
          ? String(product.price)
          : "",
    });

    setImagePreview(product.cover_image ?? "");
    setImageFile(null);

    const specsSource: ApiProductSpec[] = product.product_specs ?? [];

    setProductSpecs(
      specsSource.length > 0
        ? specsSource.map((spec, index) => ({
            id: spec.id,
            name: spec.name ?? "",
            value: spec.value ?? "",
            unit: spec.unit ?? "",
            isVisible: spec.is_visible !== false,
            sortOrder: spec.sort_order ?? index,
          }))
        : [],
    );

    const linksSource: ApiAffiliateLink[] = product.affiliate_links ?? [];
    setAffiliateLinks(
      linksSource.map((link) => ({
        id: link.id,
        merchant: link.merchant ?? "",
        urlTemplate: link.url_template ?? "",
        active: link.active !== false,
      })),
    );

    setSelectedTags((product.product_tags ?? []).map((tag) => tag.id));
  }, [product]);

  /* ------------ Handlers ------------ */

  const handleInputChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview((ev.target?.result as string) ?? "");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      coverImage: "REMOVE_IMAGE",
    }));
  };

  const addProductSpec = () => {
    setProductSpecs((prev) => [
      ...prev,
      {
        name: "",
        value: "",
        unit: "",
        isVisible: true,
        sortOrder: prev.length,
      },
    ]);
  };

  const updateProductSpec = <K extends keyof UiProductSpec>(
    index: number,
    field: K,
    value: UiProductSpec[K],
  ) => {
    setProductSpecs((prev) =>
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

  const removeProductSpec = (index: number) => {
    setProductSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const addAffiliateLink = () => {
    setAffiliateLinks((prev) => [
      ...prev,
      {
        merchant: "",
        urlTemplate: "",
        active: true,
      },
    ]);
  };

  const updateAffiliateLink = <K extends keyof UiAffiliateLink>(
    index: number,
    field: K,
    value: UiAffiliateLink[K],
  ) => {
    setAffiliateLinks((prev) =>
      prev.map((link, i) =>
        i === index
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    );
  };

  const removeAffiliateLink = (index: number) => {
    setAffiliateLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!product) return;

    if (!formData.brand || !formData.model || !formData.categoryId) {
      toast.error("Marka, model ve kategori alanları zorunludur");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("model", formData.model);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.categoryId);

      if (formData.price) {
        formDataToSend.append("price", formData.price);
      }
      if (formData.releaseYear) {
        formDataToSend.append("release_year", formData.releaseYear);
      }

      if (imageFile) {
        formDataToSend.append("cover_image_file", imageFile);
      } else if (formData.coverImage === "REMOVE_IMAGE") {
        formDataToSend.append("cover_image", "");
      } else if (formData.coverImage.trim()) {
        formDataToSend.append("cover_image", formData.coverImage.trim());
      }

      selectedTags.forEach((tagId) => {
        formDataToSend.append("tags", String(tagId));
      });

      const validSpecs = productSpecs.filter(
        (spec) => spec.name && spec.value,
      );
      validSpecs.forEach((spec, index) => {
        formDataToSend.append(`specs[${index}][name]`, spec.name);
        formDataToSend.append(`specs[${index}][value]`, spec.value);
        if (spec.unit) {
          formDataToSend.append(`specs[${index}][unit]`, spec.unit);
        }
        formDataToSend.append(
          `specs[${index}][is_visible]`,
          spec.isVisible ? "true" : "false",
        );
        formDataToSend.append(
          `specs[${index}][sort_order]`,
          String(index),
        );
      });

      const validLinks = affiliateLinks.filter(
        (link) => link.merchant && link.urlTemplate,
      );
      validLinks.forEach((link, index) => {
        formDataToSend.append(
          `affiliate_links_data[${index}][merchant]`,
          link.merchant,
        );
        formDataToSend.append(
          `affiliate_links_data[${index}][url_template]`,
          link.urlTemplate,
        );
        formDataToSend.append(
          `affiliate_links_data[${index}][active]`,
          link.active ? "true" : "false",
        );
      });

      await updateProductById({
        id: product.id,
        data: formDataToSend,
      }).unwrap();

      toast.success("Ürün başarıyla güncellendi");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error updating product:", err);
      setErrorMsg("Ürün güncellenirken bir hata oluştu");
      toast.error("Ürün güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  /* ------------ Render ------------ */

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Ürün yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {errorMsg || "Ürün bulunamadı"}
          </p>
          <Button onClick={() => router.push("/admin/products/manage")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ürünler Listesine Dön
          </Button>
        </div>
      </div>
    );
  }

  const specsCount = product.product_specs?.length ?? 0;
  const affiliateLinksCount = product.affiliate_links?.length ?? 0;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/products/manage")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ürün Düzenle</h1>
            <p className="text-muted-foreground">
              {product.brand} {product.model}
            </p>
          </div>
        </div>

        {(errorMsg || categoriesError || tagsError) && (
          <div className="mt-2 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg ||
              "Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marka</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Örn: ASUS"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Örn: RTX 4090"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ürün açıklaması..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Fiyat (₺)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="releaseYear">Çıkış Yılı</Label>
                  <Input
                    id="releaseYear"
                    name="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={handleInputChange}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId">Kategori</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    disabled={categoriesLoading}
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>Etiketler</Label>
                <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {tagsLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Etiketler yükleniyor...
                    </p>
                  ) : tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Henüz etiket tanımlanmamış.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagToggle(tag.id)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted"
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="coverImage">Ürün Görseli</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="coverImage"
                      name="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG veya GIF formatında, maksimum 5MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {imageFile
                        ? `Seçilen dosya: ${imageFile.name}`
                        : "Dosya seçilmedi"}
                    </p>
                    {(imageFile || imagePreview) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Kaldır
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ürün Özellikleri</CardTitle>
                <Button
                  type="button"
                  onClick={addProductSpec}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Özellik Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {productSpecs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Henüz özellik eklenmemiş. Özellik ekleyerek başlayın.
                </p>
              )}
              {productSpecs.map((spec, index) => (
                <div
                  key={spec.id ?? index}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  <div className="col-span-3">
                    <Label>Özellik Adı</Label>
                    <Input
                      value={spec.name}
                      onChange={(e) =>
                        updateProductSpec(index, "name", e.target.value)
                      }
                      placeholder="Örn: VRAM"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Değer</Label>
                    <Input
                      value={spec.value}
                      onChange={(e) =>
                        updateProductSpec(index, "value", e.target.value)
                      }
                      placeholder="16"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Birim</Label>
                    <Input
                      value={spec.unit}
                      onChange={(e) =>
                        updateProductSpec(index, "unit", e.target.value)
                      }
                      placeholder="GB"
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={spec.isVisible}
                      onChange={(e) =>
                        updateProductSpec(index, "isVisible", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <Label className="text-sm">Görünür</Label>
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProductSpec(index)}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Affiliate Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Affiliate Linkler</CardTitle>
                <Button
                  type="button"
                  onClick={addAffiliateLink}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Link Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {affiliateLinks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Henüz affiliate link eklenmemiş.
                </p>
              )}
              {affiliateLinks.map((link, index) => (
                <div
                  key={link.id ?? index}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  <div className="col-span-3">
                    <Label>Satıcı</Label>
                    <Input
                      value={link.merchant}
                      onChange={(e) =>
                        updateAffiliateLink(
                          index,
                          "merchant",
                          e.target.value,
                        )
                      }
                      placeholder="Örn: Trendyol"
                    />
                  </div>
                  <div className="col-span-6">
                    <Label>URL Template</Label>
                    <Input
                      value={link.urlTemplate}
                      onChange={(e) =>
                        updateAffiliateLink(
                          index,
                          "urlTemplate",
                          e.target.value,
                        )
                      }
                      placeholder="https://trendyol.com/product-url"
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={link.active}
                      onChange={(e) =>
                        updateAffiliateLink(index, "active", e.target.checked)
                      }
                      className="mr-2"
                    />
                    <Label className="text-sm">Aktif</Label>
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAffiliateLink(index)}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Değişiklikleri Kaydet
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ürün Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">ID: {product.id}</span>
              </div>

              {product.category && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Kategori
                  </Label>
                  <div className="mt-1">
                    <Badge variant="outline">{product.category.name}</Badge>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">
                    Özellikler
                  </Label>
                  <p className="font-medium">{specsCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Affiliate Linkler
                  </Label>
                  <p className="font-medium">{affiliateLinksCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Oluşturulma:{" "}
                  {product.created_at
                    ? new Date(product.created_at).toLocaleDateString("tr-TR")
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
