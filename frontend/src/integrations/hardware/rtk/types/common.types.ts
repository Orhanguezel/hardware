// =============================================================
// FILE: src/integrations/hardware/rtk/types/common.types.ts
// =============================================================

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
