import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Add type=REVIEW filter for reviews
    searchParams.set('type', 'REVIEW')
    const queryString = searchParams.toString()
    const url = `${DJANGO_API_URL}/articles/?${queryString}`

    const response = await fetch(url, {
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
      data: data.results || data
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Ensure type is REVIEW for reviews endpoint
    body.type = 'REVIEW'
    
    const response = await fetch(`${DJANGO_API_URL}/articles/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.error || 'Failed to create review' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
