'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Link as LinkIcon,
  Calendar,
  Star,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  brand: string
  model: string
  slug: string
  description?: string
  releaseYear?: number
  coverImage?: string
  category?: {
    id: string
    name: string
    slug: string
  }
  product_tags: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  affiliateLinks: Array<{
    id: string
    merchant: string
    urlTemplate: string
    active: boolean
  }>
  reviewCount: number
  averageRating?: number
  specsCount: number
  affiliateLinksCount: number
  createdAt: string
  updatedAt: string
}

interface ProductsResponse {
  success: boolean
  data?: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      
      const response = await fetch(`/api/admin/products?${params.toString()}`)
      const data: ProductsResponse = await response.json()
      
      if (data.success && data.data) {
        setProducts(data.data.products)
      } else {
        console.error('Failed to fetch products:', data.error)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, categoryFilter])

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`"${productName}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Ürün başarıyla silindi')
        fetchProducts() // Refresh the list
      } else {
        toast.error(data.error || 'Ürün silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Ürün silinirken hata oluştu')
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ürün Yönetimi</h1>
            <p className="text-muted-foreground">
              Tüm ürünleri yönetin ve affiliate linklerini düzenleyin
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Marka, model veya kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Ara
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Ürünler yükleniyor...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.brand} {product.model}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {product.category && (
                        <Badge variant="outline">{product.category.name}</Badge>
                      )}
                      {product.releaseYear && (
                        <Badge variant="secondary">{product.releaseYear}</Badge>
                      )}
                    </div>
                  </div>
                  {product.averageRating && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{product.averageRating}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Description */}
                  {product.description && (
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <h4 className="font-medium mb-2">Etiketler</h4>
                    {product.product_tags && product.product_tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.product_tags.slice(0, 5).map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {product.product_tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.product_tags.length - 5}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Henüz etiket eklenmemiş</p>
                    )}
                  </div>

                  {/* Affiliate Links */}
                  <div>
                    <h4 className="font-medium mb-2">Affiliate Linkler</h4>
                    {product.affiliateLinks.length > 0 ? (
                      <div className="space-y-2">
                        {product.affiliateLinks.map((link, index) => (
                          <div key={link.id || `link-${index}`} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant={link.active ? 'default' : 'secondary'} className="text-xs">
                                {link.merchant}
                              </Badge>
                              <LinkIcon className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Henüz affiliate link eklenmemiş</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{product.reviewCount} inceleme</span>
                      <span>{product.specsCount} özellik</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(product.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild className="flex-1">
                      <Link href={`/admin/products/manage/${product.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Düzenle
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id, `${product.brand} ${product.model}`)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ürün Bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                  : 'Henüz hiç ürün eklenmemiş.'
                }
              </p>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ürün Ekle
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
