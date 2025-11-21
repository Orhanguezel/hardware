'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Save, 
  ArrowLeft,
  Plus,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductSpec {
  id?: string
  name: string
  value: string
}

interface Product {
  id: string
  brand: string
  model: string
  description?: string
  categoryId: string
  price?: number
  releaseYear?: number
  imageUrl?: string
  productSpecs: ProductSpec[]
}

interface ProductEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AdminProductsEditPage({ params }: ProductEditPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [specs, setSpecs] = useState<ProductSpec[]>([{ name: '', value: '' }])
  const [productId, setProductId] = useState('')
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    description: '',
    categoryId: '',
    price: '',
    releaseYear: '',
    imageUrl: ''
  })

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
      await Promise.all([
        fetchCategories(),
        fetchProduct(resolvedParams.id)
      ])
      setInitialLoading(false)
    }
    loadData()
  }, [params])

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

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`)
      const result = await response.json()
      
      if (result.success) {
        const product = result.data
        setFormData({
          brand: product.brand,
          model: product.model,
          description: product.description || '',
          categoryId: product.categoryId,
          price: product.price?.toString() || '',
          releaseYear: product.releaseYear?.toString() || '',
          imageUrl: product.imageUrl || ''
        })
        
        if (product.productSpecs && product.productSpecs.length > 0) {
          setSpecs(product.productSpecs)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }

  const addSpec = () => {
    setSpecs([...specs, { name: '', value: '' }])
  }

  const removeSpec = (index: number) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index))
    }
  }

  const updateSpec = (index: number, field: 'name' | 'value', value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.brand || !formData.model || !formData.categoryId) {
      toast.error('Marka, model ve kategori alanları zorunludur')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : null,
          productSpecs: specs.filter(spec => spec.name && spec.value)
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Ürün başarıyla güncellendi')
        router.push('/admin/products/manage')
      } else {
        toast.error(result.error || 'Ürün güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Ürün güncellenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Ürün yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products/manage">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ürün Düzenle</h1>
            <p className="text-muted-foreground">
              Ürün bilgilerini güncelleyin
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marka *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Örn: ASUS"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Örn: RT-AX88U Pro"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün hakkında kısa açıklama..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Fiyat (₺)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="releaseYear">Çıkış Yılı</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                    placeholder="2024"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Görsel URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ürün Özellikleri */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ürün Özellikleri</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSpec}>
                  <Plus className="w-4 h-4 mr-2" />
                  Özellik Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={spec.name}
                      onChange={(e) => updateSpec(index, 'name', e.target.value)}
                      placeholder="Özellik adı (örn: RAM)"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={spec.value}
                      onChange={(e) => updateSpec(index, 'value', e.target.value)}
                      placeholder="Özellik değeri (örn: 16GB)"
                    />
                  </div>
                  {specs.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpec(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products/manage">İptal</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  )
}
