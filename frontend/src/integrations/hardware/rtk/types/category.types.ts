// =============================================================
// FILE: src/integrations/hardware/rtk/types/category.types.ts
// Django CategorySerializer tipleri
// =============================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
  parent: number | null;
  children: Category[]; // recursive tree
  article_count: number;
  product_count: number;
  created_at: string; // ISO datetime
}
