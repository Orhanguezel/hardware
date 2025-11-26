// src/app/favorites/page.tsx

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, Calendar, ArrowRight } from 'lucide-react';

import { FavoriteButton } from '@/components/product/favorite-button';

import { useListFavoritesQuery } from '@/integrations/hardware/rtk/endpoints/favorites.endpoints';
import type { FavoriteDto } from '@/integrations/hardware/rtk/types/favorite.types';

const PAGE_SIZE = 12;

export default function FavoritesPage() {
  const { data: session, status } = useSession();

  // RTK query (current user favorites)
  const {
    data: favoritesRes,
    isLoading,
    isError,
  } = useListFavoritesQuery(undefined, {
    // İstersen burada auth durumuna göre skip verebilirsin
    skip: status === 'unauthenticated',
  });

  // Tüm favoriler (RTK tipi: ApiListResponse<FavoriteDto>)
  const allFavorites: FavoriteDto[] = favoritesRes?.data ?? [];

  // Client-side "Daha Fazla Yükle" için sayfa state'i
  const [page, setPage] = useState(1);

  const visibleFavorites = allFavorites.slice(0, page * PAGE_SIZE);
  const hasMore = visibleFavorites.length < allFavorites.length;

  /* ---------- Auth kontrolü ---------- */

  if (status === 'loading') {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-2 text-muted-foreground">Favoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-8">
        <div className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Favori Listesi</h1>
          <p className="mb-4 text-muted-foreground">
            Favorilerinizi görmek için giriş yapmanız gerekiyor.
          </p>
          <Button asChild>
            <Link href="/auth/signin">Giriş Yap</Link>
          </Button>
        </div>
      </div>
    );
  }

  /* ---------- İlk yükleme / hata durumları ---------- */

  if (isLoading && visibleFavorites.length === 0) {
    return (
      <div className="container py-8">
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-2 text-muted-foreground">Favoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isError && visibleFavorites.length === 0) {
    return (
      <div className="container py-8">
        <div className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-red-400" />
          <h2 className="mb-2 text-xl font-semibold">
            Favoriler yüklenirken bir hata oluştu
          </h2>
          <p className="mb-4 text-muted-foreground">
            Lütfen sayfayı yenileyip tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Asıl içerik ---------- */

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <Heart className="h-8 w-8 text-red-500" />
          Favori Listem
        </h1>
        <p className="text-muted-foreground">
          {allFavorites.length} ürün favorilerinizde
        </p>
      </div>

      {allFavorites.length === 0 ? (
        <div className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">
            Henüz favori ürününüz yok
          </h2>
          <p className="mb-4 text-muted-foreground">
            Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilerinize
            ekleyebilirsiniz.
          </p>
          <Button asChild>
            <Link href="/products">Ürünleri Keşfet</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleFavorites.map((favorite) => (
              <Card
                key={favorite.id}
                className="group transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {favorite.product.category?.name || 'Kategori Yok'}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {new Date(favorite.created_at).toLocaleDateString(
                        'tr-TR',
                      )}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                    {favorite.product.brand} {favorite.product.model}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {favorite.product.cover_image && (
                    <div className="mb-4">
                      <Image
                        src={favorite.product.cover_image}
                        alt={`${favorite.product.brand} ${favorite.product.model}`}
                        width={640}
                        height={360}
                        className="h-48 w-full rounded-md object-cover"
                      />
                    </div>
                  )}

                  <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {favorite.product.release_year || 'Bilinmiyor'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>
                        {favorite.product.review_count || 0} inceleme
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link
                        href={`/products/by-slug/${favorite.product.slug}`}
                      >
                        Detayları Gör
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                    <FavoriteButton
                      productId={favorite.product.id.toString()}
                      className="px-3"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
