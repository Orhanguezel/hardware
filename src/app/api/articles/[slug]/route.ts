import { NextRequest, NextResponse } from 'next/server'
import { DJANGO_API_URL } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params


    // Env’den gelen base URL (sonundaki / işaretlerini temizleyelim)
    const djangoApiUrl = DJANGO_API_URL.replace(/\/+$/, "");
    const url = `${djangoApiUrl}/articles/${slug}/`

    console.log('Django API URL:', djangoApiUrl)
    console.log('Fetching article from Django API:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Django API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Django API response data:', data)

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
