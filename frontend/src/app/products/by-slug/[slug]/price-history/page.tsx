'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  ExternalLink, 
  Calendar,
  DollarSign,
  Store,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useSettings } from '@/contexts/SettingsContext'
import { toast } from 'sonner'

interface PriceHistory {
  id: number
  price: number
  currency: string
  source: string
  url: string | null
  recorded_at: string
  recorded_by: number | null
  recorded_by_name: string
}

interface Product {
  id: string
  brand: string
  model: string
  slug: string
  price: number | null
}

export default function PriceHistoryPage() {
  const params = useParams()
  const { data: session } = useSession()
  const { isAffiliateTrackingEnabled } = useSettings()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newUrl, setNewUrl] = useState('')

  useEffect(() => {
    if (slug) {
      fetchProduct()
      fetchPriceHistory()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/by-slug/${slug}`)
      const data = await response.json()
      
      console.log('Product fetch response:', data)
      
      if (data.success) {
        setProduct(data.data)
        console.log('Product data set:', data.data)
        console.log('Product price:', data.data.price)
      } else {
        console.error('Failed to fetch product:', data.error)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    }
  }

  const fetchPriceHistory = async () => {
    try {
      setLoading(true)
      console.log('Fetching price history for slug:', slug)
      const response = await fetch(`/api/products/by-slug/${slug}/price-history`)
      console.log('Price history response status:', response.status)
      
      const data = await response.json()
      console.log('Price history response data:', data)
      
      if (data.success) {
        setPriceHistory(data.data)
        console.log('Price history set:', data.data)
      } else {
        console.error('Failed to fetch price history:', data.error)
      }
    } catch (error) {
      console.error('Error fetching price history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPrice || !newSource) {
      toast.error('Fiyat ve kaynak alanları zorunludur')
      return
    }

    const requestData = {
      price: parseFloat(newPrice),
      currency: 'TRY',
      source: newSource,
      url: newUrl || null
    }

    console.log('Frontend sending price history data:', requestData)
    console.log('Slug:', slug)

    try {
      const response = await fetch(`/api/products/by-slug/${slug}/price-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        toast.success('Fiyat geçmişi eklendi')
        setNewPrice('')
        setNewSource('')
        setNewUrl('')
        setShowAddForm(false)
        fetchPriceHistory()
      } else {
        toast.error(data.error || 'Fiyat geçmişi eklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Error adding price:', error)
      toast.error('Fiyat geçmişi eklenirken hata oluştu')
    }
  }

  const getPriceChange = (index: number) => {
    if (index === priceHistory.length - 1) return null
    
    const current = priceHistory[index].price
    const previous = priceHistory[index + 1].price
    
    const change = current - previous
    const percentage = ((change / previous) * 100).toFixed(1)
    
    return { change, percentage }
  }

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Fiyat geçmişi yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/products/by-slug/${slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ürüne Dön
            </Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">
          {product?.brand} {product?.model} - Fiyat Geçmişi
        </h1>
        {product?.price ? (
          <p className="text-lg text-muted-foreground">
            Güncel Fiyat: <span className="font-semibold text-primary">₺{product.price.toLocaleString('tr-TR')}</span>
          </p>
        ) : (
          <p className="text-lg text-muted-foreground">
            Güncel Fiyat: <span className="text-muted-foreground">Belirtilmemiş</span>
          </p>
        )}
      </div>

      {/* Add Price Form (Admin Only) */}
      {isAdmin && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Yeni Fiyat Ekle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Fiyat Ekle
              </Button>
            ) : (
              <form onSubmit={handleAddPrice} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fiyat (₺)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Kaynak</label>
                    <input
                      type="text"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      placeholder="Amazon, Teknosa, vs."
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL (Opsiyonel)</label>
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    İptal
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Price History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fiyat Geçmişi ({priceHistory.length} kayıt)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {priceHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Henüz fiyat geçmişi bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {priceHistory.map((price, index) => {
                const priceChange = getPriceChange(index)
                
                return (
                  <div key={price.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary">
                        ₺{price.price.toLocaleString('tr-TR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{price.source}</span>
                        {isAffiliateTrackingEnabled() && price.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={price.url} target="_blank">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {priceChange && (
                        <div className="flex items-center gap-1">
                          {priceChange.change > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : priceChange.change < 0 ? (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          ) : (
                            <Minus className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className={`text-sm font-medium ${
                            priceChange.change > 0 ? 'text-red-500' : 
                            priceChange.change < 0 ? 'text-green-500' : 
                            'text-muted-foreground'
                          }`}>
                            {priceChange.change > 0 ? '+' : ''}{priceChange.change.toFixed(2)} 
                            ({priceChange.percentage}%)
                          </span>
                        </div>
                      )}
                      
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(price.recorded_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
