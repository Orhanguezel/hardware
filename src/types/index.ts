
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
  }
}

// Base types for our models
export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  role: string
  avatar?: string
  bio?: string
  status: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  is_active: boolean
  sort_order: number
  parent?: number
  children?: Category[]
  article_count?: number
  product_count?: number
  created_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  type: string
}

export interface Product {
  id: number
  brand: string
  model: string
  slug: string
  specs: Record<string, unknown>
  release_year?: number
  cover_image?: string
  description?: string
  category?: Category
  created_at: string
}

export interface Article {
  id: number
  type: string
  slug: string
  title: string
  subtitle?: string
  excerpt?: string
  content: Record<string, unknown>
  status: string
  author: User
  category?: Category
  published_at?: string
  hero_image?: string
  og_image?: string
  meta_title?: string
  meta_description?: string
  created_at: string
}

export interface Comment {
  id: number
  article: number
  user?: number
  content: string
  status: string
  author_name?: string
  author_email?: string
  parent?: number
  created_at: string
}

export interface Notification {
  id: number
  user: number
  type: string
  payload: Record<string, unknown>
  read_at?: string
  created_at: string
}

// String-based enums for SQLite compatibility
export type UserRole = 'ADMIN' | 'AUTHOR' | 'EDITOR' | 'VISITOR'
export type ArticleType = 'REVIEW' | 'BEST_LIST' | 'COMPARE' | 'GUIDE' | 'NEWS'
export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type NotificationType = 'COMMENT_REPLY' | 'ARTICLE_PUBLISHED' | 'SYSTEM'
export type TagType = 'GENERAL' | 'BRAND' | 'FEATURE' | 'PRICE_RANGE'

export interface ReviewCriteria {
  performance: number
  stability: number
  coverage: number
  software: number
  price: number
}

export interface ReviewWeights {
  performance: number // 0.35
  stability: number   // 0.25
  coverage: number    // 0.2
  software: number    // 0.1
  price: number       // 0.1
}

export interface ReviewExtraData {
  criteria: ReviewCriteria
  scoreNumeric: number
  pros: string[]
  cons: string[]
  technicalSpec?: Record<string, unknown>
}

export interface CompareRound {
  category: string
  leftScore: number
  rightScore: number
  winner: 'left' | 'right' | 'tie'
}

export interface CompareExtraData {
  leftProductId: string
  rightProductId: string
  rounds: CompareRound[]
  winnerProductId?: string
}

export interface ArticleWithRelations extends Article {
  author: User
  editor?: User | null
  articleTags: Array<{
    tag: Tag
  }>
  articleProducts: Array<{
    product: Product
  }>
  reviewExtra?: ReviewExtraData | null
  compareExtra?: CompareExtraData | null
}

export interface ProductWithDetails extends Product {
  affiliateLinks: Array<{
    merchant: string
    urlTemplate: string
  }>
}

export interface SearchFilters {
  category?: string
  tags?: string[]
  priceRange?: [number, number]
  wifiStandard?: string[]
  features?: string[]
  sortBy?: 'score' | 'date' | 'popularity'
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}
