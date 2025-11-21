import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    const djangoApiUrl = 'http://localhost:8000/api'
    
    // Get settings from Django API
    const response = await fetch(`${djangoApiUrl}/settings/bulk/`, {
      headers: {
        'Authorization': `Token ${(session as any).accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Settings API response not OK:', response.status)
      // If no settings exist, return empty object instead of error
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: {}
        })
      }
      throw new Error('Failed to fetch settings')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      data: data.data || {}
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    console.log('=== NEXT.JS API ROUTE DEBUG ===')
    console.log('Request method:', request.method)
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    const formData = await request.formData()
    console.log('FormData keys:', Array.from(formData.keys()))
    
    const djangoApiUrl = 'http://localhost:8000/api'
    
    // Create new FormData for Django API
    const djangoFormData = new FormData()
    
    // Get settings JSON
    const settingsJson = formData.get('settings') as string
    console.log('Settings JSON:', settingsJson)
    if (settingsJson) {
      djangoFormData.append('settings', settingsJson)
    }
    
    // Add file uploads
    const logoFile = formData.get('logo_file') as File
    if (logoFile) {
      console.log('Logo file:', logoFile.name, logoFile.size)
      djangoFormData.append('logo_file', logoFile)
    }
    
    const faviconFile = formData.get('favicon_file') as File
    if (faviconFile) {
      console.log('Favicon file:', faviconFile.name, faviconFile.size)
      djangoFormData.append('favicon_file', faviconFile)
    }
    
    console.log('Django FormData keys:', Array.from(djangoFormData.keys()))
    
    // Update settings via Django API
    const response = await fetch(`${djangoApiUrl}/settings/bulk/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${(session as any).accessToken}`,
      },
      body: djangoFormData
    })

    if (!response.ok) {
      console.error('Settings update API response not OK:', response.status)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error('Failed to update settings')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: data.data || {}
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
