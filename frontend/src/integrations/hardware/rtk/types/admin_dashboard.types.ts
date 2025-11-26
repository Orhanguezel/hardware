// =============================================================
// FILE: src/integrations/hardware/rtk/types/admin_dashboard.types.ts
// =============================================================

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalUsers: number;
  totalComments: number;
  pendingComments: number;
  totalProducts: number;
  totalCategories: number;
  views: number;
  affiliateClicks: number;
  newUsers: number;
  newComments: number;
}

export interface RecentArticle {
  id: number;
  title: string;
  status: string;
  author: {
    name: string;
  };
  created_at: string;
  comment_count?: number;
}

export interface RecentComment {
  id: number;
  content: string;
  status: string;
  author: {
    name: string;
  };
  article: {
    title: string;
  };
  created_at: string;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  recentArticles: RecentArticle[];
  recentComments: RecentComment[];
}

export interface AdminDashboardApiResponse {
  success: boolean;
  message?: string;
  data?: AdminDashboardData;
}
