// src/app/admin/articles/page.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Trash2,
  Calendar,
  User,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

import {
  useListArticlesQuery,
  useUpdateArticleByIdMutation,
  useDeleteArticleByIdMutation,
} from "@/integrations/hardware/rtk/endpoints/articles.endpoints";
import type {
  ArticleListItem,
  ArticleStatus,
} from "@/integrations/hardware/rtk/types/article.types";

// Helper function to get article URL based on type
function getArticleUrl(article: ArticleListItem): string {
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
}

type StatusFilter = "all" | "published" | "draft" | "archived";
type TypeFilter =
  | "all"
  | "review"
  | "best_list"
  | "compare"
  | "guide"
  | "news";

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const { data, isLoading, isError, refetch } = useListArticlesQuery();

  const [updateArticle, { isLoading: isUpdating }] =
    useUpdateArticleByIdMutation();
  const [deleteArticle, { isLoading: isDeleting }] =
    useDeleteArticleByIdMutation();

  const articles: ArticleListItem[] = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.results ?? [];
  }, [data]);

  const handleStatusChange = async (
    articleId: number,
    newStatus: ArticleStatus,
  ) => {
    try {
      await updateArticle({
        id: articleId,
        data: { status: newStatus },
      }).unwrap();
      await refetch();
      alert("Makale durumu güncellendi");
    } catch (error) {
      console.error("Error updating article status:", error);
      alert("Durum güncellenemedi");
    }
  };

  const handleDeleteArticle = async (
    articleId: number,
    articleTitle: string,
  ) => {
    const confirmed = window.confirm(
      `"${articleTitle}" makalesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
    );
    if (!confirmed) return;

    try {
      await deleteArticle(articleId).unwrap();
      await refetch();
      alert("Makale silindi");
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Makale silinemedi");
    }
  };

  const filteredArticles = useMemo(
    () =>
      articles.filter((article) => {
        if (
          searchTerm &&
          !article.title.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (statusFilter !== "all") {
          if (article.status.toLowerCase() !== statusFilter) {
            return false;
          }
        }

        if (typeFilter !== "all") {
          if (article.type.toLowerCase() !== typeFilter) {
            return false;
          }
        }

        return true;
      }),
    [articles, searchTerm, statusFilter, typeFilter],
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "draft":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "archived":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-800">
            Yayınlandı
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Taslak
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            Arşivlendi
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isBusy = isLoading || isUpdating || isDeleting;

  if (isLoading) {
    return (
      <div className="min-w-0 w-full overflow-x-hidden px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <span>Makaleler yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-w-0 w-full overflow-x-hidden px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            Makaleler yüklenirken bir hata oluştu.
          </p>
          <Button onClick={() => refetch()}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full overflow-x-hidden px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-2 break-words text-2xl font-bold sm:text-3xl">
              Makale Yönetimi
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Tüm makaleleri yönetin, yayınlayın ve düzenleyin
            </p>
          </div>
          <div className="flex w-full justify-start sm:w-auto sm:justify-end">
            <Button asChild disabled={isBusy} className="w-full sm:w-auto">
              <Link href="/admin/articles/new">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Makale
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div className="min-w-0">
              <label className="text-xs font-medium sm:text-sm">
                Arama
              </label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Makale başlığı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-medium sm:text-sm">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="mt-1 w-full rounded-md border bg-background p-2 text-sm text-foreground"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="published">Yayınlandı</option>
                <option value="draft">Taslak</option>
                <option value="archived">Arşivlendi</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium sm:text-sm">
                Tip
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as TypeFilter)
                }
                className="mt-1 w-full rounded-md border bg-background p-2 text-sm text-foreground"
              >
                <option value="all">Tüm Tipler</option>
                <option value="review">İnceleme</option>
                <option value="best_list">En İyi Listesi</option>
                <option value="compare">Karşılaştırma</option>
                <option value="guide">Rehber</option>
                <option value="news">Haber</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const authorName =
            article.author?.name ??
            article.author?.first_name ??
            article.author?.username;

          const displayDate = article.published_at ?? article.created_at;

          return (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="pt-5 sm:pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: Text */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-base font-semibold sm:text-lg">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(article.status)}
                        {getStatusBadge(article.status)}
                      </div>
                    </div>

                    {article.subtitle && (
                      <p className="mb-3 break-words text-sm text-muted-foreground sm:text-base">
                        {article.subtitle}
                      </p>
                    )}

                    {/* Tags */}
                    {article.article_tags &&
                      article.article_tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {article.article_tags.slice(0, 5).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-[10px] sm:text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {article.article_tags.length > 5 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] sm:text-xs"
                            >
                              +{article.article_tags.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:text-sm">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="truncate">
                          {authorName || "Bilinmiyor"}
                        </span>
                      </div>

                      {article.category && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{article.category.name}</span>
                        </div>
                      )}

                      {displayDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(
                              displayDate,
                            ).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      )}

                      <span>{article.comment_count ?? 0} yorum</span>

                      {article.review_extra?.total_score != null && (
                        <span className="font-medium text-yellow-600">
                          ⭐ {article.review_extra.total_score}/10
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex w-full flex-wrap items-center justify-end gap-2 border-t pt-3 sm:border-none sm:pt-0 lg:w-auto lg:border-none lg:pt-0 lg:pl-4">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 sm:flex-none"
                    >
                      <Link href={getArticleUrl(article)}>
                        <Eye className="mr-1 h-4 w-4" />
                        Görüntüle
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1 sm:flex-none"
                    >
                      <Link href={`/admin/articles/edit/${article.id}`}>
                        <Edit className="mr-1 h-4 w-4" />
                        Düzenle
                      </Link>
                    </Button>

                    {article.status.toLowerCase() !== "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          handleStatusChange(article.id, "PUBLISHED")
                        }
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Yayınla
                      </Button>
                    )}

                    {article.status.toLowerCase() === "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBusy}
                        onClick={() =>
                          handleStatusChange(article.id, "ARCHIVED")
                        }
                        className="flex-1 sm:flex-none"
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Arşivle
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() =>
                        handleDeleteArticle(article.id, article.title)
                      }
                      className="flex-1 text-red-600 hover:text-red-700 sm:flex-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <Card className="mt-4">
          <CardContent className="py-10 sm:py-12">
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
              <h3 className="mb-2 text-base font-semibold sm:text-lg">
                Makale Bulunamadı
              </h3>
              <p className="mb-4 text-sm text-muted-foreground sm:text-base">
                {searchTerm ||
                statusFilter !== "all" ||
                typeFilter !== "all"
                  ? "Arama kriterlerinize uygun makale bulunamadı."
                  : "Henüz hiç makale eklenmemiş."}
              </p>
              <Button asChild disabled={isBusy}>
                <Link href="/admin/articles/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Makale Ekle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
