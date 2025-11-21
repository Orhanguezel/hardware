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

interface Tag {
  id: number
  name: string
  slug: string
  type: string
}

interface ProductSpec {
  name: string
  value: string
  unit: string
}

interface AffiliateLink {
  merchant: string
  urlTemplate: string
  active: boolean
}

export default function AdminProductsNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [specs, setSpecs] = useState<ProductSpec[]>([{ name: '', value: '', unit: '' }])
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([{ merchant: '', urlTemplate: '', active: true }])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
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
    fetchCategories()
    fetchTags()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        // Convert category IDs to strings for consistency
        const categoriesWithStringIds = result.data.map((category: any) => ({
          ...category,
          id: category.id.toString()
        }))
        setCategories(categoriesWithStringIds)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      const result = await response.json()
      if (result.success) {
        setTags(result.data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const addSpec = () => {
    setSpecs([...specs, { name: '', value: '', unit: '' }])
  }

  const removeSpec = (index: number) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index))
    }
  }

  const updateSpec = (index: number, field: 'name' | 'value' | 'unit', value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  const addAffiliateLink = () => {
    setAffiliateLinks([...affiliateLinks, { merchant: '', urlTemplate: '', active: true }])
  }

  const removeAffiliateLink = (index: number) => {
    if (affiliateLinks.length > 1) {
      setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index))
    }
  }

  const updateAffiliateLink = (index: number, field: 'merchant' | 'urlTemplate' | 'active', value: string | boolean) => {
    const newLinks = [...affiliateLinks]
    newLinks[index][field] = value as any
    setAffiliateLinks(newLinks)
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.brand || !formData.model || !formData.categoryId) {
      toast.error('Marka, model ve kategori alanları zorunludur')
      return
    }

    setLoading(true)

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('model', formData.model)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category_id', formData.categoryId)
      if (formData.price) formDataToSend.append('price', formData.price)
      if (formData.releaseYear) formDataToSend.append('release_year', formData.releaseYear)
      if (formData.imageUrl) formDataToSend.append('cover_image', formData.imageUrl)
      
      // Add image file if selected
      if (imageFile) {
        formDataToSend.append('cover_image_file', imageFile)
      }
      
      // Add tags
      selectedTags.forEach(tagId => {
        formDataToSend.append('tags', tagId.toString())
      })
      
      // Add specs
      const validSpecs = specs.filter(spec => spec.name && spec.value)
      validSpecs.forEach((spec, index) => {
        formDataToSend.append(`specs[${index}][name]`, spec.name)
        formDataToSend.append(`specs[${index}][value]`, spec.value)
        formDataToSend.append(`specs[${index}][unit]`, spec.unit)
        formDataToSend.append(`specs[${index}][sort_order]`, index.toString())
      })
      
      // Add affiliate links
      const validLinks = affiliateLinks.filter(link => link.merchant && link.urlTemplate)
      validLinks.forEach((link, index) => {
        formDataToSend.append(`affiliate_links_data[${index}][merchant]`, link.merchant)
        formDataToSend.append(`affiliate_links_data[${index}][url_template]`, link.urlTemplate)
        formDataToSend.append(`affiliate_links_data[${index}][active]`, link.active.toString())
      })

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Ürün başarıyla oluşturuldu')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Ürün oluşturulurken hata oluştu')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Ürün oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold">Yeni Ürün Ekle</h1>
            <p className="text-muted-foreground">
              Yeni bir ürün oluşturun ve sisteme ekleyin
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

              <div>
                <Label>Etiketler</Label>
                <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Etiket yükleniyor...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            selectedTags.includes(tag.id)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted'
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTags.length} etiket seçildi
                  </p>
                )}
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
                <Label htmlFor="imageFile">Ürün Görseli</Label>
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
                      id="imageFile"
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

          {/* Affiliate Bilgileri */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Affiliate Bilgileri</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addAffiliateLink}>
                  <Plus className="w-4 h-4 mr-2" />
                  Link Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {affiliateLinks.map((link, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`affiliate-merchant-${index}`}>Satıcı</Label>
                      <Input
                        id={`affiliate-merchant-${index}`}
                        value={link.merchant}
                        onChange={(e) => updateAffiliateLink(index, 'merchant', e.target.value)}
                        placeholder="Örn: Amazon, Teknosa"
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`affiliate-url-${index}`}>Affiliate URL</Label>
                      <Input
                        id={`affiliate-url-${index}`}
                        value={link.urlTemplate}
                        onChange={(e) => updateAffiliateLink(index, 'urlTemplate', e.target.value)}
                        placeholder="https://affiliate-link.com"
                      />
                    </div>
                    {affiliateLinks.length > 1 && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAffiliateLink(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

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
              <div key={index} className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`spec-name-${index}`}>Özellik Adı</Label>
                    <Input
                      id={`spec-name-${index}`}
                      value={spec.name}
                      onChange={(e) => updateSpec(index, 'name', e.target.value)}
                      placeholder="Özellik adı (örn: RAM)"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`spec-value-${index}`}>Değer</Label>
                    <Input
                      id={`spec-value-${index}`}
                      value={spec.value}
                      onChange={(e) => updateSpec(index, 'value', e.target.value)}
                      placeholder="Değer (örn: 16)"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`spec-unit-${index}`}>Birim</Label>
                    <Input
                      id={`spec-unit-${index}`}
                      value={spec.unit}
                      onChange={(e) => updateSpec(index, 'unit', e.target.value)}
                      placeholder="Birim (örn: GB)"
                    />
                  </div>
                  {specs.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpec(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products/manage">İptal</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  )
}