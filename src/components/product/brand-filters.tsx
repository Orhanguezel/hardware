'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface BrandFiltersProps {
  brands: string[]
  selectedBrand?: string
}

export function BrandFilters({ brands, selectedBrand }: BrandFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBrands = brands.filter(brand =>
    brand.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-base">Markalar</h3>
        <Badge variant="secondary" className="text-xs">
          {brands.length} marka
        </Badge>
      </div>
      
      {/* Marka Arama */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Marka ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {/* Tüm Markalar */}
        <Link
          href="/products"
          className={`flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-accent ${
            !selectedBrand ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:shadow-sm'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span className="font-medium">Tüm Markalar</span>
        </Link>

        {/* Marka Listesi */}
        {filteredBrands.map((brand) => (
          <Link
            key={brand}
            href={`/products?brand=${encodeURIComponent(brand)}`}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-accent ${
              selectedBrand === brand ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:shadow-sm'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
            <span className="font-medium text-sm" title={brand}>
              {brand}
            </span>
          </Link>
        ))}

        {filteredBrands.length === 0 && searchTerm && (
          <div className="text-sm text-muted-foreground p-2 text-center">
            Aradığınız marka bulunamadı.
          </div>
        )}
      </div>
    </div>
  )
}
