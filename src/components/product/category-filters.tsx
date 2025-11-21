'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Cpu, 
  Monitor, 
  Router, 
  HardDrive, 
  Headphones, 
  Smartphone,
  Laptop,
  Gamepad2,
  Zap,
  Wifi,
  MemoryStick,
  Thermometer,
  Power,
  Package,
  Printer,
  Scan
} from 'lucide-react'
import Link from 'next/link'

interface CategoryFiltersProps {
  categorySlug: string
  categoryName: string
  searchParams: Record<string, string>
}

// Kategori bazlı filtreler
const getCategoryFilters = (categorySlug: string) => {
  switch (categorySlug) {
    case 'ekran-karti-gpu':
      return {
        title: 'Ekran Kartı Filtreleri',
        icon: <Cpu className="w-5 h-5" />,
        filters: [
          {
            name: 'VRAM',
            key: 'vram',
            type: 'select',
            options: [
              { value: '8', label: '8 GB' },
              { value: '12', label: '12 GB' },
              { value: '16', label: '16 GB' },
              { value: '24', label: '24 GB' },
              { value: '32', label: '32 GB' }
            ]
          },
          {
            name: 'Boost Clock',
            key: 'boost_clock',
            type: 'range',
            min: 1500,
            max: 3000,
            step: 100,
            unit: 'MHz'
          },
          {
            name: 'TDP',
            key: 'tdp',
            type: 'range',
            min: 100,
            max: 500,
            step: 50,
            unit: 'W'
          },
          {
            name: 'Ray Tracing',
            key: 'ray_tracing',
            type: 'checkbox',
            options: [
              { value: 'true', label: 'Ray Tracing Destekli' }
            ]
          }
        ]
      }

    case 'monitor':
      return {
        title: 'Monitör Filtreleri',
        icon: <Monitor className="w-5 h-5" />,
        filters: [
          {
            name: 'Boyut',
            key: 'size',
            type: 'select',
            options: [
              { value: '24', label: '24"' },
              { value: '27', label: '27"' },
              { value: '32', label: '32"' },
              { value: '34', label: '34"' },
              { value: '49', label: '49"' }
            ]
          },
          {
            name: 'Çözünürlük',
            key: 'resolution',
            type: 'select',
            options: [
              { value: '1080p', label: '1920x1080 (1080p)' },
              { value: '1440p', label: '2560x1440 (1440p)' },
              { value: '4k', label: '3840x2160 (4K)' },
              { value: 'ultrawide', label: 'Ultrawide' }
            ]
          },
          {
            name: 'Yenileme Hızı',
            key: 'refresh_rate',
            type: 'select',
            options: [
              { value: '60', label: '60 Hz' },
              { value: '75', label: '75 Hz' },
              { value: '120', label: '120 Hz' },
              { value: '144', label: '144 Hz' },
              { value: '165', label: '165 Hz' },
              { value: '240', label: '240 Hz' }
            ]
          },
          {
            name: 'Panel Tipi',
            key: 'panel_type',
            type: 'select',
            options: [
              { value: 'IPS', label: 'IPS' },
              { value: 'VA', label: 'VA' },
              { value: 'TN', label: 'TN' },
              { value: 'OLED', label: 'OLED' },
              { value: 'Nano IPS', label: 'Nano IPS' }
            ]
          },
          {
            name: 'HDR',
            key: 'hdr',
            type: 'checkbox',
            options: [
              { value: 'true', label: 'HDR Destekli' }
            ]
          }
        ]
      }

    case 'router':
    case 'modem':
      return {
        title: 'Router/Modem Filtreleri',
        icon: <Router className="w-5 h-5" />,
        filters: [
          {
            name: 'Wi-Fi Standardı',
            key: 'wifi_standard',
            type: 'select',
            options: [
              { value: 'Wi-Fi 5', label: 'Wi-Fi 5 (802.11ac)' },
              { value: 'Wi-Fi 6', label: 'Wi-Fi 6 (802.11ax)' },
              { value: 'Wi-Fi 6E', label: 'Wi-Fi 6E' },
              { value: 'Wi-Fi 7', label: 'Wi-Fi 7 (802.11be)' }
            ]
          },
          {
            name: 'Toplam Hız',
            key: 'total_speed',
            type: 'range',
            min: 1000,
            max: 11000,
            step: 1000,
            unit: 'Mbps'
          },
          {
            name: 'Band',
            key: 'band',
            type: 'select',
            options: [
              { value: 'Dual-Band', label: 'Dual-Band' },
              { value: 'Tri-Band', label: 'Tri-Band' }
            ]
          },
          {
            name: 'Port Sayısı',
            key: 'ports',
            type: 'range',
            min: 2,
            max: 8,
            step: 1,
            unit: 'Port'
          },
          {
            name: 'Gaming',
            key: 'gaming',
            type: 'checkbox',
            options: [
              { value: 'true', label: 'Gaming Özellikli' }
            ]
          }
        ]
      }

    case 'gaming-mouse':
      return {
        title: 'Gaming Mouse Filtreleri',
        icon: <Gamepad2 className="w-5 h-5" />,
        filters: [
          {
            name: 'DPI',
            key: 'dpi',
            type: 'range',
            min: 800,
            max: 30000,
            step: 400,
            unit: 'DPI'
          },
          {
            name: 'Ağırlık',
            key: 'weight',
            type: 'range',
            min: 50,
            max: 150,
            step: 10,
            unit: 'g'
          },
          {
            name: 'Kablosuz',
            key: 'wireless',
            type: 'checkbox',
            options: [
              { value: 'true', label: 'Kablosuz' }
            ]
          },
          {
            name: 'Pil Ömrü',
            key: 'battery',
            type: 'range',
            min: 20,
            max: 120,
            step: 10,
            unit: 'Saat'
          }
        ]
      }

    case 'gaming-klavye':
      return {
        title: 'Gaming Klavye Filtreleri',
        icon: <Gamepad2 className="w-5 h-5" />,
        filters: [
          {
            name: 'Switch',
            key: 'switch',
            type: 'select',
            options: [
              { value: 'Cherry MX Red', label: 'Cherry MX Red' },
              { value: 'Cherry MX Blue', label: 'Cherry MX Blue' },
              { value: 'Cherry MX Brown', label: 'Cherry MX Brown' },
              { value: 'Razer Green', label: 'Razer Green' },
              { value: 'Gateron Red', label: 'Gateron Red' }
            ]
          },
          {
            name: 'Aydınlatma',
            key: 'lighting',
            type: 'select',
            options: [
              { value: 'RGB', label: 'RGB' },
              { value: 'Tek Renk', label: 'Tek Renk' },
              { value: 'Yok', label: 'Aydınlatma Yok' }
            ]
          },
          {
            name: 'Kablosuz',
            key: 'wireless',
            type: 'checkbox',
            options: [
              { value: 'true', label: 'Kablosuz' }
            ]
          },
          {
            name: 'Makro Tuşları',
            key: 'macro_keys',
            type: 'range',
            min: 0,
            max: 12,
            step: 1,
            unit: 'Tuş'
          }
        ]
      }

    case 'islemci-cpu':
      return {
        title: 'İşlemci Filtreleri',
        icon: <Cpu className="w-5 h-5" />,
        filters: [
          {
            name: 'Çekirdek Sayısı',
            key: 'cores',
            type: 'range',
            min: 2,
            max: 32,
            step: 2,
            unit: 'Çekirdek'
          },
          {
            name: 'Thread Sayısı',
            key: 'threads',
            type: 'range',
            min: 2,
            max: 64,
            step: 2,
            unit: 'Thread'
          },
          {
            name: 'Base Clock',
            key: 'base_clock',
            type: 'range',
            min: 2.0,
            max: 5.0,
            step: 0.1,
            unit: 'GHz'
          },
          {
            name: 'Boost Clock',
            key: 'boost_clock',
            type: 'range',
            min: 3.0,
            max: 6.0,
            step: 0.1,
            unit: 'GHz'
          },
          {
            name: 'TDP',
            key: 'tdp',
            type: 'range',
            min: 35,
            max: 250,
            step: 15,
            unit: 'W'
          }
        ]
      }

    case 'ram':
      return {
        title: 'RAM Filtreleri',
        icon: <MemoryStick className="w-5 h-5" />,
        filters: [
          {
            name: 'Kapasite',
            key: 'capacity',
            type: 'select',
            options: [
              { value: '8', label: '8 GB' },
              { value: '16', label: '16 GB' },
              { value: '32', label: '32 GB' },
              { value: '64', label: '64 GB' },
              { value: '128', label: '128 GB' }
            ]
          },
          {
            name: 'Hız',
            key: 'speed',
            type: 'range',
            min: 2133,
            max: 8000,
            step: 133,
            unit: 'MHz'
          },
          {
            name: 'Tip',
            key: 'type',
            type: 'select',
            options: [
              { value: 'DDR4', label: 'DDR4' },
              { value: 'DDR5', label: 'DDR5' }
            ]
          },
          {
            name: 'Latency',
            key: 'latency',
            type: 'range',
            min: 10,
            max: 40,
            step: 1,
            unit: 'CL'
          }
        ]
      }

    case 'depolama':
      return {
        title: 'Depolama Filtreleri',
        icon: <HardDrive className="w-5 h-5" />,
        filters: [
          {
            name: 'Kapasite',
            key: 'capacity',
            type: 'select',
            options: [
              { value: '256', label: '256 GB' },
              { value: '512', label: '512 GB' },
              { value: '1', label: '1 TB' },
              { value: '2', label: '2 TB' },
              { value: '4', label: '4 TB' },
              { value: '8', label: '8 TB' }
            ]
          },
          {
            name: 'Tip',
            key: 'type',
            type: 'select',
            options: [
              { value: 'SSD', label: 'SSD' },
              { value: 'NVMe', label: 'NVMe SSD' },
              { value: 'HDD', label: 'HDD' }
            ]
          },
          {
            name: 'Okuma Hızı',
            key: 'read_speed',
            type: 'range',
            min: 100,
            max: 7000,
            step: 100,
            unit: 'MB/s'
          },
          {
            name: 'Yazma Hızı',
            key: 'write_speed',
            type: 'range',
            min: 50,
            max: 6000,
            step: 50,
            unit: 'MB/s'
          }
        ]
      }

    case 'yazici-tuketim':
      return {
        title: 'Yazıcı Filtreleri',
        icon: <Printer className="w-5 h-5" />,
        filters: [
          {
            name: 'Tip',
            key: 'type',
            type: 'select',
            options: [
              { value: 'Lazer', label: 'Lazer Yazıcı' },
              { value: 'Inkjet', label: 'Mürekkep Püskürtmeli' },
              { value: 'Tarayıcı', label: 'Tarayıcı' },
              { value: 'Çok Fonksiyonlu', label: 'Çok Fonksiyonlu' }
            ]
          },
          {
            name: 'Kablosuz',
            key: 'wireless',
            type: 'checkbox',
            options: [
              { value: 'true', label: 'Kablosuz' }
            ]
          },
          {
            name: 'Çift Taraflı',
            key: 'duplex',
            type: 'checkbox',
            options: [
              { value: 'true', label: 'Çift Taraflı Yazdırma' }
            ]
          }
        ]
      }

    default:
      return null
  }
}

export function CategoryFilters({ categorySlug, categoryName, searchParams }: CategoryFiltersProps) {
  const [filters, setFilters] = useState(searchParams)
  const categoryFilterConfig = getCategoryFilters(categorySlug)

  if (!categoryFilterConfig) {
    return null
  }

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value) {
      newFilters[key] = value
    } else {
      delete newFilters[key]
    }
    setFilters(newFilters)
  }

  const buildFilterUrl = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    return `/products?category=${categorySlug}&${params.toString()}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {categoryFilterConfig.icon}
          {categoryFilterConfig.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryFilterConfig.filters.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium mb-2">
              {filter.name}
            </label>
            
            {filter.type === 'select' && (
              <div className="space-y-2">
                {filter.options?.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters[filter.key] === option.value}
                      onChange={(e) => updateFilter(filter.key, e.target.checked ? option.value : '')}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                {filter.options?.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters[filter.key] === option.value}
                      onChange={(e) => updateFilter(filter.key, e.target.checked ? option.value : '')}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {filter.type === 'range' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder={`Min ${filter.min}${filter.unit}`}
                    value={filters[`${filter.key}_min`] || ''}
                    onChange={(e) => updateFilter(`${filter.key}_min`, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder={`Max ${filter.max}${filter.unit}`}
                    value={filters[`${filter.key}_max`] || ''}
                    onChange={(e) => updateFilter(`${filter.key}_max`, e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">{filter.unit}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="pt-4">
          <Button asChild className="w-full">
            <Link href={buildFilterUrl()}>
              Filtreleri Uygula
            </Link>
          </Button>
        </div>

        {/* Aktif Filtreler */}
        {Object.keys(filters).length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Aktif Filtreler:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="gap-1">
                  {key}: {value}
                  <button
                    onClick={() => updateFilter(key, '')}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
