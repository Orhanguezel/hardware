// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/tags.endpoints.ts
// Django TagListCreateView / TagDetailView için RTK Query endpoints
// =============================================================

import { hardwareApi } from "../baseApi";
import type { QueryParams } from "@/lib/api-config";
import { buildQueryString } from "@/lib/api-config";
import type { PaginatedResult } from "../types/common.types";
import type {
  TagDto,
  TagCreatePayload,
  TagUpdatePayload,
} from "../types/tag.types";

export const tagsApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * GET /tags/
     * TagListCreateView
     * DRF default pagination:
     *   { count, next, previous, results: TagDto[] }
     * ya da direkt TagDto[]
     */
    listTags: build.query<PaginatedResult<TagDto> | TagDto[], QueryParams | void>({
      query: (params: QueryParams | void) => {
        const qs = params ? buildQueryString(params) : "";
        return `/tags/${qs}`;
      },
      providesTags: (result) => {
        const items: TagDto[] | undefined = Array.isArray(result)
          ? result
          : result?.results;

        if (items && items.length > 0) {
          return [
            ...items.map((t) => ({
              type: "Tag" as const,
              id: t.id,
            })),
            { type: "Tag" as const, id: "LIST" },
          ];
        }

        return [{ type: "Tag" as const, id: "LIST" }];
      },
    }),

    /**
     * POST /tags/
     * TagListCreateView – yeni tag oluşturma
     * Body: { name, slug, type? }
     */
    createTag: build.mutation<TagDto, TagCreatePayload>({
      query: (data) => ({
        url: "/tags/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),

    /**
     * GET /tags/<slug:slug>/
     * TagDetailView – slug ile detay
     */
    getTagBySlug: build.query<TagDto, string>({
      query: (slug) => `/tags/${slug}/`,
      providesTags: (_res, _err, slug) => [
        { type: "Tag" as const, id: `slug-${slug}` },
      ],
    }),

    /**
     * PUT /tags/<slug:slug>/
     * TagDetailView – slug ile update
     */
    updateTagBySlug: build.mutation<
      TagDto,
      { slug: string; data: TagUpdatePayload }
    >({
      query: ({ slug, data }) => ({
        url: `/tags/${slug}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { slug }) => [
        { type: "Tag" as const, id: `slug-${slug}` },
        { type: "Tag" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /tags/<slug:slug>/
     * TagDetailView – slug ile silme
     */
    deleteTagBySlug: build.mutation<void, string>({
      query: (slug) => ({
        url: `/tags/${slug}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, slug) => [
        { type: "Tag" as const, id: `slug-${slug}` },
        { type: "Tag" as const, id: "LIST" },
      ],
    }),

    /**
     * GET /tags/id/<int:pk>/
     * TagDetailView – ID ile detay
     */
    getTagById: build.query<TagDto, number>({
      query: (id) => `/tags/id/${id}/`,
      providesTags: (_res, _err, id) => [
        { type: "Tag" as const, id },
      ],
    }),

    /**
     * PUT /tags/id/<int:pk>/
     * TagDetailView – ID ile update
     */
    updateTagById: build.mutation<
      TagDto,
      { id: number; data: TagUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/tags/id/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Tag" as const, id },
        { type: "Tag" as const, id: "LIST" },
      ],
    }),

    /**
     * DELETE /tags/id/<int:pk>/
     * TagDetailView – ID ile silme
     */
    deleteTagById: build.mutation<void, number>({
      query: (id) => ({
        url: `/tags/id/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Tag" as const, id },
        { type: "Tag" as const, id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListTagsQuery,
  useCreateTagMutation,
  useGetTagBySlugQuery,
  useUpdateTagBySlugMutation,
  useDeleteTagBySlugMutation,
  useGetTagByIdQuery,
  useUpdateTagByIdMutation,
  useDeleteTagByIdMutation,
} = tagsApi;
