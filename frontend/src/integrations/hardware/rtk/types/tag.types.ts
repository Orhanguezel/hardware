// =============================================================
// FILE: src/integrations/hardware/rtk/types/tag.types.ts
// Django Tag + TagSerializer tipleri
// =============================================================

export type TagType = "GENERAL" | "BRAND" | "FEATURE" | "PRICE_RANGE" | string;

export interface TagDto {
  id: number;
  name: string;
  slug: string;
  type: TagType;
  article_count: number;
  product_count: number;
}

export interface TagCreatePayload {
  name: string;
  slug: string;
  type?: TagType;
}

export type TagUpdatePayload = Partial<TagCreatePayload>;
