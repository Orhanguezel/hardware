'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Calendar,
  Tag,
  Wifi,
  DollarSign,
  CheckCircle
} from 'lucide-react'

interface SearchFilters {
  query: string
  category: string
  priceRange: [number, number]
  wifiStandard: string[]
  features: string[]
  rating: number
  sortBy: string
}

interface AdvancedSearchProps {
  onSearch?: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
}

const categories = [
  'Router',
  'Modem',
  'Mesh',
  'Access Point',
  'Switch',
  'Adapter'
]

const wifiStandards = [
  'Wi-Fi 4',
  'Wi-Fi 5',
  'Wi-Fi 6',
  'Wi-Fi 6E',
  'Wi-Fi 7'
]

const features = [
  'Gaming Mode',
  'MU-MIMO',
  'Mesh Support',
  'VPN Support',
  'Parental Controls',
  'Guest Network',
  'QoS',
  'USB Ports',
  'Gigabit Ethernet'
]

const sortOptions = [
  { value: 'relevance', label: 'En İlgili' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'rating', label: 'En Yüksek Puan' },
  { value: 'price_low', label: 'En Düşük Fiyat' },
  { value: 'price_high', label: 'En Yüksek Fiyat' },
  { value: 'popular', label: 'En Popüler' }
]

export default function AdvancedSearch({ onSearch, initialFilters }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    priceRange: [0, 10000],
    wifiStandard: [],
    features: [],
    rating: 0,
    sortBy: 'relevance',
    ...initialFilters
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    onSearch?.(filters)
  }, [filters, onSearch])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleArrayFilter = (key: 'wifiStandard' | 'features', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      priceRange: [0, 10000],
      wifiStandard: [],
      features: [],
      rating: 0,
      sortBy: 'relevance'
    })
  }

  const activeFiltersCount = 
    (filters.category !== 'all' ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0) +
    filters.wifiStandard.length +
    filters.features.length +
    (filters.rating > 0 ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ürün, marka veya özellik ara..."
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreler
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtreler</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Temizle
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
                  Kapat
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category */}
            <div>
              <h4 className="font-medium mb-3">Kategori</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filters.category === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('category', 'all')}
                >
                  Tümü
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={filters.category === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('category', category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-medium mb-3">Fiyat Aralığı</h4>
              <div className="space-y-4">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value)}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₺{filters.priceRange[0].toLocaleString()}</span>
                  <span>₺{filters.priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Wi-Fi Standards */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Wi-Fi Standardı
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {wifiStandards.map((standard) => (
                  <Button
                    key={standard}
                    variant={filters.wifiStandard.includes(standard) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayFilter('wifiStandard', standard)}
                    className="justify-start"
                  >
                    {filters.wifiStandard.includes(standard) && (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {standard}
                  </Button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Özellikler
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {features.map((feature) => (
                  <Button
                    key={feature}
                    variant={filters.features.includes(feature) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayFilter('features', feature)}
                    className="justify-start"
                  >
                    {filters.features.includes(feature) && (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    {feature}
                  </Button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Minimum Puan
              </h4>
              <div className="space-y-4">
                <Slider
                  value={[filters.rating]}
                  onValueChange={([value]) => updateFilter('rating', value)}
                  max={10}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Herhangi</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    {filters.rating.toFixed(1)}+
                  </span>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <h4 className="font-medium mb-3">Sıralama</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('sortBy', option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Aktif Filtreler:</span>
              
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Kategori: {filters.category}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('category', 'all')}
                  />
                </Badge>
              )}

              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ₺{filters.priceRange[0]} - ₺{filters.priceRange[1]}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('priceRange', [0, 10000])}
                  />
                </Badge>
              )}

              {filters.wifiStandard.map((standard) => (
                <Badge key={standard} variant="secondary" className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  {standard}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => toggleArrayFilter('wifiStandard', standard)}
                  />
                </Badge>
              ))}

              {filters.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {feature}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => toggleArrayFilter('features', feature)}
                  />
                </Badge>
              ))}

              {filters.rating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {filters.rating}+ Puan
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter('rating', 0)}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
