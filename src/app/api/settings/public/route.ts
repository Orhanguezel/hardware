import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const djangoApiUrl = 'http://localhost:8000/api'
    
    // Get public settings from Django API
    const response = await fetch(`${djangoApiUrl}/settings/public/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Public settings API response not OK:', response.status)
      // Return default values if API fails
      return NextResponse.json({
        success: true,
        data: {
          site_name: { value: 'Hardware Review', is_file: false },
          site_description: { value: 'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.', is_file: false },
          logo: { value: '', is_file: true },
          favicon: { value: '', is_file: true },
          user_registration: { value: 'true', is_file: false },
          primary_color: { value: '#3b82f6', is_file: false },
          secondary_color: { value: '#64748b', is_file: false },
          seo_title: { value: 'Hardware Review - En İyi Donanım Rehberleri', is_file: false },
          seo_description: { value: 'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.', is_file: false },
          seo_keywords: { value: 'donanım, router, modem, wifi, inceleme', is_file: false },
          affiliate_tracking: { value: 'false', is_file: false }
        }
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data.data || {}
    })

  } catch (error) {
    console.error('Error fetching public settings:', error)
    // Return default values if there's an error
    return NextResponse.json({
      success: true,
      data: {
        site_name: { value: 'Hardware Review', is_file: false },
        site_description: { value: 'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.', is_file: false },
        logo: { value: '', is_file: true },
        favicon: { value: '', is_file: true },
        user_registration: { value: 'true', is_file: false },
        primary_color: { value: '#3b82f6', is_file: false },
        secondary_color: { value: '#64748b', is_file: false },
        seo_title: { value: 'Hardware Review - En İyi Donanım Rehberleri', is_file: false },
        seo_description: { value: 'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.', is_file: false },
        seo_keywords: { value: 'donanım, router, modem, wifi, inceleme', is_file: false },
        affiliate_tracking: { value: 'false', is_file: false }
      }
    })
  }
}
