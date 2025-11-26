'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  children?: Category[]
}

interface ExpandableCategoriesProps {
  categories: Category[]
  selectedCategorySlug?: string
}

const getShortCategoryName = (name: string) => {
  const shortNames: { [key: string]: string } = {
    'Ağ Modem Ürünleri': 'Ağ & Modem',
    'Bilgisayar': 'Bilgisayar',
    'Bilgisayar Bileşenleri': 'Bileşenler',
    'Gaming': 'Gaming',
    'TV, Ses ve Görüntü Sistemi': 'TV & Ses',
    'Telefon': 'Telefon',
    'Yazıcı ve Tüketim': 'Yazıcı',
    'Çevre Birimleri': 'Çevre Birimleri',
    'All-in-One': 'All-in-One',
    'Dizüstü Bilgisayar': 'Laptop',
    'Masaüstü Bilgisayar': 'Masaüstü',
    'Mini PC': 'Mini PC',
    'Android Telefonlar': 'Android',
    'Samsung Galaxy': 'Galaxy',
    'Telefon Aksesuarları': 'Telefon Aks.',
    'iPhone': 'iPhone',
    'Fare': 'Fare',
    'Hoparlör': 'Hoparlör',
    'Klavye': 'Klavye',
    'Kulaklık': 'Kulaklık',
    'Webcam': 'Webcam',
    'Gaming Klavye': 'Gaming Klavye',
    'Gaming Kulaklık': 'Gaming Kulaklık',
    'Gaming Monitör': 'Gaming Monitör',
    'Gaming Mouse': 'Gaming Mouse',
    'Oyun Konsolu': 'Konsol',
    'AV Receiver': 'AV Receiver',
    'Monitör': 'Monitör',
    'Projeksiyon': 'Projeksiyon',
    'Soundbar': 'Soundbar',
    'Televizyon': 'TV',
    'Anakart': 'Anakart',
    'Depolama': 'Depolama',
    'Ekran Kartı (GPU)': 'GPU',
    'Güç Kaynağı': 'PSU',
    'Kasa': 'Kasa',
    'RAM': 'RAM',
    'Soğutma': 'Soğutma',
    'İşlemci (CPU)': 'CPU',
    'Access Point': 'Access Point',
    'Ağ Kartı': 'Ağ Kartı',
    'Mesh Sistem': 'Mesh',
    'Modem': 'Modem',
    'Network Switch': 'Switch',
    'Router': 'Router',
    'Lazer Yazıcı': 'Lazer',
    'Mürekkep Kartuşu': 'Kartuş',
    'Mürekkep Püskürtmeli': 'Mürekkep',
    'Tarayıcı': 'Tarayıcı',
    'Yazıcı Toneri': 'Toner',
    'Çok Fonksiyonlu': 'Çok Fonksiyonlu'
  }
  
  return shortNames[name] || name
}

export function ExpandableCategories({ 
  categories, 
  selectedCategorySlug
}: ExpandableCategoriesProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-base">Kategoriler</h3>
        <Badge variant="secondary" className="text-xs">
          {categories.length} ana kategori
        </Badge>
      </div>
      <div className="space-y-1">
        {/* Tüm Kategoriler */}
        <Link
          href="/products"
          className={`flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-accent ${
            !selectedCategorySlug ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:shadow-sm'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-current"></div>
          <span className="font-medium">Tüm Kategoriler</span>
        </Link>

        {/* Ana Kategoriler */}
        {categories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center">
              {/* Ana Kategori */}
              <Link
                href={`/products?category=${category.slug}`}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-accent flex-1 ${
                  selectedCategorySlug === category.slug ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:shadow-sm'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                <span className="font-medium flex-1" title={category.name}>
                  {getShortCategoryName(category.name)}
                </span>
              </Link>
              
              {/* Alt Kategoriler Toggle Butonu */}
              {category.children && category.children.length > 0 && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label={expandedCategories.has(category.id) ? 'Alt kategorileri gizle' : 'Alt kategorileri göster'}
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Alt Kategoriler */}
            {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
              <div className="ml-4 mt-1 space-y-1">
                {category.children.map((subCategory) => (
                  <Link
                    key={subCategory.id}
                    href={`/products?category=${subCategory.slug}`}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-accent ${
                      selectedCategorySlug === subCategory.slug ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:shadow-sm'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                    <span className="font-medium text-sm" title={subCategory.name}>
                      {getShortCategoryName(subCategory.name)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
