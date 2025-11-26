// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/articles.endpoints.ts
// =============================================================

import { hardwareApi } from "../baseApi";
import type { QueryParams } from "@/lib/api-config";
import { buildQueryString } from "@/lib/api-config";
import type { PaginatedResult } from "../types/common.types";
import type {
  ArticleDto,
  ArticleListItem,
  ArticleCreatePayload,
  ArticleUpdatePayload,
} from "../types/article.types";

/* ---------- Comment tipleri ---------- */

export interface ArticleCommentUserDto {
  id: number;
  name?: string;
  avatar?: string | null;
  // ek alanlar backend'den gelirse bozulmasın
  [key: string]: unknown;
}

export interface ArticleCommentDto {
  id: number;
  content: string;
  created_at: string;
  author_name?: string | null;
  author_email?: string | null;
  user?: ArticleCommentUserDto | null;
  _count?: {
    replies?: number;
  } | null;
  replies?: ArticleCommentDto[] | null;
  [key: string]: unknown;
}

/** Yorum ekleme cevabı için basit tip */
export interface SubmitArticleCommentResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

/** Yorum ekleme payload'u */
export interface SubmitArticleCommentPayload {
  articleId: number | string;
  content: string;
  author_name: string;
  author_email?: string;
  parent_id?: number;
}

export const articlesApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    listArticles: build.query<
      PaginatedResult<ArticleListItem> | ArticleListItem[],
      QueryParams | void
    >({
      query: (params: QueryParams | void) => {
        const qs = params ? buildQueryString(params) : "";
        return `/articles/${qs}`;
      },
      providesTags: (result) => {
        const items: ArticleListItem[] | undefined = Array.isArray(result)
          ? result
          : result?.results;

        if (items && items.length > 0) {
          return [
            ...items.map((a) => ({
              type: "Article" as const,
              id: a.id,
            })),
            { type: "Article" as const, id: "LIST" },
          ];
        }

        return [{ type: "Article" as const, id: "LIST" }];
      },
    }),

    createArticle: build.mutation<ArticleDto, ArticleCreatePayload | FormData>({
      query: (data) => ({
        url: "/articles/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Article", id: "LIST" }],
    }),

    getArticleBySlug: build.query<ArticleDto, string>({
      query: (slug) => `/articles/${slug}/`,
      providesTags: (_res, _err, slug) => [
        { type: "Article" as const, id: `slug-${slug}` },
      ],
    }),

    updateArticleBySlug: build.mutation<
      ArticleDto,
      { slug: string; data: ArticleUpdatePayload | FormData }
    >({
      query: ({ slug, data }) => ({
        url: `/articles/${slug}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { slug }) => [
        { type: "Article" as const, id: `slug-${slug}` },
        { type: "Article" as const, id: "LIST" },
      ],
    }),

    deleteArticleBySlug: build.mutation<void, string>({
      query: (slug) => ({
        url: `/articles/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, slug) => [
        { type: "Article" as const, id: `slug-${slug}` },
        { type: "Article" as const, id: "LIST" },
      ],
    }),

    getArticleById: build.query<ArticleDto, number>({
      query: (id) => `/articles/id/${id}/`,
      providesTags: (_res, _err, id) => [
        { type: "Article" as const, id },
      ],
    }),

    updateArticleById: build.mutation<
      ArticleDto,
      { id: number; data: ArticleUpdatePayload | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/articles/id/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Article" as const, id },
        { type: "Article" as const, id: "LIST" },
      ],
    }),

    deleteArticleById: build.mutation<void, number>({
      query: (id) => ({
        url: `/articles/id/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Article" as const, id },
        { type: "Article" as const, id: "LIST" },
      ],
    }),

    /* ---------- Yorum listeleme ---------- */
    /**
     * GET /articles/<articleId>/comments/
     */
    listArticleComments: build.query<
      ArticleCommentDto[],
      number | string
    >({
      query: (articleId) => `/articles/${articleId}/comments/`,
      providesTags: (_res, _err, articleId) => [
        { type: "Article" as const, id: articleId },
        { type: "ArticleComment" as const, id: `ARTICLE-${articleId}` },
      ],
    }),

    /* ---------- Yorum ekleme ---------- */
    /**
     * POST /articles/<articleId>/comments/
     */
    submitArticleComment: build.mutation<
      SubmitArticleCommentResponse,
      SubmitArticleCommentPayload
    >({
      query: ({ articleId, ...body }) => ({
        url: `/articles/${articleId}/comments/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { articleId }) => [
        { type: "Article" as const, id: articleId },
        { type: "ArticleComment" as const, id: `ARTICLE-${articleId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListArticlesQuery,
  useCreateArticleMutation,
  useGetArticleBySlugQuery,
  useUpdateArticleBySlugMutation,
  useDeleteArticleBySlugMutation,
  useGetArticleByIdQuery,
  useUpdateArticleByIdMutation,
  useDeleteArticleByIdMutation,
  useListArticleCommentsQuery,      // 🔹 yeni hook
  useSubmitArticleCommentMutation,  // 🔹 önce eklediğimiz hook
} = articlesApi;
