// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/admin_dashboard.endpoints.ts
// =============================================================

import { hardwareApi } from "../baseApi";
import type {
  AdminDashboardData,
  DashboardStats,
  RecentArticle,
  RecentComment,
} from "../types/admin_dashboard.types";

// Django’dan GERÇEKTEN gelen response tipi
interface DjangoAdminDashboardResponse {
  success: boolean;
  message?: string;
  data?: {
    overview: {
      total_articles: number;
      published_articles: number;
      total_products: number;
      total_users: number;
      total_comments: number;
      approved_comments: number;
    };
    recent_articles: any[];
    recent_products: any[];
  };
}

export const adminDashboardApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminDashboard: build.query<AdminDashboardData, void>({
      query: () => "/dashboard/",
      transformResponse: (response: DjangoAdminDashboardResponse) => {
        if (!response?.success || !response.data) {
          throw new Error(response.message || "Dashboard verisi alınamadı.");
        }

        const { overview, recent_articles } = response.data;

        // ---- stats’i doldur ----
        const stats: DashboardStats = {
          totalArticles: overview.total_articles ?? 0,
          publishedArticles: overview.published_articles ?? 0,
          // taslak = toplam - yayında
          draftArticles:
            (overview.total_articles ?? 0) -
            (overview.published_articles ?? 0),

          totalUsers: overview.total_users ?? 0,
          totalComments: overview.total_comments ?? 0,
          // pending = total - approved
          pendingComments:
            (overview.total_comments ?? 0) -
            (overview.approved_comments ?? 0),

          totalProducts: overview.total_products ?? 0,
          totalCategories: 0, // backend bunu göndermiyor, istersen sonra eklersin

          // şimdilik hepsi 0; monthly analytics endpoint’inden sonra doldurulur
          views: 0,
          affiliateClicks: 0,
          newUsers: 0,
          newComments: 0,
        };

        // ---- recent_articles → recentArticles ----
        const recentArticles: RecentArticle[] = recent_articles.map(
          (a: any): RecentArticle => ({
            id: a.id,
            title: a.title,
            status: a.status,
            author: {
              name:
                a.author?.name ||
                [a.author?.first_name, a.author?.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                a.author_name ||
                "Bilinmiyor",
            },
            created_at: a.created_at,
            comment_count: a.comment_count ?? a.comments_count ?? 0,
          })
        );

        // ---- backend şu an recent comments göndermiyor ----
        const recentComments: RecentComment[] = [];

        const normalized: AdminDashboardData = {
          stats,
          recentArticles,
          recentComments,
        };

        return normalized;
      },
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminDashboardQuery } = adminDashboardApi;
