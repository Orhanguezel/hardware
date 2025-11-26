'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useState } from 'react'

interface PopularFeature {
  name: string
  value: string
  count: number
  averageRating: number
}

interface PopularFeaturesProps {
  features: PopularFeature[]
  selectedFeature?: string
}

export function PopularFeatures({ features, selectedFeature }: PopularFeaturesProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-base">Popüler Özellikler</h3>
        <Badge variant="secondary" className="text-xs">
          {features.length} özellik
        </Badge>
      </div>
      
      {/* Özellik Arama */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Özellik ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filteredFeatures.map((feature) => (
          <Link
            key={`${feature.name}-${feature.value}`}
            href={`/products?search=${encodeURIComponent(`${feature.name}:${feature.value}`)}`}
            className={`flex items-center justify-between p-2 rounded-lg transition-all hover:bg-accent ${
              selectedFeature === `${feature.name}:${feature.value}` ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:shadow-sm'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate" title={feature.name}>
                {feature.name}
              </div>
              <div className="text-xs text-muted-foreground truncate" title={feature.value}>
                {feature.value}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline" className="text-xs">
                {feature.count}
              </Badge>
              {feature.averageRating > 0 && (
                <Badge variant="secondary" className="text-xs">
                  ⭐ {feature.averageRating.toFixed(1)}
                </Badge>
              )}
            </div>
          </Link>
        ))}

        {filteredFeatures.length === 0 && searchTerm && (
          <div className="text-sm text-muted-foreground p-2 text-center">
            Aradığınız özellik bulunamadı.
          </div>
        )}
      </div>
    </div>
  )
}
