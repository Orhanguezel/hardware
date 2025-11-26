'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  BarChart3,
  Star,
  Loader2,
  FileText,
  Package,
  MessageSquare,
  Link as LinkIcon,
} from 'lucide-react';

import { useGetAnalyticsOverviewQuery } from '@/integrations/hardware/rtk/endpoints/misc.endpoints';

// Bu interface'i istersen src/integrations/hardware/rtk/types/misc.types.ts
// içine alıp buradan import edebilirsin.
interface AnalyticsData {
  overview: {
    totalArticles: number;
    totalProducts: number;
    totalUsers: number;
    totalReviews: number;
    totalAffiliateLinks: number;
    totalComments: number;
    avgReviewsPerProduct: number;
    avgCommentsPerArticle: number;
  };
  recentContent: {
    articles: Array<{
      id: string;
      title: string;
      author: string;
      createdAt: string;
      commentsCount: number;
    }>;
    products: Array<{
      id: string;
      brand: string;
      model: string;
      category?: string;
      createdAt: string;
      reviewsCount: number;
      affiliateLinksCount: number;
    }>;
  };
  topCategories: Array<{
    id: string;
    name: string;
    slug: string;
    articlesCount: number;
    productsCount: number;
    totalContent: number;
  }>;
  affiliateMerchants: Array<{
    name: string;
    linksCount: number;
  }>;
}

export default function AnalyticsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAnalyticsOverviewQuery();

  // Backend response'u:
  // { success: boolean; data?: unknown; error?: string; ... }
  // olarak tanımlamıştık. Burada data.data'yı tipliyoruz.
  const analyticsData = useMemo<AnalyticsData | null>(() => {
    if (!data || !data.success || !('data' in data) || data.data == null) {
      return null;
    }
    return data.data as AnalyticsData;
  }, [data]);

  const errorMessage: string | null = useMemo(() => {
    if (isError) {
      return 'Analytics verisi alınırken bir hata oluştu.';
    }
    if (data && !data.success) {
      const maybeError =
        'error' in data && typeof data.error === 'string'
          ? data.error
          : undefined;
      return maybeError ?? 'Analytics verisi alınamadı.';
    }
    return null;
  }, [isError, data]);

  if (isLoading && !analyticsData) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Analytics yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Button onClick={() => refetch()}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Analytics verisi bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Site performansı ve içerik istatistikleri
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Makale</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalArticles}
            </div>
            <p className="text-xs text-muted-foreground">
              Yayınlanmış makale sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı ürün sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı kullanıcı sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Yorum
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalReviews}
            </div>
            <p className="text-xs text-muted-foreground">
              Onaylanmış yorum sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Affiliate Linkler
            </CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalAffiliateLinks}
            </div>
            <p className="text-xs text-muted-foreground">
              Aktif affiliate link sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Makale Yorumları
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.totalComments}
            </div>
            <p className="text-xs text-muted-foreground">
              Onaylanmış makale yorumu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ort. Ürün Yorumu
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.avgReviewsPerProduct}
            </div>
            <p className="text-xs text-muted-foreground">
              Ürün başına ortalama yorum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ort. Makale Yorumu
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.avgCommentsPerArticle}
            </div>
            <p className="text-xs text-muted-foreground">
              Makale başına ortalama yorum
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle>Son Makaleler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentContent.articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{article.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {article.author} •{' '}
                      {new Date(article.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {article.commentsCount} yorum
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Son Ürünler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentContent.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {product.brand} {product.model}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {product.category} •{' '}
                      {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.reviewsCount} yorum
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.affiliateLinksCount} link
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>En Popüler Kategoriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topCategories.slice(0, 5).map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-medium text-sm">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {category.articlesCount} makale,{' '}
                      {category.productsCount} ürün
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {category.totalContent} içerik
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Merchants */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Satıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.affiliateMerchants.slice(0, 5).map((merchant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-medium text-sm">{merchant.name}</h4>
                  </div>
                  <Badge variant="secondary">
                    {merchant.linksCount} link
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
