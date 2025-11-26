// src/app/admin/articles/new/page.tsx

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import RichEditor from "@/components/editor/rich-editor";
import { Save, Eye, ArrowLeft, Plus, X, Loader2 } from "lucide-react";

import { useCreateArticleMutation } from "@/integrations/hardware/rtk/endpoints/articles.endpoints";
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";
import { useListTagsQuery } from "@/integrations/hardware/rtk/endpoints/tags.endpoints";
import type {
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

/** BEST LIST tipleri */
interface BestListItemDraft {
  title: string;
  description: string;
  image: string;
  imageFile: File | null;
  imagePreview: string | null;
  pros: string[];
  cons: string[];
  price: string;
  rating: number;
  link: string;
}

interface BestListItem extends BestListItemDraft {
  id: string;
}

interface ArticleFormState {
  type: ArticleType;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  category: string; // select’ten gelen string id
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
}

export default function NewArticlePage() {
  const router = useRouter();

  // RTK Query – kategoriler & etiketler
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useListCategoriesQuery(undefined);

  const {
    data: tagsData,
    isLoading: tagsLoading,
  } = useListTagsQuery(undefined);

  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];
    const items = Array.isArray(categoriesData)
      ? categoriesData
      : (categoriesData as { results?: Category[] }).results ?? [];
    return items as Category[];
  }, [categoriesData]);

  const tags: Tag[] = useMemo(() => {
    if (!tagsData) return [];
    const items = Array.isArray(tagsData)
      ? tagsData
      : (tagsData as { results?: Tag[] }).results ?? [];
    return items as Tag[];
  }, [tagsData]);

  const [createArticle, { isLoading: isSaving }] = useCreateArticleMutation();

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

  // Best list specific state
  const [bestListItems, setBestListItems] = useState<BestListItem[]>([]);
  const [newBestListItem, setNewBestListItem] = useState<BestListItemDraft>({
    title: "",
    description: "",
    image: "",
    imageFile: null,
    imagePreview: null,
    pros: [],
    cons: [],
    price: "",
    rating: 5,
    link: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
      heroImage: "",
    }));
  };

  const handleBestListItemImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBestListItem((prev) => ({
        ...prev,
        imageFile: file,
        image: "",
      }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewBestListItem((prev) => ({
          ...prev,
          imagePreview: ev.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBestListItemImage = () => {
    setNewBestListItem((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      image: "",
    }));
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleScoreChange = (newScores: ReviewScores) => {
    setReviewScores(newScores);

    const scores = Object.values(newScores);
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    setTotalScore(average);
  };

  // Best list functions
  const addBestListItem = () => {
    if (newBestListItem.title.trim()) {
      const item: BestListItem = {
        id: Date.now().toString(),
        ...newBestListItem,
      };
      setBestListItems((prev) => [...prev, item]);
      setNewBestListItem({
        title: "",
        description: "",
        image: "",
        imageFile: null,
        imagePreview: null,
        pros: [],
        cons: [],
        price: "",
        rating: 5,
        link: "",
      });
    }
  };

  const removeBestListItem = (id: string) => {
    setBestListItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addPro = (pro: string) => {
    if (pro.trim()) {
      setNewBestListItem((prev) => ({
        ...prev,
        pros: [...prev.pros, pro],
      }));
    }
  };

  const removePro = (index: number) => {
    setNewBestListItem((prev) => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index),
    }));
  };

  const addCon = (con: string) => {
    if (con.trim()) {
      setNewBestListItem((prev) => ({
        ...prev,
        cons: [...prev.cons, con],
      }));
    }
  };

  const removeCon = (index: number) => {
    setNewBestListItem((prev) => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index),
    }));
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
      toast.error("Kategori seçmelisiniz");
      return;
    }

    try {
      const fd = new FormData();

      // ArticleSerializer alan isimleriyle birebir
      fd.append("title", formData.title);
      if (formData.subtitle) fd.append("subtitle", formData.subtitle);
      if (formData.excerpt) fd.append("excerpt", formData.excerpt);
      fd.append("content", formData.content);
      fd.append("type", formData.type);
      fd.append("category_id", formData.category);
      fd.append("status", status); // "DRAFT" | "PUBLISHED" | "ARCHIVED"
      if (formData.metaTitle) fd.append("meta_title", formData.metaTitle);
      if (formData.metaDescription) {
        fd.append("meta_description", formData.metaDescription);
      }

      // 🔹 Tags: JSON array string olarak gönder → backend parse_tags ile çözüyor
      if (selectedTags.length > 0) {
        fd.append("tags", JSON.stringify(selectedTags));
      }

      // Kapak görseli
      if (imageFile) {
        fd.append("hero_image_file", imageFile);
      } else if (formData.heroImage) {
        fd.append("hero_image", formData.heroImage);
      }

      // REVIEW ise review_extra_data JSON
      if (formData.type === "REVIEW") {
        const reviewExtraData = {
          criteria: {},
          pros: [] as unknown[],
          cons: [] as unknown[],
          technical_spec: {},
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

      // BEST_LIST ise best_list_extra_data JSON
      if (formData.type === "BEST_LIST") {
        const processedBestListItems = bestListItems.map(
          ({ title, description, image, pros, cons, price, rating, link }) => ({
            title,
            description,
            image,
            pros,
            cons,
            price,
            rating,
            link,
          })
        );

        const bestListExtraData = {
          items: processedBestListItems,
          criteria: {},
          methodology: "",
        };
        fd.append("best_list_extra_data", JSON.stringify(bestListExtraData));

        // İsteğe bağlı: item bazlı görsel dosyaları (backend dikkate alıyorsa)
        bestListItems.forEach((item, index) => {
          if (item.imageFile) {
            fd.append(`best_list_item_${index}_image_file`, item.imageFile);
          }
        });
      }

      const result = await createArticle(fd).unwrap();
      console.log("Create article result:", result);
      toast.success("Makale başarıyla kaydedildi");
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Makale kaydedilirken bir hata oluştu");
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/articles")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Yeni Makale</h1>
            <p className="text-muted-foreground">
              Yeni bir makale oluşturun ve yayınlayın
            </p>
          </div>
        </div>
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
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Makale başlığı..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Alt Başlık</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Alt başlık..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Makale özeti..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Makale Tipi</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
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
                    className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
                    disabled={categoriesLoading}
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categoriesLoading && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Kategoriler yükleniyor...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
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

          {/* Tags */}
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
                  placeholder="SEO için özel başlık..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO için özel açıklama..."
                  rows={3}
                  className="mt-1"
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

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => handleSave("DRAFT")}
              disabled={isSaving}
              variant="outline"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Taslak Kaydet
                </>
              )}
            </Button>

            <Button
              onClick={() => handleSave("PUBLISHED")}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yayınlanıyor...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Yayınla
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Scores (only for review type) */}
          {formData.type === "REVIEW" && (
            <Card>
              <CardHeader>
                <CardTitle>Değerlendirme Puanları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Performans: {reviewScores.performance}/10</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reviewScores.performance}
                      onChange={(e) =>
                        handleScoreChange({
                          ...reviewScores,
                          performance: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label>Kararlılık: {reviewScores.stability}/10</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reviewScores.stability}
                      onChange={(e) =>
                        handleScoreChange({
                          ...reviewScores,
                          stability: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label>Kapsama: {reviewScores.coverage}/10</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reviewScores.coverage}
                      onChange={(e) =>
                        handleScoreChange({
                          ...reviewScores,
                          coverage: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label>Yazılım: {reviewScores.software}/10</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reviewScores.software}
                      onChange={(e) =>
                        handleScoreChange({
                          ...reviewScores,
                          software: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <Label>Değer: {reviewScores.value}/10</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reviewScores.value}
                      onChange={(e) =>
                        handleScoreChange({
                          ...reviewScores,
                          value: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>

                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">Genel Puan</div>
                    <div className="text-4xl font-bold text-primary">
                      {totalScore.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Best List Items (only for best list type) */}
          {formData.type === "BEST_LIST" && (
            <Card>
              <CardHeader>
                <CardTitle>En İyi Listesi Öğeleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new item form */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="item-title">Ürün Adı *</Label>
                    <Input
                      id="item-title"
                      value={newBestListItem.title}
                      onChange={(e) =>
                        setNewBestListItem((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Ürün adı..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="item-description">Açıklama</Label>
                    <Textarea
                      id="item-description"
                      value={newBestListItem.description}
                      onChange={(e) =>
                        setNewBestListItem((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Ürün açıklaması..."
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="item-price">Fiyat</Label>
                      <Input
                        id="item-price"
                        value={newBestListItem.price}
                        onChange={(e) =>
                          setNewBestListItem((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="₺1,000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-rating">Puan (1-10)</Label>
                      <Input
                        id="item-rating"
                        type="number"
                        min={1}
                        max={10}
                        value={newBestListItem.rating}
                        onChange={(e) =>
                          setNewBestListItem((prev) => ({
                            ...prev,
                            rating:
                              parseInt(e.target.value, 10) ||
                              prev.rating,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="item-image">Görsel</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {newBestListItem.imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={newBestListItem.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : newBestListItem.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={newBestListItem.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Eye className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          id="item-image"
                          type="file"
                          accept="image/*"
                          onChange={handleBestListItemImageChange}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG veya GIF formatında, maksimum 5MB
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {newBestListItem.imageFile
                            ? `Seçilen dosya: ${newBestListItem.imageFile.name}`
                            : newBestListItem.image
                            ? "URL kullanılıyor"
                            : "Dosya seçilmedi"}
                        </p>
                        {(newBestListItem.imageFile ||
                          newBestListItem.imagePreview ||
                          newBestListItem.image) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveBestListItemImage}
                            className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Kaldır
                          </Button>
                        )}
                      </div>
                    </div>
                    {!newBestListItem.imageFile &&
                      !newBestListItem.imagePreview && (
                        <div className="mt-2">
                          <Input
                            value={newBestListItem.image}
                            onChange={(e) =>
                              setNewBestListItem((prev) => ({
                                ...prev,
                                image: e.target.value,
                              }))
                            }
                            placeholder="Veya görsel URL'si girin..."
                            className="mt-1"
                          />
                        </div>
                      )}
                  </div>

                  <div>
                    <Label htmlFor="item-link">Satın Alma Linki</Label>
                    <Input
                      id="item-link"
                      value={newBestListItem.link}
                      onChange={(e) =>
                        setNewBestListItem((prev) => ({
                          ...prev,
                          link: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/product"
                      className="mt-1"
                    />
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Artılar</Label>
                      <div className="space-y-2">
                        {newBestListItem.pros.map((pro, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={pro}
                              onChange={(e) => {
                                const newPros = [...newBestListItem.pros];
                                newPros[index] = e.target.value;
                                setNewBestListItem((prev) => ({
                                  ...prev,
                                  pros: newPros,
                                }));
                              }}
                              placeholder="Artı..."
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePro(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const pro = window.prompt("Artı ekle:");
                            if (pro) addPro(pro);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Artı Ekle
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Eksiler</Label>
                      <div className="space-y-2">
                        {newBestListItem.cons.map((con, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2"
                          >
                            <Input
                              value={con}
                              onChange={(e) => {
                                const newCons = [...newBestListItem.cons];
                                newCons[index] = e.target.value;
                                setNewBestListItem((prev) => ({
                                  ...prev,
                                  cons: newCons,
                                }));
                              }}
                              placeholder="Eksi..."
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCon(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const con = window.prompt("Eksi ekle:");
                            if (con) addCon(con);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Eksi Ekle
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addBestListItem}
                    disabled={!newBestListItem.title.trim()}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Listeye Ekle
                  </Button>
                </div>

                {/* List of added items */}
                {bestListItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Eklenen Öğeler ({bestListItems.length})</Label>
                    {bestListItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.price} • {item.rating}/10 puan
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBestListItem(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
