"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
  Database,
  Table,
  Users,
  Package,
  FolderTree,
  Star,
  MessageSquare,
  Tag,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function DatabaseStudioPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchParams = useSearchParams();

  const table = searchParams.get("table");
  // mode şu an kullanılmıyor; alınsa bile kullanmadan bırakmak yerine hiç okumayalım
  // const mode = searchParams.get("mode");

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Django admin paneli URL'i
  const adminUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:8000/admin"
      : "/admin";

  // Tablo adlarını Django model adlarına çevir (main app ile)
  const getModelName = (tableName: string): string => {
    const modelMap: Record<string, string> = {
      User: "main/user",
      Category: "main/category",
      Article: "main/article",
      Product: "main/product",
      ProductSpec: "main/productspec",
      PriceHistory: "main/pricehistory",
      UserReview: "main/userreview",
      Comment: "main/comment",
      Tag: "main/tag",
      ProductTag: "main/producttag",
      ProductComparison: "main/productcomparison",
      AffiliateLink: "main/affiliatelink",
      OutboundClick: "main/outboundclick",
      Setting: "main/setting",
      ReviewExtra: "main/reviewextra",
      BestListExtra: "main/bestlistextra",
      CompareExtra: "main/compareextra",
      Favorite: "main/favorite",
      Notification: "main/notification",
    };

    return modelMap[tableName] ?? `main/${tableName.toLowerCase()}`;
  };

  // Tablo ikonları (tipli)
  const getTableIcon = (tableName: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      User: Users,
      Category: FolderTree,
      Article: MessageSquare,
      Product: Package,
      ProductSpec: Settings,
      PriceHistory: Settings,
      UserReview: Star,
      Comment: MessageSquare,
      Tag,
      ProductTag: Tag,
      ProductComparison: Settings,
      AffiliateLink: ExternalLink,
      OutboundClick: ExternalLink,
      Setting: Settings,
    };

    return iconMap[tableName] ?? Table;
  };

  // Tablo açıklamaları
  const getTableDescription = (tableName: string): string => {
    const descriptions: Record<string, string> = {
      User: "Kullanıcı hesapları ve yetkilendirme bilgileri",
      Category: "Ürün ve makale kategorileri",
      Article: "Site içeriği, makaleler ve rehberler",
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
      Setting: "Sistem ayarları",
    };

    return descriptions[tableName] ?? "Veritabanı tablosu";
  };

  // Eğer belirli bir tablo seçilmişse, o tabloya yönlendir
  const getTableUrl = (): string => {
    if (table) {
      const modelName = getModelName(table);
      return `${adminUrl}/${modelName}/`;
    }
    return adminUrl;
  };

  const TableIcon = table ? getTableIcon(table) : Table;

  return (
    <div
      className={
        isFullscreen ? "fixed inset-0 z-50 bg-background" : "space-y-6"
      }
    >
      {!isFullscreen && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/database">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Database className="w-8 h-8" />
                Veritabanı Yönetimi
              </h1>
              <p className="text-muted-foreground mt-2">
                Django Admin Panel ile PostgreSQL veritabanını yönetin
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleFullscreen} variant="outline" size="sm">
              <Maximize2 className="w-4 h-4 mr-2" />
              Tam Ekran
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={getTableUrl()} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Yeni Sekmede Aç
              </a>
            </Button>
          </div>
        </div>
      )}

      {isFullscreen && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button onClick={toggleFullscreen} variant="outline" size="sm">
              <Minimize2 className="w-4 h-4 mr-2" />
              Küçült
            </Button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6" />
              Veritabanı Yönetimi - Tam Ekran
            </h2>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a
                href={getTableUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Django Admin&apos;i Aç
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`${adminUrl}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Database className="w-4 h-4 mr-2" />
                Ana Panel
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Tablo seçimi */}
      {table && !isFullscreen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TableIcon className="w-5 h-5" />
              {table} Tablosu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {getTableDescription(table)}
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <a
                  href={`${adminUrl}/${getModelName(table)}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Table className="w-4 h-4 mr-2" />
                  Tabloyu Görüntüle
                </a>
              </Button>
              <Button asChild variant="outline">
                <a
                  href={`${adminUrl}/${getModelName(table)}/add/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yeni Kayıt Ekle
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card
        className={isFullscreen ? "h-[calc(100vh-80px)]" : "h-[600px]"}
      >
        <CardContent className="p-8 h-full flex flex-col items-center justify-center">
          <div className="text-center max-w-2xl">
            <Database className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl font-bold mb-4">Django Admin Panel</h3>
            <p className="text-muted-foreground mb-6">
              Django Admin Panel güvenlik politikaları nedeniyle iframe içinde
              yüklenemiyor. Aşağıdaki butonları kullanarak yeni sekmede
              açabilirsiniz.
            </p>

            {table && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TableIcon className="w-5 h-5" />
                  {table} Tablosu
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {getTableDescription(table)}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button asChild>
                    <a
                      href={`${adminUrl}/${getModelName(table)}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Table className="w-4 h-4 mr-2" />
                      Tabloyu Görüntüle
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <a
                      href={`${adminUrl}/${getModelName(table)}/add/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Yeni Kayıt Ekle
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <a
                  href={getTableUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Django Admin Panel&apos;i Aç
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href={`${adminUrl}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Ana Admin Paneli
                </a>
              </Button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Güvenlik Notu
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Django Admin Panel güvenlik nedeniyle iframe içinde
                yüklenemiyor. Bu, verilerinizin güvenliğini artırır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isFullscreen && (
        <Card>
          <CardHeader>
            <CardTitle>Django Admin Panel Kullanım İpuçları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Temel İşlemler</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Modelleri görüntülemek için sol menüden seçin</li>
                  <li>• Yeni kayıt eklemek için &quot;ADD&quot; butonunu kullanın</li>
                  <li>• Kayıtları düzenlemek için üzerine tıklayın</li>
                  <li>
                    • Kayıtları silmek için checkbox seçip &quot;Delete selected&quot;
                    kullanın
                  </li>
                  <li>• Arama yapmak için üst kısımdaki arama kutusunu kullanın</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Gelişmiş Özellikler</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Filtreleme için sağ taraftaki filtreleri kullanın</li>
                  <li>• Verileri CSV olarak dışa aktarabilirsiniz</li>
                  <li>• İlişkili verileri inline olarak düzenleyebilirsiniz</li>
                  <li>• Toplu işlemler yapabilirsiniz</li>
                  <li>• Veritabanı şemasını inceleyebilirsiniz</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
