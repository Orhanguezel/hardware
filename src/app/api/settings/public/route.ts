// src/app/api/settings/public/route.ts
import { NextResponse } from 'next/server'
import { DJANGO_API_URL } from '@/lib/api'

// Env'den gelen base URL (sonundaki / işaretlerini temizleyelim)
const djangoApiUrl = DJANGO_API_URL.replace(/\/+$/, '')

const defaultPublicSettings = {
  site_name: { value: 'Hardware Review', is_file: false },
  site_description: {
    value:
      'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.',
    is_file: false,
  },
  logo: { value: '', is_file: true },
  favicon: { value: '', is_file: true },
  user_registration: { value: 'true', is_file: false },
  primary_color: { value: '#3b82f6', is_file: false },
  secondary_color: { value: '#64748b', is_file: false },
  seo_title: {
    value: 'Hardware Review - En İyi Donanım Rehberleri',
    is_file: false,
  },
  seo_description: {
    value:
      'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.',
    is_file: false,
  },
  seo_keywords: {
    value: 'donanım, router, modem, wifi, inceleme',
    is_file: false,
  },
  affiliate_tracking: { value: 'false', is_file: false },
}

export async function GET() {
  try {
    const response = await fetch(`${djangoApiUrl}/settings/public/`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Eğer prodda cache istemezsen:
      // cache: 'no-store',
    })

    if (!response.ok) {
      console.error(
        'Public settings API response not OK:',
        response.status,
        response.statusText,
      )
      // API patlarsa default değerleri dön
      return NextResponse.json({
        success: true,
        data: defaultPublicSettings,
      })
    }

    const data = (await response.json()) as { data?: unknown }

    return NextResponse.json({
      success: true,
      data: data.data ?? defaultPublicSettings,
    })
  } catch (error: unknown) {
    console.error(
      'Error fetching public settings:',
      error instanceof Error ? error.message : error,
    )

    // Hata durumunda da default değerleri dön
    return NextResponse.json({
      success: true,
      data: defaultPublicSettings,
    })
  }
}
