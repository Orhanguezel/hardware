// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/settings.endpoints.ts
// =============================================================

import { hardwareApi } from "../baseApi";
import type { ApiItemResponse, ApiListResponse } from "../baseApi";
import type { QueryParams } from "@/lib/api-config";
import { buildQueryString } from "@/lib/api-config";

/**
 * SettingSerializer
 * fields = [
 *  "id", "key", "value", "description",
 *  "category", "is_file", "created_at", "updated_at"
 * ]
 */
export interface Setting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  category: string | null;
  is_file: boolean;
  created_at: string;
  updated_at: string;
}

/** Yeni kayıt oluştururken kullanılacak payload */
export interface SettingCreatePayload {
  key: string;
  value: string;
  description?: string;
  category?: string;
  is_file?: boolean;
}

/** Güncelleme payload’ı (key URL’de) */
export interface SettingUpdatePayload {
  value?: string;
  description?: string;
  category?: string;
  is_file?: boolean;
}

/** /settings/bulk/ GET dönen her bir setting değeri */
export interface BulkSettingInfo {
  value: string | number | boolean | null;
  description: string | null;
  is_file: boolean;
}

/** /settings/bulk/ GET -> data */
export type BulkSettingsData = {
  [category: string]: {
    [key: string]: BulkSettingInfo;
  };
};

/** /settings/bulk/ POST -> gönderilecek settings gövdesi */
export type SettingsBulkUpdateBody = {
  [category: string]: {
    [key: string]: string | number | boolean | null;
  };
};

/** RTK mutation input tipi – FormData’ya çevrilecek */
export interface SettingsBulkUpdatePayload {
  settings: SettingsBulkUpdateBody;
  logo_file?: File | Blob | null;
  favicon_file?: File | Blob | null;
}

/** /settings/bulk/ POST -> data (updated_settings) */
export type SettingsBulkUpdateResult = {
  [category: string]: {
    [key: string]: string; // Setting.value
  };
};

/** /settings/public/ için item */
export interface PublicSettingValue {
  value: string;
  is_file: boolean;
}

/** public_settings_view -> data */
export type PublicSettings = Record<string, PublicSettingValue>;

export const settingsApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /settings/
     * SettingListCreateView
     * – admin/editör için filtrelenebilir liste
     */
    listSettings: build.query<ApiListResponse<Setting>, QueryParams | void>({
      query: (params) => `/settings/${buildQueryString(params)}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((s) => ({
                type: "Setting" as const,
                id: s.key,
              })),
              { type: "Setting" as const, id: "LIST" },
            ]
          : [{ type: "Setting" as const, id: "LIST" }],
    }),

    /**
     * POST /settings/
     * SettingListCreateView.create
     */
    createSetting: build.mutation<ApiItemResponse<Setting>, SettingCreatePayload>({
      query: (body) => ({
        url: "/settings/",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Setting" as const, id: "LIST" }],
    }),

    /**
     * GET /settings/<key>/
     * SettingDetailView.retrieve
     */
    getSetting: build.query<ApiItemResponse<Setting>, string>({
      query: (key) => `/settings/${key}/`,
      providesTags: (_res, _err, key) => [
        { type: "Setting" as const, id: key },
      ],
    }),

    /**
     * PATCH /settings/<key>/
     * SettingDetailView.update
     */
    updateSetting: build.mutation<
      ApiItemResponse<Setting>,
      { key: string; data: SettingUpdatePayload }
    >({
      query: ({ key, data }) => ({
        url: `/settings/${key}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { key }) => [
        { type: "Setting" as const, id: key },
        { type: "Setting" as const, id: "LIST" },
        { type: "Setting" as const, id: "BULK" },
      ],
    }),

    /**
     * DELETE /settings/<key>/
     * SettingDetailView.destroy
     */
    deleteSetting: build.mutation<ApiItemResponse<unknown>, string>({
      query: (key) => ({
        url: `/settings/${key}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, key) => [
        { type: "Setting" as const, id: key },
        { type: "Setting" as const, id: "LIST" },
        { type: "Setting" as const, id: "BULK" },
      ],
    }),

    /**
     * GET /settings/bulk/
     * settings_bulk_view – grouped_settings + defaults
     * Response: { success, data: BulkSettingsData }
     */
    getBulkSettings: build.query<
      ApiItemResponse<BulkSettingsData>,
      void
    >({
      query: () => "/settings/bulk/",
      providesTags: [{ type: "Setting" as const, id: "BULK" }],
    }),

    /**
     * POST /settings/bulk/
     * settings_bulk_view – FormData üzerinden toplu update + file upload
     * Body:
     *   - settings: JSON.stringify(SettingsBulkUpdateBody)
     *   - logo_file?: File
     *   - favicon_file?: File
     * Response: { success, message, data: SettingsBulkUpdateResult }
     */
    bulkUpdateSettings: build.mutation<
      ApiItemResponse<SettingsBulkUpdateResult>,
      SettingsBulkUpdatePayload
    >({
      query: ({ settings, logo_file, favicon_file }) => {
        const form = new FormData();
        form.append("settings", JSON.stringify(settings));

        if (logo_file) {
          form.append("logo_file", logo_file);
        }
        if (favicon_file) {
          form.append("favicon_file", favicon_file);
        }

        return {
          url: "/settings/bulk/",
          method: "POST",
          body: form,
        };
      },
      invalidatesTags: [
        { type: "Setting" as const, id: "LIST" },
        { type: "Setting" as const, id: "BULK" },
      ],
    }),

    /**
     * GET /settings/public/
     * public_settings_view – auth gereksiz, sadece public key'ler
     * Response: { success, data: PublicSettings }
     */
    getPublicSettings: build.query<
      ApiItemResponse<PublicSettings>,
      void
    >({
      query: () => "/settings/public/",
      providesTags: ["PublicSetting"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListSettingsQuery,
  useCreateSettingMutation,
  useGetSettingQuery,
  useUpdateSettingMutation,
  useDeleteSettingMutation,
  useGetBulkSettingsQuery,
  useBulkUpdateSettingsMutation,
  useGetPublicSettingsQuery,
} = settingsApi;
