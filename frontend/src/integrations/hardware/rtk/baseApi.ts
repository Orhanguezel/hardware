// =============================================================
// FILE: src/integrations/hardware/rtk/baseApi.ts
// Amaç: Tüm RTK Query endpoint'leri için ortak baseApi
// =============================================================

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-config";
import { DJANGO_API_URL_BROWSER } from "@/lib/api-config";
import { hardwareTagTypes } from "./tags";

export type ApiListResponse<T> = PaginatedResponse<T>;
export type ApiItemResponse<T> = ApiResponse<T>;

export const hardwareApi = createApi({
  reducerPath: "hardwareApi",
  baseQuery: fetchBaseQuery({
    baseUrl: DJANGO_API_URL_BROWSER, // Örn: https://domain.com/api
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth_token");
        if (token) {
          headers.set("Authorization", `Token ${token}`);
        }
      }

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  }),
  tagTypes: hardwareTagTypes,
  endpoints: () => ({}),
});
