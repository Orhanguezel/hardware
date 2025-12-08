import SearchPageClient from "./SearchPageClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SearchPage(props: any) {
  const searchParams =
    (props.searchParams as
      | {
        q?: string | string[];
        type?: string | string[];
        [key: string]: string | string[] | undefined;
      }
      | undefined) ?? undefined;

  const rawQ = searchParams?.q;
  const rawType = searchParams?.type;

  const q =
    typeof rawQ === "string"
      ? rawQ
      : Array.isArray(rawQ)
        ? rawQ[0] ?? ""
        : "";

  const type =
    typeof rawType === "string"
      ? rawType
      : Array.isArray(rawType)
        ? rawType[0]
        : undefined;

  return <SearchPageClient query={q} type={type} />;
}
