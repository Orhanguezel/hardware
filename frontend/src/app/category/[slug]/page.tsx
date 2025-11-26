// src/app/category/[slug]/page.tsx

import { CategoryPageClient } from "./CategoryPageClient";

export default function Page(props: any) {
  const slug =
    typeof props?.params?.slug === "string" ? props.params.slug : "";

  const searchParams =
    (props?.searchParams as { [key: string]: string | string[] | undefined }) ??
    {};

  return <CategoryPageClient slug={slug} searchParams={searchParams} />;
}
