// =============================================================
// FILE: src/integrations/hardware/rtk/types/comment_review.types.ts
// Django Comment + UserReview serializer tipleri
// =============================================================

import type { QueryParams } from "@/lib/api-config";

export type CommentStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

export interface CommentArticleDetailSummary {
  id: number;
  title: string;
  slug: string | null;
  type: string;
}

export interface CommentUserSummary {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string | null;
  [key: string]: unknown;
}

export interface CommentDto {
  id: number;
  article: number | null;
  article_detail: CommentArticleDetailSummary | null;
  article_id: number | null;
  user: CommentUserSummary | null;
  content: string;
  status: CommentStatus;
  author_name: string | null;
  author_email: string | null;
  parent: number | null;
  replies: CommentDto[]; // nested approved replies
  helpful_count: number;
  article_title: string;
  created_at: string;
  ip_address?: string | null;
}

/**
 * Comment oluşturma payload’u
 * - backend create içinde article zorunlu
 * - user ve ip backend tarafından set ediliyor
 */
export interface CommentCreatePayload {
  article: number;
  content: string;
  author_name?: string;
  author_email?: string;
  parent?: number | null;
}

/**
 * Comment update payload’u
 * - admin için içerik + status değişebilir
 * - normal user için sadece status (backend tarafında extra kontrol var)
 */
export interface CommentUpdatePayload {
  content?: string;
  status?: CommentStatus;
}

/**
 * /comments/<comment_id>/helpful/ yanıtı
 * {
 *   success: boolean;
 *   action: "added" | "removed";
 *   helpful_count: number;
 * }
 */
export interface HelpfulVoteResponse {
  success: boolean;
  action: "added" | "removed";
  helpful_count: number;
}

// --------- USER REVIEW ---------

export type UserReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

export interface UserReviewUserSummary {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar?: string | null;
  [key: string]: unknown;
}

export interface UserReviewDto {
  id: number;
  product: number;
  user: UserReviewUserSummary | null;
  rating: number;
  title: string;
  content: string;
  pros: unknown;
  cons: unknown;
  status: UserReviewStatus;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Genel /reviews/ endpoint’i için create payload
 * (ProductReviewsView ve ProductReviewsBySlugView ayrı RTK endpoint’lerinde ele alınıyor)
 */
export interface UserReviewCreatePayload {
  product: number;
  rating: number;
  title: string;
  content: string;
  pros?: string[] | string;
  cons?: string[] | string;
}

export interface UserReviewUpdatePayload {
  rating?: number;
  title?: string;
  content?: string;
  pros?: string[] | string;
  cons?: string[] | string;
  status?: UserReviewStatus;
}

/* -------------------------------------------------------------
 * Liste sorgu parametre tipleri (RTK Query için)
 * -----------------------------------------------------------*/

export interface CommentListQueryParams extends QueryParams {
  article?: number;
  user?: number;
  status?: CommentStatus;
  admin?: "true" | "false";
}

export interface ReviewListQueryParams extends QueryParams {
  product?: number;
  user?: number;
  status?: UserReviewStatus;
  rating?: number;
  admin?: "true" | "false";
}
