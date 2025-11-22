'use client'

import type React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import {
  Search,
  Menu,
  User,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  FolderOpen,
  X,
  Package,
  FileText,
  Loader2,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/SettingsContext'

interface Category {
  id: string
  name: string
  slug: string
  children: {
    id: string
    name: string
    slug: string
    _count: {
      articles: number
    }
  }[]
  _count: {
    articles: number
  }
}

/* ---------- Search result tipleri ---------- */

interface ArticleSearchResult {
  kind: 'article'
  id: number | string
  slug: string
  title: string
  excerpt?: string
  type: string // REVIEW | BEST_LIST | COMPARE | GUIDE | NEWS | ...
  category?: {
    name: string
  }
}

interface ProductSearchResult {
  kind: 'product'
  id: number | string
  slug: string
  brand: string
  model: string
  description?: string
  category?: {
    name: string
  }
}

interface UserSearchResult {
  kind: 'user'
  id: number | string
  name: string
  email?: string
  role?: string
}

type SearchResultItem = ArticleSearchResult | ProductSearchResult | UserSearchResult

interface SearchApiResponse {
  success: boolean
  data: {
    articles?: Array<{
      id: number | string
      slug: string
      title: string
      excerpt?: string
      type: string
      category?: { name: string }
    }>
    products?: Array<{
      id: number | string
      slug: string
      brand: string
      model: string
      description?: string
      category?: { name: string }
    }>
    users?: Array<{
      id: number | string
      username?: string
      first_name?: string
      last_name?: string
      name?: string
      email?: string
      role?: string
    }>
  }
}

export function Header() {
  const { data: session } = useSession()
  const { settings } = useSettings()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ---------- Kategorileri çek ---------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          const parentCategories: Category[] = result.data.filter(
            (category: Category & { parent?: unknown }) => !category.parent,
          )
          setCategories(parentCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  /* ---------- Spotlight benzeri arama ---------- */
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=8`,
          )
          const result: SearchApiResponse = await response.json()

          if (result.success && result.data) {
            const articles: ArticleSearchResult[] = (result.data.articles ?? []).map(
              (item) => ({
                ...item,
                kind: 'article' as const,
              }),
            )

            const products: ProductSearchResult[] = (result.data.products ?? []).map(
              (item) => ({
                ...item,
                kind: 'product' as const,
              }),
            )

            const users: UserSearchResult[] = (result.data.users ?? []).map((item) => {
              const fullName = `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim()
              const name = item.name || fullName || item.username || ''
              return {
                kind: 'user' as const,
                id: item.id,
                name,
                email: item.email,
                role: item.role,
              }
            })

            const combinedResults: SearchResultItem[] = [
              ...articles,
              ...products,
              ...users,
            ]

            setSearchResults(combinedResults)
            setShowResults(combinedResults.length > 0)
            setSelectedIndex(-1)
          }
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }, 200)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  /* ---------- Bir sonuç için URL üretici ---------- */
  const getArticleUrl = (article: ArticleSearchResult): string => {
    switch (article.type) {
      case 'REVIEW':
        return `/reviews/${article.slug}`
      case 'BEST_LIST':
        return `/best/${article.slug}`
      case 'COMPARE':
        return `/compare-articles/${article.slug}`
      case 'GUIDE':
        return `/guides/${article.slug}`
      case 'NEWS':
        return `/news/${article.slug}`
      default:
        return `/reviews/${article.slug}`
    }
  }

  const getResultUrl = (item: SearchResultItem): string => {
    if (item.kind === 'article') {
      return getArticleUrl(item)
    }
    if (item.kind === 'user') {
      return `/users/${item.id}`
    }
    return `/products/by-slug/${item.slug}`
  }

  /* ---------- Klavye navigasyonu ---------- */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showSearch || !showResults || searchResults.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0,
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1,
          )
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            const selectedItem = searchResults[selectedIndex]
            const url = getResultUrl(selectedItem)
            router.push(url)
            setShowSearch(false)
            setSearchQuery('')
            setShowResults(false)
            setSelectedIndex(-1)
          }
          break
        case 'Escape':
          event.preventDefault()
          setShowSearch(false)
          setSearchQuery('')
          setShowResults(false)
          setSelectedIndex(-1)
          break
      }
    }

    if (showSearch) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showSearch, showResults, searchResults, selectedIndex, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearch(false)
      setShowResults(false)
      setSelectedIndex(-1)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Logo URL helper
  const logoValue =
    settings?.logo && typeof settings.logo.value === 'string'
      ? settings.logo.value
      : null

  const logoUrl = logoValue
    ? logoValue.startsWith('/media/')
      ? `http://localhost:8000${logoValue}`
      : logoValue
    : null

  const siteName = settings?.site_name?.value || 'Hardware Review'

  return (
    <>
      {/* Spotlight Search Overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowSearch(false)
            setSearchQuery('')
            setShowResults(false)
            setSelectedIndex(-1)
          }}
        >
          <div
            className="flex justify-center pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl mx-4">
              <div className="relative bg-background/95 backdrop-blur-sm rounded-xl border shadow-2xl">
                <form onSubmit={handleSearch} className="flex items-center p-1">
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Ürün arama..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-10 text-lg py-4 border-0 bg-transparent focus:bg-transparent transition-all duration-200"
                      autoFocus
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-4 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <Button type="submit" size="sm" className="ml-2 mr-1">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSearch(false)
                      setSearchQuery('')
                      setShowResults(false)
                      setSelectedIndex(-1)
                    }}
                    className="mr-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>

                {showResults && searchResults.length > 0 && (
                  <div className="max-h-96 overflow-y-auto border-t">
                    <div className="space-y-1 p-2">
                      {searchResults.map((item, index) => {
                        const isSelected = index === selectedIndex

                        const Icon =
                          item.kind === 'article'
                            ? FileText
                            : item.kind === 'user'
                            ? User
                            : Package

                        const url = getResultUrl(item)

                        const title =
                          item.kind === 'article'
                            ? item.title
                            : item.kind === 'user'
                            ? item.name
                            : `${item.brand} ${item.model}`

                        const subtitle =
                          item.kind === 'article'
                            ? item.excerpt
                            : item.kind === 'user'
                            ? item.email ?? ''
                            : item.description

                        return (
                          <Link
                            key={`${item.kind}-${item.id}`}
                            href={url}
                            className={`block p-3 transition-all duration-150 rounded-lg ${
                              isSelected
                                ? 'bg-primary/10 border-l-2 border-primary'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              setShowSearch(false)
                              setSearchQuery('')
                              setShowResults(false)
                              setSelectedIndex(-1)
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  item.kind === 'article'
                                    ? 'bg-blue-100 text-blue-600'
                                    : item.kind === 'user'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-green-100 text-green-600'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {title}
                                </p>
                                {subtitle && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {subtitle.slice(0, 60)}...
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {item.kind === 'article'
                                      ? 'Makale'
                                      : item.kind === 'user'
                                      ? item.role === 'ADMIN'
                                        ? 'Admin'
                                        : 'Kullanıcı'
                                      : 'Ürün'}
                                  </Badge>
                                  {'category' in item &&
                                    item.category &&
                                    'name' in item.category && (
                                      <span className="text-xs text-muted-foreground">
                                        {item.category.name}
                                      </span>
                                    )}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {isSelected && '↵'}
                              </div>
                            </div>
                          </Link>
                        )
                      })}

                      <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>↑↓ Navigate</span>
                          <span>↵ Select</span>
                          <span>Esc Close</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <div className="relative h-8 w-8 rounded overflow-hidden">
                <Image
                  src={logoUrl}
                  alt={siteName}
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded bg-primary" />
            )}
            <span className="text-xl font-bold">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/reviews" className="text-sm font-medium hover:text-primary">
              İncelemeler
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary">
              Ürünler
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium hover:text-primary flex items-center gap-1">
                Kategoriler
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {isCategoriesLoading ? (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Kategoriler yükleniyor...
                    </div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        className="group/category relative"
                      >
                        <Link
                          href={`/category/${category.slug}`}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            <span>{category.name}</span>
                          </div>
                          {category.children.length > 0 && (
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Link>

                        {category.children.length > 0 && (
                          <div className="absolute left-full top-0 ml-1 w-56 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible transition-all duration-200 z-50">
                            <div className="py-2">
                              {category.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/category/${child.slug}`}
                                  className="block px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center justify-between"
                                >
                                  <span>{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Henüz kategori bulunmuyor
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link href="/best" className="text-sm font-medium hover:text-primary">
              En İyiler
            </Link>
            <Link href="/compare" className="text-sm font-medium hover:text-primary">
              Ürün Karşılaştırma
            </Link>
            <Link
              href="/compare-articles"
              className="text-sm font-medium hover:text-primary"
            >
              Karşılaştırma
            </Link>
            <Link href="/guides" className="text-sm font-medium hover:text-primary">
              Rehberler
            </Link>
            <Link href="/news" className="text-sm font-medium hover:text-primary">
              Haberler
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch(true)
                setTimeout(() => inputRef.current?.focus(), 100)
              }}
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            {session ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/favorites">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>
                <div className="relative group">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                        <div className="font-medium">
                          {session.user?.name || session.user?.email}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {session.user.role || 'USER'}
                        </Badge>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="inline w-4 h-4 mr-2" />
                        Profil
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="inline w-4 h-4 mr-2" />
                        Ayarlar
                      </Link>
                      {(session.user.role === 'SUPER_ADMIN' ||
                        session.user.role === 'ADMIN') && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings className="inline w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Giriş</Link>
                </Button>
                {settings?.user_registration?.value === 'true' && (
                  <Button asChild>
                    <Link href="/auth/signup">Üye Ol</Link>
                  </Button>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 space-y-4">
              <Link
                href="/reviews"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                İncelemeler
              </Link>
              <Link
                href="/best"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                En İyi Listeler
              </Link>
              <Link
                href="/products"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Ürünler
              </Link>

              <div className="border-t pt-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Kategoriler
                </div>
                {isCategoriesLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Kategoriler yükleniyor...
                  </div>
                ) : categories.length > 0 ? (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="ml-2">
                        <Link
                          href={`/category/${category.slug}`}
                          className="block text-sm hover:text-primary flex items-center justify-between"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            <span>{category.name}</span>
                          </div>
                          {category.children.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({category.children.length} alt kategori)
                            </span>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground ml-2">
                    Henüz kategori bulunmuyor
                  </div>
                )}
              </div>

              {session &&
                (session.user.role === 'SUPER_ADMIN' ||
                  session.user.role === 'ADMIN') && (
                  <div className="border-t pt-4">
                    <Link
                      href="/admin"
                      className="block text-sm font-medium hover:text-primary text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  </div>
                )}

              <Link
                href="/best"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                En İyiler
              </Link>
              <Link
                href="/compare"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Ürün Karşılaştırma
              </Link>
              <Link
                href="/compare-articles"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Karşılaştırma Makaleleri
              </Link>
              <Link
                href="/guides"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Rehberler
              </Link>
              <Link
                href="/news"
                className="block text-sm font-medium hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Haberler
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
