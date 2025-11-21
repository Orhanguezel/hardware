import { NextRequest, NextResponse } from 'next/server'
import { DJANGO_API_URL } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // Build Django API URL with filters
    const djangoParams = new URLSearchParams()
    if (type) djangoParams.append('type', type)
    if (search) djangoParams.append('search', search)
    djangoParams.append('ordering', 'name')

    const url = `${DJANGO_API_URL}/tags/?${djangoParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      throw new Error(`Django API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const tags = data.results || data

    return NextResponse.json({
      success: true,
      data: tags
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
