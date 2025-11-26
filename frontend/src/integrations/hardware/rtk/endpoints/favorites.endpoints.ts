// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/favorites.endpoints.ts
// Django Favorite view'lerine birebir uygun RTK endpointleri
// =============================================================

import { hardwareApi } from "../baseApi";
import type { ApiItemResponse, ApiListResponse } from "../baseApi";
import type {
  FavoriteDto,
  FavoriteCreatePayload,
} from "../types/favorite.types";

export const favoritesApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /favorites/
     * FavoriteListCreateView
     * -> Current user'ın tüm favorileri
     * Serializer: FavoriteSerializer (product nested ProductSerializer)
     */
    listFavorites: build.query<ApiListResponse<FavoriteDto>, void>({
      query: () => "/favorites/",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((f) => ({
                type: "Favorite" as const,
                id: f.id,
              })),
              { type: "Favorite" as const, id: "LIST" },
            ]
          : [{ type: "Favorite" as const, id: "LIST" }],
    }),

    /**
     * GET /favorites/<pk>/
     * FavoriteDetailView
     */
    getFavorite: build.query<ApiItemResponse<FavoriteDto>, number>({
      query: (id) => `/favorites/${id}/`,
      providesTags: (_res, _err, id) => [
        { type: "Favorite" as const, id },
      ],
    }),

    /**
     * POST /favorites/
     * FavoriteListCreateView.create
     * Body: { product_id }
     */
    addFavorite: build.mutation<
      ApiItemResponse<FavoriteDto>,
      FavoriteCreatePayload
    >({
      query: (body) => ({
        url: "/favorites/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Favorite" as const, id: "LIST" }],
    }),

    /**
     * DELETE /favorites/<pk>/
     * FavoriteDetailView.destroy
     */
    removeFavorite: build.mutation<void, number>({
      query: (id) => ({
        url: `/favorites/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Favorite" as const, id },
        { type: "Favorite" as const, id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListFavoritesQuery,
  useGetFavoriteQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
