// =============================================================
// FILE: src/integrations/hardware/rtk/types/article.types.ts
// Django Article + ArticleSerializer tipleri
// =============================================================

export type ArticleType =
  | "REVIEW"
  | "BEST_LIST"
  | "COMPARE"
  | "GUIDE"
  | "NEWS"
  | string;

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;

export interface ArticleAuthor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  // UserSerializer name alanı var (get_name)
  name?: string;
  // Ek alanlar için esnek bırak
  [key: string]: unknown;
}

export interface ArticleCategorySummary {
  id: number;
  name: string;
  slug: string;
  // CategorySerializer ekstra alanları için esnek bırak
  [key: string]: unknown;
}

export interface ArticleTagSummary {
  id: number;
  name: string;
  slug: string;
  type: string;
}

// --- Review extra ---
// ReviewExtra modeline göre:
// criteria: JSONField (dict)
// pros/cons: JSONField (list)
// technical_spec: JSONField (dict)
// skorlar: float, null olabilir

export interface ReviewExtraDto {
  criteria: Record<string, unknown>;       // JSONField default=dict
  pros: unknown[];                         // JSONField default=list
  cons: unknown[];                         // JSONField default=list
  technical_spec: Record<string, unknown>; // JSONField default=dict
  performance_score: number | null;
  stability_score: number | null;
  coverage_score: number | null;
  software_score: number | null;
  value_score: number | null;
  total_score: number | null;
  score_numeric: number | null;
}

// write-only payload – JSON alanlar esnek olsun
export interface ReviewExtraInput {
  criteria?: Record<string, unknown>;
  pros?: unknown[];
  cons?: unknown[];
  technical_spec?: Record<string, unknown>;
  performance_score?: number | null;
  stability_score?: number | null;
  coverage_score?: number | null;
  software_score?: number | null;
  value_score?: number | null;
  total_score?: number | null;
  score_numeric?: number | null;
}

// --- Best list extra ---

export type BestListItem = Record<string, unknown>;

export interface BestListExtraDto {
  items: BestListItem[];
  criteria: Record<string, unknown>;
  methodology: string;
  last_updated: string;
}

export interface BestListExtraInput {
  items?: BestListItem[];
  criteria?: Record<string, unknown>;
  methodology?: string;
}

// --- Compare extra ---

export interface CompareProductSummary {
  // ProductSerializer'dan gelen minimal alanlar
  id: number;
  slug: string;
  brand?: string;
  model?: string;
  [key: string]: unknown;
}

export interface CompareExtraDto {
  left_product: CompareProductSummary;
  right_product: CompareProductSummary;
  rounds: unknown;
  winner_product: CompareProductSummary | null;
}

// --- Ana Article DTO (READ) ---

export interface ArticleDto {
  id: number;
  type: ArticleType;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string | null;
  status: ArticleStatus;
  author: ArticleAuthor;
  category: ArticleCategorySummary | null;
  published_at: string | null;
  hero_image: string | null;
  og_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  view_count: number;
  article_tags: ArticleTagSummary[];
  review_extra: ReviewExtraDto | null;
  best_list_extra: BestListExtraDto | null;
  compare_extra: CompareExtraDto | null;
  comment_count: number;
  created_at: string;
}

// Liste görünümü için – şu an ArticleDto ile aynı
export type ArticleListItem = ArticleDto;

// --- CREATE / UPDATE payload tipleri (WRITE) ---

export interface ArticleBasePayload {
  type?: ArticleType;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content: string; // Serializer'da required
  status?: ArticleStatus;
  category_id?: number | null;
  published_at?: string | null;

  hero_image?: string | null; // string URL gönderiyorsan
  og_image?: string | null;

  meta_title?: string | null;
  meta_description?: string | null;

  // write-only JSON alanlar
  review_extra_data?: ReviewExtraInput;
  best_list_extra_data?: BestListExtraInput;

  // Tag id listesi – backend hem string hem listeyi handle ediyor
  tags?: number[] | string;

  // Dosya upload için – FormData kullanırsan devreye girer
  hero_image_file?: File | Blob;
}

// Yeni makale için payload – şu an ArticleBasePayload ile aynı
export type ArticleCreatePayload = ArticleBasePayload;

// PATCH için (hepsi opsiyonel)
export type ArticleUpdatePayload = Partial<ArticleBasePayload>;
