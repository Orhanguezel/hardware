// src/app/admin/reviews/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Star,
  User as UserIcon,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Trash2,
} from "lucide-react";

import {
  useListReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/integrations/hardware/rtk/endpoints/comments_reviews.endpoints";
import type {
  UserReviewDto,
  UserReviewStatus,
  UserReviewUserSummary,
  ReviewListQueryParams,
} from "@/integrations/hardware/rtk/types/comment_review.types";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";

/* ---------- View model tipleri ---------- */

type ReviewStatus = UserReviewStatus;

interface ReviewProductSummary {
  id: number;
  brand: string;
  model: string;
  slug: string;
}

interface ReviewUserSummaryView {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string;
}

interface ReviewViewModel {
  id: number;
  rating: number;
  title?: string;
  content: string;
  pros: string[];
  cons: string[];
  status: ReviewStatus;
  isVerified: boolean;
  isHelpful: number;
  createdAt: string;
  product: ReviewProductSummary;
  user: ReviewUserSummaryView;
}

/* ---------- Helper’lar ---------- */

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter((v) => v.trim().length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
};

const getBooleanFlag = (
  source: Record<string, unknown>,
  keys: string[],
): boolean => {
  for (const key of keys) {
    const val = source[key];
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val !== 0;
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      if (["true", "1", "yes", "evet"].includes(lower)) return true;
      if (["false", "0", "no", "hayır", "hayir"].includes(lower)) return false;
    }
  }
  return false;
};

const getNumberField = (
  source: Record<string, unknown>,
  keys: string[],
): number => {
  for (const key of keys) {
    const val = source[key];
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const n = Number(val);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
};

const mapUserSummary = (user: UserReviewUserSummary | null): ReviewUserSummaryView => {
  const base: ReviewUserSummaryView = {
    id: 0,
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    avatar: undefined,
  };

  if (!user) return base;

  return {
    id: user.id,
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    username: user.username,
    email: user.email ?? "",
    avatar: user.avatar ?? undefined,
  };
};

const mapProductSummary = (review: UserReviewDto): ReviewProductSummary => {
  const base: ReviewProductSummary = {
    id: review.product,
    brand: "Bilinmiyor",
    model: "",
    slug: "",
  };

  const dict = review as Record<string, unknown>;

  const productCandidate =
    dict.product_detail ??
    dict.product_info ??
    dict.product_obj ??
    dict.product;

  if (productCandidate && typeof productCandidate === "object") {
    const obj = productCandidate as Record<string, unknown>;
    const idVal = obj.id;
    const brandVal = obj.brand;
    const modelVal = obj.model;
    const slugVal = obj.slug;

    return {
      id:
        typeof idVal === "number"
          ? idVal
          : typeof idVal === "string"
          ? Number(idVal) || review.product
          : review.product,
      brand: typeof brandVal === "string" ? brandVal : base.brand,
      model: typeof modelVal === "string" ? modelVal : base.model,
      slug: typeof slugVal === "string" ? slugVal : base.slug,
    };
  }

  return base;
};

const mapReviewDtoToView = (dto: UserReviewDto): ReviewViewModel => {
  const dict = dto as Record<string, unknown>;

  const pros = normalizeStringArray(dto.pros);
  const cons = normalizeStringArray(dto.cons);

  const isVerified = getBooleanFlag(dict, [
    "is_verified",
    "verified_purchase",
    "is_verified_purchase",
  ]);

  const isHelpful = getNumberField(dict, [
    "helpful_count",
    "helpful",
    "helpful_votes",
  ]);

  return {
    id: dto.id,
    rating: dto.rating,
    title: dto.title,
    content: dto.content,
    pros,
    cons,
    status: dto.status,
    isVerified,
    isHelpful,
    createdAt: dto.created_at,
    product: mapProductSummary(dto),
    user: mapUserSummary(dto.user),
  };
};

const getStatusBadge = (status: ReviewStatus) => {
  switch (status) {
    case "APPROVED":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Onaylandı
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Reddedildi
        </Badge>
      );
    case "PENDING":
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Beklemede
        </Badge>
      );
  }
};

const getRatingStars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
      }`}
    />
  ));

export default function ReviewsManagementPage() {
  // filtre state’leri
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "">("");
  const [ratingFilter, setRatingFilter] = useState<string>("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // search debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // filtre değişince sayfayı sıfırla
  useEffect(() => {
    setPage(1);
  }, [statusFilter, ratingFilter]);

  // RTK query params
  const queryParams: ReviewListQueryParams = {
    page,
    page_size: limit,
    admin: "true",
    ...(searchTerm ? { search: searchTerm } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(ratingFilter ? { rating: Number(ratingFilter) || undefined } : {}),
  };

  const {
    data: reviewsResult,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useListReviewsQuery(queryParams);

  const [updateReviewMutation, { isLoading: isUpdating }] =
    useUpdateReviewMutation();
  const [deleteReviewMutation, { isLoading: isDeleting }] =
    useDeleteReviewMutation();

  const paginated = reviewsResult as PaginatedResult<UserReviewDto> | undefined;
  const reviewsDto = paginated?.results ?? [];
  const reviews: ReviewViewModel[] = reviewsDto.map(mapReviewDtoToView);

  const total = paginated?.count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  const startIndex = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  const globalError =
    error ||
    (queryError ? "Yorumlar yüklenirken bir hata oluştu." : null);

  const updateReviewStatus = async (
    reviewId: number,
    status: ReviewStatus,
  ) => {
    try {
      setError(null);
      setSuccess(null);

      await updateReviewMutation({
        id: reviewId,
        data: { status },
      }).unwrap();

      let statusText = "";
      switch (status) {
        case "PENDING":
          statusText = "beklemeye çekildi";
          break;
        case "APPROVED":
          statusText = "onaylandı";
          break;
        case "REJECTED":
          statusText = "reddedildi";
          break;
        default:
          statusText = "güncellendi";
          break;
      }

      setSuccess(`Yorum ${statusText}`);
      await refetch();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error updating review status:", err);
      setError("Yorum güncellenirken hata oluştu");
    }
  };

  const deleteReview = async (reviewId: number) => {
    const confirmDelete = window.confirm(
      "Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    );
    if (!confirmDelete) return;

    try {
      setError(null);
      setSuccess(null);

      await deleteReviewMutation(reviewId).unwrap();

      setSuccess("Yorum başarıyla silindi");
      await refetch();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error deleting review:", err);
      setError("Yorum silinirken hata oluştu");
    }
  };

  const busy = isLoading || isFetching;

  if (busy && !reviewsResult) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Yorumlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ürün Yorumları</h1>
          <p className="text-muted-foreground">
            Ürünlere gelen kullanıcı yorumlarını yönetin ve onaylayın
          </p>
        </div>
      </div>

      {/* Error and Success Messages */}
      {globalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
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

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
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

      {/* Filtreler */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Arama</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ürün veya kullanıcı ara..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as ReviewStatus | "",
                  )
                }
                className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
              >
                <option value="">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="APPROVED">Onaylandı</option>
                <option value="REJECTED">Reddedildi</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Puan</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
              >
                <option value="">Tüm Puanlar</option>
                <option value="5">5 Yıldız</option>
                <option value="4">4 Yıldız</option>
                <option value="3">3 Yıldız</option>
                <option value="2">2 Yıldız</option>
                <option value="1">1 Yıldız</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  setSearchTerm("");
                  setStatusFilter("");
                  setRatingFilter("");
                  setPage(1);
                }}
                className="w-full"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yorum Listesi */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const displayName =
            `${review.user.firstName} ${review.user.lastName}`.trim() ||
            review.user.username;

          return (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Kullanıcı Avatarı */}
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    {review.user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={review.user.avatar}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Yorum İçeriği */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{displayName}</h3>
                          <div className="flex items-center gap-1">
                            {getRatingStars(review.rating)}
                          </div>
                          {getStatusBadge(review.status)}
                          {review.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Doğrulanmış
                            </Badge>
                          )}
                          <Badge className="bg-purple-100 text-purple-800">
                            Ürün Yorumu
                          </Badge>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                          <span className="font-medium">
                            {review.product.brand} {review.product.model}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(
                              review.createdAt,
                            ).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {review.status !== "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateReviewStatus(
                                review.id,
                                "PENDING",
                              )
                            }
                            disabled={isUpdating}
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Beklemeye Çek
                          </Button>
                        )}
                        {review.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateReviewStatus(
                                review.id,
                                "APPROVED",
                              )
                            }
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Onayla
                          </Button>
                        )}
                        {review.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateReviewStatus(
                                review.id,
                                "REJECTED",
                              )
                            }
                            disabled={isUpdating}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reddet
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReview(review.id)}
                          disabled={isDeleting}
                          className="border-gray-300 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-medium mb-2">{review.title}</h4>
                    )}

                    <p className="text-sm text-muted-foreground mb-3">
                      {review.content}
                    </p>

                    {/* Artıları ve Eksileri */}
                    {(review.pros.length > 0 ||
                      review.cons.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {review.pros.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-green-600 mb-1">
                              Artıları:
                            </h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {review.pros.map((pro, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-green-500 mt-1">
                                    •
                                  </span>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {review.cons.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-red-600 mb-1">
                              Eksileri:
                            </h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {review.cons.map((con, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-red-500 mt-1">
                                    •
                                  </span>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ürün Linki */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Bu yorum şu ürüne yazıldı:
                        </span>
                        <a
                          href={
                            review.product.slug
                              ? `/products/by-slug/${review.product.slug}`
                              : `/products/${review.product.id}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {review.product.brand} {review.product.model}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reviews.length === 0 && !busy && (
        <Card className="mt-6">
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Yorum bulunamadı
              </h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun ürün yorumu bulunamadı.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Toplam {total} yorumdan {startIndex}-{endIndex} arası
                gösteriliyor
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
