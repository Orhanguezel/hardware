// =============================================================
// FILE: src/integrations/hardware/rtk/types/favorite.types.ts
// Django Favorite + FavoriteSerializer tipleri
// =============================================================

import type { ProductDto } from "./product.types";

export interface FavoriteDto {
  id: number;
  /**
   * FavoriteSerializer'da user read_only olduğu için
   * varsayılan olarak User PK (number) döner.
   */
  user: number;
  /**
   * ProductSerializer(read_only=True) ile gelen ürün nesnesi
   */
  product: ProductDto;
  created_at: string;
}

/**
 * Favorite oluşturma payload'u
 * FavoriteSerializer:
 *   product_id = IntegerField(write_only=True)
 */
export interface FavoriteCreatePayload {
  product_id: number;
}
