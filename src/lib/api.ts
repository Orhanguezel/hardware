// =========================
// frontend/src/lib/api.ts
// =========================

const isServer = typeof window === "undefined";

/**
 * Server tarafı (Next.js, build, API route’lar) için:
 *  - DJANGO_API_URL (env) yoksa 127.0.0.1:8001/api kullan
 */
export const DJANGO_API_URL =
  process.env.DJANGO_API_URL || "http://127.0.0.1:8001/api";

/**
 * Browser tarafı için:
 *  - NEXT_PUBLIC_API_URL (env) yoksa local fallback
 */
const API_BASE_URL = isServer
  ? DJANGO_API_URL
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";

/* ---------- Ortak response tipleri ---------- */

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ---------- Auth için tipler ---------- */

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  [key: string]: unknown;
}

interface AuthResponseData {
  token: string;
  user: AuthUser;
}

/* ---------- Genel amaçlı tipler ---------- */

type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

type JsonObject = Record<string, unknown>;

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
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

    if (this.token) {
      headers.Authorization = `Token ${this.token}`;
    }

    return headers;
  }

  private async request<TResponse>(
    endpoint: string,
    options: RequestInit = {}
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
          `HTTP error! status: ${response.status}`
      );
    }

    const data = (await response.json()) as TResponse;
    return data;
  }

  /* ---------- Authentication ---------- */

  async login(email: string, password: string) {
    const response = await this.request<ApiResponse<AuthResponseData>>(
      "/auth/login/",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.token);
      }
    }

    return response;
  }

  async register(userData: JsonObject) {
    const response = await this.request<ApiResponse<AuthResponseData>>(
      "/auth/register/",
      {
        method: "POST",
        body: JSON.stringify(userData),
      }
    );

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.token);
      }
    }

    return response;
  }

  async logout() {
    const response = await this.request<ApiResponse>("/auth/logout/", {
      method: "POST",
    });

    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }

    return response;
  }

  /* ---------- Categories ---------- */

  async getCategories(params?: QueryParams) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/categories/?${queryString}`
      : "/categories/";

    return this.request<PaginatedResponse<unknown>>(endpoint);
  }

  async getCategory(slug: string) {
    return this.request<ApiResponse<unknown>>(`/categories/${slug}/`);
  }

  /* ---------- Products ---------- */

  async getProducts(params?: QueryParams) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products/?${queryString}` : "/products/";

    return this.request<PaginatedResponse<unknown>>(endpoint);
  }

  async getProduct(slug: string) {
    return this.request<ApiResponse<unknown>>(`/products/${slug}/`);
  }

  /* ---------- Articles ---------- */

  async getArticles(params?: QueryParams) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/articles/?${queryString}` : "/articles/";

    return this.request<PaginatedResponse<unknown>>(endpoint);
  }

  async getArticle(slug: string) {
    return this.request<ApiResponse<unknown>>(`/articles/${slug}/`);
  }

  /* ---------- Comments ---------- */

  async getComments(params?: QueryParams) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/comments/?${queryString}` : "/comments/";

    return this.request<PaginatedResponse<unknown>>(endpoint);
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
      `/search/?q=${encodeURIComponent(query)}`
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

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
