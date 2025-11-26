// =============================================================
// FILE: src/lib/api.ts
// =============================================================
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  buildQueryString,
  DJANGO_API_URL_BROWSER,
} from "./api-config";

type JsonObject = Record<string, unknown>;

// Backend'deki login response'unun gerçek şekli:
interface LoginApiResponse {
  success: boolean;
  token?: string;
  user?: unknown;
  email_verification_required?: boolean;
  email?: string;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;

    if (typeof window !== "undefined") {
      this.token = window.localStorage.getItem("auth_token");
    }
  }

  /** Dışarıdan token senkronizasyonu için */
  public setToken(token: string | null) {
    this.token = token;

    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage.setItem("auth_token", token);
      } else {
        window.localStorage.removeItem("auth_token");
      }
    }
  }

  private buildHeaders(optionsHeaders?: HeadersInit): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (optionsHeaders) {
      if (optionsHeaders instanceof Headers) {
        optionsHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(optionsHeaders)) {
        for (const [key, value] of optionsHeaders) {
          headers[key] = value;
        }
      } else {
        Object.assign(headers, optionsHeaders);
      }
    }

    // Login dışındaki isteklerde Authorization header
    if (this.token) {
      headers.Authorization = `Token ${this.token}`;
    }

    return headers;
  }

  private async request<TResponse>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<TResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(options.headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({}))) as Partial<ApiResponse<unknown>>;
      throw new Error(
        (errorData && errorData.error) ||
          `HTTP error! status: ${response.status}`,
      );
    }

    const data = (await response.json()) as TResponse;
    return data;
  }

  /* ---------- Authentication ---------- */

  async login(email: string, password: string) {
    // Backend gerçekten { success, token, user, ... } döndürüyor
    const response = await this.request<LoginApiResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    // logout endpoint'in de ApiResponse pattern'i kullanıyorsa:
    await this.request<ApiResponse>("/auth/logout/", {
      method: "POST",
    });

    this.setToken(null);
  }

  /* ---------- Categories ---------- */

  async getCategories(params?: QueryParams) {
    const qs = buildQueryString(params);
    return this.request<PaginatedResponse<unknown>>(`/categories/${qs}`);
  }

  async getCategory(slug: string) {
    return this.request<ApiResponse<unknown>>(`/categories/${slug}/`);
  }

  /* ---------- Products ---------- */

  async getProducts(params?: QueryParams) {
    const qs = buildQueryString(params);
    return this.request<PaginatedResponse<unknown>>(`/products/${qs}`);
  }

  async getProduct(slug: string) {
    return this.request<ApiResponse<unknown>>(`/products/${slug}/`);
  }

  /* ---------- Articles ---------- */

  async getArticles(params?: QueryParams) {
    const qs = buildQueryString(params);
    return this.request<PaginatedResponse<unknown>>(`/articles/${qs}`);
  }

  async getArticle(slug: string) {
    return this.request<ApiResponse<unknown>>(`/articles/${slug}/`);
  }

  /* ---------- Comments ---------- */

  async getComments(params?: QueryParams) {
    const qs = buildQueryString(params);
    return this.request<PaginatedResponse<unknown>>(`/comments/${qs}`);
  }

  async createComment(commentData: JsonObject) {
    return this.request<ApiResponse<unknown>>("/comments/", {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  /* ---------- Search ---------- */

  async search(query: string) {
    return this.request<ApiResponse<unknown>>(
      `/search/?q=${encodeURIComponent(query)}`,
    );
  }

  /* ---------- Favorites ---------- */

  async getFavorites() {
    return this.request<PaginatedResponse<unknown>>("/favorites/");
  }

  async addFavorite(productId: number) {
    return this.request<ApiResponse<unknown>>("/favorites/", {
      method: "POST",
      body: JSON.stringify({ product: productId }),
    });
  }

  async removeFavorite(favoriteId: number) {
    return this.request<ApiResponse<unknown>>(`/favorites/${favoriteId}/`, {
      method: "DELETE",
    });
  }

  /* ---------- Outbound click tracking ---------- */

  async trackOutboundClick(data: JsonObject) {
    return this.request<ApiResponse<unknown>>("/outbound/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(DJANGO_API_URL_BROWSER);
export default apiClient;
