'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface PriceRange {
  label: string
  min?: number
  max?: number
  href: string
}

interface PriceRangeFiltersProps {
  selectedPriceRange?: string
}

const priceRanges: PriceRange[] = [
  { label: '0₺ - 1000₺', min: 0, max: 1000, href: '/products?price_min=0&price_max=1000' },
  { label: '1000₺ - 3000₺', min: 1000, max: 3000, href: '/products?price_min=1000&price_max=3000' },
  { label: '3000₺ - 5000₺', min: 3000, max: 5000, href: '/products?price_min=3000&price_max=5000' },
  { label: '5000₺+', min: 5000, href: '/products?price_min=5000' }
]

export function PriceRangeFilters({ selectedPriceRange }: PriceRangeFiltersProps) {
  const getPriceRangeKey = (range: PriceRange) => {
    if (range.min !== undefined && range.max !== undefined) {
      return `${range.min}-${range.max}`
    } else if (range.min !== undefined) {
      return `${range.min}+`
    }
    return range.label
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-base">Fiyat Aralığı</h3>
        <Badge variant="secondary" className="text-xs">
          {priceRanges.length} aralık
        </Badge>
      </div>
      
      <div className="space-y-2">
        {priceRanges.map((range) => {
          const rangeKey = getPriceRangeKey(range)
          const isSelected = selectedPriceRange === rangeKey
          
          return (
            <Link
              key={rangeKey}
              href={range.href}
              className={`block p-2 rounded-md text-sm font-medium transition-all ${
                isSelected 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted hover:bg-accent'
              }`}
            >
              {range.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
