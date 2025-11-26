'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Scale,
  Monitor,
  Cpu,
  Wifi,
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
  Package,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  brand: string
  model: string
  slug: string
  description?: string
  releaseYear?: number
  category?: {
    id: string
    name: string
  }
  productSpecs: Array<{
    id: string
    name: string
    value: string
    unit?: string
    type: string
    isVisible: boolean
  }>
  userReviews: Array<{
    rating: number
  }>
  coverImage?: string
  _count: {
    userReviews: number
    articleProducts: number
    outboundClicks: number
  }
}

interface ComparisonFilters {
  category: string
  brand: string
  search: string
}

export default function ProductComparisonPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState<ComparisonFilters>({
    category: '',
    brand: '',
    search: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])

      const [productsResult, categoriesResult] = await Promise.all([
        productsRes.json(),
        categoriesRes.json()
      ])

      if (productsResult.success) {
        setProducts(productsResult.data)
        // Extract unique brands
        const uniqueBrands = [...new Set(productsResult.data.map((p: Product) => p.brand))] as string[]
        setBrands(uniqueBrands)
      }

      if (categoriesResult.success) {
        setCategories(categoriesResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category?.id !== filters.category) return false
    if (filters.brand && product.brand !== filters.brand) return false
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      if (!product.brand.toLowerCase().includes(searchTerm) && 
          !product.model.toLowerCase().includes(searchTerm)) {
        return false
      }
    }
    return true
  })

  const toggleProductSelection = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id))
    } else if (selectedProducts.length < 2) {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  const startComparison = () => {
    if (selectedProducts.length === 2) {
      // Navigate to comparison page
      const comparisonSlug = `${selectedProducts[0].slug}-vs-${selectedProducts[1].slug}`
      window.location.href = `/compare/products/${comparisonSlug}`
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'monitör': case 'monitor': return <Monitor className="w-4 h-4" />
      case 'ekran kartı': case 'gpu': case 'graphics': return <Cpu className="w-4 h-4" />
      case 'router': case 'modem': case 'mesh': return <Router className="w-4 h-4" />
      case 'ssd': case 'hdd': case 'storage': return <HardDrive className="w-4 h-4" />
      case 'kulaklık': case 'headphones': return <Headphones className="w-4 h-4" />
      case 'kamera': case 'camera': return <Camera className="w-4 h-4" />
      case 'telefon': case 'smartphone': return <Smartphone className="w-4 h-4" />
      case 'laptop': case 'notebook': return <Laptop className="w-4 h-4" />
      case 'server': case 'sunucu': return <Database className="w-4 h-4" />
      case 'internet': case 'network': return <Globe className="w-4 h-4" />
      case 'gaming': case 'oyun': return <Gamepad2 className="w-4 h-4" />
      case 'access point': case 'ap': return <Shield className="w-4 h-4" />
      case 'switch': case 'network switch': return <Settings className="w-4 h-4" />
      default: return <Wifi className="w-4 h-4" />
    }
  }

  const getAverageRating = (reviews: Array<{ rating: number }>) => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Ürünler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Scale className="w-8 h-8 text-blue-500" />
          <h1 className="text-4xl font-bold">Ürün Karşılaştırma</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          İki ürün seçin ve detaylı karşılaştırma yapın. 
          Özellikler, fiyatlar ve performans kriterlerini yan yana inceleyin.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sol Panel - Filtreler */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Kategori Filtresi */}
              <div>
                <h3 className="font-semibold mb-3">Kategori</h3>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marka Filtresi */}
              <div>
                <h3 className="font-semibold mb-3">Marka</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Tüm Markalar</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Arama */}
              <div>
                <h3 className="font-semibold mb-3">Arama</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Marka veya model ara..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seçili Ürünler */}
          {selectedProducts.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Seçili Ürünler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedProducts.map((product, index) => {
                    const averageRating = getAverageRating(product.userReviews)
                    return (
                      <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{product.brand} {product.model}</div>
                          {product.category && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              {getCategoryIcon(product.category.name)}
                              {product.category.name}
                            </div>
                          )}
                          {averageRating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProductSelection(product)}
                          className="text-red-500 hover:text-red-700 w-6 h-6 p-0"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>

                {selectedProducts.length === 2 && (
                  <Button 
                    className="w-full mt-4" 
                    onClick={startComparison}
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Karşılaştırmayı Başlat
                  </Button>
                )}

                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {selectedProducts.length}/2 ürün seçildi
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ana İçerik */}
        <div className="lg:w-3/4">
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} ürün bulundu
              {filters.search && ` "${filters.search}" için`}
              {filters.brand && ` ${filters.brand} markası için`}
              {filters.category && ` ${categories.find(c => c.id === filters.category)?.name} kategorisi için`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.find(p => p.id === product.id)
              const canSelect = selectedProducts.length < 2 || isSelected
              const averageRating = getAverageRating(product.userReviews)

              return (
                <Card 
                  key={product.id} 
                  className={`group hover:shadow-lg transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                  } ${!canSelect ? 'opacity-50' : ''}`}
                  onClick={() => canSelect && toggleProductSelection(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.coverImage ? (
                          <img 
                            src={product.coverImage} 
                            alt={`${product.brand} ${product.model}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          getCategoryIcon(product.category?.name || '')
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                              {product.brand} {product.model}
                            </h3>
                            {product.category && (
                              <Badge variant="outline" className="text-xs mt-1">
                                <span className="flex items-center gap-1">
                                  {getCategoryIcon(product.category.name)}
                                  {product.category.name}
                                </span>
                              </Badge>
                            )}
                            {product.releaseYear && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {product.releaseYear}
                              </div>
                            )}
                          </div>
                          
                          {isSelected && (
                            <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {selectedProducts.indexOf(product) + 1}
                            </div>
                          )}
                        </div>

                        {/* Özellikler */}
                        <div className="space-y-1 mb-2">
                          {product.productSpecs.slice(0, 2).map((spec) => (
                            <div key={spec.id} className="text-xs text-muted-foreground">
                              <span className="font-medium">{spec.name}:</span> {spec.value} {spec.unit}
                            </div>
                          ))}
                          {product.productSpecs.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{product.productSpecs.length - 2} özellik daha
                            </div>
                          )}
                        </div>

                        {/* İstatistikler */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {averageRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{averageRating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span>{product._count.userReviews} yorum</span>
                            <span>•</span>
                            <span>{product._count.articleProducts} inceleme</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Ürün bulunamadı</h3>
                  <p className="text-muted-foreground">
                    Arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}