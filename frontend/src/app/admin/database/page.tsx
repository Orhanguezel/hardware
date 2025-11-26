// =============================================================
// FILE: src/app/admin/database/page.tsx
// =============================================================

"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Database,
  Table,
  Eye,
  Edit,
  RefreshCw,
  Users,
  Package,
  FolderTree,
  Star,
} from "lucide-react";

import {
  useGetDatabaseStatsQuery,
  type DatabaseStatsResponse,
  type DatabaseTableInfo,
  type DatabaseInfo,
} from "@/integrations/hardware/rtk/endpoints/misc.endpoints";

export default function DatabasePage() {
  // RTK Query – db stats
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsIsError,
    error: statsError,
    refetch,
  } = useGetDatabaseStatsQuery();

  const [manualError, setManualError] = useState<string | null>(null);

  // RTK data’yı tipli kullan
  const rawStats = statsData as DatabaseStatsResponse | undefined;

  const tables: DatabaseTableInfo[] = Array.isArray(rawStats?.tables)
    ? rawStats!.tables
    : [];

  const databaseInfo: DatabaseInfo | null = rawStats?.database_info ?? null;

  // Backend’ten gelen 403 / 401 durumunu yakala
  let apiErrorFromBackend: string | null = null;
  const errAny = statsError as any;
  if (errAny && typeof errAny === "object" && "status" in errAny) {
    if (errAny.status === 401 || errAny.status === 403) {
      const backendMsg =
        typeof errAny.data === "object" && errAny.data && "error" in errAny.data
          ? (errAny.data.error as string)
          : null;
      apiErrorFromBackend =
        backendMsg ??
        "Bu sayfaya erişim yetkiniz bulunmuyor. Lütfen Super Admin hesabı ile giriş yapın.";
    }
  }

  const errorMessage =
    manualError ||
    apiErrorFromBackend ||
    (statsIsError
      ? "Veritabanı istatistikleri alınırken bir hata oluştu."
      : null);

  const handleRefresh = async () => {
    setManualError(null);
    try {
      await refetch().unwrap();
    } catch (err) {
      console.error("Error refetching db stats:", err);
      setManualError("Veritabanı bilgileri yenilenirken bir hata oluştu.");
    }
  };

  // DB stats yükleniyorken
  if (statsLoading && !statsData && !errorMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Veritabanı Yönetimi</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Veritabanı bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Eğer backend 401/403 döndüyse ya da başka bir hata varsa, üstte göstereceğiz
  const tableDescriptions: Record<string, string> = {
    User: "Kullanıcılar ve yetkilendirme bilgileri",
    Category: "Ürün ve makale kategorileri",
    Article: "Site içeriği ve makaleler",
    Product: "Ürün bilgileri ve özellikleri",
    ProductSpec: "Ürün teknik özellikleri",
    PriceHistory: "Ürün fiyat geçmişi",
    UserReview: "Kullanıcı yorumları ve puanları",
    Comment: "Makale yorumları",
    Tag: "Etiketler ve kategorizasyon",
    ProductTag: "Ürün-etiket ilişkileri",
    ProductComparison: "Ürün karşılaştırmaları",
    AffiliateLink: "Satış ortaklığı bağlantıları",
    OutboundClick: "Dış bağlantı tıklama istatistikleri",
  };

  // Boyut hesaplama (backend size_mb vermezse size_bytes'tan hesapla)
  const databaseSizeMb =
    databaseInfo?.size_mb ??
    (databaseInfo?.size_bytes
      ? Number((databaseInfo.size_bytes / (1024 * 1024)).toFixed(2))
      : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veritabanı Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            PostgreSQL veritabanı istatistikleri ve yönetimi
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button asChild>
            <Link href="/admin/database/studio" target="_blank">
              <Database className="w-4 h-4 mr-2" />
              PostgreSQL&apos;i Aç
            </Link>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <Database className="w-5 h-5" />
              <span className="font-medium">Hata:</span>
              <span>{errorMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backend 403 verirse tables boş olur, aşağısı zaten render edilse de veri görmezsin */}
      {databaseInfo && !apiErrorFromBackend && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              PostgreSQL Veritabanı Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Sürüm
                </h4>
                <p className="text-lg font-mono">{databaseInfo.version}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Boyut
                </h4>
                <p className="text-lg font-mono">{databaseSizeMb} MB</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Toplam Tablo
                </h4>
                <p className="text-lg font-mono">{tables.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!apiErrorFromBackend && (
        <>
          {/* Table list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <Card
                key={table.name}
                className={`hover:shadow-md transition-shadow ${
                  table.error ? "border-red-200 bg-red-50" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Table className="w-5 h-5" />
                      {table.name}
                    </CardTitle>
                    <Badge
                      variant={table.error ? "destructive" : "secondary"}
                    >
                      {table.error ? "Hata" : `${table.count} kayıt`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-2">
                    {tableDescriptions[table.name] || "Veritabanı tablosu"}
                  </p>
                  {table.table_name && (
                    <p className="text-xs text-muted-foreground mb-4 font-mono">
                      Tablo: {table.table_name}
                    </p>
                  )}
                  {table.error && (
                    <p className="text-xs text-red-600 mb-4">
                      Hata: {table.error}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/database/studio?table=${table.name}`}
                        target="_blank"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Görüntüle
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/admin/database/studio?table=${table.name}&mode=edit`}
                        target="_blank"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Düzenle
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link
                    href="/admin/database/studio?table=User"
                    target="_blank"
                  >
                    <div className="text-center">
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">Kullanıcılar</div>
                      <div className="text-sm text-muted-foreground">Yönet</div>
                    </div>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link
                    href="/admin/database/studio?table=Product"
                    target="_blank"
                  >
                    <div className="text-center">
                      <Package className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">Ürünler</div>
                      <div className="text-sm text-muted-foreground">Yönet</div>
                    </div>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link
                    href="/admin/database/studio?table=Category"
                    target="_blank"
                  >
                    <div className="text-center">
                      <FolderTree className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">Kategoriler</div>
                      <div className="text-sm text-muted-foreground">Yönet</div>
                    </div>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link
                    href="/admin/database/studio?table=UserReview"
                    target="_blank"
                  >
                    <div className="text-center">
                      <Star className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">Yorumlar</div>
                      <div className="text-sm text-muted-foreground">Yönet</div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
