// src/app/best/[slug]/page.tsx

import { BestListPageClient } from "./BestListPageClient";

type PageProps = {
  // Next'in ürettiği PageProps ile kavga etmemek için gevşek tip
  params: any;
};

export default function Page({ params }: PageProps) {
  const slug =
    typeof params?.slug === "string" ? params.slug : "";

  return <BestListPageClient slug={slug} />;
}
