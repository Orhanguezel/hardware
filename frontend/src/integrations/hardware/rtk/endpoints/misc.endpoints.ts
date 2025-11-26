// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/misc.endpoints.ts
// Çeşitli endpointler: search, affiliate-links, analytics, outbound,
// article-view, database stats, test email
// =============================================================

import { hardwareApi } from "../baseApi";
import type { QueryParams } from "@/lib/api-config";
import { buildQueryString } from "@/lib/api-config";
import type { BaseApiSuccess } from "../types/auth.types";

// =============================================================
// Ortak Tipler
// =============================================================

/* ---------- Search ---------- */

export interface SearchQueryParams extends QueryParams {
  q?: string;
  // Backend tarafında farklı filtreler varsa buraya ekleyebilirsin
  type?: string; // "article" | "product" | "category" | "tag" | ...
}

export interface SearchResultItem {
  id: number;
  type: string; // "ARTICLE" | "PRODUCT" vs – backend tarafı nasıl dönerse
  title?: string;
  name?: string;
  slug?: string;
  // Ek alanları da serbest bırak
  [key: string]: unknown;
}

export interface SearchResponse {
  results: SearchResultItem[];
  // Bazı projelerde extra meta vs olabilir, type güvenli olsun diye serbest bırakıyoruz
  [key: string]: unknown;
}

/* ---------- Affiliate Link ---------- */

// DRF AffiliateLinkSerializer çıktısı
export interface AffiliateLinkDto {
  id: number;
  product: number; // Product FK id
  product_name: string; // Serializer.get_product_name
  merchant: string;
  url_template: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// CREATE / UPDATE payload (admin kullanımı için)
export interface AffiliateLinkBasePayload {
  product: number;
  merchant: string;
  url_template: string;
  active?: boolean;
}

export type AffiliateLinkCreatePayload = AffiliateLinkBasePayload;
export type AffiliateLinkUpdatePayload = Partial<AffiliateLinkBasePayload>;

/* ---------- Outbound Click ---------- */

export interface OutboundClickDto {
  id: number;
  product: number | null;
  article: number | null;
  user: number | null;
  merchant: string;
  ip: string;
  user_agent: string | null;
  created_at: string;
}

// Frontend’den outgoing click loglarken göndereceğin payload
export interface TrackOutboundClickPayload {
  product?: number;
  article?: number;
  merchant: string;
  url?: string;
}

/* ---------- Article View Tracking ---------- */

export interface ArticleViewDto {
  id: number;
  article: number;
  user: number | null;
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  created_at: string;
}

// Frontend’den view loglarken kullanılacak payload
export interface TrackArticleViewPayload {
  article: number;
  referer?: string;
}

/* ---------- Monthly Analytics ---------- */

export interface MonthlyAnalyticsDto {
  id: number;
  year: number;
  month: number;
  total_views: number;
  total_affiliate_clicks: number;
  total_users: number;
  created_at: string;
  updated_at: string;
}

/* ---------- Genel Analytics & DB Stats ---------- */

export interface AnalyticsOverviewResponse extends BaseApiSuccess {
  // Backend ne döndürüyorsa burada geniş bırakıyoruz
  data?: unknown;
  [key: string]: unknown;
}

// Veritabanı istatistikleri için tipler
export interface DatabaseTableInfo {
  name: string;
  count: number;
  table_name: string;
  description?: string;
  error?: string;
}

export interface DatabaseInfo {
  version: string;
  size_bytes: number;
  size_mb: number;
}

export interface DatabaseStatsResponse {
  tables: DatabaseTableInfo[];
  database_info: DatabaseInfo;
  [key: string]: unknown;
}

/* ---------- Test Email ---------- */

// Backend "to" alanını istiyor, FE'den hep { to: email } göndereceğiz
export interface TestEmailRequest {
  to: string;
}

export type TestEmailResponse = BaseApiSuccess;

/* ---------- Upload Image ---------- */

export interface UploadImageResponse extends BaseApiSuccess {
  url: string;
  // Backend başka alanlar döndürüyorsa buraya ekleyebilirsin
  [key: string]: unknown;
}

// =============================================================
// API Slice
// =============================================================

export const miscApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /search/
     * search_view
     */
    search: build.query<SearchResponse, SearchQueryParams | undefined>({
      query: (params) => `/search/${buildQueryString(params)}`,
    }),

    /**
     * GET /affiliate-links/
     * AffiliateLinkListView (ListCreateAPIView)
     */
    listAffiliateLinks: build.query<
      AffiliateLinkDto[],
      QueryParams | undefined
    >({
      query: (params) => `/affiliate-links/${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map((l) => ({
                type: "AffiliateLink" as const,
                id: l.id,
              })),
              { type: "AffiliateLink" as const, id: "LIST" },
            ]
          : [{ type: "AffiliateLink" as const, id: "LIST" }],
    }),

    /**
     * GET /affiliate-links/<pk>/
     * AffiliateLinkDetailView
     */
    getAffiliateLink: build.query<AffiliateLinkDto, number>({
      query: (id) => `/affiliate-links/${id}/`,
      providesTags: (_res, _err, id) => [
        { type: "AffiliateLink" as const, id },
      ],
    }),

    /**
     * POST /affiliate-links/
     * AffiliateLinkListView.create (ADMIN)
     */
    createAffiliateLink: build.mutation<
      AffiliateLinkDto,
      AffiliateLinkCreatePayload
    >({
      query: (body) => ({
        url: "/affiliate-links/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AffiliateLink" as const, id: "LIST" }],
    }),

    /**
     * PATCH /affiliate-links/<pk>/
     * AffiliateLinkDetailView.update (ADMIN)
     */
    updateAffiliateLink: build.mutation<
      AffiliateLinkDto,
      { id: number; data: AffiliateLinkUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/affiliate-links/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "AffiliateLink" as const, id },
        { type: "AffiliateLink" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /affiliate-links/<pk>/
     * AffiliateLinkDetailView.destroy (ADMIN)
     */
    deleteAffiliateLink: build.mutation<BaseApiSuccess, number>({
      query: (id) => ({
        url: `/affiliate-links/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "AffiliateLink" as const, id },
        { type: "AffiliateLink" as const, id: "LIST" },
      ],
    }),

    /**
     * GET /admin/analytics/
     * analytics_view (ADMIN)
     */
    getAnalyticsOverview: build.query<AnalyticsOverviewResponse, void>({
      query: () => "/analytics/",
      providesTags: ["AnalyticsOverview"],
    }),

    /**
     * GET /admin/analytics/monthly/
     * monthly_analytics_view (ADMIN)
     */
    getMonthlyAnalytics: build.query<
      MonthlyAnalyticsDto[],
      QueryParams | undefined
    >({
      query: (params) =>
        `/analytics/monthly/${buildQueryString(params)}`,
      providesTags: ["MonthlyAnalytics"],
    }),

    /**
     * GET /admin/database/stats/
     * DatabaseStatsView (ADMIN)
     */
    getDatabaseStats: build.query<DatabaseStatsResponse, void>({
      query: () => "/database/stats/",
      providesTags: ["DatabaseStats"],
    }),

    /**
     * POST /outbound/
     * track_outbound_click
     */
    trackOutboundClick: build.mutation<
      OutboundClickDto,
      TrackOutboundClickPayload
    >({
      query: (body) => ({
        url: "/outbound/",
        method: "POST",
        body,
      }),
    }),

    /**
     * POST /article-view/
     * track_article_view
     */
    trackArticleView: build.mutation<
      ArticleViewDto,
      TrackArticleViewPayload
    >({
      query: (body) => ({
        url: "/article-view/",
        method: "POST",
        body,
      }),
    }),

    /**
     * POST /upload/
     * upload_image_view
     */
    uploadImage: build.mutation<UploadImageResponse, FormData>({
      query: (formData) => ({
        url: "/upload/",
        method: "POST",
        body: formData,
      }),
    }),

    /**
     * POST /email/test/
     * test_email_view
     */
    sendTestEmail: build.mutation<TestEmailResponse, TestEmailRequest>({
      query: (body) => ({
        url: "/email/test/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useSearchQuery,
  useListAffiliateLinksQuery,
  useGetAffiliateLinkQuery,
  useCreateAffiliateLinkMutation,
  useUpdateAffiliateLinkMutation,
  useDeleteAffiliateLinkMutation,
  useGetAnalyticsOverviewQuery,
  useGetMonthlyAnalyticsQuery,
  useGetDatabaseStatsQuery,
  useTrackOutboundClickMutation,
  useTrackArticleViewMutation,
  useSendTestEmailMutation,
  useUploadImageMutation,
} = miscApi;
