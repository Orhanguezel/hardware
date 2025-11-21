'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Loader2,
  Package,
  Star,
  Link as LinkIcon,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  brand: string
  model: string
  slug: string
  description?: string
  price?: number
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
  productSpecs: Array<{
    id: string
    name: string
    value: string
    unit?: string
    isVisible: boolean
    sortOrder: number
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

interface Category {
  id: string
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
  type: string
}

export default function ManageProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    description: '',
    releaseYear: '',
    categoryId: '',
    coverImage: '',
    price: ''
  })

  // Product specs state
  const [productSpecs, setProductSpecs] = useState<Array<{
    id?: string
    name: string
    value: string
    unit: string
    isVisible: boolean
    sortOrder: number
  }>>([])

  // Affiliate links state
  const [affiliateLinks, setAffiliateLinks] = useState<Array<{
    id?: string
    merchant: string
    urlTemplate: string
    active: boolean
  }>>([])

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchCategories()
      fetchTags()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/products/${productId}`)
      const data = await response.json()
      
      if (data.success) {
        const productData = data.data
        console.log('Product data received:', productData)
        console.log('ProductSpecs type:', typeof productData.productSpecs, productData.productSpecs)
        console.log('AffiliateLinks type:', typeof productData.affiliateLinks, productData.affiliateLinks)
        setProduct(productData)
        
        // Set form data
        setFormData({
          brand: productData.brand || '',
          model: productData.model || '',
          description: productData.description || '',
          releaseYear: productData.releaseYear?.toString() || '',
          categoryId: productData.category?.id || '',
          coverImage: '', // Don't populate with existing URL to avoid sending it back
          price: productData.price?.toString() || ''
        })

        // Set image preview if cover image exists
        if (productData.coverImage) {
          setImagePreview(productData.coverImage)
        }

        // Set product specs - ensure it's an array
        const specs = Array.isArray(productData.productSpecs) ? productData.productSpecs : []
        setProductSpecs(specs.map((spec: any) => ({
          id: spec.id,
          name: spec.name || '',
          value: spec.value || '',
          unit: spec.unit || '',
          isVisible: spec.isVisible !== false,
          sortOrder: spec.sortOrder || 0
        })))

        // Set affiliate links - ensure it's an array
        const links = Array.isArray(productData.affiliateLinks) ? productData.affiliateLinks : []
        setAffiliateLinks(links.map((link: any) => ({
          id: link.id,
          merchant: link.merchant || '',
          urlTemplate: link.urlTemplate || '',
          active: link.active !== false
        })))

        // Set product tags
        const tags = Array.isArray(productData.product_tags) ? productData.product_tags : []
        setSelectedTags(tags.map((tag: any) => tag.id))
      } else {
        setError(data.error || 'Ürün bulunamadı')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Ürün yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const data = await response.json()
      
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({
      ...prev,
      coverImage: 'REMOVE_IMAGE' // Special signal to remove image
    }))
  }

  const addProductSpec = () => {
    setProductSpecs(prev => [...prev, {
      name: '',
      value: '',
      unit: '',
      isVisible: true,
      sortOrder: prev.length
    }])
  }

  const updateProductSpec = (index: number, field: string, value: any) => {
    setProductSpecs(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ))
  }

  const removeProductSpec = (index: number) => {
    setProductSpecs(prev => prev.filter((_, i) => i !== index))
  }

  const addAffiliateLink = () => {
    setAffiliateLinks(prev => [...prev, {
      merchant: '',
      urlTemplate: '',
      active: true
    }])
  }

  const updateAffiliateLink = (index: number, field: string, value: any) => {
    setAffiliateLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
  }

  const removeAffiliateLink = (index: number) => {
    setAffiliateLinks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('model', formData.model)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category_id', formData.categoryId)
      if (formData.price) formDataToSend.append('price', formData.price)
      if (formData.releaseYear) formDataToSend.append('release_year', formData.releaseYear)
      // Add image file if selected, otherwise use URL, or handle removal signal
      if (imageFile) {
        formDataToSend.append('cover_image_file', imageFile)
      } else if (formData.coverImage === 'REMOVE_IMAGE') {
        // Send empty string to remove image
        formDataToSend.append('cover_image', '')
      } else if (formData.coverImage && formData.coverImage.trim() !== '') {
        formDataToSend.append('cover_image', formData.coverImage)
      }
      // If neither file nor URL nor removal signal, don't send cover_image field (keep existing)
      
      // Add tags - always send the field, even if empty
      if (selectedTags.length > 0) {
        selectedTags.forEach(tagId => {
          formDataToSend.append('tags', tagId.toString())
        })
      } else {
        // Send empty string to clear all tags
        formDataToSend.append('tags', '')
      }
      
      // Add specs
      const validSpecs = productSpecs.filter(spec => spec.name && spec.value)
      validSpecs.forEach((spec, index) => {
        formDataToSend.append(`specs[${index}][name]`, spec.name)
        formDataToSend.append(`specs[${index}][value]`, spec.value)
        formDataToSend.append(`specs[${index}][unit]`, spec.unit)
        formDataToSend.append(`specs[${index}][is_visible]`, spec.isVisible.toString())
        formDataToSend.append(`specs[${index}][sort_order]`, index.toString())
      })
      
      // Add affiliate links - always send the field, even if empty
      const validLinks = affiliateLinks.filter(link => link.merchant && link.urlTemplate)
      
      // Always send affiliate_links_data field, even if empty
      if (validLinks.length > 0) {
        validLinks.forEach((link, index) => {
          formDataToSend.append(`affiliate_links_data[${index}][merchant]`, link.merchant)
          formDataToSend.append(`affiliate_links_data[${index}][url_template]`, link.urlTemplate)
          formDataToSend.append(`affiliate_links_data[${index}][active]`, link.active.toString())
        })
      } else {
        // Send empty array to clear all affiliate links
        formDataToSend.append('affiliate_links_data', '[]')
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Ürün başarıyla güncellendi')
        fetchProduct() // Refresh data
      } else {
        toast.error(data.error || 'Ürün güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Ürün güncellenirken hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Ürün yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Ürün bulunamadı'}</p>
          <Button onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ürünler Listesine Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ürün Düzenle</h1>
            <p className="text-muted-foreground">
              {product.brand} {product.model}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marka</Label>
                  <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Örn: ASUS"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Örn: RTX 4090"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Ürün açıklaması..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Fiyat (₺)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="releaseYear">Çıkış Yılı</Label>
                  <Input
                    id="releaseYear"
                    name="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={handleInputChange}
                    placeholder="2024"
                  />
                </div>
              <div>
                <Label htmlFor="categoryId">Kategori</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Etiketler</Label>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Etiket yükleniyor...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id)
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted'
                          }`}
                        >
                          {tag.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

              <div>
                <Label htmlFor="coverImage">Ürün Görseli</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="coverImage"
                      name="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG veya GIF formatında, maksimum 5MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {imageFile ? `Seçilen dosya: ${imageFile.name}` : 'Dosya seçilmedi'}
                    </p>
                    {(imageFile || imagePreview) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Kaldır
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Specifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ürün Özellikleri</CardTitle>
                <Button onClick={addProductSpec} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Özellik Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {productSpecs.map((spec, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <Label>Özellik Adı</Label>
                    <Input
                      value={spec.name}
                      onChange={(e) => updateProductSpec(index, 'name', e.target.value)}
                      placeholder="Örn: VRAM"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Değer</Label>
                    <Input
                      value={spec.value}
                      onChange={(e) => updateProductSpec(index, 'value', e.target.value)}
                      placeholder="16"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Birim</Label>
                    <Input
                      value={spec.unit}
                      onChange={(e) => updateProductSpec(index, 'unit', e.target.value)}
                      placeholder="GB"
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={spec.isVisible}
                      onChange={(e) => updateProductSpec(index, 'isVisible', e.target.checked)}
                      className="mr-2"
                    />
                    <Label className="text-sm">Görünür</Label>
                  </div>
                  <div className="col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProductSpec(index)}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Affiliate Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Affiliate Linkler</CardTitle>
                <Button onClick={addAffiliateLink} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Link Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {affiliateLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <Label>Satıcı</Label>
                    <Input
                      value={link.merchant}
                      onChange={(e) => updateAffiliateLink(index, 'merchant', e.target.value)}
                      placeholder="Örn: Trendyol"
                    />
                  </div>
                  <div className="col-span-6">
                    <Label>URL Template</Label>
                    <Input
                      value={link.urlTemplate}
                      onChange={(e) => updateAffiliateLink(index, 'urlTemplate', e.target.value)}
                      placeholder="https://trendyol.com/product-url"
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={link.active}
                      onChange={(e) => updateAffiliateLink(index, 'active', e.target.checked)}
                      className="mr-2"
                    />
                    <Label className="text-sm">Aktif</Label>
                  </div>
                  <div className="col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAffiliateLink(index)}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Değişiklikleri Kaydet
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ürün Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">ID: {product.id}</span>
              </div>
              
              {product.category && (
                <div>
                  <Label className="text-sm text-muted-foreground">Kategori</Label>
                  <Badge variant="outline">{product.category.name}</Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Özellikler</Label>
                  <p className="font-medium">{product.specsCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Affiliate Linkler</Label>
                  <p className="font-medium">{product.affiliateLinksCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Oluşturulma: {new Date(product.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
