import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DJANGO_API_URL } from '@/lib/api'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Super Admin access required' },
        { status: 403 }
      )
    }

    // Django API'den database istatistiklerini al
    const response = await fetch(`${DJANGO_API_URL}/database/stats/`, {
      headers: {
        'Authorization': `Token ${(session as unknown as { accessToken: string }).accessToken || ''}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Django API error response:', errorText)
      throw new Error(`Django API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch database stats')
    }

    return NextResponse.json({
      success: true,
      tables: data.tables,
      database_info: data.database_info
    })

  } catch (error) {
    console.error('Error fetching table info:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch table information' },
      { status: 500 }
    )
  }
}
