// src/app/products/ProductsPageClient.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
  Filter,
  Star,
  Wifi,
  Calendar,
  Monitor,
  Cpu,
  HardDrive,
  Headphones,
  Camera,
  Smartphone,
  Laptop,
  Database,
  Globe,
  Router,
  Shield,
  Settings,
  Gamepad2,
  X,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { getScoreColor } from '@/lib/utils';
import { CategoryFilters } from '@/components/product/category-filters';
import { ProductSearchForm } from '@/components/product/product-search-form';
import { FavoriteButton } from '@/components/product/favorite-button';
import { ExpandableCategories } from '@/components/product/expandable-categories';
import { BrandFilters } from '@/components/product/brand-filters';
import { PriceRangeFilters } from '@/components/product/price-range-filters';
import AffiliateButton from '@/components/tracking/AffiliateButton';

import {
  useListProductsQuery,
} from '@/integrations/hardware/rtk/endpoints/products.endpoints';
import type { ProductDto } from '@/integrations/hardware/rtk/types/product.types';
import type { Category } from '@/integrations/hardware/rtk/types/category.types';
import type { QueryParams } from '@/lib/api-config';

/* ---------- Yardımcılar ---------- */

const getShortCategoryName = (name: string) => {
  const shortNames: { [key: string]: string } = {
    'Ağ Modem Ürünleri': 'Ağ & Modem',
    Bilgisayar: 'Bilgisayar',
    'Bilgisayar Bileşenleri': 'Bileşenler',
    Gaming: 'Gaming',
    'TV, Ses ve Görüntü Sistemi': 'TV & Ses',
    Telefon: 'Telefon',
    'Yazıcı ve Tüketim': 'Yazıcı',
    'Çevre Birimleri': 'Çevre Birimleri',
    'All-in-One': 'All-in-One',
    'Dizüstü Bilgisayar': 'Laptop',
    'Masaüstü Bilgisayar': 'Masaüstü',
    'Mini PC': 'Mini PC',
    'Android Telefonlar': 'Android',
    'Samsung Galaxy': 'Galaxy',
    'Telefon Aksesuarları': 'Telefon Aks.',
    iPhone: 'iPhone',
    Fare: 'Fare',
    Hoparlör: 'Hoparlör',
    Klavye: 'Klavye',
    Kulaklık: 'Kulaklık',
    Webcam: 'Webcam',
    'Gaming Klavye': 'Gaming Klavye',
    'Gaming Kulaklık': 'Gaming Kulaklık',
    'Gaming Monitör': 'Gaming Monitör',
    'Gaming Mouse': 'Gaming Mouse',
    'Oyun Konsolu': 'Konsol',
    'AV Receiver': 'AV Receiver',
    Monitör: 'Monitör',
    Projeksiyon: 'Projeksiyon',
    Soundbar: 'Soundbar',
    Televizyon: 'TV',
    Anakart: 'Anakart',
    Depolama: 'Depolama',
    'Ekran Kartı (GPU)': 'GPU',
    'Güç Kaynağı': 'PSU',
    Kasa: 'Kasa',
    RAM: 'RAM',
    Soğutma: 'Soğutma',
    'İşlemci (CPU)': 'CPU',
    'Access Point': 'Access Point',
    'Ağ Kartı': 'Ağ Kartı',
    'Mesh Sistem': 'Mesh',
    Modem: 'Modem',
    'Network Switch': 'Switch',
    Router: 'Router',
    'Lazer Yazıcı': 'Lazer',
    'Mürekkep Kartuşu': 'Kartuş',
    'Mürekkep Püskürtmeli': 'Mürekkep',
    Tarayıcı: 'Tarayıcı',
    'Yazıcı Toneri': 'Toner',
    'Çok Fonksiyonlu': 'Çok Fonksiyonlu',
  };

  return shortNames[name] || name;
};

const getCategoryIcon = (categoryName: string) => {
  switch (categoryName?.toLowerCase()) {
    case 'ekran kartı':
    case 'gpu':
    case 'graphics':
      return <Cpu className="h-5 w-5" />;
    case 'monitör':
    case 'monitor':
      return <Monitor className="h-5 w-5" />;
    case 'router':
    case 'modem':
    case 'mesh':
      return <Router className="h-5 w-5" />;
    case 'ssd':
    case 'hdd':
    case 'storage':
      return <HardDrive className="h-5 w-5" />;
    case 'kulaklık':
    case 'headphones':
      return <Headphones className="h-5 w-5" />;
    case 'kamera':
    case 'camera':
      return <Camera className="h-5 w-5" />;
    case 'telefon':
    case 'smartphone':
      return <Smartphone className="h-5 w-5" />;
    case 'laptop':
    case 'notebook':
      return <Laptop className="h-5 w-5" />;
    case 'server':
    case 'sunucu':
      return <Database className="h-5 w-5" />;
    case 'internet':
    case 'network':
      return <Globe className="h-5 w-5" />;
    case 'gaming':
    case 'oyun':
      return <Gamepad2 className="h-5 w-5" />;
    case 'access point':
    case 'ap':
      return <Shield className="h-5 w-5" />;
    case 'switch':
    case 'network switch':
      return <Settings className="h-5 w-5" />;
    default:
      return <Wifi className="h-5 w-5" />;
  }
};

/* ---------- Props ---------- */

interface ProductsPageClientProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default function ProductsPageClient({
  searchParams,
}: ProductsPageClientProps) {
  const pageParam = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const page = Number.parseInt(pageParam || '1', 10) || 1;
  const limit = 12;

  // URL parametreleri
  const search = Array.isArray(searchParams.search)
    ? searchParams.search[0]
    : searchParams.search;
  const brand = Array.isArray(searchParams.brand)
    ? searchParams.brand[0]
    : searchParams.brand;
  const categorySlug = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
  const priceMin = Array.isArray(searchParams.price_min)
    ? searchParams.price_min[0]
    : searchParams.price_min;
  const priceMax = Array.isArray(searchParams.price_max)
    ? searchParams.price_max[0]
    : searchParams.price_max;

  /* ---------- Kategoriler (şimdilik fetch ile, istersen burayı da RTK yaparız) ---------- */

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      try {
        setCategoriesLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/?is_active=true&ordering=name`,
          { cache: 'no-store' },
        );
        if (!res.ok) {
          throw new Error(`Categories error: ${res.status}`);
        }
        const json = await res.json();
        const cats: Category[] = Array.isArray(json)
          ? json
          : json.results ?? [];
        if (!cancelled) {
          setCategories(cats);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const mainCategories = useMemo(
    () => categories.filter((cat) => !cat.parent),
    [categories],
  );
  const subCategories = useMemo(
    () => categories.filter((cat) => !!cat.parent),
    [categories],
  );

  const organizedCategories = useMemo(
    () =>
      mainCategories.map((mainCat) => ({
        ...mainCat,
        children: subCategories.filter((sub) => sub.parent === mainCat.id),
        shortName: getShortCategoryName(mainCat.name),
      })),
    [mainCategories, subCategories],
  );

  const selectedCategory = useMemo(
    () =>
      categorySlug
        ? categories.find((c) => c.slug === categorySlug)
        : undefined,
    [categories, categorySlug],
  );

  const categoryId = selectedCategory?.id;

  /* ---------- Ürünler: RTK Query ile ---------- */

  const queryParams: QueryParams = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(brand ? { brand } : {}),
    // Backend ID bekliyorsa:
    ...(categoryId ? { category: categoryId } : {}),
    ...(priceMin ? { price_min: priceMin } : {}),
    ...(priceMax ? { price_max: priceMax } : {}),
  };

  const skipProductsQuery = Boolean(categorySlug) && categoriesLoading;

  const {
    data: productsResult,
    isLoading: productsLoading,
    isError: productsError,
  } = useListProductsQuery(queryParams, {
    skip: skipProductsQuery,
  });

  const products: ProductDto[] = useMemo(() => {
    if (!productsResult) return [];
    return Array.isArray(productsResult)
      ? productsResult
      : productsResult.results ?? [];
  }, [productsResult]);

  const total: number = useMemo(() => {
    if (!productsResult) return 0;
    if (Array.isArray(productsResult)) {
      // Backend plain array dönerse
      return productsResult.length;
    }
    return productsResult.count ?? (productsResult.results?.length ?? 0);
  }, [productsResult]);

  const totalPages = Math.ceil((total || 0) / limit) || 1;

  const brands = useMemo(
    () =>
      [...new Set(products.map((p) => p.brand))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [products],
  );

  /* ---------- Loading / Error ---------- */

  const initialLoading =
    (productsLoading || (categorySlug && categoriesLoading)) && !products.length;

  if (initialLoading) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Ürünler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="mb-4 text-red-500">
            Ürünler yüklenirken bir hata oluştu.
          </p>
          <Button asChild variant="outline">
            <Link href="/products">Tekrar dene</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categorySlugForFilters = selectedCategory?.slug || '';

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* SOL PANEL - Filtreler */}
        <div className="lg:w-1/4">
          {/* Ana Filtreler */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Kategoriler */}
              <ExpandableCategories
                categories={organizedCategories}
                selectedCategorySlug={categorySlug}
              />

              {/* Markalar */}
              <BrandFilters brands={brands} selectedBrand={brand} />
            </CardContent>
          </Card>

          {/* Fiyat Aralığı */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Fiyat Aralığı</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceRangeFilters
                selectedPriceRange={
                  priceMin && priceMax
                    ? `${priceMin}-${priceMax}`
                    : priceMin
                    ? `${priceMin}+`
                    : undefined
                }
              />
            </CardContent>
          </Card>

          {/* Filtreleri Temizle */}
          {(categoryId || brand || search || priceMin || priceMax) && (
            <Card>
              <CardContent className="pt-6">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">
                    <X className="mr-2 h-4 w-4" />
                    Filtreleri Temizle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Kategori Bazlı Özel Filtreler */}
          {categorySlug && (
            <div className="mt-4">
              <CategoryFilters
                categorySlug={categorySlugForFilters}
                categoryName={selectedCategory?.name || ''}
                searchParams={Object.fromEntries(
                  Object.entries(searchParams).filter(
                    ([, value]) => value !== undefined,
                  ),
                ) as Record<string, string>}
              />
            </div>
          )}
        </div>

        {/* SAĞ TARAF - Ürün Grid */}
        <div className="lg:w-3/4">
          {/* Başlık + Arama */}
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold">Ürünler</h1>
            <ProductSearchForm />
          </div>

          {/* Sonuç sayısı */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {total} ürün bulundu
              {search && ` "${search}" için`}
              {brand && ` ${brand} markası için`}
              {selectedCategory &&
                ` ${selectedCategory.name} kategorisi için`}
              {priceMin &&
                priceMax &&
                ` ${priceMin}₺ - ${priceMax}₺ aralığında`}
              {priceMin && !priceMax && ` ${priceMin}₺ ve üzeri`}
            </p>
          </div>

          {/* Ürün Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const averageScore = product.average_rating || 0;

              return (
                <Card
                  key={product.id}
                  className="group transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="p-0">
                    <div className="flex aspect-video items-center justify-center rounded-t-lg bg-muted">
                      {product.cover_image ? (
                        <Image
                          src={product.cover_image}
                          alt={`${product.brand} ${product.model}`}
                          width={640}
                          height={360}
                          className="h-full w-full rounded-t-lg object-cover"
                        />
                      ) : (
                        getCategoryIcon(product.category?.name || '')
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-1">
                          {product.category && (
                            <Badge variant="outline">
                              {product.category.name}
                            </Badge>
                          )}
                          {product.product_tags?.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {product.product_tags?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.product_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
                          {product.brand} {product.model}
                        </h3>
                        {product.release_year && (
                          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{product.release_year}</span>
                          </div>
                        )}
                      </div>

                      {/* Specs (ilk 3) */}
                      <div className="space-y-2">
                        {product.product_specs?.slice(0, 3).map((spec) => (
                          <div
                            key={spec.id}
                            className="flex items-center gap-2"
                          >
                            <span className="text-sm font-medium">
                              {spec.name}:
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {spec.value} {spec.unit && spec.unit}
                            </span>
                          </div>
                        ))}
                        {product.product_specs?.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{product.product_specs.length - 3} özellik daha
                          </div>
                        )}
                      </div>

                      {/* Puan */}
                      <div className="flex items-center justify-between border-t pt-2">
                        <div className="flex items-center gap-2">
                          {averageScore > 0 ? (
                            <>
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span
                                className={`font-semibold ${getScoreColor(
                                  averageScore,
                                )}`}
                              >
                                {averageScore.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({product.review_count || 0} değerlendirme)
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Henüz puanlanmamış
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Aksiyonlar */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/products/by-slug/${product.slug}`}>
                            Detayları Gör
                          </Link>
                        </Button>
                        <FavoriteButton
                            productId={product.id.toString()}
                          className="h-8 w-8"
                        />
                        {product.affiliate_links?.length > 0 && (
                          <AffiliateButton
                            productId={product.id}
                            merchant={product.affiliate_links[0].merchant}
                            url={product.affiliate_links[0].url_template}
                            size="sm"
                            variant="outline"
                          >
                            Satın Al
                          </AffiliateButton>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    asChild
                  >
                    <Link
                      href={`/products?page=${pageNum}${
                        search ? `&search=${encodeURIComponent(search)}` : ''
                      }${
                        brand ? `&brand=${encodeURIComponent(brand)}` : ''
                      }${
                        categorySlug
                          ? `&category=${encodeURIComponent(categorySlug)}`
                          : ''
                      }${
                        priceMin ? `&price_min=${encodeURIComponent(priceMin)}` : ''
                      }${
                        priceMax ? `&price_max=${encodeURIComponent(priceMax)}` : ''
                      }`}
                    >
                      {pageNum}
                    </Link>
                  </Button>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
