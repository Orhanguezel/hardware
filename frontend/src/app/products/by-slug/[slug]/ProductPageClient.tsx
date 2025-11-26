// src/app/products/by-slug/[slug]/ProductPageClient.tsx

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

import { ProductDetailClient } from '@/components/product/product-detail-client';

import {
  useGetProductBySlugQuery,
} from '@/integrations/hardware/rtk/endpoints/products.endpoints';
import type { ProductDto } from '@/integrations/hardware/rtk/types/product.types';

interface ProductPageClientProps {
  slug: string;
}

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const {
    data,
    isLoading,
    isError,
  } = useGetProductBySlugQuery(slug);

  const product = data as ProductDto | undefined;

  const isInvalid = !product || !product.id;

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Ürün yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error veya ürün yok
  if (isError || isInvalid) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              Ürün bulunamadı
            </h2>
            <p className="mb-4 text-muted-foreground">
              Aradığınız ürün silinmiş veya yayından kaldırılmış olabilir.
            </p>
            <Button asChild>
              <Link href="/products">Ürünlere geri dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Başarılı durumda, detay component’ini besliyoruz
  return <ProductDetailClient product={product} />;
}
