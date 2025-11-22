// hardware/src/app/api/categories/public/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { DJANGO_API_URL } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${DJANGO_API_URL}/categories/?parent__isnull=true&ordering=name`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Django API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data.results || []
    })
  } catch (error) {
    console.error('Error fetching public categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
