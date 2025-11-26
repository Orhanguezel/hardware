// src/app/admin/tags/page.tsx

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Tag as TagIcon,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

import type { TagDto, TagType } from "@/integrations/hardware/rtk/types/tag.types";
import {
  useListTagsQuery,
  useCreateTagMutation,
  useUpdateTagByIdMutation,
  useDeleteTagByIdMutation,
} from "@/integrations/hardware/rtk/endpoints/tags.endpoints";
import type { QueryParams } from "@/lib/api-config";

type Tag = TagDto;

interface TagFormData {
  name: string;
  slug: string;
  type: TagType;
}

export default function TagsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TagType | "">("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    slug: "",
    type: "GENERAL",
  });

  const tagTypes: { value: TagType; label: string }[] = [
    { value: "GENERAL", label: "Genel" },
    { value: "BRAND", label: "Marka" },
    { value: "FEATURE", label: "Özellik" },
    { value: "PRICE_RANGE", label: "Fiyat Aralığı" },
  ];

  // --- RTK Query: liste ---
  const queryArgs: QueryParams = {};
  if (searchTerm) queryArgs.search = searchTerm;
  if (filterType) queryArgs.type = filterType;

  const {
    data: tagsResult,
    isLoading,
    error: queryError,
  } = useListTagsQuery(queryArgs);

  const tags: Tag[] = Array.isArray(tagsResult)
    ? tagsResult
    : tagsResult?.results ?? [];

  // --- RTK Mutations ---
  const [createTag] = useCreateTagMutation();
  const [updateTagById] = useUpdateTagByIdMutation();
  const [deleteTagById] = useDeleteTagByIdMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingTag) {
        await updateTagById({
          id: editingTag.id,
          data: {
            name: formData.name,
            slug: formData.slug,
            type: formData.type,
          },
        }).unwrap();
        setSuccess("Etiket başarıyla güncellendi");
      } else {
        await createTag({
          name: formData.name,
          slug: formData.slug,
          type: formData.type,
        }).unwrap();
        setSuccess("Etiket başarıyla oluşturuldu");
      }

      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error saving tag:", err);
      setError("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tag: Tag) => {
    if (
      !window.confirm(
        `${tag.name} etiketini silmek istediğinizden emin misiniz?`,
      )
    ) {
      return;
    }

    setDeleting(tag.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteTagById(tag.id).unwrap();
      setSuccess("Etiket başarıyla silindi");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting tag:", err);
      setError("Etiket silinemedi");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      type: tag.type,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", type: "GENERAL" });
    setEditingTag(null);
    setShowForm(false);
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const getTypeLabel = (type: TagType) =>
    tagTypes.find((t) => t.value === type)?.label || type;

  const getTypeColor = (type: TagType): string => {
    switch (type) {
      case "BRAND":
        return "bg-blue-100 text-blue-800";
      case "FEATURE":
        return "bg-green-100 text-green-800";
      case "PRICE_RANGE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Etiketler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasQueryError = Boolean(queryError);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Etiket Yönetimi</h1>
          <p className="text-muted-foreground">
            Etiketleri düzenleyin, ekleyin ve silin
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Etiket
        </Button>
      </div>

      {/* Error and Success Messages */}
      {(error || hasQueryError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error || "Etiketler yüklenirken hata oluştu"}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Etiket Listesi */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Etiketler</CardTitle>
                <div className="flex gap-4">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Etiket ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(e.target.value as TagType | "")
                    }
                    className="p-2 border rounded-md bg-white text-gray-900"
                  >
                    <option value="">Tüm Türler</option>
                    {tagTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <TagIcon className="w-5 h-5 text-primary" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{tag.name}</h3>
                        <Badge className={getTypeColor(tag.type)}>
                          {getTypeLabel(tag.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{tag.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">
                          {tag.article_count}
                        </span>{" "}
                        makale
                      </div>
                      <div>
                        <span className="font-medium">
                          {tag.product_count}
                        </span>{" "}
                        ürün
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag)}
                        className="text-red-500 hover:text-red-700"
                        disabled={
                          tag.article_count > 0 ||
                          tag.product_count > 0 ||
                          deleting === tag.id
                        }
                      >
                        {deleting === tag.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {tags.length === 0 && !hasQueryError && (
                  <div className="p-6 text-center text-muted-foreground">
                    Hiç etiket bulunamadı.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Etiket Formu */}
        <div className="lg:col-span-1">
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTag ? "Etiket Düzenle" : "Yeni Etiket"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Etiket Adı</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Örn: Gaming"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      placeholder="Örn: gaming"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tür</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value as TagType,
                        }))
                      }
                      className="w-full p-2 border rounded-md bg-white text-gray-900"
                    >
                      {tagTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingTag
                            ? "Güncelleniyor..."
                            : "Oluşturuluyor..."}
                        </>
                      ) : editingTag ? (
                        "Güncelle"
                      ) : (
                        "Oluştur"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      İptal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
