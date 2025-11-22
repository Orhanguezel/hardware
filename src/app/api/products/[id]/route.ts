// hardware/src/app/api/products/%5Bid%5D/route.ts

import { NextRequest, NextResponse } from 'next/server'

const DJANGO_API_URL = process.env.DJANGO_API_URL || 'http://localhost:8000/api'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}


export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Check if id is a number or slug
    const isNumeric = /^\d+$/.test(id)
    
    let apiUrl: string
    if (isNumeric) {
      // If it's a number, treat it as ID
      apiUrl = `${DJANGO_API_URL}/products/id/${id}/`
    } else {
      // If it's not a number, treat it as slug
      apiUrl = `${DJANGO_API_URL}/products/${id}/`
    }
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
