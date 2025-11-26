// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/users.endpoints.ts
// Django User + user-specific view'lere birebir uygun RTK endpointleri
// =============================================================

import { hardwareApi } from "../baseApi";
import type { QueryParams } from "@/lib/api-config";
import { buildQueryString } from "@/lib/api-config";
import type { PaginatedResult } from "../types/common.types";
import type {
  UserDto,
  UserListItem,
  UserPublicProfile,
  UserStats,
  UserSettings,
  UserSettingsUpdatePayload,
  UserSettingsUpdateResponse,
  UserActivityItem,
  FavoriteItem,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
} from "../types/user.types";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../types/auth.types";

export const usersApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /users/
     * UserListCreateView (admin/super admin için)
     * DRF default pagination:
     * {
     *   count, next, previous, results: UserListItem[]
     * }
     */
    listUsers: build.query<PaginatedResult<UserListItem>, QueryParams | void>({
      query: (params) => `/users/${buildQueryString(params)}`,
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map((u) => ({
                type: "User" as const,
                id: u.id,
              })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    /**
     * POST /users/
     * UserListCreateView.create – admin panelden kullanıcı oluşturma
     */
    createUser: build.mutation<UserDto, AdminUserCreatePayload>({
      query: (data) => ({
        url: "/users/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "User" as const, id: "LIST" }],
    }),

    /**
     * GET /users/<id>/
     * UserDetailView
     */
    getUser: build.query<UserDto, number>({
      query: (id) => `/users/${id}/`,
      providesTags: (_res, _err, id) => [{ type: "User" as const, id }],
    }),

    /**
     * PATCH /users/<id>/
     * UserDetailView.update – admin tarafında role/status/email_verified güncelleme
     */
    updateUser: build.mutation<
      UserDto,
      { id: number; data: AdminUserUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "User" as const, id },
        { type: "User" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /users/<id>/
     * UserDetailView.destroy – admin kullanıcı silme
     */
    deleteUser: build.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "User" as const, id },
        { type: "User" as const, id: "LIST" },
      ],
    }),

    /**
     * GET /users/<id>/profile/
     * UserProfileView – public profil datası
     */
    getUserProfile: build.query<UserPublicProfile, number>({
      query: (id) => `/users/${id}/profile/`,
      providesTags: (_res, _err, id) => [{ type: "User" as const, id }],
    }),

    /**
     * GET /users/<user_id>/favorites/
     * UserFavoritesView – sadece o kullanıcının favorileri (pagination yok)
     * Response: FavoriteSerializer listesi
     */
    getUserFavorites: build.query<FavoriteItem[], number>({
      query: (userId) => `/users/${userId}/favorites/`,
      providesTags: (_res, _err, userId) => [
        { type: "User" as const, id: userId },
        { type: "Favorite" as const, id: `USER-${userId}` },
      ],
    }),

    /**
     * GET /users/<user_id>/stats/
     * UserStatsView – sadece kendi user'ına izin var
     */
    getUserStats: build.query<UserStats, number>({
      query: (userId) => `/users/${userId}/stats/`,
      providesTags: (_res, _err, userId) => [
        { type: "UserStats" as const, id: userId },
      ],
    }),

    /**
     * GET /users/<user_id>/stats/public/
     * UserPublicStatsView – public ve privacy'e göre
     */
    getUserPublicStats: build.query<UserStats, number>({
      query: (userId) => `/users/${userId}/stats/public/`,
      providesTags: (_res, _err, userId) => [
        { type: "UserStats" as const, id: `PUBLIC-${userId}` },
      ],
    }),

    /**
     * GET /users/<user_id>/settings/
     * UserSettingsView GET
     */
    getUserSettings: build.query<UserSettings, number>({
      query: (userId) => `/users/${userId}/settings/`,
      providesTags: (_res, _err, userId) => [
        { type: "UserSettings" as const, id: userId },
      ],
    }),

    /**
     * PUT /users/<user_id>/settings/
     * UserSettingsView PUT
     */
    updateUserSettings: build.mutation<
      UserSettingsUpdateResponse,
      { userId: number; data: UserSettingsUpdatePayload | FormData }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/settings/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { userId }) => [
        { type: "UserSettings" as const, id: userId },
        { type: "User" as const, id: userId },
      ],
    }),

    /**
     * GET /users/<user_id>/activity/
     * UserActivityView – son 20 aktivite
     */
    getUserActivity: build.query<UserActivityItem[], number>({
      query: (userId) => `/users/${userId}/activity/`,
      providesTags: (_res, _err, userId) => [
        { type: "UserActivity" as const, id: userId },
      ],
    }),

    /**
     * POST /users/<user_id>/change-password/
     * change_password_view
     */
    changeUserPassword: build.mutation<
      ChangePasswordResponse,
      ChangePasswordRequest
    >({
      query: ({ userId, currentPassword, newPassword }) => ({
        url: `/users/${userId}/change-password/`,
        method: "POST",
        body: {
          currentPassword,
          newPassword,
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useListUsersQuery,
  useCreateUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserProfileQuery,
  useGetUserFavoritesQuery,
  useGetUserStatsQuery,
  useGetUserPublicStatsQuery,
  useGetUserSettingsQuery,
  useUpdateUserSettingsMutation,
  useGetUserActivityQuery,
  useChangeUserPasswordMutation,
} = usersApi;
