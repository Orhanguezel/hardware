const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
export const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Token ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<ApiResponse<{ token: string; user: any }>>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.success && response.data?.token) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
      }
    }
    
    return response
  }

  async register(userData: any) {
    const response = await this.request<ApiResponse<{ token: string; user: any }>>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    
    if (response.success && response.data?.token) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
      }
    }
    
    return response
  }

  async logout() {
    const response = await this.request<ApiResponse>('/auth/logout/', {
      method: 'POST',
    })
    
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
    
    return response
  }

  // Categories
  async getCategories(params?: Record<string, any>) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/categories/?${queryString}` : '/categories/'
    
    return this.request<PaginatedResponse<any>>(endpoint)
  }

  async getCategory(slug: string) {
    return this.request<ApiResponse<any>>(`/categories/${slug}/`)
  }

  // Products
  async getProducts(params?: Record<string, any>) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/products/?${queryString}` : '/products/'
    
    return this.request<PaginatedResponse<any>>(endpoint)
  }

  async getProduct(slug: string) {
    return this.request<ApiResponse<any>>(`/products/${slug}/`)
  }

  // Articles
  async getArticles(params?: Record<string, any>) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/articles/?${queryString}` : '/articles/'
    
    return this.request<PaginatedResponse<any>>(endpoint)
  }

  async getArticle(slug: string) {
    return this.request<ApiResponse<any>>(`/articles/${slug}/`)
  }

  // Comments
  async getComments(params?: Record<string, any>) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/comments/?${queryString}` : '/comments/'
    
    return this.request<PaginatedResponse<any>>(endpoint)
  }

  async createComment(commentData: any) {
    return this.request<ApiResponse<any>>('/comments/', {
      method: 'POST',
      body: JSON.stringify(commentData),
    })
  }

  // Search
  async search(query: string) {
    return this.request<ApiResponse<any>>(`/search/?q=${encodeURIComponent(query)}`)
  }

  // Favorites
  async getFavorites() {
    return this.request<PaginatedResponse<any>>('/favorites/')
  }

  async addFavorite(productId: number) {
    return this.request<ApiResponse<any>>('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ product: productId }),
    })
  }

  async removeFavorite(favoriteId: number) {
    return this.request<ApiResponse<any>>(`/favorites/${favoriteId}/`, {
      method: 'DELETE',
    })
  }

  // Outbound click tracking
  async trackOutboundClick(data: any) {
    return this.request<ApiResponse<any>>('/outbound/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
