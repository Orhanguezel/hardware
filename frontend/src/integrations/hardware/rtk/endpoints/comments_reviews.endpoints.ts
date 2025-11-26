// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/comments_reviews.endpoints.ts
// Django Comment + UserReview view'lerine birebir uygun RTK endpointleri
// =============================================================

import { hardwareApi } from "../baseApi";
import { buildQueryString } from "@/lib/api-config";
import type { PaginatedResult } from "../types/common.types";
import type {
  CommentDto,
  CommentCreatePayload,
  CommentUpdatePayload,
  HelpfulVoteResponse,
  UserReviewDto,
  UserReviewCreatePayload,
  UserReviewUpdatePayload,
  CommentListQueryParams,
  ReviewListQueryParams,
} from "../types/comment_review.types";

// =============================================================
// API Slice
// =============================================================

export const commentsReviewsApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /comments/
     * CommentListCreateView
     * DRF default pagination:
     * { count, next, previous, results: CommentDto[] }
     */
    listComments: build.query<
      PaginatedResult<CommentDto>,
      CommentListQueryParams | undefined
    >({
      query: (params) => `/comments/${buildQueryString(params)}`,
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((c) => ({
                type: "Comment" as const,
                id: c.id,
              })),
              { type: "Comment" as const, id: "LIST" },
            ]
          : [{ type: "Comment" as const, id: "LIST" }],
    }),

    /**
     * GET /comments/<pk>/
     * CommentDetailView
     */
    getComment: build.query<CommentDto, number>({
      query: (id) => `/comments/${id}/`,
      providesTags: (_res, _err, id) => [
        { type: "Comment" as const, id },
      ],
    }),

    /**
     * POST /comments/
     * CommentListCreateView.create
     * Body: CommentCreatePayload
     */
    createComment: build.mutation<CommentDto, CommentCreatePayload>({
      query: (body) => ({
        url: "/comments/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Comment" as const, id: "LIST" }],
    }),

    /**
     * PATCH /comments/<pk>/
     * CommentDetailView.update
     */
    updateComment: build.mutation<
      CommentDto,
      { id: number; data: CommentUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/comments/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Comment" as const, id },
        { type: "Comment" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /comments/<pk>/
     * CommentDetailView.destroy
     */
    deleteComment: build.mutation<void, number>({
      query: (id) => ({
        url: `/comments/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Comment" as const, id },
        { type: "Comment" as const, id: "LIST" },
      ],
    }),

    /**
     * POST /comments/<comment_id>/helpful/
     * helpful_vote_view
     */
    markCommentHelpful: build.mutation<HelpfulVoteResponse, number>({
      query: (commentId) => ({
        url: `/comments/${commentId}/helpful/`,
        method: "POST",
      }),
    }),

    // ==========================
    // User Reviews
    // ==========================

    /**
     * GET /reviews/
     * UserReviewListCreateView
     * DRF pagination: { count, next, previous, results: UserReviewDto[] }
     */
    listReviews: build.query<
      PaginatedResult<UserReviewDto>,
      ReviewListQueryParams | undefined
    >({
      query: (params) => `/reviews/${buildQueryString(params)}`,
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((r) => ({
                type: "Review" as const,
                id: r.id,
              })),
              { type: "Review" as const, id: "LIST" },
            ]
          : [{ type: "Review" as const, id: "LIST" }],
    }),

    /**
     * GET /reviews/<pk>/
     * UserReviewDetailView
     */
    getReview: build.query<UserReviewDto, number>({
      query: (id) => `/reviews/${id}/`,
      providesTags: (_res, _err, id) => [
        { type: "Review" as const, id },
      ],
    }),

    /**
     * POST /reviews/
     * UserReviewListCreateView.create
     * Body: UserReviewCreatePayload
     */
    createReview: build.mutation<UserReviewDto, UserReviewCreatePayload>({
      query: (body) => ({
        url: "/reviews/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Review" as const, id: "LIST" }],
    }),

    /**
     * PATCH /reviews/<pk>/
     * UserReviewDetailView.update
     */
    updateReview: build.mutation<
      UserReviewDto,
      { id: number; data: UserReviewUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/reviews/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Review" as const, id },
        { type: "Review" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /reviews/<pk>/
     * UserReviewDetailView.destroy
     */
    deleteReview: build.mutation<void, number>({
      query: (id) => ({
        url: `/reviews/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Review" as const, id },
        { type: "Review" as const, id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  // Comments
  useListCommentsQuery,
  useGetCommentQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useMarkCommentHelpfulMutation,
  // Reviews
  useListReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = commentsReviewsApi;
