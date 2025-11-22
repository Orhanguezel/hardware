'use client'

import Link from 'next/link'
import { useSettings } from '@/contexts/SettingsContext'
import { useState, useEffect } from 'react'
import Image from 'next/image'

function FooterContent() {
  const { settings } = useSettings()
  const [categories, setCategories] = useState<unknown[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 🔁 ESKİ: /api/categories/public  (artık yok)
        const response = await fetch('/api/categories/public')
        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          const parentCategories = result.data.filter(
            (category: unknown) => !(category as { parent?: unknown }).parent,
          )
          setCategories(parentCategories.slice(0, 4)) // Limit to 4 categories
        }
      } catch (error) {
        console.error('Error fetching footer categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Logo + site adı için helper
  const logoValue =
    settings?.logo && typeof settings.logo.value === 'string'
      ? settings.logo.value
      : null

  const logoUrl = logoValue
    ? logoValue.startsWith('/media/')
      ? `http://localhost:8000${logoValue}`
      : logoValue
    : null

  const siteName = settings?.site_name?.value || 'Hardware Review'

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={siteName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded object-contain"
                />
              ) : (
                <div className="h-8 w-8 rounded bg-primary" />
              )}
              <span className="text-xl font-bold">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {settings?.site_description?.value ||
                'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.'}
            </p>
          </div>

          {/* İçerikler */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">İçerikler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/reviews" className="text-muted-foreground hover:text-primary">
                  İncelemeler
                </Link>
              </li>
              <li>
                <Link href="/best" className="text-muted-foreground hover:text-primary">
                  En İyi Listeler
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-primary">
                  Karşılaştırmalar
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-primary">
                  Rehberler
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-muted-foreground hover:text-primary">
                  Haberler
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Kategoriler</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((category: unknown) => (
                <li key={(category as { id: string }).id}>
                  <Link
                    href={`/category/${(category as { slug: string }).slug}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {(category as { name: string }).name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Yasal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Yasal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-muted-foreground hover:text-primary">
                  Affiliate Açıklaması
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Donanım Puanı. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/rss" className="text-sm text-muted-foreground hover:text-primary">
                RSS
              </Link>
              <Link
                href="/sitemap.xml"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function Footer() {
  return <FooterContent />
}
