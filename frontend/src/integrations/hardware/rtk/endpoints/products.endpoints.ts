// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/products.endpoints.ts
// Django Product / UserReview / PriceHistory endpoint'leri
// =============================================================

import { hardwareApi } from "../baseApi";
import type { QueryParams } from "@/lib/api-config";
import { buildQueryString } from "@/lib/api-config";
import type { PaginatedResult } from "../types/common.types";
import type {
  ProductDto,
  ProductWritePayload,
  ProductReview,
  ProductReviewCreatePayload,
  PriceHistoryItem,
  PriceHistoryCreatePayload,
} from "../types/product.types";

export const productsApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /products/
     * ProductListCreateView
     * DRF global pagination'a göre:
     *   - PaginatedResult<ProductDto>
     *   - veya ProductDto[]
     */
    listProducts: build.query<
      PaginatedResult<ProductDto> | ProductDto[],
      QueryParams | void
    >({
      query: (params) => `/products/${buildQueryString(params)}`,
      providesTags: (result) => {
        const items: ProductDto[] | undefined = Array.isArray(result)
          ? result
          : result?.results;

        if (items && items.length > 0) {
          return [
            ...items.map((p) => ({
              type: "Product" as const,
              id: p.id,
            })),
            { type: "Product" as const, id: "LIST" },
          ];
        }

        return [{ type: "Product" as const, id: "LIST" }];
      },
    }),

    /**
     * POST /products/
     * ProductListCreateView → admin create
     * Body: JSON veya FormData (cover_image_file vs)
     */
    createProduct: build.mutation<
      ProductDto,
      ProductWritePayload | FormData
    >({
      query: (body) => ({
        url: "/products/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    /**
     * GET /products/<slug:slug>/
     * ProductDetailView (slug tabanlı)
     */
    getProductBySlug: build.query<ProductDto, string>({
      query: (slug) => `/products/${slug}/`,
      providesTags: (_res, _err, slug) => [
        { type: "Product" as const, id: `slug-${slug}` },
      ],
    }),

    /**
     * PUT /products/<slug:slug>/
     * ProductDetailView update (slug tabanlı)
     */
    updateProductBySlug: build.mutation<
      ProductDto,
      { slug: string; data: ProductWritePayload | FormData }
    >({
      query: ({ slug, data }) => ({
        url: `/products/${slug}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { slug }) => [
        { type: "Product" as const, id: `slug-${slug}` },
        { type: "Product" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /products/<slug:slug>/
     * ProductDetailView delete (slug tabanlı)
     */
    deleteProductBySlug: build.mutation<void, string>({
      query: (slug) => ({
        url: `/products/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, slug) => [
        { type: "Product" as const, id: `slug-${slug}` },
        { type: "Product" as const, id: "LIST" },
      ],
    }),

    /**
     * GET /products/id/<int:pk>/
     * ProductDetailByIdView (ID tabanlı)
     */
    getProductById: build.query<ProductDto, number>({
      query: (id) => `/products/id/${id}/`,
      providesTags: (_res, _err, id) => [
        { type: "Product" as const, id },
      ],
    }),

    /**
     * PUT /products/id/<int:pk>/
     * ProductDetailByIdView update
     */
    updateProductById: build.mutation<
      ProductDto,
      { id: number; data: ProductWritePayload | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/products/id/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Product" as const, id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /products/id/<int:pk>/
     * ProductDetailByIdView delete
     */
    deleteProductById: build.mutation<void, number>({
      query: (id) => ({
        url: `/products/id/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Product" as const, id },
        { type: "Product" as const, id: "LIST" },
      ],
    }),

    // ---------------------------------------------------------
    // Product Reviews
    // ---------------------------------------------------------

    /**
     * GET /products/<int:product_id>/reviews/
     * ProductReviewsView – product_id üzerinden
     * Response: PaginatedResult<ProductReview> veya ProductReview[]
     */
    listProductReviewsById: build.query<
      PaginatedResult<ProductReview> | ProductReview[],
      number
    >({
      query: (productId) => `/products/${productId}/reviews/`,
      providesTags: (result, _err, productId) => {
        const items: ProductReview[] | undefined = Array.isArray(result)
          ? result
          : result?.results;

        if (items && items.length > 0) {
          return [
            ...items.map((r) => ({
              type: "Product" as const,
              id: `REVIEW-${r.id}`,
            })),
            { type: "Product" as const, id: `REVIEWS-PRODUCT-${productId}` },
          ];
        }

        return [{ type: "Product" as const, id: `REVIEWS-PRODUCT-${productId}` }];
      },
    }),

    /**
     * POST /products/<int:product_id>/reviews/
     * ProductReviewsView – product_id üzerinden review oluşturma
     */
    createProductReviewById: build.mutation<
      ProductReview,
      { productId: number; data: ProductReviewCreatePayload }
    >({
      query: ({ productId, data }) => ({
        url: `/products/${productId}/reviews/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_res, _err, { productId }) => [
        { type: "Product" as const, id: `REVIEWS-PRODUCT-${productId}` },
        { type: "Product" as const, id: productId },
      ],
    }),

    /**
     * GET /products/slug/<slug:slug>/reviews/
     * ProductReviewsBySlugView – slug üzerinden reviews
     */
    listProductReviewsBySlug: build.query<
      PaginatedResult<ProductReview> | ProductReview[],
      string
    >({
      query: (slug) => `/products/slug/${slug}/reviews/`,
      providesTags: (result, _err, slug) => {
        const items: ProductReview[] | undefined = Array.isArray(result)
          ? result
          : result?.results;

        if (items && items.length > 0) {
          return [
            ...items.map((r) => ({
              type: "Product" as const,
              id: `REVIEW-${r.id}`,
            })),
            { type: "Product" as const, id: `REVIEWS-SLUG-${slug}` },
          ];
        }

        return [{ type: "Product" as const, id: `REVIEWS-SLUG-${slug}` }];
      },
    }),

    /**
     * POST /products/slug/<slug:slug>/reviews/
     * ProductReviewsBySlugView – slug üzerinden review oluşturma
     */
    createProductReviewBySlug: build.mutation<
      ProductReview,
      { slug: string; data: ProductReviewCreatePayload }
    >({
      query: ({ slug, data }) => ({
        url: `/products/slug/${slug}/reviews/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_res, _err, { slug }) => [
        { type: "Product" as const, id: `REVIEWS-SLUG-${slug}` },
        { type: "Product" as const, id: `slug-${slug}` },
      ],
    }),

    // ---------------------------------------------------------
    // Price History
    // ---------------------------------------------------------

    /**
     * GET /products/<slug:slug>/price-history/
     * PriceHistoryListCreateView – slug üzerinden
     * Response: PaginatedResult<PriceHistoryItem> veya PriceHistoryItem[]
     */
    listPriceHistoryBySlug: build.query<
      PaginatedResult<PriceHistoryItem> | PriceHistoryItem[],
      string
    >({
      query: (slug) => `/products/${slug}/price-history/`,
      providesTags: (result, _err, slug) => {
        const items: PriceHistoryItem[] | undefined = Array.isArray(result)
          ? result
          : result?.results;

        if (items && items.length > 0) {
          return [
            ...items.map((ph) => ({
              type: "Product" as const,
              id: `PRICE-${ph.id}`,
            })),
            { type: "Product" as const, id: `PRICE-SLUG-${slug}` },
          ];
        }

        return [{ type: "Product" as const, id: `PRICE-SLUG-${slug}` }];
      },
    }),

    /**
     * POST /products/<slug:slug>/price-history/
     * PriceHistoryListCreateView – slug üzerinden price history ekleme
     * (Admin / Super Admin gerektirir)
     */
    createPriceHistoryBySlug: build.mutation<
      PriceHistoryItem,
      { slug: string; data: PriceHistoryCreatePayload }
    >({
      query: ({ slug, data }) => ({
        url: `/products/${slug}/price-history/`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_res, _err, { slug }) => [
        { type: "Product" as const, id: `PRICE-SLUG-${slug}` },
        { type: "Product" as const, id: `slug-${slug}` },
      ],
    }),

    /**
     * GET /products/slug/<slug:slug>/price-history/<int:pk>/
     * PriceHistoryDetailView
     */
    getPriceHistoryItem: build.query<
      PriceHistoryItem,
      { slug: string; id: number }
    >({
      query: ({ slug, id }) =>
        `/products/slug/${slug}/price-history/${id}/`,
      providesTags: (_res, _err, { id }) => [
        { type: "Product" as const, id: `PRICE-${id}` },
      ],
    }),

    /**
     * PUT /products/slug/<slug:slug>/price-history/<int:pk>/
     * PriceHistoryDetailView update
     */
    updatePriceHistoryItem: build.mutation<
      PriceHistoryItem,
      { slug: string; id: number; data: PriceHistoryCreatePayload }
    >({
      query: ({ slug, id, data }) => ({
        url: `/products/slug/${slug}/price-history/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { slug, id }) => [
        { type: "Product" as const, id: `PRICE-${id}` },
        { type: "Product" as const, id: `PRICE-SLUG-${slug}` },
        { type: "Product" as const, id: `slug-${slug}` },
      ],
    }),

    /**
     * DELETE /products/slug/<slug:slug>/price-history/<int:pk>/
     * PriceHistoryDetailView delete
     */
    deletePriceHistoryItem: build.mutation<
      void,
      { slug: string; id: number }
    >({
      query: ({ slug, id }) => ({
        url: `/products/slug/${slug}/price-history/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { slug, id }) => [
        { type: "Product" as const, id: `PRICE-${id}` },
        { type: "Product" as const, id: `PRICE-SLUG-${slug}` },
        { type: "Product" as const, id: `slug-${slug}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListProductsQuery,
  useCreateProductMutation,
  useGetProductBySlugQuery,
  useUpdateProductBySlugMutation,
  useDeleteProductBySlugMutation,
  useGetProductByIdQuery,
  useUpdateProductByIdMutation,
  useDeleteProductByIdMutation,
  useListProductReviewsByIdQuery,
  useCreateProductReviewByIdMutation,
  useListProductReviewsBySlugQuery,
  useCreateProductReviewBySlugMutation,
  useListPriceHistoryBySlugQuery,
  useCreatePriceHistoryBySlugMutation,
  useGetPriceHistoryItemQuery,
  useUpdatePriceHistoryItemMutation,
  useDeletePriceHistoryItemMutation,
} = productsApi;
