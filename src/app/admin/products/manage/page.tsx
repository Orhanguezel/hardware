'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Package, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  TrendingUp,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  brand: string
  model: string
  slug: string
  description?: string
  price?: number
  category: {
    id: string
    name: string
    slug: string
  }
  reviewCount: number
  specsCount: number
  affiliateLinksCount: number
  createdAt: string
  updatedAt: string
}

export default function AdminProductsManagePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [page, categoryFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      })

      const response = await fetch(`/api/admin/products?${params}`)
      const result = await response.json()

      if (result.success) {
        setProducts(result.data.products)
        setTotalPages(result.data.totalPages)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh products
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Ürün Yönetimi</h1>
            <p className="text-muted-foreground">
              Ürünleri yönetin, düzenleyin ve silin
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ürünlerde ara..."
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
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {product.brand} {product.model}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {product.category.name}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/products/${product.slug}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/products/manage/${product.id}`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
              )}
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{product.reviewCount}</div>
                  <div className="text-xs text-muted-foreground">Yorum</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{product.specsCount}</div>
                  <div className="text-xs text-muted-foreground">Özellik</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{product.affiliateLinksCount}</div>
                  <div className="text-xs text-muted-foreground">Link</div>
                </div>
              </div>

              {product.price && (
                <div className="mt-4 text-center">
                  <span className="text-lg font-bold text-primary">
                    {product.price.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              )}

              <div className="mt-4 text-xs text-muted-foreground">
                Oluşturulma: {new Date(product.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Ürün Bulunamadı</h3>
          <p className="text-muted-foreground mb-4">
            Arama kriterlerinize uygun ürün bulunamadı.
          </p>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" />
              İlk Ürünü Ekle
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}