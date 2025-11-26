// src/app/admin/articles/edit/[id]/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import RichEditor from "@/components/editor/rich-editor";
import { Save, Eye, ArrowLeft, Loader2 } from "lucide-react";

import {
  useGetArticleByIdQuery,
  useUpdateArticleByIdMutation,
} from "@/integrations/hardware/rtk/endpoints/articles.endpoints";
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";
import { useListTagsQuery } from "@/integrations/hardware/rtk/endpoints/tags.endpoints";
import type {
  ArticleDto,
  ArticleType,
  ArticleStatus,
} from "@/integrations/hardware/rtk/types/article.types";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  type: string;
}

const articleTypes: { value: ArticleType; label: string }[] = [
  { value: "REVIEW", label: "İnceleme" },
  { value: "BEST_LIST", label: "En İyi Listeler" },
  { value: "COMPARE", label: "Karşılaştırma" },
  { value: "GUIDE", label: "Rehber" },
  { value: "NEWS", label: "Haber" },
];

interface ReviewScores {
  performance: number;
  stability: number;
  coverage: number;
  software: number;
  value: number;
}

interface ArticleFormState {
  type: ArticleType;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  category: string; // select’ten gelen id (string)
  heroImage: string; // URL veya "REMOVE_IMAGE" sinyali
  metaTitle: string;
  metaDescription: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const idString = Array.isArray(rawId) ? rawId[0] : rawId;
  const articleId = Number(idString);

  // Kategoriler
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useListCategoriesQuery(undefined);

  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];
    const items = Array.isArray(categoriesData)
      ? categoriesData
      : (categoriesData as { results?: Category[] }).results ?? [];
    return items as Category[];
  }, [categoriesData]);

  // Etiketler
  const { data: tagsData, isLoading: tagsLoading } = useListTagsQuery(undefined);

  const tags: Tag[] = useMemo(() => {
    if (!tagsData) return [];
    const items = Array.isArray(tagsData)
      ? tagsData
      : (tagsData as { results?: Tag[] }).results ?? [];
    return items as Tag[];
  }, [tagsData]);

  // Makale
  const {
    data: article,
    isLoading: articleLoading,
  } = useGetArticleByIdQuery(articleId, {
    skip: Number.isNaN(articleId),
  });

  const [updateArticle, { isLoading: isSaving }] =
    useUpdateArticleByIdMutation();

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ArticleFormState>({
    type: "REVIEW",
    title: "",
    subtitle: "",
    excerpt: "",
    content: "",
    category: "",
    heroImage: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [reviewScores, setReviewScores] = useState<ReviewScores>({
    performance: 5,
    stability: 5,
    coverage: 5,
    software: 5,
    value: 5,
  });
  const [totalScore, setTotalScore] = useState(5);

  // Makale geldiğinde formu hydrate et
  useEffect(() => {
    if (!article) return;

    const a: ArticleDto = article;

    setFormData({
      type: a.type,
      title: a.title ?? "",
      subtitle: a.subtitle ?? "",
      excerpt: a.excerpt ?? "",
      content: a.content ?? "",
      category: a.category ? String(a.category.id) : "",
      heroImage: "", // var olan URL'i direkt geri göndermemek için boş tutuyoruz
      metaTitle: a.meta_title ?? "",
      metaDescription: a.meta_description ?? "",
    });

    if (a.hero_image) {
      setImagePreview(a.hero_image);
    }

    // Tag id’leri
    const tagIds = (a.article_tags ?? []).map((t) => t.id);
    setSelectedTags(tagIds);

    if (a.review_extra) {
      const re = a.review_extra;
      const scores: ReviewScores = {
        performance: re.performance_score ?? 5,
        stability: re.stability_score ?? 5,
        coverage: re.coverage_score ?? 5,
        software: re.software_score ?? 5,
        value: re.value_score ?? 5,
      };
      setReviewScores(scores);
      const avg =
        Object.values(scores).reduce((sum, v) => sum + v, 0) /
        Object.keys(scores).length;
      setTotalScore(re.total_score ?? avg);
    }
  }, [article]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setFormData((prev) => ({ ...prev, heroImage: "" })); // URL temizle
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      heroImage: "REMOVE_IMAGE", // özel sinyal
    }));
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleScoreChange = (scoreType: keyof ReviewScores, value: number) => {
    const newScores: ReviewScores = { ...reviewScores, [scoreType]: value };
    setReviewScores(newScores);

    const average =
      Object.values(newScores).reduce((sum, score) => sum + score, 0) /
      Object.keys(newScores).length;
    setTotalScore(Math.round(average * 10) / 10);
  };

  const handleSave = async (status: ArticleStatus) => {
    if (!formData.title.trim()) {
      toast.error("Başlık gereklidir");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("İçerik gereklidir");
      return;
    }

    if (!formData.category) {
      toast.error("Kategori seçilmelidir");
      return;
    }

    try {
      const fd = new FormData();

      fd.append("title", formData.title);
      if (formData.subtitle) fd.append("subtitle", formData.subtitle);
      if (formData.excerpt) fd.append("excerpt", formData.excerpt);
      fd.append("content", formData.content);
      fd.append("type", formData.type); // ArticleType (örn: "REVIEW")
      fd.append("category_id", formData.category);
      fd.append("status", status); // "DRAFT" | "PUBLISHED" | "ARCHIVED"

      if (formData.metaTitle) fd.append("meta_title", formData.metaTitle);
      if (formData.metaDescription) {
        fd.append("meta_description", formData.metaDescription);
      }

      // Tags: "1,2,3" string
      if (selectedTags.length > 0) {
        fd.append("tags", selectedTags.join(","));
      }

      // Kapak görseli
      if (imageFile) {
        fd.append("hero_image_file", imageFile);
      } else if (formData.heroImage === "REMOVE_IMAGE") {
        // resmi silmek için backend'e boş string
        fd.append("hero_image", "");
      } else if (formData.heroImage && formData.heroImage.trim() !== "") {
        fd.append("hero_image", formData.heroImage);
      }
      // aksi halde hero_image alanını göndermiyoruz → mevcut değer korunur

      // REVIEW ise review_extra_data JSON
      if (formData.type === "REVIEW") {
        const reviewExtraData = {
          criteria: {} as Record<string, unknown>,
          pros: [] as unknown[],
          cons: [] as unknown[],
          technical_spec: {} as Record<string, unknown>,
          performance_score: reviewScores.performance,
          stability_score: reviewScores.stability,
          coverage_score: reviewScores.coverage,
          software_score: reviewScores.software,
          value_score: reviewScores.value,
          total_score: totalScore,
          score_numeric: totalScore,
        };
        fd.append("review_extra_data", JSON.stringify(reviewExtraData));
      }

      await updateArticle({ id: articleId, data: fd }).unwrap();

      toast.success("Makale başarıyla güncellendi");
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error updating article:", error);
      toast.error("Makale güncellenirken bir hata oluştu");
    }
  };

  if (articleLoading || categoriesLoading || Number.isNaN(articleId)) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Makale yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold">Makale Düzenle</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Makale başlığı"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Alt Başlık</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Makale alt başlığı"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Makale özeti"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Makale Türü</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-white text-gray-900"
                  >
                    {articleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-white text-gray-900"
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İçerik */}
          <Card>
            <CardHeader>
              <CardTitle>İçerik</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="content">Makale İçeriği *</Label>
                <div className="mt-2">
                  <RichEditor
                    content={formData.content}
                    onChange={(content) =>
                      setFormData((prev) => ({ ...prev, content }))
                    }
                    placeholder="Makale içeriğinizi yazın..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İnceleme Puanları */}
          {formData.type === "REVIEW" && (
            <Card>
              <CardHeader>
                <CardTitle>İnceleme Puanları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="performance">
                      Performans: {reviewScores.performance}/10
                    </Label>
                    <Input
                      id="performance"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={reviewScores.performance}
                      onChange={(e) =>
                        handleScoreChange(
                          "performance",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="stability">
                      Kararlılık: {reviewScores.stability}/10
                    </Label>
                    <Input
                      id="stability"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={reviewScores.stability}
                      onChange={(e) =>
                        handleScoreChange(
                          "stability",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="coverage">
                      Kapsama: {reviewScores.coverage}/10
                    </Label>
                    <Input
                      id="coverage"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={reviewScores.coverage}
                      onChange={(e) =>
                        handleScoreChange(
                          "coverage",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="software">
                      Yazılım: {reviewScores.software}/10
                    </Label>
                    <Input
                      id="software"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={reviewScores.software}
                      onChange={(e) =>
                        handleScoreChange(
                          "software",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">
                      Değer: {reviewScores.value}/10
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={reviewScores.value}
                      onChange={(e) =>
                        handleScoreChange("value", parseFloat(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="totalScore">Toplam Puan</Label>
                  <Input
                    id="totalScore"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={totalScore}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etiketler */}
          <Card>
            <CardHeader>
              <CardTitle>Etiketler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mevcut Etiketlerden Seç</Label>
                <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {tagsLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Etiketler yükleniyor...
                    </p>
                  ) : tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Henüz etiket bulunmuyor
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
                {selectedTags.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTags.length} etiket seçildi
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO başlığı"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO açıklaması"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="heroImage">Kapak Resmi</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Eye className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="heroImage"
                      name="heroImage"
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
                        : formData.heroImage
                          ? "URL kullanılıyor"
                          : ""}
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

          {/* Kaydet Butonları */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={() => handleSave("DRAFT")}
                  disabled={isSaving}
                  className="w-full"
                  variant="outline"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Taslak Olarak Kaydet
                </Button>

                <Button
                  onClick={() => handleSave("PUBLISHED")}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Yayınla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
