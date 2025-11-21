'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import RichEditor from '@/components/editor/rich-editor'
import { 
  Save, 
  Eye, 
  Send, 
  ArrowLeft,
  Plus,
  X,
  Loader2
} from 'lucide-react'

const articleTypes = [
  { value: 'REVIEW', label: 'İnceleme' },
  { value: 'BEST_LIST', label: 'En İyi Listeler' },
  { value: 'COMPARE', label: 'Karşılaştırma' },
  { value: 'GUIDE', label: 'Rehber' },
  { value: 'NEWS', label: 'Haber' }
]

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

interface Article {
  id: string
  title: string
  subtitle?: string
  excerpt?: string
  content?: string
  type: string
  status: string
  categoryId?: string
  heroImage?: string
  metaTitle?: string
  metaDescription?: string
  tags: string[]
  article_tags?: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  reviewExtra?: {
    performance: number
    stability: number
    coverage: number
    software: number
    value: number
    totalScore: number
  }
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [tagsLoading, setTagsLoading] = useState(true)
  const [articleLoading, setArticleLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    type: 'review',
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    category: '',
    heroImage: '',
    metaTitle: '',
    metaDescription: ''
  })

  const [reviewScores, setReviewScores] = useState({
    performance: 5,
    stability: 5,
    coverage: 5,
    software: 5,
    value: 5
  })
  const [totalScore, setTotalScore] = useState(5)

  useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchArticle()
  }, [articleId])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      } else {
        console.error('Failed to fetch categories:', data.error)
        toast.error('Kategoriler yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Kategoriler yüklenirken hata oluştu')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      setTagsLoading(true)
      const response = await fetch('/api/tags')
      const data = await response.json()
      
      if (data.success) {
        setTags(data.data)
      } else {
        console.error('Failed to fetch tags:', data.error)
        toast.error('Etiketler yüklenemedi')
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast.error('Etiketler yüklenirken hata oluştu')
    } finally {
      setTagsLoading(false)
    }
  }

  const fetchArticle = async () => {
    try {
      setArticleLoading(true)
      const response = await fetch(`/api/admin/articles/${articleId}`)
      const data = await response.json()
      
      if (data.success) {
        const article = data.data
        console.log('Article data received in edit page:', article)
        
        setFormData({
          type: article.type.toLowerCase(),
          title: article.title || '',
          subtitle: article.subtitle || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          category: article.category?.id || article.category_id || '',
          heroImage: '', // Don't populate with existing URL to avoid sending it back
          metaTitle: article.meta_title || '',
          metaDescription: article.meta_description || ''
        })

        // Set image preview if there's an existing hero image
        if (article.hero_image) {
          setImagePreview(article.hero_image)
        }

        // Set selected tags from article_tags
        const tags = Array.isArray(article.article_tags) ? article.article_tags : []
        console.log('Article tags from API:', tags)
        const tagIds = tags.map((tag: any) => tag.tag?.id || tag.id)
        console.log('Extracted tag IDs:', tagIds)
        setSelectedTags(tagIds)

        if (article.review_extra) {
          setReviewScores({
            performance: article.review_extra.performance_score || 5,
            stability: article.review_extra.stability_score || 5,
            coverage: article.review_extra.coverage_score || 5,
            software: article.review_extra.software_score || 5,
            value: article.review_extra.value_score || 5
          })
          setTotalScore(article.review_extra.total_score || 5)
        }
      } else {
        console.error('Failed to fetch article:', data.error)
        toast.error('Makale yüklenemedi')
        router.push('/admin/articles')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      toast.error('Makale yüklenirken hata oluştu')
      router.push('/admin/articles')
    } finally {
      setArticleLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setFormData(prev => ({ ...prev, heroImage: '' })) // Clear URL when file is selected
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({
      ...prev,
      heroImage: 'REMOVE_IMAGE' // Special signal to remove image
    }))
  }


  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleScoreChange = (scoreType: string, value: number) => {
    const newScores = { ...reviewScores, [scoreType]: value }
    setReviewScores(newScores)
    
    // Calculate total score as average of all scores
    const average = Object.values(newScores).reduce((sum, score) => sum + score, 0) / Object.keys(newScores).length
    setTotalScore(Math.round(average * 10) / 10)
  }

  const handleSave = async (status: string) => {
    if (!formData.title.trim()) {
      toast.error('Başlık gereklidir')
      return
    }

    if (!formData.content.trim()) {
      toast.error('İçerik gereklidir')
      return
    }

    if (!formData.category) {
      toast.error('Kategori seçilmelidir')
      return
    }

    try {
      setLoading(true)
      
      // Use FormData for file uploads
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('subtitle', formData.subtitle)
      formDataToSend.append('excerpt', formData.excerpt)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('type', formData.type.toUpperCase())
      formDataToSend.append('category_id', formData.category)
      formDataToSend.append('status', status.toUpperCase())
      formDataToSend.append('meta_title', formData.metaTitle)
      formDataToSend.append('meta_description', formData.metaDescription)
      
      // Add tags
      console.log('Selected tags before sending:', selectedTags)
      selectedTags.forEach(tagId => {
        formDataToSend.append('tags', tagId.toString())
      })
      
      // Add image file if selected, otherwise use URL, or handle removal signal
      if (imageFile) {
        formDataToSend.append('hero_image_file', imageFile)
      } else if (formData.heroImage === 'REMOVE_IMAGE') {
        // Send empty string to remove image
        formDataToSend.append('hero_image', '')
      } else if (formData.heroImage && formData.heroImage.trim() !== '') {
        formDataToSend.append('hero_image', formData.heroImage)
      }
      // If neither file nor URL nor removal signal, don't send hero_image field (keep existing)

      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Makale başarıyla güncellendi')
        router.push('/admin/articles')
      } else {
        toast.error(result.error || 'Makale güncellenirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (articleLoading || categoriesLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Makale yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold">Makale Düzenle</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Makale başlığı"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Alt Başlık</Label>
                <Input
                  id="subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Makale alt başlığı"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Makale özeti"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Makale Türü</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-white text-gray-900"
                  >
                    {articleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-white text-gray-900"
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İçerik */}
          <Card>
            <CardHeader>
              <CardTitle>İçerik</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="content">Makale İçeriği *</Label>
                <div className="mt-2">
                  <RichEditor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Makale içeriğinizi yazın..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* İnceleme Puanları */}
          {formData.type === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle>İnceleme Puanları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(reviewScores).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                      <Input
                        id={key}
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={value}
                        onChange={(e) => handleScoreChange(key, parseFloat(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="totalScore">Toplam Puan</Label>
                  <Input
                    id="totalScore"
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={totalScore}
                    onChange={(e) => setTotalScore(parseFloat(e.target.value))}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etiketler */}
          <Card>
            <CardHeader>
              <CardTitle>Etiketler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tag Selection */}
              <div>
                <Label>Mevcut Etiketlerden Seç</Label>
                <div className="mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {tagsLoading ? (
                    <p className="text-sm text-muted-foreground">Etiketler yükleniyor...</p>
                  ) : tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Henüz etiket bulunmuyor</p>
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
                {selectedTags.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTags.length} etiket seçildi
                  </p>
                )}
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO başlığı"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO açıklaması"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="heroImage">Kapak Resmi</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Eye className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="heroImage"
                      name="heroImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG veya GIF formatında, maksimum 5MB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {imageFile ? `Seçilen dosya: ${imageFile.name}` : 
                       formData.heroImage ? 'URL kullanılıyor' : ''}
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

          {/* Kaydet Butonları */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={() => handleSave('draft')} 
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Taslak Olarak Kaydet
                </Button>

                <Button 
                  onClick={() => handleSave('published')} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  Yayınla
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
