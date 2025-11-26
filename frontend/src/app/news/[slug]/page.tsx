// src/app/news/[slug]/page.tsx

import NewsPageClient from "./NewsPageClient";

export default function Page(props: any) {
  const slug =
    typeof props?.params?.slug === "string" ? props.params.slug : "";

  return <NewsPageClient slug={slug} />;
}
