// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/categories.endpoints.ts
// Django CategoryListCreateView & CategoryDetailView için RTK endpoints
// =============================================================

import { hardwareApi } from "../baseApi";
import type { QueryParams } from "@/lib/api-config";
import { buildQueryString } from "@/lib/api-config";
import type { PaginatedResult } from "../types/common.types";
import type { Category } from "../types/category.types";

// Yazma payload'u – serializer ile eşleşecek alanlar
export interface CategoryWritePayload {
  name: string;
  slug: string;
  parent?: number | null;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export const categoriesApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /categories/
     * CategoryListCreateView
     * - Global pagination açıksa: PaginatedResult<Category>
     * - Kapalıysa: Category[]
     */
    listCategories: build.query<
      PaginatedResult<Category> | Category[],
      QueryParams | void
    >({
      query: (params) => `/categories/${buildQueryString(params)}`,
      providesTags: (result) => {
        const items: Category[] | undefined = Array.isArray(result)
          ? result
          : result?.results;

        if (items && items.length > 0) {
          return [
            ...items.map((c) => ({
              type: "Category" as const,
              id: c.id,
            })),
            { type: "Category" as const, id: "LIST" },
          ];
        }

        return [{ type: "Category" as const, id: "LIST" }];
      },
    }),

    /**
     * POST /categories/
     * CategoryListCreateView – yeni kategori oluşturma
     */
    createCategory: build.mutation<Category, CategoryWritePayload>({
      query: (data) => ({
        url: "/categories/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    /**
     * GET /categories/<slug:slug>/
     * CategoryDetailView (slug tabanlı)
     */
    getCategoryBySlug: build.query<Category, string>({
      query: (slug) => `/categories/${slug}/`,
      providesTags: (_res, _err, slug) => [
        { type: "Category" as const, id: `slug-${slug}` },
      ],
    }),

    /**
     * GET /categories/id/<int:pk>/
     * CategoryDetailView (ID tabanlı)
     */
    getCategoryById: build.query<Category, number>({
      query: (id) => `/categories/id/${id}/`,
      providesTags: (_res, _err, id) => [{ type: "Category" as const, id }],
    }),

    /**
     * PUT /categories/id/<int:pk>/
     * CategoryDetailView – ID ile update
     */
    updateCategory: build.mutation<
      Category,
      { id: number; data: CategoryWritePayload }
    >({
      query: ({ id, data }) => ({
        url: `/categories/id/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Category" as const, id },
        { type: "Category" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /categories/id/<int:pk>/
     * CategoryDetailView – ID ile silme
     */
    deleteCategory: build.mutation<void, number>({
      query: (id) => ({
        url: `/categories/id/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Category" as const, id },
        { type: "Category" as const, id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useGetCategoryBySlugQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
