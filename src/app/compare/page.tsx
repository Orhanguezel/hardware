'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { 
  ArrowRight, 
  Scale, 
  Search,
  Plus,
  X,
  Star,
  Calendar,
  Zap,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Package
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: number
  brand: string
  model: string
  slug: string
  description?: string
  release_year?: number
  cover_image?: string
  category?: {
    id: number
    name: string
    slug: string
    parent?: number
  }
  product_specs?: Array<{
    id: number
    name: string
    value: string
    unit?: string
    type: string
    is_visible: boolean
    sort_order: number
  }>
  user_reviews?: Array<{
    rating: number
  }>
  review_count?: number
}

interface Category {
  id: number
  name: string
  slug: string
  parent?: number
  children?: Category[]
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showDifferences, setShowDifferences] = useState(false)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | string>('')
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | string>('')
  const [selectedCategory, setSelectedCategory] = useState<number | string>('')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    
    // URL parametresinden ürün ID'sini al ve otomatik ekle
    const urlParams = new URLSearchParams(window.location.search)
    const addProductId = urlParams.get('add')
    if (addProductId) {
      // URL'den add parametresini kaldır
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // Ürünü otomatik olarak ekle
      addProductToComparison(parseInt(addProductId))
    }
  }, [])

  const fetchProducts = async (categoryId?: number | string) => {
    try {
      let url = '/api/products?limit=100'
      if (categoryId) {
        url += `&category=${categoryId}`
      }
      
      console.log('Fetching products from:', url)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      const result = await response.json()
      console.log('Products response:', result)
      
      if (result.success) {
        setProducts(result.data)
        console.log('Products set:', result.data.length)
      } else {
        console.error('Failed to fetch products:', result.error)
        console.error('Full result object:', result)
        toast.error('Ürünler yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      console.error('Error details:', error)
      toast.error('Ürünler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsByMainCategory = async (mainCategoryId: number) => {
    try {
      console.log('Main category ID:', mainCategoryId)
      
      // Tüm ürünleri çek ve client-side'da filtrele
      const response = await fetch('/api/products?limit=1000')
      const result = await response.json()
      
      console.log('All products response:', result)
      
      if (result.success) {
        // Ana kategori ve alt kategorilerindeki ürünleri filtrele
        const subCategories = getSubCategories(mainCategoryId)
        const subCategoryIds = subCategories.map(cat => cat.id)
        const allCategoryIds = [mainCategoryId, ...subCategoryIds]
        
        console.log('Filtering by category IDs:', allCategoryIds)
        
        const filteredProducts = result.data.filter((product: Product) => {
          return product.category && allCategoryIds.includes(product.category.id)
        })
        
        console.log('Filtered products:', filteredProducts.length)
        setProducts(filteredProducts)
      } else {
        console.error('Failed to fetch products:', result.error)
        toast.error('Ürünler yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching products by main category:', error)
      toast.error('Ürünler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const addToComparison = (product: Product) => {
    if (selectedProducts.length >= 4) {
      toast.error('Maksimum 4 ürün karşılaştırabilirsiniz')
      return
    }
    
    if (selectedProducts.find(p => p.id === product.id)) {
      toast.error('Bu ürün zaten karşılaştırmada')
      return
    }

    // İlk ürün seçiliyorsa, kategoriyi belirle
    if (selectedProducts.length === 0) {
      setSelectedCategory(product.category?.id || '')
      setSelectedProducts([...selectedProducts, product])
      toast.success(`${product.brand} ${product.model} karşılaştırmaya eklendi`)
      return
    }

    // Aynı kategorideki ürünleri kontrol et
    const firstProductCategory = selectedProducts[0].category?.id
    const currentProductCategory = product.category?.id

    if (firstProductCategory !== currentProductCategory) {
      toast.error('Sadece aynı kategorideki ürünleri karşılaştırabilirsiniz')
      return
    }
    
    setSelectedProducts([...selectedProducts, product])
    toast.success(`${product.brand} ${product.model} karşılaştırmaya eklendi`)
  }

  const addProductToComparison = async (productId: number) => {
    try {
      console.log('Adding product to comparison, ID:', productId)
      // Ürünü API'den çek
      const response = await fetch(`/api/products/${productId}`)
      console.log('API response status:', response.status)
      
      if (!response.ok) {
        console.error('API response not OK:', response.status)
        toast.error('Ürün bulunamadı')
        return
      }
      
      const result = await response.json()
      console.log('API result:', result)
      
      if (result.success) {
        const product = result.data
        console.log('Product data:', product)
        addToComparison(product)
      } else {
        console.error('API result not successful:', result)
        toast.error('Ürün yüklenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Ürün yüklenirken bir hata oluştu')
    }
  }

  const removeFromComparison = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId))
  }

  const clearComparison = () => {
    setSelectedProducts([])
    setShowDifferences(false)
  }

  const getMainCategories = () => {
    return categories.filter(cat => !cat.parent)
  }

  const getSubCategories = (mainCategoryId: number) => {
    return categories.filter(cat => cat.parent === mainCategoryId)
  }

  const handleMainCategoryChange = (categoryId: string) => {
    const newMainCategory = categoryId === 'all' ? '' : parseInt(categoryId)
    setSelectedMainCategory(newMainCategory)
    setSelectedSubCategory('') // Alt kategori seçimini sıfırla
    
    console.log('Main category changed to:', newMainCategory)
    
    // Ana kategori değiştiğinde ürünleri yeniden çek
    if (newMainCategory) {
      setLoading(true)
      // Ana kategori için özel bir API çağrısı yapalım
      fetchProductsByMainCategory(newMainCategory)
    } else {
      setLoading(true)
      fetchProducts()
    }
  }

  const handleSubCategoryChange = (categoryId: string) => {
    const newSubCategory = categoryId === 'all' ? '' : parseInt(categoryId)
    setSelectedSubCategory(newSubCategory)
    
    // Alt kategori değiştiğinde ürünleri yeniden çek
    if (newSubCategory) {
      setLoading(true)
      fetchProducts(newSubCategory)
    } else if (selectedMainCategory) {
      setLoading(true)
      fetchProducts(selectedMainCategory)
    } else {
      setLoading(true)
      fetchProducts()
    }
  }

  const getAverageRating = (reviews: Array<{ rating: number }> | undefined) => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'ekran kartı':
      case 'gpu':
        return <Monitor className="w-4 h-4" />
      case 'işlemci':
      case 'cpu':
        return <Cpu className="w-4 h-4" />
      case 'ram':
        return <Zap className="w-4 h-4" />
      case 'depolama':
        return <HardDrive className="w-4 h-4" />
      case 'router':
      case 'modem':
        return <Wifi className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getAllSpecs = () => {
    const allSpecNames = new Set<string>()
    selectedProducts.forEach(product => {
      if (product.product_specs) {
        product.product_specs.forEach(spec => {
          allSpecNames.add(spec.name)
        })
      }
    })
    return Array.from(allSpecNames).sort()
  }

  const getProductSpecValue = (product: Product, specName: string) => {
    if (!product.product_specs) return '-'
    const spec = product.product_specs.find(s => s.name === specName)
    return spec ? `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}` : '-'
  }

  const isDifferentValue = (specName: string) => {
    if (selectedProducts.length < 2) return false
    
    const values = selectedProducts.map(product => getProductSpecValue(product, specName))
    return new Set(values).size > 1
  }

  const filteredProducts = products.filter(product => {
    // Arama terimi kontrolü
    const matchesSearch = !searchTerm || 
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ürün Karşılaştırma</h1>
        <p className="text-muted-foreground">
          Ürünleri karşılaştırın ve farkları görün
        </p>
      </div>

      {/* Ürün Arama ve Seçim */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Ürün Ara ve Karşılaştırmaya Ekle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Arama ve Filtreler */}
            <div className="flex flex-col lg:flex-row gap-4">
              <Input
                placeholder="Marka, model veya kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Ana Kategori Seçimi */}
                <Select value={selectedMainCategory || 'all'} onValueChange={handleMainCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Ana Kategori Seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Ana Kategoriler</SelectItem>
                    {getMainCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Alt Kategori Seçimi */}
                {selectedMainCategory && (
                  <Select value={selectedSubCategory || 'all'} onValueChange={handleSubCategoryChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Alt Kategori Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Alt Kategoriler</SelectItem>
                      {getSubCategories(selectedMainCategory).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Filtre Temizleme */}
            {(selectedMainCategory || selectedSubCategory) && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedMainCategory('')
                    setSelectedSubCategory('')
                    setLoading(true)
                    fetchProducts()
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Filtreleri Temizle
                </Button>
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedMainCategory && getMainCategories().find(c => c.id === selectedMainCategory)?.name}
                  {selectedSubCategory && ` > ${getSubCategories(selectedMainCategory).find(c => c.id === selectedSubCategory)?.name}`}
                </Badge>
              </div>
            )}
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      {product.cover_image ? (
                        <img 
                          src={product.cover_image} 
                          alt={`${product.brand} ${product.model}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          {getCategoryIcon(product.category?.name || '')}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{product.brand} {product.model}</h3>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category.name}
                        </Badge>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => addToComparison(product)}
                      disabled={selectedProducts.find(p => p.id === product.id) !== undefined}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Bu kategoride ürün bulunamadı.</p>
                <p className="text-sm">Farklı bir kategori seçmeyi deneyin.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Karşılaştırma Kontrolleri */}
      {selectedProducts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Karşılaştırma ({selectedProducts.length}/4)
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="show-differences" 
                    checked={showDifferences}
                    onCheckedChange={(checked) => setShowDifferences(checked as boolean)}
                  />
                  <Label htmlFor="show-differences">Sadece farkları göster</Label>
                </div>
                <Button variant="outline" onClick={clearComparison}>
                  <X className="w-4 h-4 mr-2" />
                  Temizle
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Karşılaştırma Tablosu */}
      {selectedProducts.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Özellik</th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} className="text-center p-4 min-w-48">
                        <div className="space-y-2">
                          <div className="flex items-center justify-center">
                            {product.cover_image ? (
                              <img 
                                src={product.cover_image} 
                                alt={`${product.brand} ${product.model}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                                {getCategoryIcon(product.category?.name || '')}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{product.brand}</h3>
                            <p className="text-sm text-muted-foreground">{product.model}</p>
                            {product.category && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {product.category.name}
                              </Badge>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromComparison(product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Temel Bilgiler */}
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Marka</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">{product.brand}</td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Model</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">{product.model}</td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Kategori</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">{product.category?.name || '-'}</td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Çıkış Yılı</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">{product.release_year || '-'}</td>
                    ))}
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="p-4 font-medium">Ortalama Puan</td>
                    {selectedProducts.map((product) => {
                      const avgRating = getAverageRating(product.user_reviews)
                      return (
                        <td key={product.id} className="p-4 text-center">
                          {avgRating > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{avgRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({product.review_count || 0})
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Teknik Özellikler */}
                  {getAllSpecs().map((specName) => {
                    const isDifferent = isDifferentValue(specName)
                    const shouldShow = !showDifferences || isDifferent
                    
                    if (!shouldShow) return null
                    
                    return (
                      <tr 
                        key={specName} 
                        className={`border-b ${isDifferent && showDifferences ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                      >
                        <td className={`p-4 font-medium ${isDifferent && showDifferences ? 'font-bold' : ''}`}>
                          {specName}
                        </td>
                        {selectedProducts.map((product) => (
                          <td 
                            key={product.id} 
                            className={`p-4 text-center ${isDifferent && showDifferences ? 'font-bold' : ''}`}
                          >
                            {getProductSpecValue(product, specName)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}