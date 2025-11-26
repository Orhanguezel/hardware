// src/app/products/page.tsx

import { Suspense } from "react";
import ProductsPageClient from "./ProductsPageClient";

export default function Page(props: any) {
  const searchParams =
    (props?.searchParams as Record<
      string,
      string | string[] | undefined
    >) ?? {};

  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              <p>Ürünler yükleniyor...</p>
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageClient searchParams={searchParams} />
    </Suspense>
  );
}
