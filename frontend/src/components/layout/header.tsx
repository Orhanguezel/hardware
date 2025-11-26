// =============================================================
// FILE: src/components/layout/Header.tsx
// =============================================================
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
} from "lucide-react";

// RTK: Categories + Search + Settings + Auth
import { useListCategoriesQuery } from "@/integrations/hardware/rtk/endpoints/categories.endpoints";

import {
  useSearchQuery,
  type SearchQueryParams,
  type SearchResultItem as ApiSearchResultItem,
} from "@/integrations/hardware/rtk/endpoints/misc.endpoints";

import {
  useGetPublicSettingsQuery,
  type PublicSettings,
} from "@/integrations/hardware/rtk/endpoints/settings.endpoints";

import {
  useCheckEmailVerificationStatusQuery,
  useLogoutMutation,
} from "@/integrations/hardware/rtk/endpoints/auth.endpoints";

import type { Category } from "@/integrations/hardware/rtk/types/category.types";
import type { PaginatedResult } from "@/integrations/hardware/rtk/types/common.types";

// 🔹 Logo / medya path'ini çözmek için (admin settings’te kullandığın helper)
import { resolveMediaUrl } from "@/app/admin/settings/settings.helpers";

/* ---------- Category tipleri ---------- */

// Django API’den gelen ham kategori tipi (flat)
interface RawCategory {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  sort_order?: number;
}

// Header’da kullanacağımız ağaç tipi
interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  children: CategoryNode[];
}

/* ---------- Spotlight sonucu tipleri (UI için) ---------- */

interface ArticleSearchResult {
  kind: "article";
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string;
  type: string; // REVIEW | BEST_LIST | COMPARE | GUIDE | NEWS | ...
  categoryName?: string;
}

interface ProductSearchResult {
  kind: "product";
  id: number | string;
  slug?: string;
  brand: string;
  model?: string;
  description?: string;
  categoryName?: string;
}

interface UserSearchResult {
  kind: "user";
  id: number | string;
  name: string;
  email?: string;
  role?: string;
}

type SpotlightResult =
  | ArticleSearchResult
  | ProductSearchResult
  | UserSearchResult;

/* ---------- Auth tarafında kullanacağımız user tipi ---------- */

interface AuthUserForHeader {
  id: number | string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

/* ---------- Flat listeyi ağaç yapısına çeviren helper ---------- */

function buildCategoryTree(raw: RawCategory[]): CategoryNode[] {
  const map = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];

  raw.forEach((c) => {
    map.set(c.id, {
      id: c.id,
      name: c.name,
      slug: c.slug,
      children: [],
    });
  });

  raw.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parent && map.has(c.parent)) {
      const parent = map.get(c.parent)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // root kategoriler alfabetik
  roots.sort((a, b) => a.name.localeCompare(b.name));

  return roots;
}

/* ---------- categoriesResult normalizer ---------- */

function normalizeCategoriesResult(
  result: PaginatedResult<Category> | Category[],
): Category[] {
  if (Array.isArray(result)) return result;
  return result.results ?? [];
}

/* ---------- SearchResultItem → SpotlightResult mapleyici ---------- */

const getStringField = (
  obj: ApiSearchResultItem,
  key: string,
): string | undefined => {
  const value = obj[key];
  return typeof value === "string" ? value : undefined;
};

function mapApiItemToSpotlight(item: ApiSearchResultItem): SpotlightResult {
  const t = item.type?.toLowerCase?.() ?? "";

  // Article / review / guide / news
  if (
    t.includes("article") ||
    t.includes("review") ||
    t.includes("guide") ||
    t.includes("news")
  ) {
    return {
      kind: "article",
      id: item.id,
      slug: item.slug ?? String(item.id),
      title: item.title ?? item.name ?? `Makale #${item.id}`,
      excerpt: getStringField(item, "description"),
      type: item.type,
      categoryName: getStringField(item, "category_name"),
    };
  }

  // User
  if (t.includes("user")) {
    return {
      kind: "user",
      id: item.id,
      name: item.name ?? item.title ?? `Kullanıcı #${item.id}`,
      email: getStringField(item, "email"),
      role: getStringField(item, "role"),
    };
  }

  // Default: product
  return {
    kind: "product",
    id: item.id,
    slug: item.slug,
    brand: item.name ?? item.title ?? `Ürün #${item.id}`,
    model: getStringField(item, "model"),
    description: getStringField(item, "description"),
    categoryName: getStringField(item, "category_name"),
  };
}

export function Header() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotlightResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------- Auth token var mı? (localStorage / cookie) ---------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    // LocalStorage veya cookie'den token'ı bulmaya çalış
    const localToken =
      window.localStorage.getItem("auth_token") ??
      window.localStorage.getItem("token");

    const cookieToken = document.cookie
      .split("; ")
      .find(
        (c) =>
          c.startsWith("auth_token=") ||
          c.startsWith("token="),
      );

    setHasAuthToken(Boolean(localToken || cookieToken));
  }, []);

  /* ---------- Settings (public) RTK ---------- */

  const { data: publicSettingsResponse } = useGetPublicSettingsQuery();

  const publicSettings: PublicSettings | undefined =
    publicSettingsResponse?.data;

  const logoSetting = publicSettings?.logo;
  const siteNameSetting = publicSettings?.site_name;
  const userRegistrationSetting = publicSettings?.user_registration;

  const logoValue = logoSetting?.value ?? "";
  const siteName = siteNameSetting?.value ?? "Hardware Review";
  const isRegistrationEnabled =
    userRegistrationSetting?.value === "true";

  // 🔹 LOGO URL: /media/... veya tam URL → resolveMediaUrl hepsini çözer
  const logoUrl =
    logoValue && typeof logoValue === "string"
      ? resolveMediaUrl(logoValue)
      : null;

  /* ---------- Auth: current user (RTK) ---------- */

  const { data: authStatus } = useCheckEmailVerificationStatusQuery(
    undefined,
    {
      // Token yoksa bu sorguyu hiç çalıştırma → 401 log’ları kaybolur
      skip: !hasAuthToken,
    },
  );
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const currentUser: AuthUserForHeader | null = authStatus?.user
    ? {
        id: authStatus.user.id as number | string,
        name:
          "name" in authStatus.user
            ? (authStatus.user.name as string | null | undefined)
            : null,
        email:
          "email" in authStatus.user
            ? (authStatus.user.email as string | null | undefined)
            : null,
        role:
          "role" in authStatus.user
            ? (authStatus.user.role as string | null | undefined)
            : null,
      }
    : null;

  const isLoggedIn = currentUser !== null;
  const userRole = currentUser?.role ?? "USER";
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

  /* ---------- RTK: Kategori listesi ---------- */

  const {
    data: categoriesResult,
    isLoading: isCategoriesLoading,
  } = useListCategoriesQuery(undefined);

  useEffect(() => {
    if (!categoriesResult) return;

    const items: Category[] = normalizeCategoriesResult(categoriesResult);

    const raw: RawCategory[] = items.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent: c.parent ?? null,
      description: c.description ?? undefined,
      icon: c.icon ?? undefined,
      color: c.color ?? undefined,
      is_active: c.is_active ?? true,
      sort_order: c.sort_order ?? undefined,
    }));

    const tree = buildCategoryTree(raw);
    setCategories(tree);
  }, [categoriesResult]);

  /* ---------- Arama: debounce edilmiş query ---------- */

  useEffect(() => {
    if (!showSearch) {
      setDebouncedQuery("");
      return;
    }

    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);

    return () => clearTimeout(timeout);
  }, [searchQuery, showSearch]);

  /* ---------- RTK: Search ---------- */

  const searchParams = useMemo<SearchQueryParams | undefined>(
    () =>
      debouncedQuery.length >= 2
        ? {
            q: debouncedQuery,
            limit: 8,
          }
        : undefined,
    [debouncedQuery],
  );

  const emptySearchParams: SearchQueryParams = {
    q: "",
    limit: 0,
  };

  const searchArgs: SearchQueryParams = searchParams ?? emptySearchParams;

  const {
    data: searchData,
    isFetching: isSearching,
  } = useSearchQuery(searchArgs, {
    skip: !searchParams,
  });

  useEffect(() => {
    if (!searchParams || !searchData?.results) {
      setSearchResults([]);
      setShowResults(false);
      setSelectedIndex(-1);
      return;
    }

    const mapped: SpotlightResult[] = searchData.results.map(
      mapApiItemToSpotlight,
    );
    setSearchResults(mapped);
    setShowResults(mapped.length > 0);
    setSelectedIndex(-1);
  }, [searchData, searchParams]);

  /* ---------- Bir sonuç için URL üretici ---------- */

  const getArticleUrl = (article: ArticleSearchResult): string => {
    switch (article.type) {
      case "REVIEW":
        return `/reviews/${article.slug}`;
      case "BEST_LIST":
        return `/best/${article.slug}`;
      case "COMPARE":
        return `/compare-articles/${article.slug}`;
      case "GUIDE":
        return `/guides/${article.slug}`;
      case "NEWS":
        return `/news/${article.slug}`;
      default:
        return `/reviews/${article.slug}`;
    }
  };

  const getResultUrl = (item: SpotlightResult): string => {
    if (item.kind === "article") {
      return getArticleUrl(item);
    }
    if (item.kind === "user") {
      return `/users/${item.id}`;
    }
    // product
    return item.slug ? `/products/by-slug/${item.slug}` : `/products/${item.id}`;
  };

  /* ---------- Klavye navigasyonu ---------- */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showSearch || !showResults || searchResults.length === 0) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1,
          );
          break;
        case "Enter":
          event.preventDefault();
          if (
            selectedIndex >= 0 &&
            selectedIndex < searchResults.length
          ) {
            const selectedItem = searchResults[selectedIndex];
            const url = getResultUrl(selectedItem);
            router.push(url);
            setShowSearch(false);
            setSearchQuery("");
            setShowResults(false);
            setSelectedIndex(-1);
          }
          break;
        case "Escape":
          event.preventDefault();
          setShowSearch(false);
          setSearchQuery("");
          setShowResults(false);
          setSelectedIndex(-1);
          break;
      }
    };

    if (showSearch) {
      document.addEventListener("keydown", handleKeyDown);
      return () =>
        document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showSearch, showResults, searchResults, selectedIndex, router]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setShowSearch(false);
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Hata olursa şimdilik sessiz geç
    } finally {
      router.push("/");
    }
  };

  return (
    <>
      {/* Spotlight Search Overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            setShowSearch(false);
            setSearchQuery("");
            setShowResults(false);
            setSelectedIndex(-1);
          }}
        >
          <div
            className="flex justify-center pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl mx-4">
              <div className="relative bg-background/95 backdrop-blur-sm rounded-xl border shadow-2xl">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center p-1"
                >
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Ürün veya içerik ara..."
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
                      setShowSearch(false);
                      setSearchQuery("");
                      setShowResults(false);
                      setSelectedIndex(-1);
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
                        const isSelected = index === selectedIndex;

                        const Icon =
                          item.kind === "article"
                            ? FileText
                            : item.kind === "user"
                            ? User
                            : Package;

                        const url = getResultUrl(item);

                        const title =
                          item.kind === "article"
                            ? item.title
                            : item.kind === "user"
                            ? item.name
                            : `${item.brand}${
                                item.model ? ` ${item.model}` : ""
                              }`;

                        const subtitle =
                          item.kind === "article"
                            ? item.excerpt
                            : item.kind === "user"
                            ? item.email ?? ""
                            : item.description;

                        return (
                          <Link
                            key={`${item.kind}-${item.id}`}
                            href={url}
                            className={`block p-3 transition-all duration-150 rounded-lg ${
                              isSelected
                                ? "bg-primary/10 border-l-2 border-primary"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              setShowSearch(false);
                              setSearchQuery("");
                              setShowResults(false);
                              setSelectedIndex(-1);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  item.kind === "article"
                                    ? "bg-blue-100 text-blue-600"
                                    : item.kind === "user"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-green-100 text-green-600"
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
                                    {item.kind === "article"
                                      ? "Makale"
                                      : item.kind === "user"
                                      ? item.role === "ADMIN"
                                        ? "Admin"
                                        : "Kullanıcı"
                                      : "Ürün"}
                                  </Badge>
                                  {item.kind === "article" &&
                                    item.categoryName && (
                                      <span className="text-xs text-muted-foreground">
                                        {item.categoryName}
                                      </span>
                                    )}
                                  {item.kind === "product" &&
                                    item.categoryName && (
                                      <span className="text-xs text-muted-foreground">
                                        {item.categoryName}
                                      </span>
                                    )}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {isSelected && "↵"}
                              </div>
                            </div>
                          </Link>
                        );
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
            <span className="text-xl font-bold">
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/reviews"
              className="text-sm font-medium hover:text-primary"
            >
              İncelemeler
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium hover:text-primary"
            >
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
                    categories.map((category) => {
                      const hasChildren =
                        category.children &&
                        category.children.length > 0;

                      return (
                        <div
                          key={category.id}
                          className="group/category relative"
                        >
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-4 h-4" />
                              <span>{category.name}</span>
                            </div>
                            {hasChildren && (
                              <ChevronDown className="w-3 h-3 text-muted-foreground" />
                            )}
                          </Link>

                          {hasChildren && (
                            <div className="absolute left-full top-0 ml-1 w-56 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible transition-all duration-200 z-50">
                              <div className="py-2">
                                {category.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/category/${child.slug}`}
                                    className="flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted"
                                  >
                                    <span>{child.name}</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      Henüz kategori bulunmuyor
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/best"
              className="text-sm font-medium hover:text-primary"
            >
              En İyiler
            </Link>
            <Link
              href="/compare"
              className="text-sm font-medium hover:text-primary"
            >
              Ürün Karşılaştırma
            </Link>
            <Link
              href="/compare-articles"
              className="text-sm font-medium hover:text-primary"
            >
              Karşılaştırma
            </Link>
            <Link
              href="/guides"
              className="text-sm font-medium hover:text-primary"
            >
              Rehberler
            </Link>
            <Link
              href="/news"
              className="text-sm font-medium hover:text-primary"
            >
              Haberler
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSearch(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            {isLoggedIn ? (
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
                          {currentUser?.name || currentUser?.email}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {userRole}
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
                      {isAdmin && (
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
                        disabled={isLogoutLoading}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
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
                {isRegistrationEnabled && (
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
                    {categories.map((category) => {
                      const hasChildren =
                        category.children &&
                        category.children.length > 0;
                      return (
                        <div key={category.id} className="ml-2">
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-4 h-4" />
                              <span>{category.name}</span>
                            </div>
                            {hasChildren && (
                              <span className="text-xs text-muted-foreground">
                                ({category.children.length} alt kategori)
                              </span>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground ml-2">
                    Henüz kategori bulunmuyor
                  </div>
                )}
              </div>

              {isLoggedIn && isAdmin && (
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
  );
}
