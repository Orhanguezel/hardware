// src/app/guides/[slug]/page.tsx

import GuidePageClient from "./GuidePageClient";

export default function Page(props: any) {
  const slug =
    typeof props?.params?.slug === "string" ? props.params.slug : "";

  return <GuidePageClient slug={slug} />;
}
