// src/app/products/by-slug/[slug]/page.tsx

import ProductPageClient from "./ProductPageClient";

export default function Page(props: any) {
  const slug =
    typeof props?.params?.slug === "string" ? props.params.slug : "";

  return <ProductPageClient slug={slug} />;
}
