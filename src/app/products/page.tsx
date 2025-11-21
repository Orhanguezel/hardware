import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Star, 
  ExternalLink,
  Wifi,
  Zap,
  Calendar,
  TrendingUp,
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
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { getScoreColor } from '@/lib/utils'
import { CategoryFilters } from '@/components/product/category-filters'
import { ProductSearchForm } from '@/components/product/product-search-form'
import { FavoriteButton } from '@/components/product/favorite-button'
import { ShareButton } from '@/components/product/share-button'
import { ExpandableCategories } from '@/components/product/expandable-categories'
import { BrandFilters } from '@/components/product/brand-filters'
import { PriceRangeFilters } from '@/components/product/price-range-filters'
import AffiliateButton from '@/components/tracking/AffiliateButton'

const getShortCategoryName = (name: string) => {
  const shortNames: { [key: string]: string } = {
    'Ağ Modem Ürünleri': 'Ağ & Modem',
    'Bilgisayar': 'Bilgisayar',
    'Bilgisayar Bileşenleri': 'Bileşenler',
    'Gaming': 'Gaming',
    'TV, Ses ve Görüntü Sistemi': 'TV & Ses',
    'Telefon': 'Telefon',
    'Yazıcı ve Tüketim': 'Yazıcı',
    'Çevre Birimleri': 'Çevre Birimleri',
    'All-in-One': 'All-in-One',
    'Dizüstü Bilgisayar': 'Laptop',
    'Masaüstü Bilgisayar': 'Masaüstü',
    'Mini PC': 'Mini PC',
    'Android Telefonlar': 'Android',
    'Samsung Galaxy': 'Galaxy',
    'Telefon Aksesuarları': 'Telefon Aks.',
    'iPhone': 'iPhone',
    'Fare': 'Fare',
    'Hoparlör': 'Hoparlör',
    'Klavye': 'Klavye',
    'Kulaklık': 'Kulaklık',
    'Webcam': 'Webcam',
    'Gaming Klavye': 'Gaming Klavye',
    'Gaming Kulaklık': 'Gaming Kulaklık',
    'Gaming Monitör': 'Gaming Monitör',
    'Gaming Mouse': 'Gaming Mouse',
    'Oyun Konsolu': 'Konsol',
    'AV Receiver': 'AV Receiver',
    'Monitör': 'Monitör',
    'Projeksiyon': 'Projeksiyon',
    'Soundbar': 'Soundbar',
    'Televizyon': 'TV',
    'Anakart': 'Anakart',
    'Depolama': 'Depolama',
    'Ekran Kartı (GPU)': 'GPU',
    'Güç Kaynağı': 'PSU',
    'Kasa': 'Kasa',
    'RAM': 'RAM',
    'Soğutma': 'Soğutma',
    'İşlemci (CPU)': 'CPU',
    'Access Point': 'Access Point',
    'Ağ Kartı': 'Ağ Kartı',
    'Mesh Sistem': 'Mesh',
    'Modem': 'Modem',
    'Network Switch': 'Switch',
    'Router': 'Router',
    'Lazer Yazıcı': 'Lazer',
    'Mürekkep Kartuşu': 'Kartuş',
    'Mürekkep Püskürtmeli': 'Mürekkep',
    'Tarayıcı': 'Tarayıcı',
    'Yazıcı Toneri': 'Toner',
    'Çok Fonksiyonlu': 'Çok Fonksiyonlu'
  }
  
  return shortNames[name] || name
}

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string
    brand?: string
    category?: string
    gpu?: string
    monitor?: string
    router?: string
    year?: string
    page?: string
    price_min?: string
    price_max?: string
    // Kategori bazlı filtreler
    vram?: string
    boost_clock?: string
    tdp?: string
    ray_tracing?: string
    size?: string
    resolution?: string
    refresh_rate?: string
    panel_type?: string
    hdr?: string
    wifi_standard?: string
    total_speed?: string
    band?: string
    ports?: string
    gaming?: string
    dpi?: string
    weight?: string
    wireless?: string
    battery?: string
    switch?: string
    lighting?: string
    macro_keys?: string
    cores?: string
    threads?: string
    base_clock?: string
    capacity?: string
    speed?: string
    type?: string
    latency?: string
    read_speed?: string
    write_speed?: string
    // Range filtreler için min/max
    [key: string]: string | undefined
  }>
}

// Kategori ikonları
const getCategoryIcon = (categoryName: string) => {
  switch (categoryName?.toLowerCase()) {
    case 'ekran kartı': case 'gpu': case 'graphics': return <Cpu className="w-5 h-5" />
    case 'monitör': case 'monitor': return <Monitor className="w-5 h-5" />
    case 'router': case 'modem': case 'mesh': return <Router className="w-5 h-5" />
    case 'ssd': case 'hdd': case 'storage': return <HardDrive className="w-5 h-5" />
    case 'kulaklık': case 'headphones': return <Headphones className="w-5 h-5" />
    case 'kamera': case 'camera': return <Camera className="w-5 h-5" />
    case 'telefon': case 'smartphone': return <Smartphone className="w-5 h-5" />
    case 'laptop': case 'notebook': return <Laptop className="w-5 h-5" />
    case 'server': case 'sunucu': return <Database className="w-5 h-5" />
    case 'internet': case 'network': return <Globe className="w-5 h-5" />
    case 'gaming': case 'oyun': return <Gamepad2 className="w-5 h-5" />
    case 'access point': case 'ap': return <Shield className="w-5 h-5" />
    case 'switch': case 'network switch': return <Settings className="w-5 h-5" />
    default: return <Wifi className="w-5 h-5" />
  }
}

async function ProductsList({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page
  const page = parseInt(pageParam || '1')
  const limit = 12

  // URL parametrelerini işle
  const search = Array.isArray(params.search) ? params.search[0] : params.search
  const brand = Array.isArray(params.brand) ? params.brand[0] : params.brand
  const categorySlug = Array.isArray(params.category) ? params.category[0] : params.category
  const priceMin = Array.isArray(params.price_min) ? params.price_min[0] : params.price_min
  const priceMax = Array.isArray(params.price_max) ? params.price_max[0] : params.price_max

  // Django API'den kategorileri çek
  const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/?is_active=true&ordering=name`, {
    cache: 'no-store'
  })
  const categoriesData = await categoriesResponse.json()
  const categories = categoriesData.results || []

  // Slug'dan category ID'sini bul
  const selectedCategory = categories.find((c: any) => c.slug === categorySlug)
  const categoryId = selectedCategory?.id

  // Django API'den ürünleri çek
  const productParams = new URLSearchParams()
  if (search) productParams.append('search', search)
  if (brand) productParams.append('brand', brand)
  if (categoryId) productParams.append('category', categoryId.toString())
  if (priceMin) productParams.append('price_min', priceMin)
  if (priceMax) productParams.append('price_max', priceMax)
  productParams.append('page', page.toString())
  productParams.append('limit', limit.toString())

  const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/?${productParams.toString()}`, {
    cache: 'no-store'
  })
  const productsData = await productsResponse.json()
  const products = productsData.results || []
  const total = productsData.count || 0


  // Ana kategorileri ve alt kategorileri ayır
  const mainCategories = categories.filter((cat: any) => !cat.parent)
  const subCategories = categories.filter((cat: any) => cat.parent)
  
  // Kategorileri hiyerarşik yapıya dönüştür
  const organizedCategories = mainCategories.map((mainCat: any) => ({
    ...mainCat,
    children: subCategories.filter((subCat: any) => subCat.parent === mainCat.id)
  }))

  // Markaları ürünlerden çıkar
  const brands = [...new Set(products.map((product: any) => product.brand))].sort() as string[]


  // Kategori bazlı özel filtreler
  const categorySlugForFilters = selectedCategory?.slug || ''

  const totalPages = Math.ceil(total / limit)

  // Filtreleme seçenekleri
  const gpuOptions = [
    'RTX 4090', 'RTX 4080', 'RTX 4070', 'RTX 4060', 'RTX 3090', 'RTX 3080', 'RTX 3070',
    'RX 7900 XTX', 'RX 7900 XT', 'RX 7800 XT', 'RX 7700 XT', 'RX 7600 XT', 'RX 6600 XT'
  ]

  const monitorOptions = [
    '4K', '1440p', '1080p', '144Hz', '240Hz', 'OLED', 'IPS', 'VA', 'TN', 'Ultrawide'
  ]

  const routerOptions = [
    'Wi-Fi 6E', 'Wi-Fi 6', 'Wi-Fi 5', 'Gigabit', 'Mesh', 'Tri-Band', 'Dual-Band'
  ]

  const yearOptions = [2024, 2023, 2022, 2021, 2020, 2019]

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sol Panel - Modern Filtreler */}
        <div className="lg:w-1/4">
          {/* Ana Filtreler */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ana Kategoriler - Expandable Style */}
              <ExpandableCategories
                categories={organizedCategories}
                selectedCategorySlug={categorySlug}
              />

              {/* Marka Filtreleri */}
              <BrandFilters
                brands={brands}
                selectedBrand={brand}
              />

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
                  priceMin && priceMax ? `${priceMin}-${priceMax}` :
                  priceMin ? `${priceMin}+` : undefined
                }
              />
            </CardContent>
          </Card>

          {/* Temizle Filtreler */}
          {(categoryId || brand || search || priceMin || priceMax) && (
            <Card>
              <CardContent className="pt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link href="/products">
                    <X className="w-4 h-4 mr-2" />
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
                  Object.entries(params).filter(([_, value]) => value !== undefined)
                ) as Record<string, string>}
              />
            </div>
          )}
        </div>

        {/* Ana İçerik */}
        <div className="lg:w-3/4">
          {/* Başlık ve Arama */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Ürünler</h1>
            <ProductSearchForm />
          </div>

          {/* Sonuç Sayısı */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {total} ürün bulundu
              {search && ` "${search}" için`}
              {brand && ` ${brand} markası için`}
              {categoryId && ` ${categories.find((c: any) => c.id === categoryId)?.name} kategorisi için`}
              {priceMin && priceMax && ` ${priceMin}₺ - ${priceMax}₺ aralığında`}
              {priceMin && !priceMax && ` ${priceMin}₺ ve üzeri`}
            </p>
          </div>

          {/* Ürün Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {products.map((product: any) => {
              const specs = product.specs || {}
              const averageScore = product.average_rating || 0

              return (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      {product.cover_image ? (
                        <img 
                          src={product.cover_image} 
                          alt={`${product.brand} ${product.model}`}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        getCategoryIcon(product.category?.name || '')
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.category && (
                            <Badge variant="outline">
                              {product.category.name}
                            </Badge>
                          )}
                          {product.product_tags?.slice(0, 3).map((tag: any) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {product.product_tags?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.product_tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                          {product.brand} {product.model}
                        </h3>
                        {product.release_year && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{product.release_year}</span>
                          </div>
                        )}
                      </div>

                      {/* Özellikler */}
                      <div className="space-y-2">
                        {product.product_specs?.slice(0, 3).map((spec: any) => (
                          <div key={spec.id} className="flex items-center gap-2">
                            <span className="text-sm font-medium">{spec.name}:</span>
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

                      {/* Puan ve İstatistikler */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          {averageScore > 0 ? (
                            <>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className={`font-semibold ${getScoreColor(averageScore)}`}>
                                {averageScore.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({product.review_count || 0} değerlendirme)
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Henüz puanlanmamış</span>
                          )}
                        </div>
                        
                        {/*<div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            <span>{product.article_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{product.click_count || 0}</span>
                          </div>
                        </div>*/}
                      </div>

                      {/* Aksiyonlar */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/products/by-slug/${product.slug}`}>
                            Detayları Gör
                          </Link>
                        </Button>
                        <FavoriteButton productId={product.id} className="w-8 h-8" />
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
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  asChild
                >
                  <Link href={`/products?page=${pageNum}${search ? `&search=${search}` : ''}${brand ? `&brand=${encodeURIComponent(brand)}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}${priceMin ? `&price_min=${priceMin}` : ''}${priceMax ? `&price_max=${priceMax}` : ''}`}>
                    {pageNum}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Ürünler yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <ProductsList searchParams={searchParams} />
    </Suspense>
  )
}