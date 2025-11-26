// =============================================================
// FILE: src/integrations/hardware/rtk/types/product.types.ts
// Django Product / UserReview / PriceHistory tipleri
// =============================================================

import type { Category } from "./category.types";

// Django ProductSpec modeline karşılık
export type ProductSpecType = "TEXT" | "NUMBER" | "BOOLEAN" | "JSON" | string;

export interface ProductSpec {
  id: number;
  name: string;
  value: string;
  type: ProductSpecType;
  unit: string;
  is_visible: boolean;
  sort_order: number;
}

// ProductSerializer.get_product_tags çıktısı
export interface ProductTag {
  id: number;
  name: string;
  slug: string;
  type: string;
}

// get_affiliate_links çıktısı
export interface AffiliateLink {
  id: string; // Serializer'da str(link.id)
  merchant: string;
  url_template: string;
  active: boolean;
}

// PriceHistorySerializer çıktısı (PriceHistoryListCreateView / DetailView)
export interface PriceHistoryItem {
  id: number;
  product: number;
  price: number;
  currency: string;
  source: string;
  url: string | null;
  recorded_at: string; // ISO datetime
}

// ProductSerializer.get_user_reviews -> sadece rating listesi
export interface ProductUserReviewSummary {
  rating: number;
}

// UserReviewSerializer çıktısı (ProductReviewsView / ProductReviewsBySlugView)
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

export interface ProductReview {
  id: number;
  product: number;
  user: number | null;
  rating: number;
  title: string;
  content: string;
  pros: string[]; // Django tarafında list olarak tutuluyor
  cons: string[];
  status: ReviewStatus;
  created_at: string;
}

// ProductSerializer çıktısı (hem list hem detail)
export interface ProductDto {
  id: number;
  brand: string;
  model: string;
  slug: string;

  specs: {
    name: string;
    value: string;
    unit: string;
    type: ProductSpecType;
    is_visible: boolean;
    sort_order: number;
  }[];

  price: number | null;
  release_year: number | null;
  cover_image: string | null;
  description: string;

  category: Category | null;
  product_specs: ProductSpec[];
  affiliate_links: AffiliateLink[];

  user_reviews: ProductUserReviewSummary[];
  review_count: number;
  average_rating: number;

  price_history: PriceHistoryItem[];
  product_tags: ProductTag[];

  created_at: string;
}

// -------- Yazma payload’ları (admin / panel için) --------

// Product create/update JSON body (FormData kullanmayacaksan)
export interface ProductWritePayload {
  brand: string;
  model: string;
  slug?: string;
  price?: number | null;
  release_year?: number | null;
  description?: string;
  category_id?: number | null;

  specs?: {
    name: string;
    value: string | number | boolean;
    unit?: string;
    type?: ProductSpecType;
    is_visible?: boolean;
    sort_order?: number;
  }[];

  affiliate_links_data?: {
    merchant: string;
    url_template: string;
    active?: boolean;
  }[];

  tags?: (number | string)[];
  is_active?: boolean;
  // cover_image_file → FormData ile gönderilecek (file)
}

// Review create payload (id veya slug üzerinden)
export interface ProductReviewCreatePayload {
  rating: number;
  title: string;
  content: string;
  pros?: string[];
  cons?: string[];
}

// Price history create/update payload
export interface PriceHistoryCreatePayload {
  price: number;
  currency?: string;
  source: string;
  url?: string;
}
