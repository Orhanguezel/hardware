'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  FolderOpen, 
  Folder,
  Search,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  is_active: boolean
  sort_order: number
  parent?: number
  children?: Category[]
  article_count?: number
  product_count?: number
}

interface CategoryFormData {
  name: string
  slug: string
  parent: string
  description: string
  icon: string
  color: string
  sort_order: number
  is_active: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parent: '',
    description: '',
    icon: '',
    color: '',
    sort_order: 0,
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        // Organize categories into hierarchical structure
        const organizedCategories = organizeCategories(result.data)
        setCategories(organizedCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const organizeCategories = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>()
    const rootCategories: Category[] = []

    // First pass: create map and identify root categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
      if (!category.parent) {
        rootCategories.push(categoryMap.get(category.id)!)
      }
    })

    // Second pass: build hierarchy
    categories.forEach(category => {
      if (category.parent && categoryMap.has(category.parent)) {
        const parent = categoryMap.get(category.parent)!
        parent.children!.push(categoryMap.get(category.id)!)
      }
    })

    return rootCategories
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const requestData = {
        name: formData.name,
        slug: formData.slug,
        parent: formData.parent ? parseInt(formData.parent) : null,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        sort_order: formData.sort_order,
        is_active: formData.is_active
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchCategories()
        resetForm()
      } else {
        alert(result.error || 'Bir hata oluştu')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`${category.name} kategorisini silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      // Try ID-based deletion first, fallback to slug-based
      let response = await fetch(`/api/categories/${category.id}`, {
        method: 'DELETE',
      })

      // If ID-based fails, try slug-based
      if (!response.ok) {
        console.log('ID-based deletion failed, trying slug-based...')
        response = await fetch(`/api/categories/${category.slug}`, {
          method: 'DELETE',
        })
      }

      const result = await response.json()
      
      if (result.success) {
        await fetchCategories()
      } else {
        alert(result.error || 'Kategori silinemedi')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      parent: category.parent ? category.parent.toString() : '',
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active !== undefined ? category.is_active : true
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ 
      name: '', 
      slug: '', 
      parent: '', 
      description: '', 
      icon: '', 
      color: '', 
      sort_order: 0, 
      is_active: true 
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const filtered = searchTerm && !category.name.toLowerCase().includes(searchTerm.toLowerCase())

    if (filtered) return null

    return (
      <div key={category.id}>
        <div 
          className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={() => toggleExpanded(category.id)}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          )}
          
          {!hasChildren && <div className="w-6" />}

          <div className="flex items-center gap-2">
            {hasChildren ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-gray-500" />}
            <span className="font-medium">{category.name}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary" className="text-xs">
              {category.article_count || 0} makale
            </Badge>
            <Badge variant="outline" className="text-xs">
              {category.product_count || 0} ürün
            </Badge>
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                {category.children?.length || 0} alt kategori
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(category)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Kategoriler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kategori Yönetimi</h1>
          <p className="text-muted-foreground">Kategorileri düzenleyin, ekleyin ve silin</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kategori Listesi */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Kategoriler</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Kategori ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories
                  .filter(cat => !cat.parent) // Sadece ana kategoriler
                  .map(category => renderCategory(category))
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kategori Formu */}
        <div className="lg:col-span-1">
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Oluştur'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {editingCategory 
                    ? 'Mevcut kategoriyi düzenleyin' 
                    : 'Ana kategori veya alt kategori oluşturun - önce kategori türünü seçin'
                  }
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Kategori Adı</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Örn: Bluetooth, Kulaklık, Router"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="Örn: router"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Açıklama</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Kategori açıklaması..."
                      className="w-full p-2 border rounded-md bg-white text-gray-900"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Kategori Türü</label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="categoryType"
                            value="main"
                            checked={!formData.parent}
                            onChange={() => setFormData(prev => ({ ...prev, parent: '' }))}
                            className="rounded"
                          />
                          <span className="text-sm">Ana Kategori</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="categoryType"
                            value="sub"
                            checked={!!formData.parent}
                            onChange={() => setFormData(prev => ({ ...prev, parent: prev.parent || (categories.find(cat => !cat.parent)?.id?.toString() || '') }))}
                            className="rounded"
                          />
                          <span className="text-sm">Alt Kategori</span>
                        </label>
                      </div>
                    </div>

                    {formData.parent && (
                      <div>
                        <label className="text-sm font-medium">Ana Kategori Seçin</label>
                        <select
                          value={formData.parent}
                          onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                          className="w-full p-2 border rounded-md mt-1 bg-white text-gray-900"
                        >
                          <option value="">Ana kategori seçin...</option>
                          {categories
                            .filter(cat => !cat.parent && cat.id !== editingCategory?.id)
                            .map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md">
                      <p className="font-medium mb-1">💡 Nasıl Kullanılır:</p>
                      <p>• <strong>Ana Kategori:</strong> "Bluetooth", "Gaming", "Ofis" gibi genel kategoriler</p>
                      <p>• <strong>Alt Kategori:</strong> "Kulaklık", "Klavye", "Monitör" gibi spesifik kategoriler</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">İkon</label>
                      <Input
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="Örn: Monitor, Cpu, etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Renk</label>
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sıralama</label>
                    <Input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium">
                      Aktif
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingCategory ? 'Güncelle' : 'Oluştur'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      İptal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
